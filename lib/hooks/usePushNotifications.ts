"use client";

import { useState, useEffect, useCallback } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, [supported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted") return;
      try {
        new Notification(title, {
          icon: "/logo-256.png",
          ...options,
        });
      } catch {
        // silent
      }
    },
    [permission],
  );

  return { supported, permission, requestPermission, sendNotification };
}
