"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/supabase/auth";
import { Mail, ArrowLeft } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@/components/ui/Typography";
import Icons from "@/components/icons";
import colors from "@/theme/colors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
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
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.text.secondary }}>
            Enter your email to receive a password reset link
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
          {success ? (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Check your email for password reset instructions
              </Alert>
              <Link href="/auth/login">
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ArrowLeft size={16} />}
                  sx={{
                    borderColor: colors.divider,
                    color: colors.text.primary,
                    textTransform: "none",
                  }}
                >
                  Back to Login
                </Button>
              </Link>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                  autoComplete="email"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={textFieldSx}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.25,
                  borderRadius: "8px",
                  background: colors.background.gradient,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { background: colors.background.gradient, opacity: 0.9 },
                }}
              >
                {loading ? <CircularProgress size={18} /> : "Send Reset Link"}
              </Button>

              <Link href="/auth/login">
                <Button
                  variant="text"
                  fullWidth
                  startIcon={<ArrowLeft size={16} />}
                  sx={{
                    color: colors.text.secondary,
                    textTransform: "none",
                    "&:hover": { bgcolor: "transparent" },
                  }}
                >
                  Back to Login
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
