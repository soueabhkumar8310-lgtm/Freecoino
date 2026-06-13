"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import {
  Box,
  Paper,
  TextField,
  Button,
  Rating,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Star, Send } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

export default function SubmitReviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        setSubmitting(false);
        return;
      }

      setSuccess(data.message);
      setTitle("");
      setComment("");
      setRating(5);

      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Submit review error:", error);
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell
      coins={user.coins_balance || 0}
      userId={user.id}
      userName={user.name}
      userAvatar={user.avatar}
    >
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: 4,
          pb: { xs: 12, lg: 4 },
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            isBold
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Star size={26} color={colors.primary} />
            Submit Your Review
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Share your experience with Freecoino and help others discover our platform
          </Typography>
        </Box>

        {/* Form */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.background.secondary,
            p: { xs: 3, sm: 4 },
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            {/* Rating */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary }}
              >
                Your Rating *
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => setRating(newValue || 5)}
                size="large"
                sx={{
                  "& .MuiRating-iconFilled": {
                    color: "#fbbf24",
                  },
                  "& .MuiRating-iconHover": {
                    color: "#fbbf24",
                  },
                }}
              />
            </Box>

            {/* Title */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary }}
              >
                Review Title *
              </Typography>
              <TextField
                fullWidth
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Great platform for earning online!"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.background.ternary,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    color: "#fff",
                    "& fieldset": { borderColor: colors.divider },
                    "&:hover fieldset": { borderColor: "rgba(1,214,118,0.3)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#01D676",
                      borderWidth: "1px",
                    },
                    "& input::placeholder": {
                      color: `${colors.text.secondary}80`,
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            {/* Comment */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                sx={{ mb: 1, fontWeight: 600, color: colors.text.secondary }}
              >
                Your Review *
              </Typography>
              <TextField
                fullWidth
                required
                multiline
                rows={6}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience with Freecoino..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.background.ternary,
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    color: "#fff",
                    "& fieldset": { borderColor: colors.divider },
                    "&:hover fieldset": { borderColor: "rgba(1,214,118,0.3)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#01D676",
                      borderWidth: "1px",
                    },
                    "& textarea::placeholder": {
                      color: `${colors.text.secondary}80`,
                      opacity: 1,
                    },
                  },
                }}
              />
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.7rem",
                  color: colors.text.secondary,
                }}
              >
                Minimum 10 characters
              </Typography>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              endIcon={!submitting && <Send size={16} />}
              sx={{
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(180deg,#00D084,#007e45)",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 16px rgba(0, 208, 132, 0.25)",
                "&:hover": { filter: "brightness(1.1)" },
                "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Submit Review"
              )}
            </Button>

            <Typography
              sx={{
                mt: 2,
                fontSize: "0.75rem",
                color: colors.text.secondary,
                textAlign: "center",
              }}
            >
              Your review will be visible after admin approval
            </Typography>
          </Box>
        </Paper>
      </Box>
    </AppShell>
  );
}
