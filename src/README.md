# Aplikasi Pembukuan Pempek Putri 🍜

Aplikasi pembukuan digital lengkap untuk usaha Pempek Putri, dibangun dengan React, TypeScript, Tailwind CSS, dan Supabase.

## ✨ Fitur Lengkap

### 🏠 Dashboard
- Ringkasan keuangan hari ini (penjualan, pengeluaran, laba bersih)
- Grafik penjualan 7 hari terakhir
- Notifikasi stok menipis, hutang & piutang jatuh tempo
- Alert stok bahan baku yang menipis

### 🛒 Penjualan
- Catat transaksi penjualan harian
- Pilih produk dengan harga otomatis
- Metode pembayaran: Tunai, Non-Tunai (Transfer/QRIS), atau Piutang
- Otomatis membuat piutang saat pilih metode Piutang
- Filter berdasarkan tanggal
- Total penjualan per hari

### 📦 Produk
- Tambah, edit, dan hapus produk pempek
- Kelola harga jual dan stok
- Alert otomatis untuk stok < 10

### 💰 Pengeluaran
- Catat pengeluaran operasional
- Kategori: Bahan Baku, Gas, Minyak, Gaji, Sewa, Listrik & Air, Transportasi, Lainnya
- Filter berdasarkan tanggal
- Total pengeluaran per hari

### 🧺 Stok Bahan
- Kelola stok bahan baku (ikan, tepung, minyak, dll)
- Alert otomatis saat stok menipis
- Update otomatis saat ada pembelian bahan

### 🧾 Pembelian Bahan
- Catat pembelian bahan dari supplier
- Otomatis update stok bahan
- Riwayat pembelian lengkap
- Total pembelian per periode

### 👥 Supplier
- Data lengkap supplier (nama, kontak, alamat)
- Riwayat pembelian dari setiap supplier
- Total transaksi per supplier

### 💳 Piutang
- Kelola piutang pelanggan
- Status: Belum Bayar / Sudah Bayar
- Alert jatuh tempo otomatis
- Tandai sebagai lunas dengan satu klik

### 📄 Hutang
- Kelola hutang usaha
- Status: Belum Lunas / Lunas
- Tanggal jatuh tempo
- Alert pembayaran

### 📊 Laporan Keuangan
- Laporan harian, mingguan, dan bulanan
- Grafik pemasukan vs pengeluaran
- Margin keuntungan
- Ekspor laporan ke CSV
- Total pemasukan, pengeluaran, dan laba bersih

### ⚙️ Pengaturan
- Informasi akun pengguna
- Backup data ke JSON
- Akses cepat ke semua menu
- Logout

## 🚀 Teknologi

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v6

## 📱 Mobile-First Design

Aplikasi ini dirancang dengan pendekatan mobile-first:
- Bottom navigation untuk navigasi mudah di mobile
- Responsive di semua ukuran layar
- Touch-friendly UI elements
- Optimized untuk diubah menjadi PWA atau aplikasi mobile

## 🗄️ Database Schema

Aplikasi menggunakan database Supabase dengan tabel:

- `produk` - Daftar produk pempek
- `transaksi_penjualan` - Riwayat penjualan
- `pengeluaran` - Riwayat pengeluaran
- `stok_bahan` - Stok bahan baku
- `pembelian_bahan` - Pembelian bahan baku
- `supplier` - Data supplier
- `piutang` - Piutang pelanggan
- `hutang` - Hutang usaha
- `laporan` - Laporan keuangan

## 🔐 Autentikasi

Aplikasi menggunakan Supabase Auth dengan fitur:
- Sign up (Registrasi)
- Sign in (Login)
- Protected routes
- Session management

## 🎨 Tema Warna

- Primary: Orange (#f97316) to Red (#ef4444) gradient
- Accent colors untuk status:
  - Green: Stok aman, pembayaran tunai, sudah lunas
  - Yellow: Stok menipis, piutang
  - Red: Stok habis, pengeluaran, hutang
  - Blue: Non-tunai, laba bersih positif

## 📝 Cara Penggunaan

### 1. Registrasi Akun
- Buka aplikasi dan klik "Daftar sekarang"
- Isi nama, email, dan password
- Login dengan akun yang sudah dibuat

### 2. Setup Awal
- Tambah produk pempek (Lenjer, Kapal Selam, Adaan, dll)
- Tambah supplier bahan baku
- Tambah stok bahan awal

### 3. Operasional Harian
- Catat setiap penjualan melalui menu Penjualan
- Catat setiap pengeluaran melalui menu Pengeluaran
- Update stok melalui Pembelian Bahan

### 4. Monitoring
- Cek Dashboard untuk ringkasan harian
- Monitor stok bahan yang menipis
- Follow up piutang dan hutang yang jatuh tempo

### 5. Laporan
- Buka menu Laporan untuk analisis keuangan
- Pilih periode (harian/mingguan/bulanan)
- Ekspor laporan untuk arsip

## 🔒 Keamanan

- Semua data tersimpan aman di Supabase
- Row Level Security (RLS) untuk proteksi data
- Autentikasi wajib untuk akses aplikasi
- HTTPS untuk semua komunikasi

## 💾 Backup & Restore

Fitur backup tersedia di menu Pengaturan:
- Backup semua data ke file JSON
- Simpan file backup di tempat aman
- Restore (Coming soon)

## 🎯 Tips Penggunaan

1. **Backup rutin**: Lakukan backup data setiap minggu
2. **Cek dashboard**: Mulai hari dengan cek dashboard untuk melihat notifikasi penting
3. **Update stok**: Selalu update stok setelah pembelian bahan
4. **Follow up piutang**: Periksa piutang yang jatuh tempo secara berkala
5. **Analisis laporan**: Gunakan laporan untuk evaluasi performa bulanan

## 📞 Support

Aplikasi ini dibuat khusus untuk Pempek Putri dengan fitur yang disesuaikan untuk kebutuhan usaha kuliner.

---

**Pempek Putri** - Pembukuan Digital, Usaha Makin Praktis! 🚀
