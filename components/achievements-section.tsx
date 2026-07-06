"use client";

import { Box, Paper } from "@mui/material";
import { useThemeMode } from "@/lib/contexts/ThemeContext";
import { useI18n } from "@/lib/contexts/I18nContext";
import { getColors } from "@/theme/colors";
import { achievements, type Achievement } from "@/lib/achievements";
import Typography from "@/components/ui/Typography";

interface AchievementsSectionProps {
  completedIds: string[];
  coins: number;
  totalEarned: number;
  streak: number;
  referrals: number;
  offersCompleted: number;
}

export default function AchievementsSection({
  completedIds,
  coins,
  totalEarned,
  streak,
  referrals,
  offersCompleted,
}: AchievementsSectionProps) {
  const { mode } = useThemeMode();
  const { lang } = useI18n();
  const colors = getColors(mode);

  const isUnlocked = (a: Achievement) => completedIds.includes(a.id) || a.requirement(coins, totalEarned, streak, referrals, offersCompleted);

  return (
    <Box>
      <Typography variant="subtitle2" isBold sx={{ mb: 2, fontSize: "0.9rem" }}>
        🏅 {lang === "hi" ? "उपलब्धियां" : "Achievements"}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
        {achievements.map((a) => {
          const unlocked = isUnlocked(a);
          return (
            <Paper
              key={a.id}
              elevation={0}
              sx={{
                minWidth: 100, maxWidth: 100, p: 1.5, textAlign: "center", flexShrink: 0,
                bgcolor: unlocked ? colors.greenTint : colors.background.glass,
                border: `1px solid ${unlocked ? "rgba(1, 214, 118, 0.3)" : colors.glass.border}`,
                backdropFilter: colors.glass.backdrop,
                borderRadius: 2, opacity: unlocked ? 1 : 0.5,
              }}
            >
              <Box sx={{ fontSize: "1.5rem", mb: 0.5 }}>{a.icon}</Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 600, lineHeight: 1.2 }}>
                {lang === "hi" ? a.titleHi : a.title}
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: colors.textSecondary, mt: 0.25 }}>
                {lang === "hi" ? a.descriptionHi : a.description}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
