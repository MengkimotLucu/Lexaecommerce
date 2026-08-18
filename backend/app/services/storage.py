import io
import uuid
import os
from fastapi import UploadFile
from PIL import Image
from app.config import settings

# Inisialisasi folder upload lokal jika tidak menggunakan Supabase
LOCAL_UPLOAD_DIR = os.path.join("static", "uploads")
os.makedirs(LOCAL_UPLOAD_DIR, exist_ok=True)

def compress_to_webp(file: UploadFile) -> io.BytesIO:
    """Mengompresi file gambar yang diunggah ke format .webp di memori."""
    img = Image.open(file.file)
    output = io.BytesIO()
    
    # Mengubah mode warna jika diperlukan agar kompatibel dengan WebP
    if img.mode in ("RGBA", "P"):
        # Pertahankan transparansi untuk webp
        pass
    else:
        img = img.convert("RGB")
        
    img.save(output, format="WEBP", quality=80)
    output.seek(0)
    return output

async def upload_image(file: UploadFile) -> str:
    """
    Mengunggah gambar ke Supabase Storage.
    Menggunakan fallback lokal jika kredensial Supabase tidak di-set di .env.
    """
    try:
        # Kompresi gambar ke WebP
        webp_bytes_io = compress_to_webp(file)
        webp_bytes = webp_bytes_io.getvalue()
        
        filename = f"{uuid.uuid4()}.webp"
        
        # Cek jika kredensial Supabase terkonfigurasi
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and settings.SUPABASE_BUCKET:
            try:
                from supabase import create_client, Client
                supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                
                # Memastikan bucket ada, jika tidak ada buat bucket baru yang bersifat public
                try:
                    supabase.storage.get_bucket(settings.SUPABASE_BUCKET)
                except Exception:
                    try:
                        supabase.storage.create_bucket(settings.SUPABASE_BUCKET, options={"public": True})
                    except Exception as create_err:
                        print(f"Gagal membuat bucket Supabase: {str(create_err)}")

                # Upload file ke Supabase Storage
                supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                    path=filename,
                    file=webp_bytes,
                    file_options={"content-type": "image/webp"}
                )
                
                # Mengambil public URL
                public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(filename)
                return public_url
            except Exception as supabase_err:
                print(f"Supabase upload error: {str(supabase_err)}. Menggunakan penyimpanan lokal fallback...")
        
        # Fallback lokal
        local_path = os.path.join(LOCAL_UPLOAD_DIR, filename)
        with open(local_path, "wb") as local_file:
            local_file.write(webp_bytes)
            
        return f"/static/uploads/{filename}"
    except Exception as e:
        print(f"Error pada proses upload gambar: {str(e)}")
        # Kembalikan string kosong jika benar-benar gagal
        return ""
