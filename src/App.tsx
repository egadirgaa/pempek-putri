import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Penjualan } from './pages/Penjualan';
import { ProdukPage } from './pages/Produk';
import { Pengeluaran } from './pages/Pengeluaran';
import { StokBahan } from './pages/StokBahan';
import { PembelianBahan } from './pages/PembelianBahan';
import { Supplier } from './pages/Supplier';
import { Piutang } from './pages/Piutang';
import { Hutang } from './pages/Hutang';
import { Laporan } from './pages/Laporan';
import { Pengaturan } from './pages/Pengaturan';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/penjualan"
          element={
            <ProtectedRoute>
              <Layout>
                <Penjualan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/produk"
          element={
            <ProtectedRoute>
              <Layout>
                <ProdukPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengeluaran"
          element={
            <ProtectedRoute>
              <Layout>
                <Pengeluaran />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stok-bahan"
          element={
            <ProtectedRoute>
              <Layout>
                <StokBahan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pembelian-bahan"
          element={
            <ProtectedRoute>
              <Layout>
                <PembelianBahan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute>
              <Layout>
                <Supplier />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/piutang"
          element={
            <ProtectedRoute>
              <Layout>
                <Piutang />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hutang"
          element={
            <ProtectedRoute>
              <Layout>
                <Hutang />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <Layout>
                <Laporan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute>
              <Layout>
                <Pengaturan />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}
