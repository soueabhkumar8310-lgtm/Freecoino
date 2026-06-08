"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/lib/supabase/auth";
import { Lock, ArrowRight } from "lucide-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Typography from "@/components/ui/Typography";
import Icons from "@/components/icons";
import colors from "@/theme/colors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      alert("Password updated successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
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
            Set New Password
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: colors.text.secondary }}>
            Choose a strong password for your account
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
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" isBold sx={{ mb: 0.75, color: colors.text.secondary }}>
                New Password
              </Typography>
              <TextField
                type="password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={textFieldSx}
              />
            </Box>

            <Box>
              <Typography variant="body2" isBold sx={{ mb: 0.75, color: colors.text.secondary }}>
                Confirm Password
              </Typography>
              <TextField
                type="password"
                required
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} />
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
                "&:hover": { background: colors.background.gradient, opacity: 0.9 },
              }}
            >
              {loading ? <CircularProgress size={18} /> : "Update Password"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
