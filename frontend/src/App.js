import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppStoreProvider } from "@/store/AppStore";
import Landing from "@/pages/landing/Landing";
import TiketLayout from "@/pages/tiket/TiketLayout";
import TiketHome from "@/pages/tiket/TiketHome";
import BookingList from "@/pages/tiket/BookingList";
import Order from "@/pages/tiket/Order";
import Confirmation from "@/pages/tiket/Confirmation";
import Transaction from "@/pages/tiket/Transaction";
import { CustomerLogin, CustomerRegister } from "@/pages/tiket/CustomerAuth";
import { InfoPemesanan, JadwalPelayaran, Kontak, Partner, Riwayat } from "@/pages/tiket/InfoPages";
import StaffLogin from "@/pages/petugas/StaffLogin";
import AdminLayout from "@/pages/petugas/AdminLayout";
import Dashboard from "@/pages/petugas/Dashboard";
import CrudPage, { CONFIGS } from "@/pages/petugas/CrudPage";
import JadwalPage from "@/pages/petugas/JadwalPage";
import ManifestPage from "@/pages/petugas/ManifestPage";
import LaporanPage from "@/pages/petugas/LaporanPage";
import RekonPage from "@/pages/petugas/RekonPage";
import { CutoffSettings, Profile } from "@/pages/petugas/Settings";

const crudPaths = Object.keys(CONFIGS).filter((p) => p.startsWith("/"));

function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<StaffLogin />} />
          <Route path="/tiket/login" element={<CustomerLogin />} />
          <Route path="/tiket/register" element={<CustomerRegister />} />
          <Route path="/tiket" element={<TiketLayout />}>
            <Route index element={<TiketHome />} />
            <Route path="home" element={<TiketHome />} />
            <Route path="booking/:asal/:tujuan/:tanggal" element={<BookingList />} />
            <Route path="order/:id/:kapasitas/:tanggal" element={<Order />} />
            <Route path="confirmation-payments/:invoice/:metode" element={<Confirmation />} />
            <Route path="transaction/:invoice/status-payment" element={<Transaction />} />
            <Route path="riwayat-pemesanan" element={<Riwayat />} />
            <Route path="jadwal" element={<JadwalPelayaran />} />
            <Route path="info" element={<InfoPemesanan />} />
            <Route path="partner" element={<Partner />} />
            <Route path="contact-us" element={<Kontak />} />
            <Route path="*" element={<Navigate to="/tiket" replace />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/jadwal" element={<JadwalPage />} />
            <Route path="/manifest" element={<ManifestPage />} />
            {crudPaths.map((p) => <Route key={p} path={p} element={<CrudPage />} />)}
            <Route path="/laporan/operator/harian" element={<LaporanPage />} />
            <Route path="/laporan/operator/bulanan" element={<LaporanPage />} />
            <Route path="/laporan/penumpang" element={<LaporanPage />} />
            <Route path="/laporan/transaksi" element={<LaporanPage />} />
            <Route path="/rekonsiliasi/va" element={<RekonPage />} />
            <Route path="/rekonsiliasi/qris" element={<RekonPage />} />
            <Route path="/pengaturan/batas-penjualan" element={<CutoffSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AppStoreProvider>
  );
}

export default App;
