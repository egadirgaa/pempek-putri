import { useState, useEffect } from 'react';
import { supabase, Hutang as HutangType, formatRupiah, formatDate } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function Hutang() {
  const [hutang, setHutang] = useState<HutangType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pihak: '',
    jumlah: '',
    tanggal_jatuh_tempo: '',
  });

  useEffect(() => {
    loadHutang();
  }, []);

  const loadHutang = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hutang')
      .select('*')
      .order('tanggal_pinjam', { ascending: false });

    if (error) {
      toast.error('Gagal memuat data hutang');
      console.error(error);
    } else {
      setHutang(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('hutang')
        .insert([{
          nama_pihak: formData.nama_pihak,
          jumlah: parseInt(formData.jumlah),
          tanggal_pinjam: new Date().toISOString().split('T')[0],
          tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo || null,
        }]);

      if (error) throw error;

      toast.success('Hutang berhasil ditambahkan!');
      setDialogOpen(false);
      resetForm();
      loadHutang();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const { error } = await supabase
        .from('hutang')
        .update({ status: 'Lunas' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Hutang telah ditandai sebagai lunas!');
      loadHutang();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui status');
    }
  };

  const resetForm = () => {
    setFormData({ nama_pihak: '', jumlah: '', tanggal_jatuh_tempo: '' });
  };

  const belumLunas = hutang.filter(h => h.status === 'Belum Lunas');
  const sudahLunas = hutang.filter(h => h.status === 'Lunas');
  
  const totalBelumLunas = belumLunas.reduce((sum, h) => sum + h.jumlah, 0);
  const totalSudahLunas = sudahLunas.reduce((sum, h) => sum + h.jumlah, 0);

  const today = new Date().toISOString().split('T')[0];
  const jatuhTempo = belumLunas.filter(h => h.tanggal_jatuh_tempo && h.tanggal_jatuh_tempo <= today);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const HutangCard = ({ item }: { item: HutangType }) => {
    const isOverdue = item.tanggal_jatuh_tempo && item.tanggal_jatuh_tempo <= today && item.status === 'Belum Lunas';
    
    return (
      <div className={`p-4 rounded-lg border-2 ${isOverdue ? 'border-red-200 bg-red-50' : 'bg-gray-50 border-transparent'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-800">{item.nama_pihak}</h3>
              {isOverdue && <Badge className="bg-red-100 text-red-700">Jatuh Tempo</Badge>}
            </div>
            <p className="text-orange-600 mt-1">{formatRupiah(item.jumlah)}</p>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>Tanggal Pinjam: {formatDate(item.tanggal_pinjam)}</p>
              {item.tanggal_jatuh_tempo && (
                <p>Jatuh Tempo: {formatDate(item.tanggal_jatuh_tempo)}</p>
              )}
            </div>
          </div>
          {item.status === 'Belum Lunas' && (
            <Button
              size="sm"
              onClick={() => handleMarkAsPaid(item.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Bayar
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Hutang</h1>
          <p className="text-gray-600 mt-1">Kelola hutang usaha</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Hutang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Hutang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_pihak">Nama Pemberi Pinjaman</Label>
                <Input
                  id="nama_pihak"
                  placeholder="Nama supplier / pihak lain"
                  value={formData.nama_pihak}
                  onChange={(e) => setFormData({ ...formData, nama_pihak: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah Hutang</Label>
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
                <Label htmlFor="tanggal_jatuh_tempo">Tanggal Jatuh Tempo (Opsional)</Label>
                <Input
                  id="tanggal_jatuh_tempo"
                  type="date"
                  value={formData.tanggal_jatuh_tempo}
                  onChange={(e) => setFormData({ ...formData, tanggal_jatuh_tempo: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Lunas</p>
                <p className="text-2xl text-red-600 mt-1">{formatRupiah(totalBelumLunas)}</p>
                <p className="text-xs text-gray-500 mt-1">{belumLunas.length} hutang</p>
              </div>
              <FileText className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Lunas</p>
                <p className="text-2xl text-green-600 mt-1">{formatRupiah(totalSudahLunas)}</p>
                <p className="text-xs text-gray-500 mt-1">{sudahLunas.length} hutang</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jatuh Tempo</p>
                <p className="text-2xl text-orange-600 mt-1">{jatuhTempo.length}</p>
                <p className="text-xs text-gray-500 mt-1">Perlu dibayar segera</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hutang Tabs */}
      <Tabs defaultValue="belum-lunas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="belum-lunas">Belum Lunas ({belumLunas.length})</TabsTrigger>
          <TabsTrigger value="sudah-lunas">Sudah Lunas ({sudahLunas.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="belum-lunas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hutang Belum Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              {belumLunas.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Tidak ada hutang!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {belumLunas.map((item) => (
                    <HutangCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sudah-lunas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hutang Sudah Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              {sudahLunas.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Belum ada hutang yang lunas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sudahLunas.map((item) => (
                    <HutangCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
