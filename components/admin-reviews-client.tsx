"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Chip,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Avatar,
} from "@mui/material";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import Typography from "@/components/ui/Typography";
import colors from "@/theme/colors";

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: "#facc15", bg: "rgba(250,204,21,0.15)" },
  approved: { color: "#01D676", bg: "rgba(1,214,118,0.15)" },
  rejected: { color: "#f87171", bg: "rgba(239,68,68,0.15)" },
};

const TABS = ["all", "pending", "approved", "rejected"] as const;

export default function AdminReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchReviews(filter);
  }, [filter]);

  async function fetchReviews(status: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/reviews?${params}`);
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

  async function handleApprove(reviewId: string) {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status: "approved" }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: "approved" } : r))
        );
        setToast({
          open: true,
          message: "Review approved successfully",
          severity: "success",
        });
      } else {
        const data = await res.json();
        setToast({
          open: true,
          message: data.error || "Failed to approve review",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Approve error:", error);
      setToast({
        open: true,
        message: "Failed to approve review",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(reviewId: string) {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status: "rejected" }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: "rejected" } : r))
        );
        setToast({
          open: true,
          message: "Review rejected successfully",
          severity: "success",
        });
      } else {
        const data = await res.json();
        setToast({
          open: true,
          message: data.error || "Failed to reject review",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Reject error:", error);
      setToast({
        open: true,
        message: "Failed to reject review",
        severity: "error",
      });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteDialog) return;

    setActionLoading(deleteDialog);
    try {
      const res = await fetch(`/api/admin/reviews?id=${deleteDialog}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteDialog));
        setToast({
          open: true,
          message: "Review deleted successfully",
          severity: "success",
        });
      } else {
        const data = await res.json();
        setToast({
          open: true,
          message: data.error || "Failed to delete review",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setToast({
        open: true,
        message: "Failed to delete review",
        severity: "error",
      });
    } finally {
      setDeleteDialog(null);
      setActionLoading(null);
    }
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: 4,
        pb: { xs: 12, lg: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          isBold
          sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Star size={24} color="#01D676" />
          Reviews Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {reviews.length} total reviews
        </Typography>
      </Box>

      {/* Filter tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <Button
            key={tab}
            onClick={() => setFilter(tab)}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
              fontSize: "0.8rem",
              borderRadius: 2,
              px: 2,
              py: 0.75,
              color: filter === tab ? "#fff" : colors.text.secondary,
              bgcolor:
                filter === tab ? colors.background.gradient : colors.primary,
              background: filter === tab ? colors.background.gradient : undefined,
              border: `1px solid ${
                filter === tab ? "transparent" : colors.divider
              }`,
              "&:hover": { bgcolor: colors.background.ternary },
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Reviews Table */}
      {!loading && reviews.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${colors.divider}`,
            bgcolor: colors.background.secondary,
            p: 5,
            textAlign: "center",
          }}
        >
          <Star size={36} color="rgba(169,169,202,0.3)" style={{ margin: "0 auto" }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            No reviews found
          </Typography>
        </Paper>
      )}

      {!loading && reviews.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.divider}`,
            bgcolor: "transparent",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: colors.primary }}>
                {["User", "Rating", "Title", "Comment", "Status", "Date", "Actions"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: colors.text.secondary,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        borderColor: colors.divider,
                      }}
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => {
                const sc = STATUS_COLORS[review.status] ?? STATUS_COLORS.pending;
                return (
                  <TableRow
                    key={review.id}
                    sx={{
                      "&:hover": { bgcolor: colors.background.ternary },
                    }}
                  >
                    <TableCell sx={{ borderColor: colors.divider }}>
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
                          <Typography
                            sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                          >
                            {review.user_name}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              color: colors.text.secondary,
                            }}
                          >
                            {review.user_email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider }}>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: colors.divider,
                        maxWidth: 200,
                        fontSize: "0.8rem",
                      }}
                    >
                      {review.title}
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: colors.divider,
                        maxWidth: 300,
                        fontSize: "0.75rem",
                        color: colors.text.secondary,
                      }}
                    >
                      {review.comment.slice(0, 100)}
                      {review.comment.length > 100 && "..."}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider }}>
                      <Chip
                        label={review.status}
                        size="small"
                        sx={{
                          bgcolor: sc.bg,
                          color: sc.color,
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        borderColor: colors.divider,
                        fontSize: "0.75rem",
                        color: colors.text.secondary,
                      }}
                    >
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.divider }}>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {review.status === "pending" && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(review.id)}
                              disabled={actionLoading === review.id}
                              sx={{
                                color: "#01D676",
                                bgcolor: "rgba(1,214,118,0.1)",
                                "&:hover": { bgcolor: "rgba(1,214,118,0.2)" },
                              }}
                            >
                              <CheckCircle size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReject(review.id)}
                              disabled={actionLoading === review.id}
                              sx={{
                                color: "#f87171",
                                bgcolor: "rgba(239,68,68,0.1)",
                                "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                              }}
                            >
                              <XCircle size={16} />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setDeleteDialog(review.id)}
                          disabled={actionLoading === review.id}
                          sx={{
                            color: "#f87171",
                            bgcolor: "rgba(239,68,68,0.1)",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                          }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.background.default,
              border: `1px solid ${colors.divider}`,
              borderRadius: 4,
              minWidth: 400,
            },
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${colors.divider}`, py: 1.5 }}>
          <Typography variant="subtitle1" isBold>
            Delete Review
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography variant="body2" color="textSecondary">
            Are you sure you want to delete this review? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialog(null)}
            sx={{ textTransform: "none", color: colors.text.secondary }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={actionLoading !== null}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "rgba(239,68,68,0.15)",
              color: "#f87171",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "rgba(239,68,68,0.25)" },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{
            bgcolor:
              toast.severity === "success"
                ? "rgba(1,214,118,0.1)"
                : "rgba(239,68,68,0.1)",
            border: `1px solid ${
              toast.severity === "success"
                ? "rgba(1,214,118,0.3)"
                : "rgba(239,68,68,0.3)"
            }`,
            color: toast.severity === "success" ? "#01D676" : "#f87171",
            "& .MuiAlert-icon": {
              color: toast.severity === "success" ? "#01D676" : "#f87171",
            },
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
