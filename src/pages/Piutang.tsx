import { useState, useEffect } from 'react';
import { supabase, Piutang as PiutangType, formatRupiah, formatDate } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Plus, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export function Piutang() {
  const [piutang, setPiutang] = useState<PiutangType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    jumlah_piutang: '',
    tanggal_jatuh_tempo: '',
  });

  useEffect(() => {
    loadPiutang();
  }, []);

  const loadPiutang = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('piutang')
      .select('*')
      .order('tanggal_transaksi', { ascending: false });

    if (error) {
      toast.error('Gagal memuat data piutang');
      console.error(error);
    } else {
      setPiutang(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('piutang')
        .insert([{
          nama_pelanggan: formData.nama_pelanggan,
          jumlah_piutang: parseInt(formData.jumlah_piutang),
          tanggal_transaksi: new Date().toISOString().split('T')[0],
          tanggal_jatuh_tempo: formData.tanggal_jatuh_tempo || null,
        }]);

      if (error) throw error;

      toast.success('Piutang berhasil ditambahkan!');
      setDialogOpen(false);
      resetForm();
      loadPiutang();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      const { error } = await supabase
        .from('piutang')
        .update({ status: 'Sudah Bayar' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Piutang telah ditandai sebagai lunas!');
      loadPiutang();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui status');
    }
  };

  const resetForm = () => {
    setFormData({ nama_pelanggan: '', jumlah_piutang: '', tanggal_jatuh_tempo: '' });
  };

  const belumBayar = piutang.filter(p => p.status === 'Belum Bayar');
  const sudahBayar = piutang.filter(p => p.status === 'Sudah Bayar');
  
  const totalBelumBayar = belumBayar.reduce((sum, p) => sum + p.jumlah_piutang, 0);
  const totalSudahBayar = sudahBayar.reduce((sum, p) => sum + p.jumlah_piutang, 0);

  const today = new Date().toISOString().split('T')[0];
  const jatuhTempo = belumBayar.filter(p => p.tanggal_jatuh_tempo && p.tanggal_jatuh_tempo <= today);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const PiutangCard = ({ item }: { item: PiutangType }) => {
    const isOverdue = item.tanggal_jatuh_tempo && item.tanggal_jatuh_tempo <= today && item.status === 'Belum Bayar';
    
    return (
      <div className={`p-4 rounded-lg border-2 ${isOverdue ? 'border-red-200 bg-red-50' : 'bg-gray-50 border-transparent'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-gray-800">{item.nama_pelanggan}</h3>
              {isOverdue && <Badge className="bg-red-100 text-red-700">Jatuh Tempo</Badge>}
            </div>
            <p className="text-orange-600 mt-1">{formatRupiah(item.jumlah_piutang)}</p>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>Tanggal: {formatDate(item.tanggal_transaksi)}</p>
              {item.tanggal_jatuh_tempo && (
                <p>Jatuh Tempo: {formatDate(item.tanggal_jatuh_tempo)}</p>
              )}
            </div>
          </div>
          {item.status === 'Belum Bayar' && (
            <Button
              size="sm"
              onClick={() => handleMarkAsPaid(item.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Lunas
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
          <h1 className="text-3xl text-gray-800">Piutang</h1>
          <p className="text-gray-600 mt-1">Kelola piutang pelanggan</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Piutang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Piutang</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="jumlah_piutang">Jumlah Piutang</Label>
                <Input
                  id="jumlah_piutang"
                  type="number"
                  placeholder="0"
                  value={formData.jumlah_piutang}
                  onChange={(e) => setFormData({ ...formData, jumlah_piutang: e.target.value })}
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
                <p className="text-sm text-gray-600">Belum Bayar</p>
                <p className="text-2xl text-orange-600 mt-1">{formatRupiah(totalBelumBayar)}</p>
                <p className="text-xs text-gray-500 mt-1">{belumBayar.length} piutang</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sudah Lunas</p>
                <p className="text-2xl text-green-600 mt-1">{formatRupiah(totalSudahBayar)}</p>
                <p className="text-xs text-gray-500 mt-1">{sudahBayar.length} piutang</p>
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
                <p className="text-2xl text-red-600 mt-1">{jatuhTempo.length}</p>
                <p className="text-xs text-gray-500 mt-1">Perlu ditindaklanjuti</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Piutang Tabs */}
      <Tabs defaultValue="belum-bayar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="belum-bayar">Belum Bayar ({belumBayar.length})</TabsTrigger>
          <TabsTrigger value="sudah-bayar">Sudah Lunas ({sudahBayar.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="belum-bayar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Piutang Belum Bayar</CardTitle>
            </CardHeader>
            <CardContent>
              {belumBayar.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Semua piutang sudah lunas!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {belumBayar.map((item) => (
                    <PiutangCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sudah-bayar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Piutang Sudah Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              {sudahBayar.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Belum ada piutang yang lunas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sudahBayar.map((item) => (
                    <PiutangCard key={item.id} item={item} />
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
