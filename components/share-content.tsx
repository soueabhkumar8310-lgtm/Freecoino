"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, Paper, TextField } from "@mui/material";
import { Copy, Check, Link2, Users, Gamepad2, Gift, Medal, Coins, DollarSign, Sparkles } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface ShareContentProps {
  referralCode: string | null;
}

export default function ShareContent({ referralCode: userReferralCode }: ShareContentProps) {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");

  const code = userReferralCode || refParam || "";
  const referralLink = code
    ? `https://freecoino.com/auth/signup?ref=${code}`
    : "https://freecoino.com";

  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState(code);

  const displayCode = inputCode || code;

  async function handleCopy() {
    const link = displayCode
      ? `https://freecoino.com/auth/signup?ref=${displayCode}`
      : "https://freecoino.com";
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const steps = [
    {
      icon: <Users size={24} />,
      emoji: "📝",
      title: "Surveys Bharein",
      desc: "Sirf 2-5 minute me paise kamayein",
    },
    {
      icon: <Gamepad2 size={24} />,
      emoji: "🎮",
      title: "Tasks & Offers",
      desc: "Games khelein, apps install karein, signups karein",
    },
    {
      icon: <Gift size={24} />,
      emoji: "👥",
      title: "Referrals",
      desc: "Doston ko invite karein, 5% commission paayein (lifetime!)",
    },
    {
      icon: <Medal size={24} />,
      emoji: "🎁",
      title: "Daily Bonus",
      desc: "Har din free coins paayein",
    },
    {
      icon: <Coins size={24} />,
      emoji: "🏆",
      title: "Leaderboard",
      desc: "Top users ko extra rewards milte hain",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #091421 0%, #0d1a2d 50%, #091421 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          px: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 6, sm: 8, md: 10 },
          pb: { xs: 4, sm: 5 },
          textAlign: "center",
        }}
      >
        {/* F Icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            component="img"
            src="/icon.svg"
            alt="Freecoino"
            sx={{ width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 } }}
          />
        </Box>

        {/* Banner Image */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Freecoino Banner"
            sx={{
              width: "100%",
              maxWidth: { xs: 240, sm: 300 },
              borderRadius: 3,
              border: "1px solid rgba(1, 214, 118, 0.15)",
            }}
          />
        </Box>

        <Typography
          variant="h3"
          isBold
          sx={{
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
            lineHeight: 1.2,
            mb: 1.5,
          }}
        >
          🅵 Freecoino
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: "1.15rem", sm: "1.35rem" },
            color: colors.primary,
            fontWeight: 700,
            mb: 1,
          }}
        >
          Paisa Kaise Kamayein?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: colors.text.secondary,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            maxWidth: 480,
            mx: "auto",
          }}
        >
          Freecoino ek real website hai jahan aap surveys, tasks aur offers complete karke real paise kama sakte hain.
          Sirf aaj hi join karein!
        </Typography>
      </Box>

      {/* Steps Section */}
      <Box sx={{ width: "100%", maxWidth: 600, px: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Typography
          variant="h6"
          isBold
          sx={{
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: "1.1rem",
          }}
        >
          <DollarSign size={20} color={colors.secondary} />
          💰 5 Tareeke Kamai Ke:
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {steps.map((step, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${colors.divider}`,
                bgcolor: colors.background.secondary,
                p: { xs: 2, sm: 2.5 },
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "rgba(1, 214, 118, 0.25)",
                  bgcolor: colors.background.ternary,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: "rgba(1, 214, 118, 0.1)",
                  border: "1px solid rgba(1, 214, 118, 0.15)",
                  color: colors.secondary,
                  flexShrink: 0,
                  fontSize: "1.25rem",
                }}
              >
                {step.emoji}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    mb: 0.25,
                  }}
                >
                  {idx + 1}. {step.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    color: colors.text.secondary,
                  }}
                >
                  {step.desc}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Withdrawal Info */}
      <Box sx={{ width: "100%", maxWidth: 600, px: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(1, 214, 118, 0.2)",
            bgcolor: "rgba(1, 214, 118, 0.05)",
            p: { xs: 2.5, sm: 3 },
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1 }}>
            <Sparkles size={20} color={colors.secondary} />
            <Typography variant="h6" isBold sx={{ fontSize: "1.1rem" }}>
              💸 Withdrawal Info
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: colors.secondary,
              mb: 0.5,
            }}
          >
            Minimum $2
          </Typography>
          <Typography
            sx={{
              fontSize: "0.82rem",
              color: colors.text.secondary,
            }}
          >
            Crypto (LTC), PayPal, Gift Cards — India aur duniya bhar me available!
          </Typography>
        </Paper>
      </Box>

      {/* Referral Link Section */}
      <Box sx={{ width: "100%", maxWidth: 600, px: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.background.secondary,
            p: { xs: 2.5, sm: 3 },
          }}
        >
          <Typography
            variant="subtitle1"
            isBold
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: "1rem",
            }}
          >
            <Link2 size={18} color={colors.secondary} />
            Apna Invite Link Copy Karein
          </Typography>

          {!displayCode && (
            <TextField
              fullWidth
              size="small"
              placeholder="Apna referral code daalein (ya blank chhodein)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.background.ternary,
                  borderRadius: 2,
                  fontSize: "0.85rem",
                  color: colors.text.primary,
                  "& fieldset": { borderColor: colors.divider },
                },
              }}
            />
          )}

          {displayCode && (
            <TextField
              fullWidth
              size="small"
              value={`https://freecoino.com/auth/signup?ref=${displayCode}`}
              slotProps={{ input: { readOnly: true } }}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.background.ternary,
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  color: colors.text.secondary,
                  "& fieldset": { borderColor: colors.divider },
                },
              }}
            />
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={handleCopy}
            startIcon={copied ? <Check size={18} /> : <Copy size={18} />}
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              ...(copied
                ? {
                    bgcolor: colors.background.ternary,
                    color: colors.secondary,
                    border: `1px solid rgba(1, 214, 118, 0.3)`,
                    "&:hover": { bgcolor: colors.background.ternary },
                  }
                : {
                    background: "linear-gradient(180deg,#01D676,#007e45)",
                    boxShadow: "0 4px 14px rgba(1, 214, 118, 0.25)",
                    "&:hover": { filter: "brightness(1.1)" },
                  }),
            }}
          >
            {copied ? "Copied! ✅" : "Copy Invite Link 📋"}
          </Button>

          <Typography
            sx={{
              mt: 1.5,
              fontSize: "0.75rem",
              color: colors.text.secondary,
              textAlign: "center",
            }}
          >
            🅵 Freecoino — Real hai, scam nahi! 🔥
          </Typography>
        </Paper>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          px: { xs: 2, sm: 3, md: 4 },
          pb: { xs: 8, sm: 10 },
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: colors.text.secondary,
          }}
        >
          Already have an account?{" "}
          <Box
            component="a"
            href="https://freecoino.com"
            sx={{
              color: colors.secondary,
              fontWeight: 700,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Sign in
          </Box>
        </Typography>
        <Typography
          sx={{
            mt: 1,
            fontSize: "0.7rem",
            color: "rgba(148, 163, 184, 0.5)",
          }}
        >
          Freecoino.com — Earn Money Online
        </Typography>
      </Box>
    </Box>
  );
}
