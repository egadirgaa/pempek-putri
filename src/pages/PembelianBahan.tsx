import { useState, useEffect } from 'react';
import { supabase, PembelianBahan as PembelianBahanType, Supplier, formatRupiah, formatDate } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { Plus, ShoppingBag, Calendar } from 'lucide-react';

export function PembelianBahan() {
  const [pembelian, setPembelian] = useState<(PembelianBahanType & { supplier?: Supplier })[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    nama_bahan: '',
    jumlah: '',
    harga_satuan: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load suppliers
    const { data: supplierData } = await supabase
      .from('supplier')
      .select('*')
      .order('nama');
    setSuppliers(supplierData || []);

    // Load purchases
    const { data: pembelianData, error } = await supabase
      .from('pembelian_bahan')
      .select(`
        *,
        supplier:supplier_id (*)
      `)
      .order('tanggal', { ascending: false });

    if (error) {
      toast.error('Gagal memuat data pembelian');
      console.error(error);
    } else {
      setPembelian(pembelianData || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Insert purchase
      const { error: purchaseError } = await supabase
        .from('pembelian_bahan')
        .insert([{
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          nama_bahan: formData.nama_bahan,
          jumlah: parseInt(formData.jumlah),
          harga_satuan: parseInt(formData.harga_satuan),
        }]);

      if (purchaseError) throw purchaseError;

      // Update stock
      const { data: existingStock } = await supabase
        .from('stok_bahan')
        .select('*')
        .eq('nama_bahan', formData.nama_bahan)
        .single();

      if (existingStock) {
        // Update existing stock
        const { error: stockError } = await supabase
          .from('stok_bahan')
          .update({
            jumlah: existingStock.jumlah + parseInt(formData.jumlah),
            tanggal_update: new Date().toISOString(),
          })
          .eq('id', existingStock.id);

        if (stockError) throw stockError;
      } else {
        // Create new stock entry
        const { error: stockError } = await supabase
          .from('stok_bahan')
          .insert([{
            nama_bahan: formData.nama_bahan,
            jumlah: parseInt(formData.jumlah),
            satuan: 'Kg', // Default satuan, bisa disesuaikan
          }]);

        if (stockError) throw stockError;
      }

      toast.success('Pembelian berhasil dicatat dan stok diperbarui!');
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({ supplier_id: '', nama_bahan: '', jumlah: '', harga_satuan: '' });
  };

  const filteredPembelian = filterDate
    ? pembelian.filter(item => item.tanggal.startsWith(filterDate))
    : pembelian;

  const totalPembelian = filteredPembelian.reduce((sum, item) => sum + (item.total || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Pembelian Bahan</h1>
          <p className="text-gray-600 mt-1">Catat pembelian bahan baku</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pembelian
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pembelian Bahan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Supplier (Opsional)</Label>
                <Select 
                  value={formData.supplier_id} 
                  onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_bahan">Nama Bahan</Label>
                <Input
                  id="nama_bahan"
                  placeholder="Contoh: Ikan Tenggiri"
                  value={formData.nama_bahan}
                  onChange={(e) => setFormData({ ...formData, nama_bahan: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jumlah">Jumlah (Kg)</Label>
                  <Input
                    id="jumlah"
                    type="number"
                    placeholder="0"
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harga_satuan">Harga/Kg</Label>
                  <Input
                    id="harga_satuan"
                    type="number"
                    placeholder="0"
                    value={formData.harga_satuan}
                    onChange={(e) => setFormData({ ...formData, harga_satuan: e.target.value })}
                    required
                  />
                </div>
              </div>
              {formData.jumlah && formData.harga_satuan && (
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Pembelian:</p>
                  <p className="text-xl text-orange-600">
                    {formatRupiah(parseInt(formData.jumlah) * parseInt(formData.harga_satuan))}
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pembelian {filterDate ? `(${filterDate})` : '(Semua)'}</p>
              <p className="text-2xl text-gray-800 mt-1">{formatRupiah(totalPembelian)}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="max-w-xs"
            />
            {filterDate && (
              <Button variant="outline" onClick={() => setFilterDate('')}>Reset</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Purchase List */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembelian</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPembelian.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada data pembelian</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPembelian.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-800">{item.nama_bahan}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.jumlah} Kg × {formatRupiah(item.harga_satuan)}
                      </p>
                      {item.supplier && (
                        <p className="text-sm text-gray-500 mt-1">
                          Supplier: {item.supplier.nama}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.tanggal)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600">{formatRupiah(item.total || 0)}</p>
                    </div>
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
