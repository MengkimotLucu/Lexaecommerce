"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { 
  Search, 
  ShoppingBag, 
  ShoppingCart, 
  Loader2, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Headphones, 
  Star, 
  ArrowRight, 
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Product {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string;
  created_at: string;
}

interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  maxPrice?: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image_url: string;
  stock: number;
  tag?: string;
  featured?: boolean;
}

// Mock products mirroring the exact items in the design image
const MOCK_PRODUCTS: CatalogProduct[] = [
  {
    id: 101,
    name: "Tan Solid Laptop Backpack",
    category: "Backpacks",
    price: 149000,
    maxPrice: 185000,
    rating: 5,
    reviewsCount: 2,
    tag: "18% OFF",
    featured: true,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
    stock: 12
  },
  {
    id: 102,
    name: "Brown Solid Biker Jacket",
    category: "Jackets",
    price: 110000,
    maxPrice: 120000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60",
    stock: 5
  },
  {
    id: 103,
    name: "Men Brown Solid Mid-Top Boots",
    category: "Casual Shoes, Sneakers",
    price: 115000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&auto=format&fit=crop&q=60",
    stock: 8
  },
  {
    id: 104,
    name: "Petite Olive Green Solid Top",
    category: "Dresses & Tops",
    price: 49000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60",
    stock: 15
  },
  {
    id: 105,
    name: "Brown Solid Laptop Bag",
    category: "Handbags, Messenger Bag",
    price: 99000,
    originalPrice: 120000,
    rating: 5,
    reviewsCount: 1,
    tag: "18% OFF",
    featured: true,
    image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=60",
    stock: 3
  },
  {
    id: 106,
    name: "Black Analogue and Digital Watch",
    category: "Analog Watches, Digital Watches",
    price: 1599000,
    rating: 0,
    reviewsCount: 0,
    image_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60",
    stock: 4
  },
  {
    id: 107,
    name: "Men Navy Printed Round Neck T-Shirt",
    category: "T-Shirts",
    price: 50000,
    rating: 5,
    reviewsCount: 1,
    image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    stock: 20
  },
  {
    id: 108,
    name: "Brown Self Design Shoulder Bag",
    category: "Handbags",
    price: 78000,
    rating: 5,
    reviewsCount: 1,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=60",
    stock: 7
  },
  {
    id: 109,
    name: "Brown Q Explorist HR Smartwatch",
    category: "Smart Analog, Smart Watches",
    price: 1699000,
    originalPrice: 2000000,
    rating: 5,
    reviewsCount: 1,
    tag: "15% OFF",
    image_url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=60",
    stock: 2
  },
  {
    id: 110,
    name: "Brown Solid Leather Belt",
    category: "Belts",
    price: 15000,
    originalPrice: 18000,
    rating: 5,
    reviewsCount: 1,
    tag: "17% OFF",
    image_url: "https://images.unsplash.com/photo-1624222247344-550fb8ecfe7c?w=500&auto=format&fit=crop&q=60",
    stock: 14
  }
];

const SLIDES = [
  {
    subtitle: "Season Sale",
    title: "MEN'S FASHION",
    description: "Min. 35–70% Off",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80",
    bgColor: "bg-gradient-to-r from-gray-50 to-gray-100"
  },
  {
    subtitle: "New Style Arrivals",
    title: "WOMEN'S TREND",
    description: "Up to 70% Off Now",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    bgColor: "bg-gradient-to-r from-[#fcf6f3] to-[#f6ebdf]"
  }
];

