"use client";

import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from "@mui/material";
import Typography from "@/components/ui/Typography";
import { Users } from "lucide-react";
import colors from "@/theme/colors";

interface User {
  id: string;
  email: string;
  displayName: string;
  coinsBalance: number;
  referralCode: string;
  createdAt: string;
}

interface AdminUsersClientProps {
  users: User[];
}

export default function AdminUsersClient({ users }: AdminUsersClientProps) {
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Users size={28} color="#01D676" />
        <Box>
          <Typography variant="h4" isBold>
            User Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your {users.length} registered users
          </Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: colors.primary, borderRadius: 3, border: `1px solid ${colors.divider}` }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.divider}` }}>USER</TableCell>
              <TableCell sx={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.divider}` }}>EMAIL</TableCell>
              <TableCell sx={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.divider}` }}>BALANCE</TableCell>
              <TableCell sx={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.divider}` }}>REFERRAL CODE</TableCell>
              <TableCell sx={{ color: colors.text.secondary, borderBottom: `1px solid ${colors.divider}` }}>JOINED</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: colors.text.secondary, borderBottom: "none" }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#01D676", fontSize: "14px", fontWeight: "bold" }}>
                        {user.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: colors.text.primary }}>
                          {user.displayName}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: colors.text.secondary }}>
                          ID: {user.id.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                    <Typography sx={{ color: colors.text.secondary }}>
                      {user.email || "No email"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                    <Chip 
                      label={`${user.coinsBalance.toLocaleString()} Coins`} 
                      size="small" 
                      sx={{ 
                        bgcolor: "rgba(1,214,118,0.1)", 
                        color: "#01D676",
                        fontWeight: "bold",
                        border: "1px solid rgba(1,214,118,0.2)"
                      }} 
                    />
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                    <Typography sx={{ color: colors.text.primary, fontFamily: "monospace", letterSpacing: "1px" }}>
                      {user.referralCode}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: `1px solid ${colors.divider}` }}>
                    <Typography sx={{ color: colors.text.secondary }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
