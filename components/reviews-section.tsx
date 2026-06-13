"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Rating, Avatar, Button } from "@mui/material";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(reviews.length - 3, prev + 1));
  };

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 6 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            isBold
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Star size={26} color={colors.primary} />
            What Our Users Say
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Rating value={avgRating} readOnly precision={0.1} size="small" />
            <Typography sx={{ fontSize: "0.85rem", color: colors.text.secondary }}>
              {avgRating.toFixed(1)} out of 5 ({reviews.length} reviews)
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href="/submit-review"
          variant="outlined"
          startIcon={<Star size={16} />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            borderRadius: 2,
            borderColor: colors.primary,
            color: colors.primary,
            px: 3,
            "&:hover": {
              borderColor: colors.primary,
              bgcolor: "rgba(1, 214, 118, 0.08)",
            },
          }}
        >
          Write a Review
        </Button>
      </Box>

      {/* Reviews Carousel */}
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {visibleReviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${colors.divider}`,
                bgcolor: colors.background.secondary,
                p: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: colors.glass.borderHover,
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px rgba(1, 214, 118, 0.1)`,
                },
              }}
            >
              {/* Rating */}
              <Box sx={{ mb: 2 }}>
                <Rating value={review.rating} readOnly size="small" />
              </Box>

              {/* Title */}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.95rem" }}
              >
                {review.title}
              </Typography>

              {/* Comment */}
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                  mb: 2.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {review.comment}
              </Typography>

              {/* User Info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  src={review.user_avatar || undefined}
                  alt={review.user_name}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: colors.primary,
                    fontSize: "0.75rem",
                  }}
                >
                  {review.user_name[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {review.user_name}
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.7rem", color: colors.text.secondary }}
                  >
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Navigation Buttons */}
        {reviews.length > 3 && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              sx={{
                minWidth: 0,
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: colors.background.ternary,
                border: `1px solid ${colors.divider}`,
                color: colors.text.secondary,
                "&:hover": {
                  bgcolor: colors.background.glass,
                  borderColor: colors.primary,
                },
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              }}
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex >= reviews.length - 3}
              sx={{
                minWidth: 0,
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: colors.background.ternary,
                border: `1px solid ${colors.divider}`,
                color: colors.text.secondary,
                "&:hover": {
                  bgcolor: colors.background.glass,
                  borderColor: colors.primary,
                },
                "&.Mui-disabled": {
                  opacity: 0.3,
                },
              }}
            >
              <ChevronRight size={20} />
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
