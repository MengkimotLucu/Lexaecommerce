"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { X, CheckCircle, Package } from "lucide-react";

interface NotificationMsg {
  id: string;
  message: string;
  order_id: number;
  status: string;
  timestamp: Date;
}

export default function WebSocketNotification() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    // Membuka koneksi WebSocket ke API gateway
    const socket = new WebSocket(`${wsUrl}/api/ws/notifications/${user.id}`);

    socket.onopen = () => {
      console.log("WebSocket terhubung untuk user:", user.id);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ORDER_STATUS_UPDATE") {
          const newNotif: NotificationMsg = {
            id: Math.random().toString(36).substring(2, 9),
            message: data.message,
            order_id: data.order_id,
            status: data.status,
            timestamp: new Date()
          };
          
          setNotifications((prev) => [newNotif, ...prev]);

          // Notifikasi akan otomatis hilang dalam 8 detik
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== newNotif.id));
          }, 8000);
        }
      } catch (err) {
        console.error("Gagal membaca pesan WebSocket:", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [user]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="glass p-4 rounded-xl border border-primary/20 bg-card/90 shadow-2xl flex gap-3 items-start animate-fade-in"
        >
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {notif.status === "DONE" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Package className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-primary">Status Pesanan Update</span>
              <span className="text-xs text-muted-foreground">Baru saja</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed pr-4">
              {notif.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
