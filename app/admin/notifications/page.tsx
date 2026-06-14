import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin-shell";
import { Box } from "@mui/material";
import Typography from "@/components/ui/Typography";
import { Bell } from "lucide-react";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'soueabhkumar8310@gmail.com';

export default async function AdminNotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return (
    <AdminShell>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" isBold sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Bell size={28} color="#facc15" />
            Notifications System
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            This feature is coming soon.
          </Typography>
        </Box>
      </Box>
    </AdminShell>
  );
}
