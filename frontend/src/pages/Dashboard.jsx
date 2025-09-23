import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBasket,
  ShoppingCart,
  Boxes,
  PlusCircle,
  Calendar,
  FileText,
  Receipt,
  FileTerminalIcon,
  FileScanIcon,
  User,
  ChevronRight,
  Globe,
  DollarSign,
  ReceiptIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import useProductsStore from "../store/useProductsStore";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedTabs, setExpandedTabs] = useState({});
  const [language, setLanguage] = useState("so"); // 'so' for Somali, 'en' for English
  const { products: rawProducts } = useProductsStore();

  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const toggleTabExpansion = (tabId) => {
    setExpandedTabs(prev => ({
      ...prev,
      [tabId]: !prev[tabId]
    }));
  };

  const content = {
    so: {
      dashboard: "Dashboard",
      tabs: {
        dashboard: "Dashboard",
        products: "Alaabta",
        stock: "Kaydka",
        loans: "Amaahda",
        Purchases: "Alaabta Meheradu so iibsatay",
        reports: "Warbixinno",
        categories: "Qeybta Alaabta",
        sales: "Iibka",
        users: "Isticmaalayaasha",
        financial: "Maaliyadda"
      },
      subtabs: {
        createProduct: "Abuur Alaab",
        GetReports: "Hel Warbixinno Bile",
        stock: "Hel Kaydka",
        GetYearlyReports: "Hel Warbixinno Sannadeed",
        createCategory: "Abuur Qayb Cusub",
        loan: "Abuur Amaah",
        CreatePurchases: "Diiwaangeli Iibsasho",
        productList: "Liiska Alaabta",
        dailySales: "Iibka Maanta",
        salesByDate: "Iibka Taariikhda",
        userDailySales: "Iibka Isticmaalaha Maanta",
        userSalesByDate: "Iibka Isticmaalaha Taariikhda",
        financialLog: "Diiwaanka Maaliyadda",
        financialHistory: "Taariikhda Maaliyadda"
      },
      welcome: "ku Soo dhawoow Dashboard-ka",
      welcomeDesc: "Halkan waxaad ka heli kartaa macluumaadka guud ee ganacsigaaga iyo xogta dhaqaale.",
      selectSubtab: "Dooro qeybta hoose ee aad rabto inaad wax ka qabato.",
      generalReport: "Warbixinta Guud",
      finance: "Dhaqaale",
      financeDesc: "Halkan waxaad arki kartaa dhaqaalahaga guud",
      productsDesc: "Maareynta alaabta iyo bakhaarka"
    },
    en: {
      dashboard: "Dashboard",
      tabs: {
        dashboard: "Dashboard",
        loans: "Loans",
        products: "Products",
        stock: "Stock",
        categories: "Categories",
        reports: "Reports",
        Purchases: "Purchases",
        sales: "Sales",
        users: "Users",
        financial: "Financial"
      },
      subtabs: {
        createProduct: "Create Product",
        loan: "Create Loan",
        stock: "View Stock",
        CreatePurchases: "Create Purchase",
        createCategory: "Create Category",
        GetReports: "Get Reports",
        GetYearlyReports: "Get Yearly Reports",
        productList: "Product List",
        dailySales: "Daily Sales",
        salesByDate: "Sales by Date",
        userDailySales: "User Daily Sales",
        userSalesByDate: "User Sales by Date",
        financialLog: "Financial Log",
        financialHistory: "Financial History"
      },
      welcome: "Welcome to your Dashboard",
      welcomeDesc: "Here you can find an overview of your business and financial data.",
      selectSubtab: "Select a sub-tab to perform operations.",
      generalReport: "General Report",
      finance: "Finance",
      financeDesc: "View your overall financial status here",
      productsDesc: "Manage your products and inventory"
    }
  };

  const tabs = [
    { 
      id: "dashboard", 
      label: content[language].tabs.dashboard, 
      icon: Home,
      content: <DashboardContent language={language} content={content[language]} />
    },
    { 
      id: "products", 
      label: content[language].tabs.products, 
      icon: ShoppingBasket,
      subtabs: [
        { id: "create", label: content[language].subtabs.createProduct, icon: PlusCircle, path: "/createProduct" },
        { id: "list", label: content[language].subtabs.productList, icon: ShoppingBasket, path: "/products" },
      ]
    },
    { 
      id: "stock", 
      label: content[language].tabs.stock, 
      icon: Boxes,
      subtabs: [
        { id: "get", label: content[language].subtabs.stock, icon: Boxes, path: "/stock" },
      ]
    },
    { 
      id: "categories", 
      label: content[language].tabs.categories, 
      icon: ShoppingBasket,
      subtabs: [
        { id: "create", label: content[language].subtabs.createCategory, icon: PlusCircle, path: "/categories" },
      ]
    },
    { 
      id: "Purchases", 
      label: content[language].tabs.Purchases, 
      icon: ShoppingBasket,
      subtabs: [
        { id: "create", label: content[language].subtabs.CreatePurchases, icon: PlusCircle, path: "/purchases" },
      ]
    },
    { 
      id: "reports", 
      label: content[language].tabs.reports, 
      icon: ReceiptIcon,
      subtabs: [
        { id: "get", label: content[language].subtabs.GetReports, icon: PlusCircle, path: "/reports" },
        { id: "get", label: content[language].subtabs.GetYearlyReports, icon: PlusCircle, path: "/yearlyreports" },
      ]
    },
    { 
      id: "loans", 
      label: content[language].tabs.loans, 
      icon: DollarSign,
      subtabs: [
        { id: "create", label: content[language].subtabs.loan, icon: PlusCircle, path: "/loans" },
      ]
    },
    { 
      id: "sales", 
      label: content[language].tabs.sales, 
      icon: ShoppingCart,
      subtabs: [
        { id: "daily", label: content[language].subtabs.dailySales, icon: Calendar, path: "/DailySales" },
        { id: "history", label: content[language].subtabs.salesByDate, icon: FileText, path: "/HistorySalesDate" },
      ]
    },
    { 
      id: "users", 
      label: content[language].tabs.users, 
      icon: User,
      subtabs: [
        { id: "userDaily", label: content[language].subtabs.userDailySales, icon: Receipt, path: "/UserDailySales" },
        { id: "userHistory", label: content[language].subtabs.userSalesByDate, icon: FileText, path: "/UserProductsByDate" },
      ]
    },
    { 
      id: "financial", 
      label: content[language].tabs.financial, 
      icon: FileTerminalIcon,
      subtabs: [
        { id: "financialLog", label: content[language].subtabs.financialLog, icon: FileScanIcon, path: "/FinancialLogForm" },
        { id: "financialHistory", label: content[language].subtabs.financialHistory, icon: FileScanIcon, path: "/FinancialLogDate" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {content[language].dashboard}
          </motion.h1>
          
          {/* Language Selector */}
          <motion.div 
            className="flex items-center space-x-2 bg-gray-800 rounded-xl p-2 border border-gray-700 shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe size={18} className="text-emerald-400" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-gray-200 focus:outline-none"
            >
              <option value="so">Somali</option>
              <option value="en">English</option>
            </select>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tab Navigation */}
          <div className="w-full lg:w-72 bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-700">
            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <div key={tab.id}>
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.subtabs) toggleTabExpansion(tab.id);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                        : "text-gray-300 hover:text-emerald-400 hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.subtabs && (
                      <motion.div
                        animate={{ rotate: expandedTabs[tab.id] ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={16} />
                      </motion.div>
                    )}
                  </button>
                  
                  {/* Subtabs */}
                  <AnimatePresence>
                    {tab.subtabs && expandedTabs[tab.id] && (
                      <motion.div 
                        className="ml-8 mt-2 flex flex-col gap-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {tab.subtabs.map((subtab) => (
                          <Link
                            key={subtab.id}
                            to={subtab.path}
                            className="flex items-center gap-3 p-2 rounded-xl text-gray-300 hover:text-emerald-400 hover:bg-gray-700/50 transition-colors"
                          >
                            <subtab.icon size={16} />
                            <span className="text-sm">{subtab.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Only welcome + DashboardContent */}
                <div>
                  <div className="bg-gray-800/80 backdrop-blur-sm p-7 rounded-2xl shadow-lg border border-gray-700 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {content[language].welcome}
                    </h2>
                    <p className="text-gray-300 text-lg">
                      {content[language].welcomeDesc}
                    </p>
                  </div>

                  <DashboardContent language={language} content={content[language]} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ language, content }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-7 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        {content.generalReport}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-all duration-300"
          whileHover={{ y: -3 }}
        >
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">
            {content.finance}
          </h3>
          <p className="text-gray-300">
            {content.financeDesc}
          </p>
        </motion.div>
        <motion.div 
          className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-5 rounded-xl border border-gray-700 hover:border-emerald-500/30 transition-all duration-300"
          whileHover={{ y: -3 }}
        >
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">
            {language === "so" ? "Alaabta" : "Products"}
          </h3>
          <p className="text-gray-300">
            {content.productsDesc}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
