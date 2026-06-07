"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signInWithOAuth, getCurrentUser } from "@/lib/supabase/auth";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Typography from "@/components/ui/Typography";
import Icons from "@/components/icons";
import colors from "@/theme/colors";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(errorParam ? "Authentication failed. Please try again." : null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    // Only redirect if not coming from a logout action
    const isLogout = searchParams.get("logout");
    if (!isLogout) {
      getCurrentUser().then((user) => {
        if (user) {
          router.push("/earn");
        }
      });
    }
  }, [router, searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Attempting login with:', email);
      
      // Simple login - just like any other website
      const result = await signInWithEmail(email, password);
      
      console.log('✅ Login successful!', result);
      
      // Success! Force redirect
      window.location.href = "/earn";
    } catch (err: any) {
      console.error('❌ Login error:', err);
      
      // Show user-friendly error messages
      if (err.message.includes('Invalid login credentials')) {
        setError("❌ Wrong email or password. Please try again.");
      } else if (err.message.includes('Email not confirmed')) {
        setError("❌ Please verify your email first. Check your inbox.");
      } else if (err.message.includes('rate limit')) {
        setError("❌ Too many attempts. Please wait a few minutes.");
      } else {
        setError(err.message || "❌ Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setOauthLoading('google');
    setError(null);
    try {
      await signInWithOAuth('google');
      // OAuth will redirect, so we don't need to handle success here
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
      setOauthLoading(null);
    }
  }



  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.background.ternary,
      borderRadius: "8px",
      fontSize: "0.875rem",
      color: colors.text.primary,
      "& fieldset": { borderColor: colors.divider },
      "&:hover fieldset": { borderColor: colors.divider },
      "&.Mui-focused fieldset": {
        borderColor: colors.secondary,
        borderWidth: "1px",
        boxShadow: `0 0 0 1px ${colors.secondary}50`,
      },
      "& input": {
        py: "12px",
        "&::placeholder": { color: `${colors.text.secondary}80`, opacity: 1 },
      },
    },
    "& .MuiInputAdornment-root": { color: colors.text.secondary },
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: colors.background.default,
        px: 2,
      }}
    >
      <Box sx={{ position: "fixed", inset: 0, pointerEvents: "none" }} className="hero-gradient" />
      <Box sx={{ position: "relative", width: "100%", maxWidth: 448 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Icons.Logo href="/" />
          <Typography variant="h5" isBold sx={{ mt: 3, color: colors.text.primary }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.text.secondary }}>
            Log in to continue earning rewards
          </Typography>
        </Box>

        <Box
          sx={{
            borderRadius: "16px",
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.primary,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            disabled={loading || oauthLoading !== null}
            startIcon={
              <svg width={20} height={20} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.10z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            }
            sx={{
              bgcolor: colors.background.primary,
              borderColor: colors.divider,
              color: colors.text.primary,
              fontWeight: 700,
              fontSize: "0.875rem",
              py: 1.25,
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": { borderColor: `${colors.secondary}66`, bgcolor: colors.background.primary },
            }}
          >
            {oauthLoading === 'google' ? <CircularProgress size={18} sx={{ color: colors.text.primary }} /> : "Continue with Google"}
          </Button>

          <Box sx={{ my: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Divider sx={{ flex: 1, borderColor: colors.divider }} />
            <Typography variant="caption" sx={{ color: colors.text.secondary }}>or</Typography>
            <Divider sx={{ flex: 1, borderColor: colors.divider }} />
          </Box>

          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" isBold sx={{ mb: 0.75, color: colors.text.secondary }}>
                Email
              </Typography>
              <TextField
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="off"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> } }}
                sx={textFieldSx}
              />
            </Box>

            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                <Typography variant="body2" isBold sx={{ color: colors.text.secondary }}>Password</Typography>
                <Link href="/auth/forgot-password" style={{ fontSize: "0.75rem", fontWeight: 600, color: colors.secondary, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </Box>
              <TextField
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="off"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock size={16} /></InputAdornment> } }}
                sx={textFieldSx}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", "& .MuiAlert-icon": { color: "#f87171" } }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              endIcon={!loading ? <ArrowRight size={16} /> : undefined}
              sx={{
                mt: 2,
                py: 1.25,
                borderRadius: "8px",
                background: colors.background.gradient,
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { background: colors.background.gradient, opacity: 0.9, boxShadow: "none" },
                "&.Mui-disabled": { opacity: 0.5, color: colors.text.primary },
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: colors.text.primary }} /> : "Log In"}
            </Button>
          </Box>
        </Box>

        <Typography variant="body2" alignCenter sx={{ mt: 3, color: colors.text.secondary }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" style={{ fontWeight: 600, color: colors.secondary, textDecoration: "none" }}>
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}