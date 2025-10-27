import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react';

// 🔸 UI Components dari shadcn/ui
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

// 🔸 Format Rupiah
function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
}

// 🔸 Tipe data
type Pengeluaran = {
  id: number;
  tanggal: string;
  kategori: string;
  deskripsi: string;
  jumlah: number;
};
const CATEGORIES = [
  'Bahan Baku',
  'Gas',
  'Minyak',
  'Gaji',
  'Sewa',
  'Listrik & Air',
  'Transportasi',
  'Lainnya',
];

export function Pengeluaran() {
  const [expenses, setExpenses] = useState<Pengeluaran[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    kategori: '',
    deskripsi: '',
    jumlah: '',
  });

  useEffect(() => {
    loadExpenses();
  }, [selectedDate]);

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('pengeluaran')
      .select('*')
      .gte('tanggal', selectedDate)
      .lt('tanggal', new Date(new Date(selectedDate).getTime() + 86400000).toISOString())
      .order('tanggal', { ascending: false });

    if (error) {
      toast.error('Gagal memuat data pengeluaran');
    } else {
      setExpenses(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('pengeluaran').insert([{
        kategori: formData.kategori,
        deskripsi: formData.deskripsi,
        jumlah: parseInt(formData.jumlah),
      }]);

      if (error) throw error;

      toast.success('Pengeluaran berhasil ditambahkan!');
      setDialogOpen(false);
      resetForm();
      loadExpenses();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan pengeluaran');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengeluaran ini?')) return;

    try {
      const { error } = await supabase.from('pengeluaran').delete().eq('id', id);
      if (error) throw error;
      toast.success('Pengeluaran berhasil dihapus');
      loadExpenses();
    } catch (error: any) {
      toast.error(error.message || 'Gagal menghapus pengeluaran');
    }
  };

  const resetForm = () => {
    setFormData({ kategori: '', deskripsi: '', jumlah: '' });
  };

  const totalHariIni = expenses.reduce((sum, e) => sum + e.jumlah, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Pengeluaran</h1>
          <p className="text-gray-600 mt-1">Catat pengeluaran operasional</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengeluaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pengeluaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <Select 
                  value={formData.kategori} 
                  onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Detail pengeluaran (opsional)"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah (Rp)</Label>
                <Input
                  id="jumlah"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Simpan</Button>
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
              <p className="text-2xl text-red-600">{formatRupiah(totalHariIni)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada pengeluaran pada tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-red-100 text-red-700">{expense.kategori}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(expense.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {expense.deskripsi && (
                      <p className="text-sm text-gray-600 mt-1">{expense.deskripsi}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-red-600">{formatRupiah(expense.jumlah)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
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
