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
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    // Create script element for Monetag banner
    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = "//pl24555143.cpmrevenuegate.com/0b/d0/46/0bd0463eef00bedd3d89bd64deb8ce59.js";

    // Append to container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Cleanup
    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

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
