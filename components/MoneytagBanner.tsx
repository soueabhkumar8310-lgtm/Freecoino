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

  useEffect(() => {
    if (!containerRef.current) return;

    // Create placeholder ad container with instructions
    const adContainer = document.createElement("div");
    adContainer.style.cssText = `
      width: 100%;
      max-width: ${width}px;
      height: ${height}px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      text-align: center;
      padding: 20px;
      margin: 0 auto;
    `;
    
    adContainer.innerHTML = `
      <div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          📢 Ad Space Available
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          ${width} × ${height} Banner Ad
        </div>
      </div>
    `;

    containerRef.current.appendChild(adContainer);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
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
      }}
    />
  );
}
