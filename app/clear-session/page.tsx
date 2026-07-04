"use client";

import { useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import Typography from '@/components/ui/Typography';
import { useRouter } from 'next/navigation';

export default function ClearSessionPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all authentication data
    if (typeof window !== 'undefined') {
      // Clear all Supabase auth keys from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('freecoino'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Also clear session storage
      sessionStorage.clear();
      
      // Clear all cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      console.log('✅ All sessions cleared (localStorage, sessionStorage, cookies). Redirecting to login...');
      
      // Redirect to login after 2 seconds with a force reload
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    }
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0a0b0f',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#01D676', mb: 3 }} size={48} />
          <Typography variant="h5" isBold sx={{ color: '#fff', mb: 2 }}>
            Clearing Sessions...
          </Typography>
          <Typography sx={{ color: '#a9a9ca' }}>
            Removing all authentication data. You will be redirected to login.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
