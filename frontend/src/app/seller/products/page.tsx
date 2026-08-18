"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Edit2, Trash2, Plus, X, Upload, Loader2, Package } from "lucide-react";

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

export default function SellerProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSellerProducts = async () => {
    try {
      const data = await apiRequest("/products");
      // Filter produk milik penjual ini saja
      const sellerProducts = data.filter((p: any) => p.seller_id === user?.id);
      setProducts(sellerProducts);
    } catch (e) {
      console.error("Gagal memuat produk:", e);
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
    fetchSellerProducts();
  }, [user]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormStock("");
    setSelectedFile(null);
    setFilePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description || "");
    setFormPrice(product.price);
    setFormStock(product.stock.toString());
    setSelectedFile(null);
    setFilePreview(product.image_url ? getFullImageUrl(product.image_url) : null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formStock) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("description", formDesc);
      formData.append("price", formPrice);
      formData.append("stock", formStock);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (editingProduct) {
        // Mode Update
        await apiRequest(`/products/${editingProduct.id}`, {
          method: "PUT",
          bodyData: formData,
          isFormData: true
        });
      } else {
        // Mode Create
        await apiRequest("/products", {
          method: "POST",
          bodyData: formData,
          isFormData: true
        });
      }

      await fetchSellerProducts();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen dari katalog?")) return;
    try {
      await apiRequest(`/products/${productId}`, {
        method: "DELETE"
      });
      await fetchSellerProducts();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk.");
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Memuat katalog produk Anda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" /> Kelola Katalog Produk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Tambahkan, ubah informasi, dan perbarui stok produk toko Anda.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-4.5 h-4.5" /> Tambah Produk Baru
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-6">Toko Anda belum memiliki produk apapun.</p>
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground font-semibold text-xs px-5 py-3 rounded-xl hover:bg-primary/95 transition-all"
          >
            Tambah Produk Pertama Anda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              {/* Product Image */}
              <div className="relative aspect-square w-full bg-secondary/50 overflow-hidden">
                <img
                  src={getFullImageUrl(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 rounded-xl bg-card/80 border border-white/5 text-foreground hover:bg-primary hover:text-white transition-all shadow-lg backdrop-blur-md"
                    title="Ubah Produk"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 rounded-xl bg-destructive/80 text-white hover:bg-destructive transition-all shadow-lg backdrop-blur-md"
                    title="Hapus Produk"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground line-clamp-1 text-base">{product.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
                  {product.description || "Tidak ada deskripsi produk."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stok: <span className="font-semibold text-foreground">{product.stock}</span></span>
                  <span className="font-bold text-primary text-base">{formatCurrency(product.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
              {editingProduct ? <Edit2 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
              {editingProduct ? "Ubah Informasi Produk" : "Tambah Produk Baru"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">NAMA PRODUK *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sepatu Sneakers Running"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">DESKRIPSI PRODUK</label>
                <textarea
                  placeholder="Jelaskan detail spesifikasi produk Anda..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">HARGA (IDR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 150000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">STOK BARANG *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 25"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-secondary border border-white/5 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Upload file image */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-2">FOTO PRODUK</label>
                <div className="flex gap-4 items-center">
                  {filePreview ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary relative border border-white/5 flex-shrink-0">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-muted-foreground bg-secondary/35 flex-shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <label className="flex-1 border border-dashed border-white/10 hover:border-primary/50 bg-secondary/15 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] font-semibold text-muted-foreground">PILIH FILE GAMBAR</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan Katalog"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
