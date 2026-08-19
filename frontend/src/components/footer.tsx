"use client";

import React from "react";
import Link from "next/link";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f111a] border-t border-white/5 text-gray-400 text-sm mt-auto relative overflow-hidden">
      {/* Glow highlight effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Value Propositions Banner */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 border-b border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Gratis Ongkir</h4>
              <p className="text-xs text-gray-500 mt-0.5">Untuk pesanan di atas Rp 500k</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">14 Hari Pengembalian</h4>
              <p className="text-xs text-gray-500 mt-0.5">Jaminan uang kembali 100%</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Pembayaran Aman</h4>
              <p className="text-xs text-gray-500 mt-0.5">Proteksi SSL & enkripsi data</p>
            </div>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-2xl bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Dukungan 24/7</h4>
              <p className="text-xs text-gray-500 mt-0.5">Konsultasi CS ramah & responsif</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-300">
                LEXA<span className="text-primary">COMMERCE</span>
              </span>
            </Link>
            <p className="text-gray-500 leading-relaxed text-xs">
              Platform e-commerce multi-vendor terpercaya yang menyajikan fashion premium, jam tangan mewah, tas berkualitas, dan gadget elektronik terbaru dengan layanan transaksi aman 24/7.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary text-gray-400 hover:text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-md">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary text-gray-400 hover:text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-md">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary text-gray-400 hover:text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-md">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-primary text-gray-400 hover:text-white flex items-center justify-center transition-all hover:-translate-y-1 shadow-md">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links: Shop */}
          <div className="space-y-6">
            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase border-l-2 border-primary pl-2.5">
              Belanja Kategori
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link href="/#shop" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Sepatu & Sneakers
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Pakaian & Jaket
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Tas & Handbags
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Jam Tangan Mewah
                </Link>
              </li>
              <li>
                <Link href="/#shop" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Gadget & Elektronik
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Support */}
          <div className="space-y-6">
            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase border-l-2 border-primary pl-2.5">
              Informasi & Bantuan
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link href="/#faq" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Pusat Bantuan (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Hubungi Customer Service
                </Link>
              </li>
              <li>
                <Link href="/#terms" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/register?role=seller" className="hover:text-primary hover:translate-x-1.5 flex items-center gap-1 transition-all duration-300">
                  <ArrowRight className="w-3 h-3 text-primary/70" /> Bergabung Sebagai Mitra Seller
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Payment Info */}
          <div className="space-y-6">
            <h4 className="font-extrabold text-white text-xs tracking-wider uppercase border-l-2 border-primary pl-2.5">
              Hubungi Kami
            </h4>
            <ul className="space-y-4 text-xs">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-gray-500 leading-relaxed">
                  Jl. Jenderal Sudirman No. 12, Sudirman Central Business District, Jakarta Pusat, 10210
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-500">+62 (21) 555-0199</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-gray-500">support@lexacommerce.com</span>
              </li>
            </ul>

            {/* Payment Logos Placeholder styling */}
            <div className="pt-2">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">METODE PEMBAYARAN</span>
              <div className="flex flex-wrap gap-2">
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-gray-500">VISA</div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-gray-500">MASTERCARD</div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-gray-500">GOPAY</div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-gray-500">OVO</div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-semibold text-gray-500">BANK TRANSFER</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="bg-[#0b0c13] py-6 border-t border-white/5 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} LEXACOMMERCE. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Cookies Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
