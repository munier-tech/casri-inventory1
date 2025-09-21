import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Loader, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
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
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="animate-spin text-white" size={40} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0 bg-gray-900" />
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-14 px-4 min-h-screen">
        <Routes>
          <Route path="/" element={user ? <CreateSale /> : <Navigate to="/signin" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" />} />
          <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user?.role === "admin" ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/FinancialLogForm" element={user?.role === "admin" ? <FinancialLogForm /> : <Navigate to="/" />} />
          <Route path="/createProduct" element={user?.role === "admin" ? <CreateProduct /> : <Navigate to="/" />} />
          <Route path="/products" element={user?.role === "admin" ? <GetProducts /> : <Navigate to="/" />} />
          <Route path="/DailySales" element={user?.role === "admin" ? <DailySales /> : <Navigate to="/" />} />
          <Route path="/HistorySalesDate" element={user?.role === "admin" ? <SalesByDate /> : <Navigate to="/" />} />
          <Route path="/UserDailySales" element={user?.role === "admin" ? <GetAllUsersDailySales /> : <Navigate to="/" />} />
          <Route path="/UserProductsByDate" element={user?.role === "admin" ? <GetAllUsersSalesByDate /> : <Navigate to="/" />} />
          <Route path="/stock" element={user?.role === "admin" ? <Stock /> : <Navigate to="/" />} />
          <Route path="/categories" element={user?.role === "admin" ? <Categories /> : <Navigate to="/" />} />
          <Route path="/loans" element={user?.role === "admin" ? <LoanManagement /> : <Navigate to="/" />} />
          <Route path="/FinancialLogDate" element={user?.role === "admin" ? <FinancialLogDate /> : <Navigate to="/" />} />
        </Routes>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
