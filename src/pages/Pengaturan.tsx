import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  Database, 
  Download, 
  Upload,
  ShoppingCart,
  Package,
  DollarSign,
  Box,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  BarChart3
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

export function Pengaturan() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Berhasil keluar');
    navigate('/login');
  };

  const handleBackupData = async () => {
    try {
      toast.info('Mengunduh data...');

      // Fetch all data
      const [
        { data: produk },
        { data: penjualan },
        { data: pengeluaran },
        { data: stokBahan },
        { data: pembelianBahan },
        { data: supplier },
        { data: piutang },
        { data: hutang },
      ] = await Promise.all([
        supabase.from('produk').select('*'),
        supabase.from('transaksi_penjualan').select('*'),
        supabase.from('pengeluaran').select('*'),
        supabase.from('stok_bahan').select('*'),
        supabase.from('pembelian_bahan').select('*'),
        supabase.from('supplier').select('*'),
        supabase.from('piutang').select('*'),
        supabase.from('hutang').select('*'),
      ]);

      const backupData = {
        tanggal_backup: new Date().toISOString(),
        data: {
          produk,
          penjualan,
          pengeluaran,
          stokBahan,
          pembelianBahan,
          supplier,
          piutang,
          hutang,
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-pempek-putri-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success('Backup data berhasil diunduh!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal membuat backup');
    }
  };

  const menuItems = [
    { path: '/penjualan', icon: ShoppingCart, label: 'Penjualan', color: 'text-blue-600' },
    { path: '/produk', icon: Package, label: 'Produk', color: 'text-purple-600' },
    { path: '/pengeluaran', icon: DollarSign, label: 'Pengeluaran', color: 'text-red-600' },
    { path: '/stok-bahan', icon: Box, label: 'Stok Bahan', color: 'text-green-600' },
    { path: '/pembelian-bahan', icon: ShoppingBag, label: 'Pembelian', color: 'text-orange-600' },
    { path: '/supplier', icon: Users, label: 'Supplier', color: 'text-indigo-600' },
    { path: '/piutang', icon: CreditCard, label: 'Piutang', color: 'text-yellow-600' },
    { path: '/hutang', icon: FileText, label: 'Hutang', color: 'text-pink-600' },
    { path: '/laporan', icon: BarChart3, label: 'Laporan', color: 'text-teal-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-800">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola preferensi dan akun Anda</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600">Email</Label>
            <p className="text-gray-800 mt-1">{user?.email}</p>
          </div>
          {user?.user_metadata?.nama && (
            <div>
              <Label className="text-sm text-gray-600">Nama</Label>
              <p className="text-gray-800 mt-1">{user.user_metadata.nama}</p>
            </div>
          )}
          <Separator />
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar dari Akun
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Tampilan
          </CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Mode Gelap</Label>
              <p className="text-sm text-gray-600">Gunakan tema gelap (Coming soon)</p>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={setDarkMode}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Manajemen Data
          </CardTitle>
          <CardDescription>Backup dan restore data aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Backup data Anda secara berkala untuk menghindari kehilangan data penting.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={handleBackupData}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup Data
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              disabled
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore Data (Coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
          <CardDescription>Navigasi ke halaman lainnya</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="outline"
                  onClick={() => navigate(item.path)}
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <Icon className={`h-6 w-6 ${item.color}`} />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tentang Aplikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Nama Aplikasi</span>
            <span className="text-gray-800">Pempek Putri</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Versi</span>
            <span className="text-gray-800">1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Database</span>
            <span className="text-gray-800">Supabase</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
