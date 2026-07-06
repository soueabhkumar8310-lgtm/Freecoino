"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Paper, Switch, Button, Divider, CircularProgress, Alert,
} from "@mui/material";
import {
  Sun, Moon, Globe, Bell, Shield, Wallet, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useThemeMode } from "@/lib/contexts/ThemeContext";
import { useI18n } from "@/lib/contexts/I18nContext";
import { getColors } from "@/theme/colors";
import Typography from "@/components/ui/Typography";
import AppShell from "@/components/app-shell";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase/client";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { mode, toggle: toggleTheme } = useThemeMode();
  const { lang, setLang, t } = useI18n();
  const router = useRouter();
  const colors = getColors(mode);

  const [displayName, setDisplayName] = useState("");
  const [ltcAddress, setLtcAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [emailOffers, setEmailOffers] = useState(true);
  const [emailPromos, setEmailPromos] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { permission, requestPermission, sendNotification } = usePushNotifications();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setDisplayName(user.name || "");
      setLtcAddress(user.ltc_address || "");
      setLoaded(true);
    }
  }, [user, isLoading, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, ltc_address: ltcAddress })
        .eq("id", user.id);
      if (error) throw error;
      toast.success(t("settings.saved"));
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("settings.password_updated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !loaded) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: colors.bgPage }}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  const sectionTitle = (icon: React.ReactNode, title: string) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ color: colors.primary, display: "flex" }}>{icon}</Box>
      <Typography variant="h6" isBold>{title}</Typography>
    </Box>
  );

  const settingRow = (
    label: string,
    value: React.ReactNode,
    description?: string,
  ) => (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      py: 1.5, gap: 2, flexWrap: { xs: "wrap", sm: "nowrap" },
    }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem" }}>{label}</Typography>
        {description && (
          <Typography sx={{ fontSize: "0.75rem", color: colors.textSecondary, mt: 0.25 }}>{description}</Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{value}</Box>
    </Box>
  );

  const navCard = (icon: React.ReactNode, label: string, onClick: () => void, badge?: string) => (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        display: "flex", alignItems: "center", gap: 2, p: 2.5,
        bgcolor: colors.background.glass,
        backdropFilter: colors.glass.backdrop,
        border: `1px solid ${colors.glass.border}`,
        borderRadius: 2, cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: colors.glass.borderHover,
          bgcolor: colors.background.glassHover,
        },
      }}
    >
      <Box sx={{ color: colors.primary, display: "flex" }}>{icon}</Box>
      <Typography sx={{ flex: 1, fontWeight: 600 }}>{label}</Typography>
      {badge && (
        <Box sx={{
          px: 1.5, py: 0.25, borderRadius: 10,
          bgcolor: colors.greenTint, color: colors.green,
          fontSize: "0.75rem", fontWeight: 600,
        }}>{badge}</Box>
      )}
      <ChevronRight size={18} color={colors.textSecondary} />
    </Paper>
  );

  return (
    <AppShell userName={user.name} userId={user.id}>
      <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4, pb: { xs: 12, lg: 4 } }}>
        <Typography variant="h5" isBold sx={{ mb: 3 }}>{t("settings.title")}</Typography>

        {/* Appearance */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          {sectionTitle(<Sun size={22} />, t("settings.theme"))}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {(["dark", "light"] as const).map((m) => (
              <Box
                key={m}
                onClick={() => { if (m !== mode) toggleTheme(); }}
                sx={{
                  flex: 1, minWidth: 120, p: 2, borderRadius: 2,
                  cursor: "pointer", textAlign: "center",
                  border: `2px solid ${mode === m ? colors.primary : colors.glass.border}`,
                  bgcolor: mode === m ? colors.greenTint : colors.background.glass,
                  transition: "all 0.2s",
                  "&:hover": { borderColor: colors.primary },
                }}
              >
                {m === "dark" ? <Moon size={24} style={{ margin: "0 auto 8px", color: mode === "dark" ? colors.primary : colors.textSecondary }} />
                  : <Sun size={24} style={{ margin: "0 auto 8px", color: mode === "light" ? colors.primary : colors.textSecondary }} />}
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {m === "dark" ? t("settings.theme_dark") : t("settings.theme_light")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Language */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          {sectionTitle(<Globe size={22} />, t("settings.language"))}
          <Box sx={{ display: "flex", gap: 2 }}>
            {(["en", "hi"] as const).map((l) => (
              <Box
                key={l}
                onClick={() => setLang(l)}
                sx={{
                  flex: 1, p: 2, borderRadius: 2, cursor: "pointer", textAlign: "center",
                  border: `2px solid ${lang === l ? colors.primary : colors.glass.border}`,
                  bgcolor: lang === l ? colors.greenTint : colors.background.glass,
                  transition: "all 0.2s",
                  "&:hover": { borderColor: colors.primary },
                }}
              >
                <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>
                  {l === "en" ? "🇺🇸" : "🇮🇳"}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                  {l === "en" ? t("settings.language_en") : t("settings.language_hi")}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Account Settings */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          {sectionTitle(<Shield size={22} />, t("settings.account"))}

          <Box component="label" sx={{ display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 600, color: colors.textSecondary }}>
            {t("settings.display_name")}
          </Box>
          <Box
            component="input"
            value={displayName}
            onChange={(e: any) => setDisplayName(e.target.value)}
            sx={{
              width: "100%", p: 1.5, mb: 2, borderRadius: 1,
              bgcolor: colors.bgInput, border: `1px solid ${colors.divider}`,
              color: colors.textPrimary, fontSize: "0.9375rem",
              outline: "none",
              "&:focus": { borderColor: colors.primary },
            }}
          />

          <Box component="label" sx={{ display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 600, color: colors.textSecondary }}>
            {t("settings.ltc_address")}
          </Box>
          <Box
            component="input"
            value={ltcAddress}
            onChange={(e: any) => setLtcAddress(e.target.value)}
            placeholder="LTC wallet address"
            sx={{
              width: "100%", p: 1.5, mb: 2, borderRadius: 1,
              bgcolor: colors.bgInput, border: `1px solid ${colors.divider}`,
              color: colors.textPrimary, fontSize: "0.9375rem",
              outline: "none",
              "&:focus": { borderColor: colors.primary },
            }}
          />

          <Box sx={{ mb: 1, fontSize: "0.875rem", fontWeight: 600, color: colors.textSecondary }}>
            {t("settings.email")}
          </Box>
          <Box sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: colors.bgInput, color: colors.textSecondary, fontSize: "0.9375rem" }}>
            {user.email}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveProfile}
            disabled={saving}
            sx={{ width: "100%" }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : t("settings.save")}
          </Button>
        </Paper>

        {/* Password */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          {sectionTitle(<Shield size={22} />, t("settings.change_password"))}

          <Box component="label" sx={{ display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 600, color: colors.textSecondary }}>
            {t("settings.new_password")}
          </Box>
          <Box
            component="input"
            type="password"
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.target.value)}
            sx={{
              width: "100%", p: 1.5, mb: 2, borderRadius: 1,
              bgcolor: colors.bgInput, border: `1px solid ${colors.divider}`,
              color: colors.textPrimary, fontSize: "0.9375rem",
              outline: "none",
              "&:focus": { borderColor: colors.primary },
            }}
          />

          <Box component="label" sx={{ display: "block", mb: 1, fontSize: "0.875rem", fontWeight: 600, color: colors.textSecondary }}>
            {t("settings.confirm_password")}
          </Box>
          <Box
            component="input"
            type="password"
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            sx={{
              width: "100%", p: 1.5, mb: 2, borderRadius: 1,
              bgcolor: colors.bgInput, border: `1px solid ${colors.divider}`,
              color: colors.textPrimary, fontSize: "0.9375rem",
              outline: "none",
              "&:focus": { borderColor: colors.primary },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePassword}
            disabled={saving || !newPassword}
            sx={{ width: "100%" }}
          >
            {saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : t("settings.change_password")}
          </Button>
        </Paper>

        {/* Notifications */}
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, bgcolor: colors.bgCard, border: `1px solid ${colors.divider}`, borderRadius: 2 }}>
          {sectionTitle(<Bell size={22} />, t("settings.notifications"))}

          {settingRow(
            t("settings.email_digest"),
            <Switch checked={emailDigest} onChange={(e) => setEmailDigest(e.target.checked)} color="primary" />,
          )}
          <Divider sx={{ borderColor: colors.divider }} />
          {settingRow(
            t("settings.email_offers"),
            <Switch checked={emailOffers} onChange={(e) => setEmailOffers(e.target.checked)} color="primary" />,
          )}
          <Divider sx={{ borderColor: colors.divider }} />
          {settingRow(
            "Push Notifications",
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                if (permission === "granted") {
                  sendNotification("Test Notification", "Hello from Freecoino!");
                } else {
                  requestPermission();
                }
              }}
              sx={{ borderColor: colors.divider, color: colors.text.primary, fontSize: "0.75rem" }}
            >
              {permission === "granted" ? "Send Test" : permission === "denied" ? "Blocked" : "Enable"}
            </Button>,
          )}
          <Divider sx={{ borderColor: colors.divider }} />
          {settingRow(
            t("settings.email_promotions"),
            <Switch checked={emailPromos} onChange={(e) => setEmailPromos(e.target.checked)} color="primary" />,
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}
