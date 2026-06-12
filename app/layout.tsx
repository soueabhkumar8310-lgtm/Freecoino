import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
// import { MockAuthProvider } from "@/lib/mock-auth"; // Removed - using Supabase auth now

export const metadata: Metadata = {
  title: "Freecoino — Earn Money Online | Complete Surveys, Tasks & Offers for Real Rewards",
  description:
    "Join Freecoino and earn real money by completing surveys, tasks, and offers. Get paid in crypto (USDT). Free to join, instant payouts, available worldwide. Start earning today!",
  keywords: [
    "earn money online",
    "make money online",
    "complete surveys for money",
    "earn crypto",
    "USDT rewards",
    "online tasks",
    "get paid online",
    "free money",
    "survey sites",
    "reward apps",
    "freecoino",
    "earn from home",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/icon.svg",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://freecoino.com"),
  alternates: {
    canonical: "https://freecoino.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Freecoino — Earn Money Online by Completing Tasks & Surveys",
    description:
      "Join thousands earning real crypto rewards. Complete surveys, tasks, and offers. Get paid in USDT. Free to join, instant payouts. Start earning today!",
    url: "https://freecoino.com",
    siteName: "Freecoino",
    images: [{ 
      url: "/logo.png", 
      width: 512, 
      height: 512, 
      alt: "Freecoino - Earn Money Online" 
    }],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freecoino — Earn Money Online | Complete Tasks for Real Rewards",
    description:
      "Join Freecoino and earn real crypto rewards. Complete surveys, tasks, and offers. Free to join, instant USDT payouts. Start earning today!",
    images: ["/logo.png"],
  },
  authors: [{ name: "Freecoino" }],
  creator: "Freecoino",
  publisher: "Freecoino",
  category: "Finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* MyLead Verification */}
        <meta name="mylead-verification" content="06ee014a7eeebe13668d1ab6ff036b37" />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <NextTopLoader color="#01D676" showSpinner={false} />
            {children}
            <ToastContainer
              autoClose={3000}
              position="top-right"
              theme="dark"
              pauseOnHover
              newestOnTop
              hideProgressBar
            />
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
