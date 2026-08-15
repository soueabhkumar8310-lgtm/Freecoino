import { CheckCircle } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Link from "next/link";
import { Box } from "@mui/material";

export default function AccountDeletedPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0a0e17",
        px: 2,
      }}
    >
      <Box sx={{ textAlign: "center", maxWidth: 480, borderRadius: "16px", bgcolor: "#111827", p: 5 }}>
        <CheckCircle size={48} color={colors.primary} style={{ marginBottom: 16 }} />
        <Typography variant="h5" isBold sx={{ mb: 1 }}>
          Account deleted
        </Typography>
        <Typography sx={{ color: colors.text.secondary, mb: 3, fontSize: "0.9rem", lineHeight: 1.6 }}>
          Your Freecoino account and all associated data have been permanently deleted. We&apos;re sorry to see you go!
        </Typography>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "linear-gradient(180deg, #10B981, #059669)",
            color: "#000",
            borderRadius: "12px",
            padding: "12px 32px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
      </Box>
    </Box>
  );
}