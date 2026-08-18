"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Mail, Lock, UserPlus, ArrowRight, User, Store } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer"); // buyer atau seller
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, role);
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-foreground/75">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            Mulai pengalaman belanja dan jualan di platform LEXACOMMERCE.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl mb-6 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              PILIH PERAN UTAMA
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  role === "buyer"
                    ? "border-primary bg-primary/10 text-primary shadow-lg"
                    : "border-white/5 bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" /> Pembeli
              </button>
              <button
                type="button"
                onClick={() => setRole("seller")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  role === "seller"
                    ? "border-primary bg-primary/10 text-primary shadow-lg"
                    : "border-white/5 bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store className="w-4 h-4" /> Penjual
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex justify-center items-center gap-2 mt-8"
          >
            {loading ? (
              "Mendaftarkan..."
            ) : (
              <>
                Daftar <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8 relative">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold flex items-center justify-center gap-1 mt-1">
            Masuk Sekarang <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
