import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Produk {
  id: number;
  nama_produk: string;
  harga_jual: number;
  stok: number;
}

export interface TransaksiPenjualan {
  id: number;
  tanggal: string;
  produk_id: number | null;
  jumlah: number;
  harga_satuan: number;
  total?: number;
  metode_bayar: 'Tunai' | 'Non-Tunai' | 'Piutang';
  keterangan?: string;
  produk?: Produk;
}

export interface Pengeluaran {
  id: number;
  tanggal: string;
  kategori: string;
  deskripsi?: string;
  jumlah: number;
}

export interface Supplier {
  id: number;
  nama: string;
  kontak?: string;
  alamat?: string;
  bahan_dipasok?: string;
}

export interface PembelianBahan {
  id: number;
  tanggal: string;
  supplier_id?: number | null;
  nama_bahan: string;
  jumlah: number;
  harga_satuan: number;
  total?: number;
  supplier?: Supplier;
}

export interface Hutang {
  id: number;
  nama_pihak: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_jatuh_tempo?: string | null;
  status: 'Belum Lunas' | 'Lunas';
}

export interface Piutang {
  id: number;
  nama_pelanggan: string;
  jumlah_piutang: number;
  tanggal_transaksi: string;
  tanggal_jatuh_tempo?: string | null;
  status: 'Belum Bayar' | 'Sudah Bayar';
}

export interface StokBahan {
  id: number;
  nama_bahan: string;
  jumlah: number;
  satuan: string;
  tanggal_update: string;
}

export interface Laporan {
  id: number;
  periode: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  laba_bersih?: number;
  catatan?: string;
}

// Helper function to format currency
export const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
