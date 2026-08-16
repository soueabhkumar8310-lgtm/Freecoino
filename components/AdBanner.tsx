"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";

interface AdBannerProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

/**
 * Google AdSense Banner Component
 * 
 * Setup Instructions:
 * 1. Apply for Google AdSense: https://www.google.com/adsense
 * 2. Add your AdSense publisher ID to .env.local:
 *    NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
 * 3. Create ad units in AdSense dashboard
 * 4. Use the ad slot IDs in this component
 * 
 * Usage:
 * <AdBanner adSlot="1234567890" adFormat="auto" />
 */
const AdBanner = ({ 
  adSlot, 
  adFormat = "auto", 
  fullWidth = true,
  style = {}
}: AdBannerProps) => {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    // Only load ads in production and if AdSense ID is configured
    if (adsenseId && typeof window !== "undefined") {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [adsenseId]);

  // Don't show ads if AdSense ID is not configured
  if (!adsenseId) {
    return (
      <Box 
        sx={{ 
          p: 2, 
          textAlign: "center", 
          bgcolor: "rgba(255,255,255,0.05)", 
          borderRadius: 1,
          fontSize: "0.75rem",
          color: "rgba(255,255,255,0.3)"
        }}
      >
        Ad Placeholder - Configure NEXT_PUBLIC_ADSENSE_ID
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: fullWidth ? "100%" : "auto",
        display: "flex",
        justifyContent: "center",
        my: 2,
        ...style,
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
    </Box>
  );
};

export default AdBanner;
