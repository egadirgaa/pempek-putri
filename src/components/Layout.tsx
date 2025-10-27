import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Box,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/penjualan', icon: ShoppingCart, label: 'Penjualan' },
    { path: '/produk', icon: Package, label: 'Produk' },
    { path: '/pengeluaran', icon: DollarSign, label: 'Pengeluaran' },
    { path: '/stok-bahan', icon: Box, label: 'Stok Bahan' },
    { path: '/pembelian-bahan', icon: ShoppingBag, label: 'Pembelian' },
    { path: '/supplier', icon: Users, label: 'Supplier' },
    { path: '/piutang', icon: CreditCard, label: 'Piutang' },
    { path: '/hutang', icon: FileText, label: 'Hutang' },
    { path: '/laporan', icon: BarChart3, label: 'Laporan' },
    { path: '/pengaturan', icon: Settings, label: 'Pengaturan' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg">Pempek Putri</h1>
            <p className="text-xs opacity-90">Pembukuan Digital</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-orange-100 text-orange-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
        <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <h1 className="text-2xl">Pempek Putri</h1>
          <p className="text-sm opacity-90 mt-1">Pembukuan Digital</p>
        </div>
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
          >
            <LogOut className="h-5 w-5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-20 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { path: '/dashboard', icon: Home, label: 'Home' },
            { path: '/penjualan', icon: ShoppingCart, label: 'Jual' },
            { path: '/produk', icon: Package, label: 'Produk' },
            { path: '/laporan', icon: BarChart3, label: 'Laporan' },
            { path: '/pengaturan', icon: Settings, label: 'Menu' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
