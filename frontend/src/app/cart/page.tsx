"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, Loader2, Home } from "lucide-react";

interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number;
  stock_available: number;
  image_url: string;
}

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchCartItems = async () => {
    try {
      const data = await apiRequest("/carts");
      setCartItems(data);
    } catch (e) {
      console.error("Gagal memuat keranjang belanja:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchCartItems();
  }, [user]);

  const handleUpdateQty = async (itemId: number, newQty: number, maxStock: number) => {
    if (newQty < 1) return;
    if (newQty > maxStock) {
      alert(`Stok tidak mencukupi. Sisa stok: ${maxStock}`);
      return;
    }
    setActionLoadingId(itemId);
    try {
      await apiRequest(`/carts/${itemId}`, {
        method: "PUT",
        bodyData: { quantity: newQty }
      });
      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui kuantitas.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini dari keranjang?")) return;
    setActionLoadingId(itemId);
    try {
      await apiRequest(`/carts/${itemId}`, {
        method: "DELETE"
      });
      await fetchCartItems();
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus item.");
    } finally {
      setActionLoadingId(null);
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
        <span className="text-sm text-muted-foreground">Memuat keranjang belanja Anda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
      <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
        <ShoppingCart className="w-8 h-8 text-primary" /> Keranjang Belanja
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <p className="text-muted-foreground text-sm mb-6">Keranjang belanja Anda kosong.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl shadow-lg hover:bg-primary/95 transition-all">
            <Home className="w-4 h-4" /> Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="glass-card p-4 rounded-2xl flex gap-4 items-center">
                {/* Product Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={getFullImageUrl(item.image_url)}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-1">
                    {item.product_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Harga: {formatCurrency(item.price)}
                  </p>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity - 1, item.stock_available)}
                      disabled={item.quantity <= 1 || actionLoadingId === item.id}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.id, item.quantity + 1, item.stock_available)}
                      disabled={item.quantity >= item.stock_available || actionLoadingId === item.id}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price and Delete Actions */}
                <div className="text-right flex flex-col items-end gap-3 pl-2">
                  <span className="font-bold text-sm md:text-base text-primary">
                    {formatCurrency(parseFloat(item.price) * item.quantity)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={actionLoadingId === item.id}
                    className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout / Summary Panel */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 text-foreground">Ringkasan Belanja</h2>
            
            <div className="space-y-3 pb-4 border-b border-white/5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Barang</span>
                <span>{cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0)} Pcs</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base mt-4 mb-6">
              <span>Total Tagihan</span>
              <span className="text-primary">{formatCurrency(totalAmount)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-4.5 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2"
            >
              Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
