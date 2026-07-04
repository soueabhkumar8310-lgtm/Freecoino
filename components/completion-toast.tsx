"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Box, Snackbar, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { supabase } from "@/lib/supabase/client";

export default function CompletionToast() {
  const [userId, setUserId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: "", message: "" });
  const processedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const showCompletion = useCallback((title: string, message: string) => {
    setSnackbar({ open: true, title, message });
  }, []);

  const handleClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Poll for new notifications
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/notifications?user_id=${userId}&t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        const notifications = data.notifications || [];
        for (const n of notifications) {
          if (!n.read && !processedIdsRef.current.has(n.id)) {
            processedIdsRef.current.add(n.id);
            showCompletion(n.title, n.message);
          }
        }
      } catch {
        // silent
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, showCompletion]);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ bottom: { xs: 80, md: 24 } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          bgcolor: "#1a1b2e",
          border: "1px solid rgba(1, 214, 118, 0.3)",
          borderRadius: 2,
          p: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          maxWidth: 380,
          minWidth: 300,
        }}
      >
        <CheckCircleIcon sx={{ color: "#01D676", fontSize: 28, flexShrink: 0, mt: 0.25 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#01D676", mb: 0.25 }}>
            {snackbar.title}
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
            {snackbar.message}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "rgba(255,255,255,0.4)", p: 0.5, mt: -0.5, mr: -0.5 }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Snackbar>
  );
}
