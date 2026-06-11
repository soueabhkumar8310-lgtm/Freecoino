"use client";

import { Box } from "@mui/material";
import Link from "next/link";

const Logo = ({ href = "/" }: { href?: string }) => {
  return (
    <Link href={href} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
      {/* SVG Logo Icon - High Quality with F Letter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          width: 40,
          height: 40,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle */}
          <circle cx="32" cy="32" r="30" fill="url(#logoGradient)" />
          <circle cx="32" cy="32" r="30" stroke="#01D676" strokeWidth="2" />
          
          {/* Letter F */}
          <path d="M24 18H40V23H29V28H38V33H29V46H24V18Z" fill="white"/>
          
          {/* Coin shine effect */}
          <circle cx="20" cy="20" r="4" fill="white" opacity="0.3"/>
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="logoGradient" x1="32" y1="2" x2="32" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#01D676" />
              <stop offset="1" stopColor="#007e45" />
            </linearGradient>
          </defs>
        </svg>
      </Box>
      
      {/* Text Logo */}
      <Box sx={{ display: { xs: "none", md: "inline-flex" }, alignItems: "center" }}>
        <Box
          component="span"
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#01D676",
            lineHeight: 1,
          }}
        >
          Free
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          coino
        </Box>
      </Box>
    </Link>
  );
};

export default Logo;
