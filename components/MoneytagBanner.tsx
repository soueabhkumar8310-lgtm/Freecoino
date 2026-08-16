"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface MoneytagBannerProps {
  width?: number;
  height?: number;
  variant?: "horizontal" | "vertical" | "square";
}

export default function MoneytagBanner({ 
  width = 728, 
  height = 90,
  variant = "horizontal" 
}: MoneytagBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current || !containerRef.current) return;
    scriptLoadedRef.current = true;

    // Create banner ad container div
    const adDiv = document.createElement("div");
    adDiv.id = `monetag-banner-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Monetag banner script
    const atOptions = document.createElement("script");
    atOptions.type = "text/javascript";
    atOptions.innerHTML = `
      atOptions = {
        'key' : 'f8d82d6c6eae9e8a4f5e3c8d4b2a1e9f',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    
    // Create invoke script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = "//www.topcreativeformat.com/f8d82d6c6eae9e8a4f5e3c8d4b2a1e9f/invoke.js";
    invokeScript.async = true;

    // Append elements
    if (containerRef.current) {
      containerRef.current.appendChild(adDiv);
      containerRef.current.appendChild(atOptions);
      containerRef.current.appendChild(invokeScript);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      scriptLoadedRef.current = false;
    };
  }, [width, height]);

  // Determine container styles based on variant
  const getContainerStyles = () => {
    switch (variant) {
      case "horizontal":
        return {
          width: "100%",
          maxWidth: `${width}px`,
          minHeight: `${height}px`,
          mx: "auto",
          my: 2,
        };
      case "vertical":
        return {
          width: `${width}px`,
          minHeight: `${height}px`,
          my: 2,
        };
      case "square":
        return {
          width: `${width}px`,
          minHeight: `${height}px`,
          mx: "auto",
          my: 2,
        };
      default:
        return {
          width: "100%",
          maxWidth: `${width}px`,
          minHeight: `${height}px`,
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
