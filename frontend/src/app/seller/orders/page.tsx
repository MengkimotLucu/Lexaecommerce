"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { ShoppingBag, Loader2, Play, Check, Clock } from "lucide-react";

interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price_at_purchase: string;
  }>;
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchSellerOrders = async () => {
    try {
      const data = await apiRequest("/orders/seller");
      setOrders(data);
    } catch (e) {
      console.error("Gagal memuat pesanan masuk:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller") {
      router.push("/");
      return;
    }
    fetchSellerOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: "PUT",
        bodyData: { status: nextStatus }
      });
      await fetchSellerOrders();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Memuat daftar pesanan masuk...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary" /> Pesanan Masuk
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola transaksi pesanan pembeli dan ubah status pengirimannya.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <p className="text-muted-foreground text-sm">Belum ada pesanan masuk untuk produk Anda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isPending = order.status === "PENDING";
            const isProcessed = order.status === "PROCESSED";
            const isDone = order.status === "DONE";

            return (
              <div key={order.id} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                {/* Header Pesanan */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">
                      ID Pesanan #{order.id}
                    </h3>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Dibuat pada: {formatDate(order.created_at)}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                      isPending
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : isProcessed
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* List Produk dalam Pesanan */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Daftar Produk Toko Anda
                  </span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <div className="min-w-0 flex-1 pr-4">
                        <span className="font-semibold text-foreground block truncate">
                          {item.product_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Kuantitas: {item.quantity} Pcs x {formatCurrency(item.price_at_purchase)}
                        </span>
                      </div>
                      <div className="font-bold text-foreground">
                        {formatCurrency(parseFloat(item.price_at_purchase) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Pesanan & Status Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/5">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Pendapatan Anda:</span>{" "}
                    <span className="font-extrabold text-primary text-base">
                      {formatCurrency(
                        order.items.reduce((s: number, i: any) => s + parseFloat(i.price_at_purchase) * i.quantity, 0)
                      )}
                    </span>
                  </div>

                  {/* Tombol Update Status */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "PROCESSED")}
                        disabled={actionLoadingId === order.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                      >
                        {actionLoadingId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" /> Proses Pesanan
                          </>
                        )}
                      </button>
                    )}
                    {isProcessed && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "DONE")}
                        disabled={actionLoadingId === order.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                      >
                        {actionLoadingId === order.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" /> Selesaikan Pengiriman
                          </>
                        )}
                      </button>
                    )}
                    {isDone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 py-2">
                        <Clock className="w-4 h-4 text-emerald-400" /> Transaksi Selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
