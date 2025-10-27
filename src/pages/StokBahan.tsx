import { useState, useEffect } from 'react';
import { supabase, StokBahan as StokBahanType, formatDate } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, Package, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function StokBahan() {
  const [stokBahan, setStokBahan] = useState<StokBahanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StokBahanType | null>(null);
  
  const [formData, setFormData] = useState({
    nama_bahan: '',
    jumlah: '',
    satuan: '',
  });

  useEffect(() => {
    loadStokBahan();
  }, []);

  const loadStokBahan = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('stok_bahan')
      .select('*')
      .order('nama_bahan');

    if (error) {
      toast.error('Gagal memuat data stok bahan');
      console.error(error);
    } else {
      setStokBahan(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from('stok_bahan')
          .update({
            nama_bahan: formData.nama_bahan,
            jumlah: parseInt(formData.jumlah),
            satuan: formData.satuan,
            tanggal_update: new Date().toISOString(),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Stok bahan berhasil diperbarui!');
      } else {
        // Insert new
        const { error } = await supabase
          .from('stok_bahan')
          .insert([{
            nama_bahan: formData.nama_bahan,
            jumlah: parseInt(formData.jumlah),
            satuan: formData.satuan,
          }]);

        if (error) throw error;
        toast.success('Stok bahan berhasil ditambahkan!');
      }

      setDialogOpen(false);
      resetForm();
      loadStokBahan();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (item: StokBahanType) => {
    setEditingItem(item);
    setFormData({
      nama_bahan: item.nama_bahan,
      jumlah: item.jumlah.toString(),
      satuan: item.satuan,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus stok bahan ini?')) return;

    try {
      const { error } = await supabase
        .from('stok_bahan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Stok bahan berhasil dihapus!');
      loadStokBahan();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus stok bahan');
    }
  };

  const resetForm = () => {
    setFormData({ nama_bahan: '', jumlah: '', satuan: '' });
    setEditingItem(null);
  };

  const getStockStatus = (jumlah: number) => {
    if (jumlah === 0) return { label: 'Habis', color: 'bg-red-100 text-red-700' };
    if (jumlah < 10) return { label: 'Menipis', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Aman', color: 'bg-green-100 text-green-700' };
  };

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
          <h1 className="text-3xl text-gray-800">Stok Bahan</h1>
          <p className="text-gray-600 mt-1">Kelola stok bahan baku pempek</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Stok
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Stok Bahan' : 'Tambah Stok Bahan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="jumlah">Jumlah</Label>
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
                  <Label htmlFor="satuan">Satuan</Label>
                  <Input
                    id="satuan"
                    placeholder="Kg, Liter, dll"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Perbarui' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bahan</p>
                <p className="text-2xl text-gray-800 mt-1">{stokBahan.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Menipis</p>
                <p className="text-2xl text-yellow-600 mt-1">
                  {stokBahan.filter(item => item.jumlah < 10 && item.jumlah > 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stok Habis</p>
                <p className="text-2xl text-red-600 mt-1">
                  {stokBahan.filter(item => item.jumlah === 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Stok Bahan</CardTitle>
        </CardHeader>
        <CardContent>
          {stokBahan.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada data stok bahan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stokBahan.map((item) => {
                const status = getStockStatus(item.jumlah);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-gray-800">{item.nama_bahan}</h3>
                        <Badge className={status.color}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Stok: {item.jumlah} {item.satuan} • Terakhir update: {formatDate(item.tanggal_update)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
