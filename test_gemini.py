
from google import genai

# Inisialisasi client
client = genai.Client(api_key="AIzaSyBHKBnJ6l4Gaey-axa1N4NxHfh3gQJURzE")

print("🔍 Mencari semua model yang terdaftar di akun kamu...\n")

try:
    # Mengambil daftar model
    models = client.models.list()
    
    for m in models:
        # Kita cetak nama teknisnya saja (ini yang dipakai di kode)
        print(f"ID Model: {m.name}")
        # Cetak deskripsi singkat jika tersedia
        if hasattr(m, 'display_name'):
            print(f"Nama: {m.display_name}")
        print("-" * 30)

except Exception as e:
    print(f"❌ Gagal mengambil daftar model: {e}")