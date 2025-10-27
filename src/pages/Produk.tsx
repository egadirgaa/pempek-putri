import { useState, useEffect } from 'react';
import { supabase, Produk, formatRupiah } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export function ProdukPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produk | null>(null);
  const [formData, setFormData] = useState({
    nama_produk: '',
    harga_jual: '',
    stok: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase.from('produk').select('*').order('nama_produk');
    if (error) {
      toast.error('Gagal memuat data produk');
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('produk')
          .update({
            nama_produk: formData.nama_produk,
            harga_jual: parseInt(formData.harga_jual),
            stok: parseInt(formData.stok),
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Produk berhasil diperbarui!');
      } else {
        const { error } = await supabase
          .from('produk')
          .insert([{
            nama_produk: formData.nama_produk,
            harga_jual: parseInt(formData.harga_jual),
            stok: parseInt(formData.stok),
          }]);

        if (error) throw error;
        toast.success('Produk berhasil ditambahkan!');
      }

      setDialogOpen(false);
      resetForm();
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (product: Produk) => {
    setEditingItem(product);
    setFormData({
      nama_produk: product.nama_produk,
      harga_jual: product.harga_jual.toString(),
      stok: product.stok.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      const { error } = await supabase.from('produk').delete().eq('id', id);
      if (error) throw error;
      toast.success('Produk berhasil dihapus');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus produk');
    }
  };

  const resetForm = () => {
    setFormData({ nama_produk: '', harga_jual: '', stok: '' });
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Produk</h1>
          <p className="text-gray-600 mt-1">Kelola daftar produk pempek</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_produk">Nama Produk</Label>
                <Input
                  id="nama_produk"
                  placeholder="Contoh: Pempek Lenjer"
                  value={formData.nama_produk}
                  onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga_jual">Harga Jual (Rp)</Label>
                <Input
                  id="harga_jual"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.harga_jual}
                  onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stok">Stok Awal</Label>
                <Input
                  id="stok"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stok}
                  onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingItem ? 'Perbarui' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produk</p>
              <p className="text-2xl text-gray-800 mt-1">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Belum ada produk. Tambahkan produk pertama Anda!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-800 mb-2">{product.nama_produk}</h3>
                    <p className="text-2xl text-orange-600">{formatRupiah(product.harga_jual)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">Stok</span>
                  <Badge className={product.stok < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                    {product.stok} pcs
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}