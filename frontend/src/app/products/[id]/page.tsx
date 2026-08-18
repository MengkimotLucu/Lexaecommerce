"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { 
  ShoppingCart, 
  ChevronRight, 
  Star, 
  Minus, 
  Plus, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  Loader2,
  ArrowLeft,
  Heart
} from "lucide-react";

interface Product {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  created_at: string;
  category?: string;
  rating?: number;
  reviewsCount?: number;
  originalPrice?: number;
}

// Mock products mirroring the homepage items
const MOCK_PRODUCTS = [
  {
    id: 101,
    name: "Tan Solid Laptop Backpack",
    category: "Backpacks",
    price: "149000",
    originalPrice: 185000,
    rating: 5,
    reviewsCount: 2,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
    stock: 12,
    description: "Tas ransel laptop yang kokoh berwarna cokelat muda, cocok untuk bekerja, sekolah, atau bepergian. Memiliki banyak kompartemen dan pelindung laptop khusus."
  },
  {
    id: 102,
    name: "Brown Solid Biker Jacket",
    category: "Jackets",
    price: "110000",
    originalPrice: 120000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
    stock: 5,
    description: "Jaket kulit biker berwarna cokelat solid bergaya klasik. Sangat nyaman digunakan berkendara dan memberikan kesan maskulin yang berkelas."
  },
  {
    id: 103,
    name: "Men Brown Solid Mid-Top Boots",
    category: "Shoes",
    price: "115000",
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60",
    stock: 8,
    description: "Sepatu boots pria model mid-top berwarna cokelat terbuat dari kulit berkualitas tinggi. Sol yang tebal memberikan grip maksimal di segala permukaan."
  },
  {
    id: 104,
    name: "Petite Olive Green Solid Top",
    category: "Dresses",
    price: "49000",
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60",
    stock: 15,
    description: "Atasan kasual wanita berwarna hijau zaitun dengan bahan katun lembut yang sejuk. Desain kasual yang modis untuk menemani aktivitas harian Anda."
  },
  {
    id: 105,
    name: "Brown Solid Laptop Bag",
    category: "Handbags",
    price: "99000",
    originalPrice: 120000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60",
    stock: 3,
    description: "Tas jinjing laptop kulit berwarna cokelat tua yang elegan. Dilengkapi dengan tali selempang yang dapat dilepas pasang dan busa peredam guncangan."
  },
  {
    id: 106,
    name: "Black Analogue and Digital Watch",
    category: "Watches",
    price: "1599000",
    rating: 4,
    reviewsCount: 3,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60",
    stock: 4,
    description: "Jam tangan sporty pria dengan dual display (analogue & digital) berwarna hitam kokoh. Tahan air hingga kedalaman 50 meter dan dilengkapi fitur stopwatch."
  },
  {
    id: 107,
    name: "Men Navy Printed Round Neck T-Shirt",
    category: "T-Shirts",
    price: "50000",
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    stock: 20,
    description: "Kaos oblong pria berwarna biru navy dengan sablon grafis premium di bagian dada. Bahan katun combed 30s berkualitas tinggi yang menyerap keringat."
  },
  {
    id: 108,
    name: "Brown Self Design Shoulder Bag",
    category: "Handbags",
    price: "78000",
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
    stock: 7,
    description: "Tas bahu wanita dengan motif rajut unik berwarna cokelat. Sangat cocok dipadupadankan dengan busana gaya boho-chic atau kasual semi-formal."
  },
  {
    id: 109,
    name: "Brown Q Explorist HR Smartwatch",
    category: "Watches",
    price: "1699000",
    originalPrice: 2000000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=60",
    stock: 2,
    description: "Smartwatch generasi terbaru dengan casing baja tahan karat berwarna cokelat dan strap kulit. Mendukung monitor detak jantung, notifikasi pintar, dan GPS internal."
  },
  {
    id: 110,
    name: "Brown Solid Leather Belt",
    category: "Belts",
    price: "15000",
    originalPrice: 18000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb8ecfe7c?w=500&auto=format&fit=crop&q=60",
    stock: 14,
    description: "Ikat pinggang kulit sapi asli berwarna cokelat dengan gesper logam berlapis chrome antik karat. Aksesori wajib pria untuk melengkapi setelan celana formal."
  }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Sky Blue");
  const [activeTab, setActiveTab] = useState<"desc" | "spec" | "reviews">("desc");
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getFullImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";
    if (url.startsWith("/static")) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      return `${baseUrl}${url}`;
    }
    return url;
  };

  useEffect(() => {
    if (!id) return;
    const productId = parseInt(id as string);

    const loadProduct = async () => {
      try {
        if (productId >= 100) {
          // Cari di mock data
          const mockItem = MOCK_PRODUCTS.find((p) => p.id === productId);
          if (mockItem) {
            setProduct({
              id: mockItem.id,
              seller_id: 1,
              name: mockItem.name,
              description: mockItem.description,
              price: mockItem.price,
              stock: mockItem.stock,
              image_url: mockItem.image_url,
              category: mockItem.category,
              rating: mockItem.rating,
              reviewsCount: mockItem.reviewsCount,
              originalPrice: mockItem.originalPrice,
              created_at: new Date().toISOString()
            });
          }
        } else {
          // Ambil dari server
          const data = await apiRequest(`/products/${productId}`);
          setProduct({
            ...data,
            category: data.category || "Produk",
            rating: 5,
            reviewsCount: 1
          });
        }
      } catch (err) {
        console.error("Gagal memuat detail produk:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async (checkoutImmediately = false) => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "seller") {
      alert("Akun penjual tidak dapat membeli produk.");
      return;
    }
    if (!product || product.stock === 0) return;

    setIsAdding(true);

    try {
      if (product.id >= 100) {
        // Mock product integration with LocalStorage
        await new Promise((resolve) => setTimeout(resolve, 600));
        const localCart = JSON.parse(localStorage.getItem("mock_cart") || "[]");
        const existingItem = localCart.find((item: any) => item.product_id === product.id);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.push({
            id: Date.now(),
            product_id: product.id,
            quantity: quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              stock: product.stock
            }
          });
        }
        localStorage.setItem("mock_cart", JSON.stringify(localCart));
      } else {
        // Real API database cart insertion
        await apiRequest("/carts", {
          method: "POST",
          bodyData: { product_id: product.id, quantity: quantity }
        });
      }
      
      window.dispatchEvent(new Event("cartUpdated"));
      
      if (checkoutImmediately) {
        router.push("/checkout");
      } else {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || "Gagal menambahkan produk ke keranjang.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">Memuat detail produk...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Produk Tidak Ditemukan</h2>
        <p className="text-gray-500 text-sm">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const COLORS = [
    { name: "Sky Blue", class: "bg-sky-400" },
    { name: "Rosy Pink", class: "bg-pink-400" },
    { name: "Olive Green", class: "bg-emerald-400" },
    { name: "Space Gray", class: "bg-gray-700" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-12">
      {/* 1. BREADCRUMBS & BACK LINK */}
      <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-muted-foreground border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="#shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-400 font-bold uppercase">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-black line-clamp-1">{product.name}</span>
        </div>
        <Link href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </Link>
      </div>

      {/* 2. PRODUCT COLUMNS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center relative shadow-sm group">
            <img
              src={getFullImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase shadow-md">
                  Stok Habis
                </span>
              </div>
            )}
          </div>
          
          {/* Thumbnails Gallery */}
          <div className="grid grid-cols-4 gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary bg-gray-50 cursor-pointer shadow-sm">
              <img src={getFullImageUrl(product.image_url)} alt="Thumbnail 1" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60" alt="Thumbnail 2" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=60" alt="Thumbnail 3" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60" alt="Thumbnail 4" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Right Column: Details Info & Purchase */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 py-1">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < (product.rating || 5) 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-gray-200 fill-gray-200"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 font-semibold mt-0.5">
                ({product.reviewsCount || 1} Reviews)
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(parseFloat(product.price))}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Discount Only For This Weekend
              </p>
            </div>
            {product.originalPrice && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-sm">
                -{Math.round(((product.originalPrice - parseFloat(product.price)) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description || "Tidak ada deskripsi produk untuk produk ini."}
          </p>

          {/* Color Picker (Aesthetic only) */}
          <div className="space-y-2 border-t border-gray-100 pt-5">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Pick a Color: <span className="text-primary font-black ml-1">{selectedColor}</span>
            </label>
            <div className="flex gap-3">
              {COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColor === col.name ? "border-primary scale-110 shadow" : "border-transparent"
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full block ${col.class}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4 border-t border-gray-100 pt-5">
            
            {/* Quantity and Stock Status */}
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || product.stock === 0}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors disabled:opacity-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  disabled={quantity >= product.stock || product.stock === 0}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stock Status text */}
              <div>
                {product.stock === 0 ? (
                  <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="text-amber-500 font-bold text-xs uppercase tracking-wider block animate-pulse">
                    Only {product.stock} Items Left, Hurry up!
                  </span>
                ) : (
                  <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider block">
                    In Stock ({product.stock} pcs tersedia)
                  </span>
                )}
              </div>
            </div>

            {/* Success Notification Alert */}
            {isSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-semibold flex items-center justify-between animate-fade-in shadow-sm">
                <span>Produk berhasil ditambahkan ke keranjang belanja Anda!</span>
                <Link href="/cart" className="underline font-bold hover:text-emerald-300">Lihat Keranjang</Link>
              </div>
            )}

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                disabled={product.stock === 0 || isAdding}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs uppercase py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy Now"}
              </button>
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={product.stock === 0 || isAdding}
                className="w-full bg-transparent border-2 border-primary hover:bg-primary/5 text-primary font-bold text-xs uppercase py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-5 text-center">
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider block">Free Delivery</span>
              <span className="text-[8px] text-gray-400 block">On orders over $99</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider block">Secure Payment</span>
              <span className="text-[8px] text-gray-400 block">100% secure payments</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
              <Headphones className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider block">24/7 Support</span>
              <span className="text-[8px] text-gray-400 block">Dedicated support</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. TABS INFORMATION (Description, Specification, Reviews) */}
      <div className="border border-gray-100 rounded-3xl bg-white p-6 md:p-8 shadow-sm space-y-6">
        {/* Tab Buttons */}
        <div className="flex gap-8 border-b border-gray-100 pb-4 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("desc")}
            className={`pb-4 border-b-2 transition-all relative ${
              activeTab === "desc" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-900"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("spec")}
            className={`pb-4 border-b-2 transition-all relative ${
              activeTab === "spec" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-900"
            }`}
          >
            Additional Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 border-b-2 transition-all relative ${
              activeTab === "reviews" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-900"
            }`}
          >
            Reviews ({product.reviewsCount || 1})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-sm text-gray-600 leading-relaxed min-h-[120px]">
          {activeTab === "desc" && (
            <div className="space-y-4">
              <p>
                {product.description || "Tidak ada deskripsi produk untuk produk ini."}
              </p>
              <p>
                Dibuat dengan memprioritaskan estetika premium serta material pilihan yang tahan lama. Cocok dipadukan dengan berbagai gaya berpakaian harian Anda untuk memberikan kenyamanan maksimal sepanjang hari.
              </p>
            </div>
          )}

          {activeTab === "spec" && (
            <div className="overflow-hidden border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <td className="px-5 py-3 font-bold text-gray-800 w-1/3">Weight</td>
                    <td className="px-5 py-3 text-gray-600">384.8 g</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3 font-bold text-gray-800">Dimensions</td>
                    <td className="px-5 py-3 text-gray-600">187.3 x 168.6 x 83.4 mm</td>
                  </tr>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <td className="px-5 py-3 font-bold text-gray-800">Material</td>
                    <td className="px-5 py-3 text-gray-600">Premium Leather & Aluminium Alloy</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="px-5 py-3 font-bold text-gray-800">Colors</td>
                    <td className="px-5 py-3 text-gray-600">Space Gray, Silver, Green, Sky Blue, Pink</td>
                  </tr>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <td className="px-5 py-3 font-bold text-gray-800">Warranty</td>
                    <td className="px-5 py-3 text-gray-600">1 Year Brand Warranty</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3 font-bold text-gray-800">Stok Tersedia</td>
                    <td className="px-5 py-3 text-gray-600">{product.stock} pcs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm flex-shrink-0">
                  U
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">User Pembeli</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 block">Diterbitkan pada: 2 Juli 2026</span>
                  <p className="text-xs text-gray-600 mt-2">
                    Sangat puas dengan barang ini! Kualitas pengerjaan sangat premium, warna sangat sesuai gambar, dan pengiriman super cepat. Direkomendasikan sekali untuk dibeli.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 4. RELATED PRODUCTS */}
      <div className="space-y-6 pt-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-extrabold text-gray-900">Related Products</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-gray-200 hover:border-gray-900 text-gray-800 rounded-xl transition-all"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-2 border border-gray-200 hover:border-gray-900 text-gray-800 rounded-xl transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.slice(0, 4).map((prod) => (
            <Link 
              key={prod.id} 
              href={`/products/${prod.id}`}
              className="glass-card rounded-2xl overflow-hidden border border-gray-100 bg-white p-4 space-y-4 cursor-pointer"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50">
                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">{prod.category}</span>
                <h4 className="font-bold text-xs text-gray-800 line-clamp-1 mt-1">{prod.name}</h4>
                <div className="flex items-center gap-1 mt-2">
                  <span className="font-black text-primary text-sm">{formatCurrency(parseFloat(prod.price))}</span>
                  {prod.originalPrice && <span className="text-[10px] text-gray-400 line-through">{formatCurrency(prod.originalPrice)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
