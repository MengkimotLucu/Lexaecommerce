"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { CheckCircle, ShoppingBag, Loader2, ArrowLeft, CreditCard } from "lucide-react";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  image_url: string;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<{ id: number; total: number } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    const fetchCartItems = async () => {
      try {
        const data = await apiRequest("/carts");
        setCartItems(data);
      } catch (e) {
        console.error("Gagal memuat checkout:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [user]);

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("/orders/checkout", {
        method: "POST"
      });
      
      // Berhasil membuat pesanan
      setSuccessOrder({
        id: response.order_id,
        total: response.total_amount
      });
      
      // Memicu update Navbar
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      alert(err.message || "Gagal memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
    if (url.startsWith("/static")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const totalAmount = cartItems.reduce((acc: number, item: CartItem) => acc + parseFloat(item.price) * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Menyiapkan ringkasan pesanan...</span>
      </div>
    );
  }

  // Jika pesanan telah berhasil dibuat
  if (successOrder) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Pesanan Berhasil!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pesanan Anda dengan nomor ID <span className="text-primary font-bold">#{successOrder.id}</span> telah dibuat dan sisa stok produk otomatis terpotong di database.
        </p>

        <div className="glass p-5 rounded-2xl mb-8 space-y-2 text-sm text-left">
          <div className="flex justify-between text-muted-foreground">
            <span>Metode Pembayaran</span>
            <span className="font-semibold text-foreground">Transfer Manual</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Pembayaran</span>
            <span className="font-bold text-primary">{formatCurrency(successOrder.total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Status Pesanan</span>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">PENDING</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-xl shadow-lg hover:bg-primary/95 transition-all flex justify-center items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Lanjut Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Keranjang
      </Link>

      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
        <CreditCard className="w-8 h-8 text-primary" /> Ringkasan Pesanan (Checkout)
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <p className="text-muted-foreground text-sm">Tidak ada barang untuk checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Order Items list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-1 tracking-wider">PRODUK YANG DIBELI</h2>
            {cartItems.map((item) => (
              <div key={item.id} className="glass p-4 rounded-xl flex gap-4 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={getFullImageUrl(item.image_url)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.product_name}</h3>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} x {formatCurrency(item.price)}
                  </span>
                </div>
                <div className="font-bold text-sm text-foreground pl-2">
                  {formatCurrency(parseFloat(item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Details Panel */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 text-foreground">Detail Pembayaran</h2>

            <div className="space-y-4 text-xs pb-4 border-b border-white/5">
              <div className="p-3 bg-secondary/50 rounded-xl border border-white/5 leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Informasi Pengiriman & Pembayaran</p>
                Platform ini adalah versi demo light. Pesanan akan langsung dibuat di database tanpa kalkulasi logistik (ongkos kirim) dan tanpa payment gateway.
              </div>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>Subtotal Produk</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base mt-4 mb-8">
              <span>Total Pembayaran</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-4.5 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses Transaksi...
                </>
              ) : (
                "Buat Pesanan & Kurangi Stok"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
