
# Smart Talent Management System

**Smart Talent Management** adalah sistem backend berbasis **Node.js** dan **GraphQL** yang dirancang untuk mengelola data talenta secara terstruktur. Sistem ini memungkinkan pengelolaan profil pengguna, keterampilan (*skills*), pengalaman kerja, proyek, hingga sistem rekomendasi talenta.

Proyek ini dibangun dengan fokus pada integritas data dan skalabilitas menggunakan **TypeScript** dan **TypeORM**.

---

## Tech Stack

* **Language:** [TypeScript](https://www.typescriptlang.org/) (Strictly Typed)
* **Runtime:** [Node.js](https://nodejs.org/)
* **Database ORM:** [TypeORM](https://typeorm.io/)
* **Database:** [PostgreSQL](https://www.postgresql.org/)
* **API Layer:** GraphQL (Apollo Server / TypeGraphQL)
* **Configuration:** Dotenv (Environment Variables)

---

## Project Architecture Explanation

Sistem ini mengikuti pola arsitektur yang memisahkan tanggung jawab antara definisi data dan logika bisnis:

### 1. Entities (`/src/entities`)

Setiap file merepresentasikan tabel di database PostgreSQL. Kami menggunakan dekorator TypeORM untuk mendefinisikan skema langsung dari *class* TypeScript.

* **User & Profile:** Menggunakan relasi *One-to-One*. User menyimpan kredensial, sementara Profile menyimpan detail personal.
* **Experience & Project:** Menyimpan rekam jejak profesional talenta.
* **Skill:** Menyimpan daftar keahlian yang dimiliki.
* **Recommendation:** Entitas khusus untuk menangani logika pemberian rekomendasi antar talenta atau dari sistem.
* **TimestampEntities:** Sebuah *base class* (abstract) yang di-extend oleh entitas lain untuk menangani otomatisasi kolom `createdAt` dan `updatedAt`.

### 2. Resolvers (`/src/resolvers`)

Berfungsi sebagai *entry point* untuk setiap operasi API. Di sini logika bisnis diproses. Setiap entitas utama memiliki resolvernya sendiri (misal: `UserResolver.ts`) untuk menjaga prinsip **Single Responsibility**.

### 3. Data Source Configuration (`/src/database`)

Konfigurasi database dipusatkan di `data-source.ts`. Sistem ini menggunakan variabel lingkungan (`.env`) untuk keamanan dan fleksibilitas konfigurasi antar environment (development/production).

---

## Database Schema Diagram (Logical)

Sistem ini memiliki keterkaitan data yang cukup kompleks untuk mendukung manajemen talenta:

* User ↔ Profile (1:1)
* Profile ↔ Skill (Many:Many)
* Profile ↔ Experience (1:Many)
* Profile ↔ Recommendation (1:Many)
* Project ↔ Recommendation (1:Many) (1:N)

---

## Setup & Installation

### 1. Prerequisites

* Node.js versi 16 ke atas.
* PostgreSQL sudah terinstall dan berjalan di lokal.
* Database kosong bernama `smart_talent_db`.

### 2. Environment Configuration

Buat file `.env` di root direktori dan salin konfigurasi dari `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=isi_password_anda
DB_NAME=smart_talent_db

```

### 3. Install Dependencies

```bash
npm install

```

### 4. Running the App

```bash
# Development mode
npm run dev

# Build to Javascript
npm run build

```

---

## 📝 Key Explanations

### TypeORM Synchronization

Dalam proyek ini, `synchronize: true` diaktifkan pada `AppDataSource`.

> **Penjelasan:** Saat aplikasi dijalankan, TypeORM akan secara otomatis melakukan pengecekan antara Entity di kode dengan tabel di database. Jika ada perbedaan, TypeORM akan memodifikasi skema database secara otomatis. Ini sangat mempercepat proses pengembangan awal.

### Security via `.env`

Proyek ini tidak menyimpan kredensial database langsung di dalam kode. Semua data sensitif dipisahkan ke file `.env` yang tidak di-push ke repository (via `.gitignore`), sesuai dengan standar industri **Twelve-Factor App**.


---

**Next Step:** Apakah kamu ingin saya menambahkan bagian **"How to Use API"** yang berisi contoh query GraphQL untuk dimasukkan ke dalam README tersebut?
