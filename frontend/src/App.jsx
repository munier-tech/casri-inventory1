import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import { useUserStore } from './store/useUserStore';
import Dashboard from './pages/Dashboard';
import FinancialLogForm from './components/Admin/FinancialLog';
import FinancialLogDate from './components/Admin/GetFinancialDate';
import CreateProduct from './components/products/CreateProduct';
import Categories from './components/categories/CreateCategories';
import GetProducts from './components/products/GetProducts';
import CreateSale from './pages/Homepage';
import LoanManagement from './components/loans/LoanManagement';
import DailySales from './components/Admin/DailySales';
import SalesByDate from './components/Admin/SalesByDate';
import GetAllUsersDailySales from './components/Admin/UserProducts';
import GetAllUsersSalesByDate from './components/Admin/UserProductsByDate';
import Stock from './components/Admin/Stock';
import useProductsStore from './store/useProductsStore';
import GetMonthlyReport from './components/reports/getMonthlyReports';
import GetYearlyReport from './components/reports/getYearlyReports';
import PurchaseManager from './components/purchases/Purchase';

const App = () => {
  const { checkAuth, user, isLoading, authChecked } = useUserStore();
  const { products, fetchProducts } = useProductsStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  useEffect(() => {
    if (!user?.role || user.role !== 'admin') return;

    // ✅ Ensure products is an array
    const prodArray = Array.isArray(products) ? products : [];

    const lowCount = prodArray.filter(
      p => Number(p.stock ?? 0) > 0 && Number(p.stock ?? 0) <= Number(p.lowStockThreshold ?? 5)
    ).length;

    const soldCount = prodArray.filter(p => Number(p.stock ?? 0) <= 0).length;

    if (lowCount > 0 || soldCount > 0) {
      const parts = [];
      if (soldCount > 0) parts.push(`${soldCount} Alaab ayaa dhamaatay`);
      if (lowCount > 0) parts.push(`${lowCount} Alaab ayaa ku dhow inay dhamaadaan`);
      toast.custom((t) => (
        <div className={`px-4 py-3 rounded-lg shadow-lg ${t.visible ? 'animate-enter' : 'animate-leave'} bg-gray-800 border border-gray-700`}> 
          <div className="text-white font-medium">La Soco kaydka alaabta</div>
          <div className="text-gray-300 text-sm mt-1">{parts.join(', ')}</div>
        </div>
      ), { id: 'stock-alert', duration: 4000 });
    }
  }, [products, user]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0 bg-white" />
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-14 px-4 min-h-screen">
        <Routes>
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user?.role === "admin" ? <Dashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/FinancialLogForm" element={user?.role === "admin" ? <FinancialLogForm /> : <Navigate to="/dashboard" />} />
          <Route path="/AddSale" element={user?.role === "admin" ? <CreateSale /> : <Navigate to="/dashboard" />} />
          <Route path="/createProduct" element={user?.role === "admin" ? <CreateProduct /> : <Navigate to="/dashboard" />} />
          <Route path="/reports" element={user?.role === "admin" ? <GetMonthlyReport /> : <Navigate to="/dashboard" />} />
          <Route path="/yearlyreports" element={user?.role === "admin" ? <GetYearlyReport /> : <Navigate to="/dashboard" />} />
          <Route path="/purchases" element={user?.role === "admin" ? <PurchaseManager /> : <Navigate to="/dashboard" />} />
          <Route path="/products" element={user?.role === "admin" ? <GetProducts /> : <Navigate to="/dashboard" />} />
          <Route path="/DailySales" element={user?.role === "admin" ? <DailySales /> : <Navigate to="/dashboard" />} />
          <Route path="/HistorySalesDate" element={user?.role === "admin" ? <SalesByDate /> : <Navigate to="/dashboard" />} />
          <Route path="/UserDailySales" element={user?.role === "admin" ? <GetAllUsersDailySales /> : <Navigate to="/dashboard" />} />
          <Route path="/UserProductsByDate" element={user?.role === "admin" ? <GetAllUsersSalesByDate /> : <Navigate to="/dashboard" />} />
          <Route path="/stock" element={user?.role === "admin" ? <Stock /> : <Navigate to="/dashboard" />} />
          <Route path="/categories" element={user?.role === "admin" ? <Categories /> : <Navigate to="/dashboard" />} />
          <Route path="/loans" element={user?.role === "admin" ? <LoanManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/FinancialLogDate" element={user?.role === "admin" ? <FinancialLogDate /> : <Navigate to="/dashboard" />} />
        </Routes>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
