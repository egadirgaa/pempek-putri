import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [todayProfit, setTodayProfit] = useState(0);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Get today's sales
    const { data: salesData } = await supabase
      .from('transaksi_penjualan')
      .select('total')
      .gte('tanggal', today);

    const totalSales = salesData?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    setTodaySales(totalSales);

    // Get today's expenses
    const { data: expensesData } = await supabase
      .from('pengeluaran')
      .select('jumlah')
      .gte('tanggal', today);

    const totalExpenses = expensesData?.reduce((sum, item) => sum + item.jumlah, 0) || 0;
    setTodayExpenses(totalExpenses);

    setTodayProfit(totalSales - totalExpenses);

    // Get low stock items
    const { data: stockData } = await supabase
      .from('stok_bahan')
      .select('*')
      .lt('jumlah', 10);

    setLowStock(stockData || []);

    // Get notifications
    const notifs: string[] = [];
    
    // Check for overdue receivables
    const { data: piutangData } = await supabase
      .from('piutang')
      .select('*')
      .eq('status', 'Belum Bayar')
      .lte('tanggal_jatuh_tempo', today);

    if (piutangData && piutangData.length > 0) {
      notifs.push(`${piutangData.length} piutang jatuh tempo`);
    }

    // Check for overdue payables
    const { data: hutangData } = await supabase
      .from('hutang')
      .select('*')
      .eq('status', 'Belum Lunas')
      .lte('tanggal_jatuh_tempo', today);

    if (hutangData && hutangData.length > 0) {
      notifs.push(`${hutangData.length} hutang jatuh tempo`);
    }

    if (stockData && stockData.length > 0) {
      notifs.push(`${stockData.length} bahan stok menipis`);
    }

    setNotifications(notifs);

    // Get weekly sales data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weeklySales } = await supabase
      .from('transaksi_penjualan')
      .select('tanggal, total')
      .gte('tanggal', weekAgo.toISOString());

    // Group by date
    const salesByDate: { [key: string]: number } = {};
    weeklySales?.forEach(sale => {
      const date = new Date(sale.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      salesByDate[date] = (salesByDate[date] || 0) + (sale.total || 0);
    });

    const chartData = Object.entries(salesByDate).map(([date, total]) => ({
      date,
      penjualan: total,
    }));

    setWeeklyData(chartData);
    setLoading(false);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Penjualan Hari Ini</p>
              <p className="text-2xl text-gray-800 mt-2">{formatRupiah(todaySales)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pengeluaran Hari Ini</p>
              <p className="text-2xl text-gray-800 mt-2">{formatRupiah(todayExpenses)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Laba Bersih Hari Ini</p>
              <p className={`text-2xl mt-2 ${todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatRupiah(todayProfit)}
              </p>
            </div>
            <div className={`${todayProfit >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-3 rounded-full`}>
              <DollarSign className={`w-6 h-6 ${todayProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-yellow-800">Pemberitahuan</h3>
              <ul className="mt-2 space-y-1">
                {notifications.map((notif, index) => (
                  <li key={index} className="text-sm text-yellow-700">• {notif}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl text-gray-800 mb-4">Penjualan 7 Hari Terakhir</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatRupiah(Number(value))} />
            <Line type="monotone" dataKey="penjualan" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl text-gray-800">Stok Bahan Menipis</h2>
          </div>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-800">{item.nama_bahan}</span>
                <span className="text-orange-600">
                  {item.jumlah} {item.satuan}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
