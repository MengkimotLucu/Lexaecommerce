"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Settings, Store, Save, Loader2 } from "lucide-react";

export default function SellerSettingsPage() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller") {
      router.push("/");
      return;
    }
    
    setStoreName(user.store_name || "");
    setStoreDesc(user.store_description || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      // Endpoint switchRole juga digunakan untuk pembaruan profil toko
      await switchRole(storeName, storeDesc);
      setSuccessMsg("Pengaturan toko berhasil diperbarui!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui pengaturan toko.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" /> Pengaturan Toko
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ubah nama toko, deskripsi profil, dan detail dagang lainnya.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-6 font-semibold animate-fade-in">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-2">
          <Store className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Profil Publik Toko</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            NAMA TOKO *
          </label>
          <input
            type="text"
            required
            placeholder="Masukkan nama toko baru..."
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
            placeholder="Deskripsikan barang dagangan atau visi toko Anda..."
            value={storeDesc}
            onChange={(e) => setStoreDesc(e.target.value)}
            rows={4}
            className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2 mt-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Simpan Pengaturan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
