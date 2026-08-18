from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import Base, engine
from app import models
from app.routers import auth, products, carts, orders, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Membuat semua tabel database jika belum ada pada saat server dinyalakan
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="LEXACOMMERCE API",
    description="Backend API untuk LEXACOMMERCE (Light Version) dengan FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

# Konfigurasi CORS (Cross-Origin Resource Sharing) agar Next.js dapat berkomunikasi dengan lancar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua origin untuk kemudahan development lokal
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount folder static untuk melayani upload gambar secara lokal (fallback)
os.makedirs(os.path.join("static", "uploads"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Registrasi semua router API dengan prefix /api
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(carts.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Selamat datang di LEXACOMMERCE API.",
        "documentation": "/docs"
    }
