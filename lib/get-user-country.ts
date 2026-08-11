import type { NextRequest } from "next/server";

// Extracts client IP from various headers
export function getClientIp(request: NextRequest): string {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  const clientIp = cfConnectingIp || forwardedFor?.split(",")[0]?.trim() || realIp || null;

  // Validate IP format (basic check) - must be valid IPv4
  if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1" && /^[\d.]+$/.test(clientIp)) {
    return clientIp;
  }

  return "1.1.1.1";
}

// Detect country code from IP using geolocation services
export async function getCountryCodeFromIp(clientIp: string): Promise<string | null> {
  // Don't try to geolocate localhost or invalid IPs
  if (clientIp === "1.1.1.1" || clientIp === "127.0.0.1" || clientIp === "::1" || !clientIp) {
    return null;
  }

  try {
    // Use multiple geolocation services for better accuracy
    const service1Promise = fetch(`http://ip-api.com/json/${clientIp}?fields=countryCode`, {
      redirect: "follow",
      signal: AbortSignal.timeout(3000), // 3 second timeout
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const service2Promise = fetch(`https://ipapi.co/${clientIp}/json/`, {
      redirect: "follow",
      signal: AbortSignal.timeout(3000),
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    // Race both services, return first successful result
    const result1 = await service1Promise;
    if (result1?.countryCode) {
      return result1.countryCode;
    }

    const result2 = await service2Promise;
    if (result2?.country_code) {
      return result2.country_code;
    }

    if (result2?.country) {
      return result2.country;
    }
  } catch (geoError) {
    // Ignore geolocation errors
  }

  return null;
}

// Resolve the user's country for offerwall filtering.
// Priority (server-authoritative, in order of trust):
//   1. CDN headers (cf-ipcountry / x-vercel-ip-country) — set by Cloudflare/Vercel edge
//   2. IP geolocation from the client's IP
//   3. Query override (client-supplied, only used when the server can't detect — e.g. local dev)
//   4. Fallback
export async function getUserCountry(
  request: NextRequest,
  options?: { overrideCountry?: string | null; fallback?: string }
): Promise<string> {
  const fallback = options?.fallback || "US";

  // Method 1: Check Cloudflare or Vercel headers
  let country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || null;

  // Method 2: Geolocate from IP
  if (!country) {
    const clientIp = getClientIp(request);
    country = await getCountryCodeFromIp(clientIp);
  }

  // Method 3: Query override (testing only) — never trust client-supplied country
  // over server-side detection
  if (!country && options?.overrideCountry) {
    country = options.overrideCountry;
  }

  return country || fallback;
}
