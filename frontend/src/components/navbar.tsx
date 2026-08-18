"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { ShoppingCart, User, LogOut, Store, LayoutDashboard, PlusCircle, Settings, Home, X, Mail, Phone, Heart, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function Navbar() {
  const { user, logout, switchRole } = useAuth();
  const pathname = usePathname();
  
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Mengambil total item di keranjang belanja secara real-time
  useEffect(() => {
    if (user && user.role === "buyer") {
      const fetchCartCount = async () => {
        let dbTotal = 0;
        try {
          const items = await apiRequest("/carts");
          dbTotal = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
        } catch (e) {
          console.error("Gagal memuat kuantitas keranjang dari server:", e);
        }
        
        let localTotal = 0;
        try {
          const localCart = JSON.parse(localStorage.getItem("mock_cart") || "[]");
          localTotal = localCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
        } catch (e) {
          console.error("Gagal memuat kuantitas keranjang lokal:", e);
        }
        
        setCartCount(dbTotal + localTotal);
      };
      
      fetchCartCount();
      
      // Setup event listener untuk memantau perubahan keranjang belanja lokal
      window.addEventListener("cartUpdated", fetchCartCount);
      return () => window.removeEventListener("cartUpdated", fetchCartCount);
    } else {
      setCartCount(0);
    }
  }, [user, pathname]);

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    setIsSubmitLoading(true);
    try {
      await switchRole(storeName, storeDesc);
      setShowSwitchModal(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengaktifkan toko.");
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const isSellerRoute = pathname.startsWith("/seller");

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white text-[11px] font-medium py-2.5 px-6 md:px-12 flex justify-between items-center border-b border-primary/10">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 opacity-90"><Mail className="w-3.5 h-3.5" /> support@lexacommerce.com</span>
          <span className="flex items-center gap-1.5 opacity-90"><Phone className="w-3.5 h-3.5" /> +(123) 4567 890</span>
        </div>
        <div className="hidden sm:flex items-center gap-5 opacity-95">
          <span>Welcome to Our Store!</span>
          <span className="hover:opacity-100 cursor-pointer transition-opacity">English ▼</span>
          <span className="hover:opacity-100 cursor-pointer transition-opacity">USD ($) ▼</span>
        </div>
      </div>

      <nav className="bg-white sticky top-0 z-40 w-full border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        {/* Brand Logo */}
        <Link href={user?.role === "seller" ? "/seller" : "/"} className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-gray-900">
            LEXACOMMERCE<span className="text-primary font-bold text-3xl">.</span>
          </span>
          {user?.role === "seller" && (
            <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-semibold ml-1">
              Seller Pro
            </span>
          )}
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {user?.role === "seller" ? (
            <>
              <Link 
                href="/seller" 
                className={`flex items-center gap-1.5 transition-colors hover:text-primary ${pathname === "/seller" ? "text-primary font-semibold" : "text-gray-600"}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dasbor
              </Link>
              <Link 
                href="/seller/products" 
                className={`flex items-center gap-1.5 transition-colors hover:text-primary ${pathname.startsWith("/seller/products") ? "text-primary font-semibold" : "text-gray-600"}`}
              >
                <PlusCircle className="w-4 h-4" /> Kelola Produk
              </Link>
              <Link 
                href="/seller/orders" 
                className={`flex items-center gap-1.5 transition-colors hover:text-primary ${pathname.startsWith("/seller/orders") ? "text-primary font-semibold" : "text-gray-600"}`}
              >
                <ShoppingCart className="w-4 h-4" /> Pesanan Masuk
              </Link>
              <Link 
                href="/seller/settings" 
                className={`flex items-center gap-1.5 transition-colors hover:text-primary ${pathname.startsWith("/seller/settings") ? "text-primary font-semibold" : "text-gray-600"}`}
              >
                <Settings className="w-4 h-4" /> Pengaturan Toko
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/" 
                className={`transition-colors hover:text-primary ${pathname === "/" ? "text-primary font-semibold" : "text-gray-600"}`}
              >
                Home
              </Link>
              <Link 
                href="#shop" 
                className="transition-colors hover:text-primary text-gray-600"
              >
                Shop
              </Link>
              <Link 
                href="#pages" 
                className="transition-colors hover:text-primary text-gray-600"
              >
                Pages
              </Link>
              <Link 
                href="#blog" 
                className="transition-colors hover:text-primary text-gray-600"
              >
                Blog
              </Link>
              <Link 
                href="#buy" 
                className="transition-colors hover:text-primary text-gray-600"
              >
                Buy
              </Link>
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4 text-gray-700">
          {/* Search Icon */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700" title="Search">
            <Search className="w-5 h-5" />
          </button>

          {/* User Icon / Login Status */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "seller" && isSellerRoute && (
                <Link
                  href="/"
                  className="hidden sm:flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Home className="w-4 h-4" /> Mode Pembeli
                </Link>
              )}
              {user.role === "buyer" && (
                <button
                  onClick={() => setShowSwitchModal(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-primary/95 transition-all"
                >
                  <Store className="w-4 h-4" /> Buka Toko
                </button>
              )}
              
              <Link href={user.role === "seller" ? "/seller" : "/"} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700" title="Profile">
                <User className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Link href="/login" className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700" title="Login">
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Wishlist Icon */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700" title="Wishlist">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700" title="Cart">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Logout / User Info */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-gray-800">{user.email}</span>
                <span className="text-[10px] text-gray-500 capitalize">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ml-1"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 border-l border-gray-200 pl-3">
              <Link href="/login" className="text-xs font-semibold text-gray-700 hover:text-primary transition-colors px-3 py-1.5">
                Masuk
              </Link>
              <Link
                href="/register"
                className="bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-primary/95 transition-all"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Switch to Seller Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative animate-fade-in">
            <button
              onClick={() => setShowSwitchModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <Store className="w-10 h-10 text-primary mx-auto mb-2" />
              <h3 className="text-xl font-bold text-foreground">Buka Toko Penjual</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ubah profil Anda menjadi Penjual dan mulailah mengunggah produk Anda sendiri.
              </p>
            </div>
            
            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  NAMA TOKO *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama toko impian Anda..."
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  DESKRIPSI TOKO
                </label>
                <textarea
                  placeholder="Deskripsikan barang yang ingin Anda jual..."
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-3 rounded-xl shadow-lg transition-all flex justify-center items-center"
              >
                {isSubmitLoading ? "Mengaktifkan..." : "Aktifkan Mode Penjual"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