const CATEGORIES = [
  { name: "Backpacks", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&auto=format&fit=crop&q=60" },
  { name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=150&auto=format&fit=crop&q=60" },
  { name: "Shoes", image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=150&auto=format&fit=crop&q=60" },
  { name: "Dresses", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=150&auto=format&fit=crop&q=60" },
  { name: "Handbags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=150&auto=format&fit=crop&q=60" },
  { name: "Watches", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=150&auto=format&fit=crop&q=60" },
  { name: "Belts", image: "https://images.unsplash.com/photo-1624222247344-550fb8ecfe7c?w=150&auto=format&fit=crop&q=60" }
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"new-arrival" | "best-selling" | "top-rated">("new-arrival");

  // Fetch real database products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiRequest("/products");
        setProducts(data);
      } catch (e) {
        console.error("Gagal memuat produk dari server:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Automatic hero slider cycle (every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (product: any) => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (user.role === "seller") {
      alert("Akun penjual tidak dapat membeli produk.");
      return;
    }

    setAddingId(product.id);

    try {
      if (product.id >= 100) {
        // Mock product integration with LocalStorage
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate networking latency
        const localCart = JSON.parse(localStorage.getItem("mock_cart") || "[]");
        const existingItem = localCart.find((item: any) => item.product_id === product.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          localCart.push({
            id: Date.now(),
            product_id: product.id,
            quantity: 1,
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
          bodyData: { product_id: product.id, quantity: 1 }
        });
      }
      
      // Dispatch custom event to tell navbar to update quantity badge
      window.dispatchEvent(new Event("cartUpdated"));
      
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err: any) {
      alert(err.message || "Gagal menambahkan produk ke keranjang.");
    } finally {
      setAddingId(null);
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

  // Filter & combine database products + mock products based on active tab
  const getCatalogProducts = () => {
    let baseMock = [];
    if (activeTab === "new-arrival") {
      baseMock = MOCK_PRODUCTS.slice(0, 5);
    } else if (activeTab === "best-selling") {
      baseMock = MOCK_PRODUCTS.slice(5, 10);
    } else {
      // Top rated combo
      baseMock = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[4], MOCK_PRODUCTS[7], MOCK_PRODUCTS[8], MOCK_PRODUCTS[2]];
    }

    // Convert real database products to match visual mock keys
    const realProductsMapped: CatalogProduct[] = products.map(p => ({
      id: p.id,
      name: p.name,
      category: "Katalog Toko",
      price: parseFloat(p.price),
      rating: 5,
      reviewsCount: 0,
      image_url: getFullImageUrl(p.image_url),
      stock: p.stock,
      tag: p.stock === 0 ? "STOK HABIS" : undefined
    }));

    // Filter by search query
    const combined = [...baseMock, ...realProductsMapped];
    return combined.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredProducts = getCatalogProducts();

  return (
    <div className="bg-[#fcfdfd] min-h-screen pb-20">
      {/* 1. HERO SLIDER */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-sm">
          {SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-1000 ease-in-out ${slide.bgColor} ${
                index === activeSlide ? "opacity-100 relative block" : "opacity-0 absolute inset-0 hidden"
              } flex flex-col md:flex-row items-center justify-between min-h-[460px] md:min-h-[520px] px-8 md:px-16 py-12 md:py-0`}
            >
              {/* Slide text */}
              <div className="flex-1 text-left z-10 max-w-xl md:pr-8">
                <span className="text-primary font-bold text-sm md:text-base tracking-wider uppercase bg-primary/10 px-3 py-1 rounded-full inline-block mb-4">
                  {slide.subtitle}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-none tracking-tight mb-4">
                  {slide.title}
                </h1>
                <p className="text-gray-600 text-lg md:text-xl font-medium mb-8">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="#shop"
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase px-8 py-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    SHOP NOW
                  </a>
                  <a
                    href="#blog"
                    className="bg-transparent border-2 border-gray-300 hover:border-gray-900 text-gray-800 hover:text-gray-900 font-bold text-xs uppercase px-8 py-4 rounded-lg transition-all"
                  >
                    READ MORE
                  </a>
                </div>
              </div>
              
              {/* Slide image */}
              <div className="flex-1 relative w-full h-[280px] md:h-[480px] mt-8 md:mt-0 flex justify-center md:justify-end items-end overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full max-h-[440px] md:max-h-[480px] object-contain object-bottom hover:scale-102 transition-transform duration-700"
                />
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-all ${
                  index === activeSlide ? "bg-primary w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURES RIBBON */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 my-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 py-2">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Free Shipping</h4>
              <p className="text-xs text-gray-500 mt-0.5">On All Orders Over $99</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-2 border-t sm:border-t-0 sm:border-l border-gray-100 pl-0 sm:pl-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
              <p className="text-xs text-gray-500 mt-0.5">We ensure secure payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-2 border-t lg:border-t-0 lg:border-l border-gray-100 pl-0 lg:pl-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">100% Money Back</h4>
              <p className="text-xs text-gray-500 mt-0.5">30 Days Return Policy</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-2 border-t lg:border-t-0 lg:border-l border-gray-100 pl-0 lg:pl-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Online Support</h4>
              <p className="text-xs text-gray-500 mt-0.5">24/7 Dedicated Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROMO BANNERS GRID */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 my-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Large Banner (Women's Style) */}
          <div className="relative overflow-hidden rounded-2xl h-[420px] bg-[#f9f2f0] group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80"
              alt="Women's Style"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent z-10 p-10 flex flex-col justify-between text-white">
              <div>
                <span className="bg-primary text-[10px] font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase">
                  New Arrivals
                </span>
                <h3 className="text-3xl font-extrabold tracking-tight">Women's Style</h3>
                <p className="text-sm font-semibold opacity-90 mt-1">Up to 70% Off</p>
              </div>
              <span className="text-sm font-bold flex items-center gap-1.5 hover:underline">
                Shop Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Right Combo Banners Grid */}
          <div className="flex flex-col gap-6">
            {/* Row 1 (Handbag & Watch) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Handbag */}
              <div className="relative overflow-hidden rounded-2xl h-[198px] bg-[#f4ece3] group cursor-pointer shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80"
                  alt="Handbag"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10 p-6 flex flex-col justify-between text-white">
                  <div>
                    <span className="bg-primary text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block uppercase">
                      25% OFF
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">Handbag</h3>
                  </div>
                  <span className="text-xs font-bold hover:underline flex items-center gap-1">
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Watch */}
              <div className="relative overflow-hidden rounded-2xl h-[198px] bg-[#eef0f3] group cursor-pointer shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&auto=format&fit=crop&q=80"
                  alt="Watch"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent z-10 p-6 flex flex-col justify-between text-white">
                  <div>
                    <span className="bg-primary text-[9px] font-bold px-2 py-0.5 rounded-full mb-1.5 inline-block uppercase">
                      45% OFF
                    </span>
                    <h3 className="text-xl font-bold tracking-tight">Watch</h3>
                  </div>
                  <span className="text-xs font-bold hover:underline flex items-center gap-1">
                    Shop Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2 (Backpack) */}
            <div className="relative overflow-hidden rounded-2xl h-[196px] bg-[#eff3f6] group cursor-pointer shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
                alt="Backpack"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/35 to-transparent z-10 p-6 flex flex-col justify-between text-white">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-90 mb-1 inline-block">
                    Accessories
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight">Backpack</h3>
                  <p className="text-xs font-semibold opacity-90 mt-0.5">Min. 40–80% Off</p>
                </div>
                <span className="text-xs font-bold hover:underline flex items-center gap-1">
                  Shop Now <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CATALOG */}
      <section id="shop" className="max-w-7xl mx-auto px-6 md:px-12 my-16">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 relative inline-block pb-3">
            Featured Products
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-primary rounded-full" />
          </h2>
        </div>

        {/* Tab Headers and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-100 pb-5 mb-8">
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab("new-arrival")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === "new-arrival"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              New Arrival
            </button>
            <button
              onClick={() => setActiveTab("best-selling")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === "best-selling"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              Best Selling
            </button>
            <button
              onClick={() => setActiveTab("top-rated")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider ${
                activeTab === "top-rated"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              Top Rated
            </button>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-sm relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-primary transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <p className="text-gray-500 text-sm">Tidak ada produk yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="glass-card rounded-2xl overflow-hidden flex flex-col relative group border border-gray-100 hover:border-primary/20 bg-white shadow-sm"
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {product.tag && (
                    <span className="bg-[#52b146] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                      {product.tag}
                    </span>
                  )}
                  {product.featured && (
                    <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                  <Heart className="w-4 h-4" />
                </button>

                {/* Product Image */}
                <Link href={`/products/${product.id}`} className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                        STOK HABIS
                      </span>
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                      {product.category}
                    </span>
                    
                    {/* Name */}
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-gray-800 hover:text-primary transition-colors text-xs mt-1 cursor-pointer line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${
                            i < product.rating 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-gray-200 fill-gray-200"
                          }`} 
                        />
                      ))}
                      <span className="text-[9px] text-gray-400 ml-1">({product.reviewsCount || 0})</span>
                    </div>
                  </div>

                  {/* Pricing and Cart */}
                  <div className="mt-4">
                    <div className="flex flex-col mb-3">
                      {product.originalPrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-primary text-sm">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        </div>
                      ) : product.maxPrice ? (
                        <span className="font-black text-primary text-xs">
                          {formatCurrency(product.price)} – {formatCurrency(product.maxPrice)}
                        </span>
                      ) : (
                        <span className="font-black text-primary text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || addingId === product.id}
                      className={`w-full font-bold text-[10px] uppercase py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                        successId === product.id
                          ? "bg-emerald-600 text-white shadow-emerald-600/10"
                          : product.stock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-primary text-white hover:bg-primary/95 hover:shadow-md"
                      }`}
                    >
                      {addingId === product.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : successId === product.id ? (
                        "Success Added"
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. BOTTOM PROMO BANNERS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 my-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Men's Fashion Weekend Sale */}
          <div className="relative overflow-hidden rounded-2xl h-[260px] bg-gray-50 group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80"
              alt="Men's Fashion Weekend Sale"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-10 p-8 flex flex-col justify-between text-white">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90 mb-1 inline-block">
                  Weekend Sale
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight">Men's Fashion</h3>
                <p className="text-xs font-semibold opacity-90 mt-0.5">Flat 70% Off</p>
              </div>
              <span className="text-xs font-bold hover:underline flex items-center gap-1">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Women's Wear Fashion Style */}
          <div className="relative overflow-hidden rounded-2xl h-[260px] bg-gray-50 group cursor-pointer shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
              alt="Women's Wear Fashion Style"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent z-10 p-8 flex flex-col justify-between text-white">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase opacity-90 mb-1 inline-block">
                  Fashion Style
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight">Women's Wear</h3>
                <p className="text-xs font-semibold opacity-90 mt-0.5">Min. 35–70% Off</p>
              </div>
              <span className="text-xs font-bold hover:underline flex items-center gap-1">
                Shop Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 my-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900 relative inline-block pb-3">
            Featured Categories
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-primary rounded-full" />
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="flex flex-col items-center group cursor-pointer">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-primary transition-all p-1.5 shadow-sm bg-white">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors mt-3">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
