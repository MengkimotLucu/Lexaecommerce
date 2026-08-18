import asyncio
import os
import sys

# Tambahkan path project agar bisa import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from supabase import create_client, Client

async def test_supabase():
    print("Mengecek konfigurasi Supabase...")
    print(f"URL: {settings.SUPABASE_URL}")
    print(f"Key (50 chars): {settings.SUPABASE_KEY[:50]}...")
    print(f"Bucket: {settings.SUPABASE_BUCKET}")
    
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("Error: Kredensial Supabase belum di-set di .env!")
        return

    try:
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Berhasil membuat client Supabase.")
        
        # Cek/buat bucket
        print("Mengecek bucket...")
        try:
            bucket = supabase.storage.get_bucket(settings.SUPABASE_BUCKET)
            print(f"Bucket '{settings.SUPABASE_BUCKET}' ditemukan. Public: {bucket.public}")
        except Exception as e:
            print(f"Bucket tidak ditemukan. Mencoba membuat bucket baru... Detail error: {e}")
            try:
                supabase.storage.create_bucket(settings.SUPABASE_BUCKET, options={"public": True})
                print(f"Berhasil membuat bucket publik '{settings.SUPABASE_BUCKET}'!")
            except Exception as create_err:
                print(f"Gagal membuat bucket: {create_err}")
                return

        # Uji upload mock data
        print("Menguji upload file...")
        mock_data = b"Hello, Supabase WebP Storage!"
        filename = "test_connection.txt"
        
        try:
            # Hapus jika file lama ada
            try:
                supabase.storage.from_(settings.SUPABASE_BUCKET).remove(filename)
            except:
                pass
                
            supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                path=filename,
                file=mock_data,
                file_options={"content-type": "text/plain"}
            )
            print("Berhasil mengunggah file uji coba.")
            
            public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(filename)
            print(f"Public URL berhasil didapat: {public_url}")
            
            # Hapus file uji coba
            supabase.storage.from_(settings.SUPABASE_BUCKET).remove(filename)
            print("Berhasil membersihkan file uji coba.")
            print("\n>>> KONEKSI SUPABASE SUKSES DAN SIAP DIGUNAKAN! <<<")
        except Exception as upload_err:
            print(f"Gagal mengunggah file: {upload_err}")
            
    except Exception as e:
        print(f"Gagal menghubungkan ke Supabase: {e}")

if __name__ == "__main__":
    asyncio.run(test_supabase())
