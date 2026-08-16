"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface MoneytagBannerProps {
  zoneId: string;
  width?: number;
  height?: number;
  variant?: "horizontal" | "vertical" | "square";
}

export default function MoneytagBanner({ 
  zoneId, 
  width = 728, 
  height = 90,
  variant = "horizontal" 
}: MoneytagBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create script element for Monetag banner
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      atOptions = {
        'key' : '${zoneId}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    // Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `//www.highperformanceformat.com/${zoneId}/invoke.js`;

    // Append to container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
      containerRef.current.appendChild(invokeScript);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [zoneId, width, height]);

  // Determine container styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case "horizontal":
        return {
          width: "100%",
          maxWidth: `${width}px`,
          height: `${height}px`,
          mx: "auto",
          my: 2,
        };
      case "vertical":
        return {
          width: `${width}px`,
          height: `${height}px`,
          my: 2,
        };
      case "square":
        return {
          width: `${width}px`,
          height: `${height}px`,
          mx: "auto",
          my: 2,
        };
      default:
        return {
          width: "100%",
          maxWidth: `${width}px`,
          height: `${height}px`,
          mx: "auto",
          my: 2,
        };
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        ...getContainerStyles(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "transparent",
        overflow: "hidden",
        borderRadius: 1,
        "& iframe": {
          border: "none",
          maxWidth: "100%",
        },
      }}
    />
  );
}
