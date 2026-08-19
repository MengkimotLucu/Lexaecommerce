import asyncio
import os
import sys
import json
import urllib.request
from decimal import Decimal

# Tambahkan path project agar bisa import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, AsyncSessionLocal
from app.models import User, Product
from app.auth import get_password_hash

# Pemetaan kategori DummyJSON ke kategori UI LexaCommerce
CATEGORY_MAP = {
    "mens-shoes": "Shoes",
    "womens-shoes": "Shoes",
    "womens-bags": "Handbags",
    "mens-watches": "Watches",
    "womens-watches": "Watches",
    "watches": "Watches",
    "mens-shirts": "Jackets",
    "womens-dresses": "Dresses",
    "tops": "Dresses",
    "laptops": "Electronics",
    "smartphones": "Electronics",
    "mobile-accessories": "Electronics",
    "tablets": "Electronics"
}

async def seed_data():
    print("Memulai proses seeding database...")
    
    # 1. Bersihkan dan buat ulang seluruh tabel database untuk menerapkan skema baru
    async with engine.begin() as conn:
        print("Menghapus tabel lama jika ada...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Membuat tabel baru dengan skema terbaru...")
        await conn.run_sync(Base.metadata.create_all)
    print("Tabel database berhasil diinisialisasi ulang.")
    
    async with AsyncSessionLocal() as db:
        # Helper function to get password hash and create user
        from sqlalchemy import select

        async def get_or_create_user(email, password, role, store_name=None, store_desc=None):
            query = select(User).where(User.email == email)
            result = await db.execute(query)
            user = result.scalars().first()
            if not user:
                print(f"Membuat pengguna {role} ({email})...")
                user = User(
                    email=email,
                    password_hash=get_password_hash(password),
                    role=role,
                    store_name=store_name,
                    store_description=store_desc,
                    store_image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" if role == "seller" else None
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
                print(f"Pengguna {role} ({email}) berhasil dibuat.")
            else:
                print(f"Pengguna {role} ({email}) sudah ada.")
            return user

        # Buat default users dan user spesifik permintaan
        seller = await get_or_create_user(
            email="mengkimen9@gmail.com",
            password="mengki1124",
            role="seller",
            store_name="Mengki Store",
            store_desc="Toko resmi Mengki penyedia pakaian, sepatu, dan aksesoris berkualitas tinggi."
        )
        
        # Buat seller cadangan (default lama)
        await get_or_create_user(
            email="seller@lexacommerce.com",
            password="password123",
            role="seller",
            store_name="Lexa Fashion Store",
            store_desc="Toko resmi LexaCommerce penyedia barang fashion premium."
        )

        # Buat buyer spesifik permintaan
        buyer = await get_or_create_user(
            email="satrialimpad2@gmail.com",
            password="satria1124",
            role="buyer"
        )

        # Buat buyer cadangan (default lama)
        await get_or_create_user(
            email="buyer@lexacommerce.com",
            password="password123",
            role="buyer"
        )

        # 4. Ambil produk dari DummyJSON
        url = "https://dummyjson.com/products?limit=150"
        print(f"Mengambil data produk dari {url}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                dummy_products = data.get("products", [])
        except Exception as e:
            print(f"Gagal mengambil data dari DummyJSON: {e}")
            return

        print(f"Berhasil mengambil {len(dummy_products)} produk dari DummyJSON.")

        # Hapus produk lama milik seller utama untuk refresh
        product_cleanup_query = select(Product).where(Product.seller_id == seller.id)
        cleanup_result = await db.execute(product_cleanup_query)
        existing_products = cleanup_result.scalars().all()
        if existing_products:
            print(f"Membersihkan {len(existing_products)} produk lama dari database...")
            for p in existing_products:
                await db.delete(p)
            await db.commit()

        # 5. Seed produk baru
        inserted_count = 0
        for dp in dummy_products:
            orig_cat = dp.get("category", "")
            title_lower = dp.get("title", "").lower()
            mapped_cat = None

            # Cek kecocokan kategori
            if orig_cat in CATEGORY_MAP:
                mapped_cat = CATEGORY_MAP[orig_cat]
            elif "backpack" in title_lower:
                mapped_cat = "Backpacks"
            elif "belt" in title_lower:
                mapped_cat = "Belts"
            elif "shoes" in title_lower or "sneaker" in title_lower:
                mapped_cat = "Shoes"
            elif "watch" in title_lower:
                mapped_cat = "Watches"
            elif "bag" in title_lower or "handbag" in title_lower:
                mapped_cat = "Handbags"
            elif "dress" in title_lower or "skirt" in title_lower:
                mapped_cat = "Dresses"
            elif "shirt" in title_lower or "jacket" in title_lower:
                mapped_cat = "Jackets"
            elif "phone" in title_lower or "laptop" in title_lower or "earphone" in title_lower or "headphone" in title_lower or "smartphones" in orig_cat:
                mapped_cat = "Electronics"

            # Jika produk tidak cocok dengan salah satu dari 8 kategori UI kita, skip produk ini
            if not mapped_cat:
                continue

            price_usd = dp.get("price", 0.0)
            price_idr = Decimal(str(int(price_usd * 15000)))

            image_url = dp.get("thumbnail")
            if not image_url and dp.get("images"):
                image_url = dp.get("images")[0]

            new_prod = Product(
                seller_id=seller.id,
                name=dp.get("title", "Product Name"),
                description=dp.get("description", ""),
                price=price_idr,
                stock=dp.get("stock", 10),
                category=mapped_cat,
                image_url=image_url
            )
            db.add(new_prod)
            inserted_count += 1

        await db.commit()
        print(f"Berhasil seeding {inserted_count} produk baru ke database.")
        print("\n>>> PROSES SEEDING SELESAI DENGAN SUKSES! <<<")

if __name__ == "__main__":
    asyncio.run(seed_data())
