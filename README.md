# LEXACOMMERCE - Multi-Vendor E-Commerce Platform

LEXACOMMERCE adalah platform e-commerce multi-vendor (Light Version) yang dibangun menggunakan teknologi modern **Next.js 14** untuk frontend dan **FastAPI** untuk backend. Platform ini dilengkapi dengan fitur manajemen produk (CRUD), sistem autentikasi multi-peran (Pembeli & Penjual), integrasi keranjang belanja, checkout transaksi, visualisasi grafik analitik toko, serta notifikasi pesanan real-time via WebSockets.

---

## 🚀 Fitur Utama

### 1. Peran Pengguna (Multi-Role Auth)
*   **Pembeli (Buyer):** Menjelajahi produk berdasarkan 8 kategori premium, menambahkan produk ke keranjang, checkout belanja, dan melakukan pembayaran simulasi.
*   **Penjual (Seller):** Memiliki akses ke halaman dasbor khusus (`/seller`) untuk memantau grafik analitik pendapatan harian, mengelola katalog produk sendiri (Tambah, Ubah, Hapus produk beserta gambar), dan memproses status pesanan masuk.

### 2. Kategori Produk Dinamis & Estetik
Terdapat 8 kategori utama dengan visualisasi modern:
1.  **Backpacks** (Tas Ransel)
2.  **Jackets** (Jaket & Pakaian Pria/Wanita)
3.  **Shoes** (Sepatu & Sneakers)
4.  **Dresses** (Gaun & Pakaian)
5.  **Handbags** (Tas Tangan Wanita)
6.  **Watches** (Jam Tangan Mewah)
7.  **Belts** (Ikat Pinggang & Aksesoris)
8.  **Electronics** (Smartphones, Laptops, Gadget & Aksesoris Elektronik)

### 3. Otomatisasi Kompresi Gambar & Penyimpanan
*   Sistem secara otomatis mengompresi gambar produk yang diunggah oleh Penjual menjadi format **WebP** guna menghemat bandwidth dan meningkatkan performa loading.
*   Logika penyimpanan terintegrasi dengan **Supabase Storage** dan otomatis menggunakan **penyimpanan lokal fallback** (`backend/static/uploads/`) jika koneksi internet terputus.

### 4. Notifikasi Real-time (WebSockets)
Notifikasi instan otomatis dikirimkan ke Penjual saat ada Pembeli yang melakukan checkout pesanan baru, didukung oleh protokol WebSocket pada FastAPI.

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

### Persyaratan Awal (Prerequisites)
Pastikan Anda sudah menginstal:
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js 18+](https://nodejs.org/)

---

### 1. Pengaturan Backend (FastAPI)

1.  Buka terminal/Command Prompt lalu masuk ke direktori `backend`:
    ```powershell
    cd backend
    ```
2.  Buat virtual environment Python:
    ```powershell
    python -m venv .venv
    ```
3.  Aktifkan virtual environment:
    *   **Windows (PowerShell):**
        ```powershell
        .\.venv\Scripts\Activate.ps1
        ```
    *   **Windows (CMD):**
        ```cmd
        .\.venv\Scripts\activate.bat
        ```
    *   **Linux / macOS:**
        ```bash
        source .venv/bin/activate
        ```
4.  Instal seluruh dependensi:
    ```powershell
    pip install -r requirements.txt
    ```
5.  Inisialisasi ulang database dan seed data produk awal dari DummyJSON:
    ```powershell
    python seed.py
    ```
6.  Jalankan server backend:
    ```powershell
    uvicorn app.main:app --reload
    ```
    *Backend akan berjalan di: `http://localhost:8000`*

---

### 2. Pengaturan Frontend (Next.js)

1.  Buka terminal baru lalu masuk ke direktori `frontend`:
    ```powershell
    cd frontend
    ```
2.  Instal dependensi Node.js:
    ```powershell
    npm install
    ```
3.  Jalankan server development:
    ```powershell
    npm run dev
    ```
    *Frontend akan berjalan di: `http://localhost:3000`*

---

## 🔑 Akun Demo Pengujian (Seeded Accounts)

Untuk mempermudah pengujian, database sudah terisi secara otomatis dengan akun-akun berikut setelah Anda menjalankan `python seed.py`:

| Peran (Role) | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Penjual (Seller)** | `mengkimen9@gmail.com` | `mengki1124` | Pemilik dari 60+ katalog produk awal. Memiliki akses ke halaman `/seller`. |
| **Pembeli (Buyer)** | `satrialimpad2@gmail.com` | `satria1124` | Akun siap pakai untuk menguji proses checkout keranjang belanja. |

---

## 📁 Struktur Proyek
*   `/backend` - Kode FastAPI, database SQLite (`test.db`), skrip seeder, dan folder media statis.
*   `/frontend` - Kode Next.js (App Router), halaman web pembeli & dasbor penjual, serta aset styling Tailwind CSS.
*   `/docs` - Berisi dokumen spesifikasi teknis tambahan, PRD, dan diagram arsitektur.
