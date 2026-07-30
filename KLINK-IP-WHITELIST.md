# Klink Labs IP Whitelist

## Current Whitelisted IPs (August 2024 Update)

### New IPs (Added August 2024)
- `74.220.53.15`
- `74.220.53.234`
- `74.220.53.235`

### Note from Klink Labs:
> "We're updating our infrastructure and adding new IP addresses to our outgoing traffic. Please whitelist the following IPs in addition to your existing setup to continue receiving postbacks in August."

**Important:** Previous IPs remain valid. These are additions, not replacements.

## Implementation

IP validation is implemented in: `app/api/klink/postback/route.ts`

```typescript
const KLINK_IPS = [
  '74.220.53.15',   // New IP (added Aug 2024)
  '74.220.53.234',  // New IP (added Aug 2024)
  '74.220.53.235',  // New IP (added Aug 2024)
];
```

## Security Features

1. **Production Mode**: Strict IP validation - only whitelisted IPs can send postbacks
2. **Development Mode**: IP validation bypassed for local testing
3. **Logging**: All postback attempts are logged with source IP
4. **403 Response**: Unauthorized IPs receive HTTP 403 Forbidden

## Testing Postback

### Local Development (Bypasses IP Check)
```bash
curl "http://localhost:3000/api/klink/postback?user_id=test123&tx_id=offer_123&amount=1000"
```

### Production (Must come from Klink IPs)
Klink Labs will automatically send postbacks when users complete offers.

## Contact
- **Klink Labs Team**: Philip Jonitz (Co-Founder)
- **Website**: https://klinklabs.com
- **Address**: 205 Regent Street, London, England, W1B 4HB

## Last Updated
August 2024
