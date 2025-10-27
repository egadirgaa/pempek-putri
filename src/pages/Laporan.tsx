import { useState, useEffect } from 'react';
import { supabase, formatRupiah } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Laporan() {
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<'harian' | 'mingguan' | 'bulanan'>('bulanan');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [labaBersih, setLabaBersih] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadLaporan();
  }, [periode, selectedMonth, selectedDate]);

  const loadLaporan = async () => {
    setLoading(true);

    try {
      let startDate: string;
      let endDate: string;

      if (periode === 'harian') {
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (periode === 'mingguan') {
        // Get last 7 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        startDate = start.toISOString().split('T')[0];
        endDate = end.toISOString().split('T')[0];
      } else {
        // bulanan
        startDate = `${selectedMonth}-01`;
        const lastDay = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
        endDate = `${selectedMonth}-${lastDay}`;
      }

      // Get sales (pemasukan)
      const { data: salesData } = await supabase
        .from('transaksi_penjualan')
        .select('tanggal, total')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);

      const pemasukan = salesData?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
      setTotalPemasukan(pemasukan);

      // Get expenses (pengeluaran)
      const { data: expensesData } = await supabase
        .from('pengeluaran')
        .select('tanggal, jumlah, kategori')
        .gte('tanggal', startDate)
        .lte('tanggal', endDate);

      const pengeluaran = expensesData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
      setTotalPengeluaran(pengeluaran);

      setLabaBersih(pemasukan - pengeluaran);

      // Prepare chart data
      if (periode === 'harian') {
        // Show categories for expenses
        const expensesByCategory: { [key: string]: number } = {};
        expensesData?.forEach(exp => {
          expensesByCategory[exp.kategori] = (expensesByCategory[exp.kategori] || 0) + exp.jumlah;
        });

        const chart = Object.entries(expensesByCategory).map(([kategori, jumlah]) => ({
          kategori,
          pengeluaran: jumlah,
        }));
        setChartData(chart);
      } else {
        // Group by date
        const dataByDate: { [key: string]: { pemasukan: number; pengeluaran: number } } = {};

        salesData?.forEach(sale => {
          const date = new Date(sale.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (!dataByDate[date]) {
            dataByDate[date] = { pemasukan: 0, pengeluaran: 0 };
          }
          dataByDate[date].pemasukan += sale.total || 0;
        });

        expensesData?.forEach(exp => {
          const date = new Date(exp.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (!dataByDate[date]) {
            dataByDate[date] = { pemasukan: 0, pengeluaran: 0 };
          }
          dataByDate[date].pengeluaran += exp.jumlah;
        });

        const chart = Object.entries(dataByDate).map(([date, values]) => ({
          tanggal: date,
          pemasukan: values.pemasukan,
          pengeluaran: values.pengeluaran,
        }));

        setChartData(chart);
      }

    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    let csv = 'Laporan Keuangan Pempek Putri\n\n';
    csv += `Periode,${periode === 'harian' ? selectedDate : periode === 'mingguan' ? '7 Hari Terakhir' : selectedMonth}\n`;
    csv += `Total Pemasukan,${totalPemasukan}\n`;
    csv += `Total Pengeluaran,${totalPengeluaran}\n`;
    csv += `Laba Bersih,${labaBersih}\n\n`;

    if (periode === 'harian') {
      csv += 'Kategori,Pengeluaran\n';
      chartData.forEach(item => {
        csv += `${item.kategori},${item.pengeluaran}\n`;
      });
    } else {
      csv += 'Tanggal,Pemasukan,Pengeluaran\n';
      chartData.forEach(item => {
        csv += `${item.tanggal},${item.pemasukan},${item.pengeluaran}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${periode}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Laporan berhasil diunduh!');
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl text-gray-800">Laporan Keuangan</h1>
          <p className="text-gray-600 mt-1">Analisis keuangan bisnis Anda</p>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Ekspor CSV
        </Button>
      </div>

      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Periode:</label>
              <Select value={periode} onValueChange={(value: any) => setPeriode(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="harian">Harian</SelectItem>
                  <SelectItem value="mingguan">Mingguan</SelectItem>
                  <SelectItem value="bulanan">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periode === 'harian' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            )}

            {periode === 'bulanan' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pemasukan</p>
                <p className="text-2xl text-green-600 mt-1">{formatRupiah(totalPemasukan)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl text-red-600 mt-1">{formatRupiah(totalPengeluaran)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Laba Bersih</p>
                <p className={`text-2xl mt-1 ${labaBersih >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatRupiah(labaBersih)}
                </p>
              </div>
              <div className={`${labaBersih >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-3 rounded-full`}>
                <DollarSign className={`h-8 w-8 ${labaBersih >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {periode === 'harian' ? 'Pengeluaran per Kategori' : 'Grafik Pemasukan vs Pengeluaran'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              Tidak ada data untuk periode ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              {periode === 'harian' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kategori" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                  <Bar dataKey="pengeluaran" fill="#ef4444" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tanggal" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={2} name="Pemasukan" />
                  <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} name="Pengeluaran" />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700">Total Pemasukan</span>
              <span className="text-green-600">{formatRupiah(totalPemasukan)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-gray-700">Total Pengeluaran</span>
              <span className="text-red-600">{formatRupiah(totalPengeluaran)}</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-lg ${labaBersih >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
              <span className="text-gray-700">Laba Bersih</span>
              <span className={labaBersih >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                {formatRupiah(labaBersih)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Margin Keuntungan</span>
              <span className="text-gray-800">
                {totalPemasukan > 0 ? ((labaBersih / totalPemasukan) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
