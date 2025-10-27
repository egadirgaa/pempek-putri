import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// 🔸 UI Components dari shadcn/ui
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

// 🔸 Format Rupiah
function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
}

// 🔸 Tipe data
type Produk = {
  id: number;
  nama_produk: string;
  harga_jual: number;
};

type Transaksi = {
  id: number;
  produk_id: number;
  produk?: { nama_produk: string };
  jumlah: number;
  harga_satuan: number;
  total: number;
  metode_bayar: string;
  tanggal: string;
  keterangan?: string;
};

export function Penjualan() {
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [products, setProducts] = useState<Produk[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    produk_id: '',
    jumlah: '1',
    metode_bayar: 'Tunai' as 'Tunai' | 'Non-Tunai' | 'Piutang',
    keterangan: '',
    nama_pelanggan: '',
  });

  // 🔸 Load data produk & transaksi
  useEffect(() => {
    loadProducts();
    loadTransactions();
  }, [selectedDate]);

  const loadProducts = async () => {
    const { data } = await supabase.from('produk').select('*').order('nama_produk');
    setProducts(data || []);
  };

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transaksi_penjualan')
      .select(`
        *,
        produk:produk_id (nama_produk)
      `)
      .gte('tanggal', selectedDate)
      .lt('tanggal', new Date(new Date(selectedDate).getTime() + 86400000).toISOString())
      .order('tanggal', { ascending: false });

    setTransactions(data || []);
  };

  // 🔸 Handle submit transaksi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProduct = products.find((p) => p.id === Number(formData.produk_id));
    if (!selectedProduct) return;

    const jumlah = parseInt(formData.jumlah);
    const total = selectedProduct.harga_jual * jumlah;

    try {
      const transactionData = {
        produk_id: formData.produk_id,
        jumlah,
        harga_satuan: selectedProduct.harga_jual,
        metode_bayar: formData.metode_bayar,
        keterangan: formData.keterangan,
        tanggal: new Date().toISOString(),
      };

      const { error } = await supabase.from('transaksi_penjualan').insert([transactionData]);
      if (error) throw error;

      // 🔸 Jika metode piutang, buat juga record di tabel piutang
      if (formData.metode_bayar === 'Piutang' && formData.nama_pelanggan) {
        await supabase.from('piutang').insert([
          {
            nama_pelanggan: formData.nama_pelanggan,
            jumlah_piutang: total,
            tanggal_transaksi: new Date().toISOString().split('T')[0],
          },
        ]);
      }

      toast.success('Transaksi berhasil ditambahkan!');
      resetForm();
      setDialogOpen(false);
      loadTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan transaksi');
    }
  };

  // 🔸 Hapus transaksi
  const handleDelete = async (id: number) => {
    if (!confirm('Hapus transaksi ini?')) return;

    try {
      const { error } = await supabase.from('transaksi_penjualan').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaksi berhasil dihapus');
      loadTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus transaksi');
    }
  };

  const resetForm = () => {
    setFormData({
      produk_id: '',
      jumlah: '1',
      metode_bayar: 'Tunai',
      keterangan: '',
      nama_pelanggan: '',
    });
  };

  const selectedProduct = products.find((p) => p.id === Number(formData.produk_id));
  const totalPreview = selectedProduct ? selectedProduct.harga_jual * parseInt(formData.jumlah || '0') : 0;
  const totalHariIni = transactions.reduce((sum, t) => sum + (t.total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Penjualan</h1>
          <p className="text-gray-600 mt-1">Catat transaksi penjualan harian</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaksi Baru</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="produk_id">Produk</Label>
                <Select
                  value={formData.produk_id}
                  onValueChange={(value) => setFormData({ ...formData, produk_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.nama_produk} - {formatRupiah(product.harga_jual)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input
                  id="jumlah"
                  type="number"
                  min="1"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metode_bayar">Metode Pembayaran</Label>
                <Select
                  value={formData.metode_bayar}
                  onValueChange={(value: any) => setFormData({ ...formData, metode_bayar: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tunai">Tunai</SelectItem>
                    <SelectItem value="Non-Tunai">Non-Tunai (Transfer/QRIS)</SelectItem>
                    <SelectItem value="Piutang">Piutang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.metode_bayar === 'Piutang' && (
                <div className="space-y-2">
                  <Label htmlFor="nama_pelanggan">Nama Pelanggan</Label>
                  <Input
                    id="nama_pelanggan"
                    placeholder="Nama pelanggan"
                    value={formData.nama_pelanggan}
                    onChange={(e) => setFormData({ ...formData, nama_pelanggan: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Catatan tambahan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  rows={2}
                />
              </div>

              {totalPreview > 0 && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total:</p>
                  <p className="text-xl text-orange-600">{formatRupiah(totalPreview)}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Simpan Transaksi
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Hari Ini</p>
              <p className="text-2xl text-orange-600">{formatRupiah(totalHariIni)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada transaksi pada tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-gray-800">{transaction.produk?.nama_produk}</h3>
                      <Badge
                        className={
                          transaction.metode_bayar === 'Tunai'
                            ? 'bg-green-100 text-green-700'
                            : transaction.metode_bayar === 'Non-Tunai'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {transaction.metode_bayar}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {transaction.jumlah} × {formatRupiah(transaction.harga_satuan)} •{' '}
                      {new Date(transaction.tanggal).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {transaction.keterangan && (
                      <p className="text-sm text-gray-500 mt-1">{transaction.keterangan}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-orange-600">{formatRupiah(transaction.total || 0)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
