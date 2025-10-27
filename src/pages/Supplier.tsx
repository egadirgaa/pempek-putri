import { useState, useEffect } from 'react';
import { supabase, Supplier as SupplierType, PembelianBahan, formatRupiah, formatDate } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, Users, Pencil, Trash2, Phone, MapPin, Package } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

export function Supplier() {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [supplierPurchases, setSupplierPurchases] = useState<{ [key: number]: PembelianBahan[] }>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierType | null>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    alamat: '',
    bahan_dipasok: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('supplier')
      .select('*')
      .order('nama');

    if (error) {
      toast.error('Gagal memuat data supplier');
      console.error(error);
    } else {
      setSuppliers(data || []);
      
      // Load purchases for each supplier
      const purchases: { [key: number]: PembelianBahan[] } = {};
      for (const supplier of (data || [])) {
        const { data: purchaseData } = await supabase
          .from('pembelian_bahan')
          .select('*')
          .eq('supplier_id', supplier.id)
          .order('tanggal', { ascending: false })
          .limit(5);
        
        if (purchaseData) {
          purchases[supplier.id] = purchaseData;
        }
      }
      setSupplierPurchases(purchases);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from('supplier')
          .update({
            nama: formData.nama,
            kontak: formData.kontak,
            alamat: formData.alamat,
            bahan_dipasok: formData.bahan_dipasok,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Supplier berhasil diperbarui!');
      } else {
        // Insert new
        const { error } = await supabase
          .from('supplier')
          .insert([{
            nama: formData.nama,
            kontak: formData.kontak,
            alamat: formData.alamat,
            bahan_dipasok: formData.bahan_dipasok,
          }]);

        if (error) throw error;
        toast.success('Supplier berhasil ditambahkan!');
      }

      setDialogOpen(false);
      resetForm();
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (item: SupplierType) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      kontak: item.kontak || '',
      alamat: item.alamat || '',
      bahan_dipasok: item.bahan_dipasok || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return;

    try {
      const { error } = await supabase
        .from('supplier')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Supplier berhasil dihapus!');
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus supplier');
    }
  };

  const resetForm = () => {
    setFormData({ nama: '', kontak: '', alamat: '', bahan_dipasok: '' });
    setEditingItem(null);
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
          <h1 className="text-3xl text-gray-800">Supplier</h1>
          <p className="text-gray-600 mt-1">Kelola data pemasok bahan baku</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Supplier' : 'Tambah Supplier'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Supplier</Label>
                <Input
                  id="nama"
                  placeholder="Nama pemasok"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kontak">Kontak</Label>
                <Input
                  id="kontak"
                  placeholder="Nomor telepon / email"
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  placeholder="Alamat lengkap"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bahan_dipasok">Bahan yang Dipasok</Label>
                <Input
                  id="bahan_dipasok"
                  placeholder="Contoh: Ikan Tenggiri, Tepung Sagu"
                  value={formData.bahan_dipasok}
                  onChange={(e) => setFormData({ ...formData, bahan_dipasok: e.target.value })}
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
              <p className="text-sm text-gray-600">Total Supplier</p>
              <p className="text-2xl text-gray-800 mt-1">{suppliers.length}</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      {/* Supplier List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada data supplier</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3">
              {suppliers.map((supplier) => {
                const purchases = supplierPurchases[supplier.id] || [];
                const totalPurchases = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
                
                return (
                  <AccordionItem key={supplier.id} value={`supplier-${supplier.id}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <h3 className="text-gray-800">{supplier.nama}</h3>
                          {supplier.bahan_dipasok && (
                            <p className="text-sm text-gray-600 mt-1">
                              <Package className="h-3 w-3 inline mr-1" />
                              {supplier.bahan_dipasok}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(supplier);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(supplier.id);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-3">
                        {supplier.kontak && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{supplier.kontak}</span>
                          </div>
                        )}
                        {supplier.alamat && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5" />
                            <span>{supplier.alamat}</span>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm text-gray-700 mb-3">
                            Riwayat Pembelian ({purchases.length}) - Total: {formatRupiah(totalPurchases)}
                          </h4>
                          {purchases.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">Belum ada pembelian</p>
                          ) : (
                            <div className="space-y-2">
                              {purchases.map((purchase) => (
                                <div key={purchase.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                  <div>
                                    <p className="text-gray-800">{purchase.nama_bahan}</p>
                                    <p className="text-xs text-gray-500">{formatDate(purchase.tanggal)}</p>
                                  </div>
                                  <p className="text-orange-600">{formatRupiah(purchase.total || 0)}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
