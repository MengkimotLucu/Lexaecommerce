"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Loader2, DollarSign, Package, ShoppingCart, TrendingUp, Store } from "lucide-react";

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

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Ambil pesanan masuk penjual
        const ordersData = await apiRequest("/orders/seller");
        setOrders(ordersData);

        // Ambil katalog produk untuk menghitung jumlah produk
        const productsData = await apiRequest("/products");
        const sellerProducts = productsData.filter((p: any) => p.seller_id === user.id);
        setProductsCount(sellerProducts.length);
      } catch (e) {
        console.error("Gagal memuat data dasbor:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Kalkulasi Pendapatan dan Total Order
  const processedOrders = orders.filter((o) => o.status !== "PENDING");
  const totalIncome = orders.reduce((acc: number, order: Order) => {
    // Hitung total dari produk milik seller ini di order tersebut
    const orderTotal = order.items.reduce(
      (sum: number, item: any) => sum + parseFloat(item.price_at_purchase) * item.quantity,
      0
    );
    return acc + orderTotal;
  }, 0);

  const totalOrdersCount = orders.length;

  // Agregasi pendapatan harian untuk grafik
  const getChartData = () => {
    const dailyMap: { [key: string]: number } = {};
    
    // Inisialisasi 7 hari terakhir agar grafik tidak kosong
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dailyMap[dateStr] = 0;
    }

    orders.forEach((order) => {
      try {
        const orderDate = new Date(order.created_at);
        const dateStr = orderDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        const revenue = order.items.reduce(
          (sum: number, item: any) => sum + parseFloat(item.price_at_purchase) * item.quantity,
          0
        );
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += revenue;
        } else {
          // Hanya tambahkan jika berada dalam rentang terdekat
          dailyMap[dateStr] = revenue;
        }
      } catch (e) {}
    });

    return Object.keys(dailyMap).map((date) => ({
      name: date,
      Pendapatan: dailyMap[date]
    }));
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Memuat analitik dasbor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10">
      {/* Header Toko */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-violet-900/40 to-indigo-900/30 p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{user?.store_name || "Toko Penjual"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.store_description || "Belum ada deskripsi toko."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" /> Toko Aktif
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Pendapatan</span>
            <h3 className="text-2xl font-black text-foreground mt-2">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pesanan Masuk</span>
            <h3 className="text-2xl font-black text-foreground mt-2">{totalOrdersCount} Transaksi</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Products Card */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Katalog Produk</span>
            <h3 className="text-2xl font-black text-foreground mt-2">{productsCount} Produk</h3>
          </div>
          <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Graph Chart */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground">Grafik Pendapatan Toko</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Statistik pendapatan harian toko Anda selama 7 hari terakhir.</p>
        </div>
        
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: "rgba(22, 28, 45, 0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }} 
                formatter={(value: any) => [formatCurrency(value), "Pendapatan"]}
              />
              <Area type="monotone" dataKey="Pendapatan" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPendapatan)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
