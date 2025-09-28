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
  FileScanIcon,
  ChevronRight,
  Globe,
  BarChart3,
  Package,
  CreditCard,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useProductsStore from "../store/useProductsStore";
import { useEffect } from "react";
import useSalesStore from "../store/UseSalesStore";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedTabs, setExpandedTabs] = useState({});
  const [language, setLanguage] = useState("so");


  const toggleTabExpansion = (tabId) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [tabId]: !prev[tabId],
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
        Purchases: "Daynta Meheradaha",
        reports: "Warbixinno",
        Sale: "Ku Dar Iib Cusub",
        categories: "Qeybta Alaabta",
        sales: "Iibka",
        users: "Isticmaalayaasha",
        financial: "Maaliyadda",
      },
      subtabs: {
        createProduct: "Abuur Alaab",
        GetReports: "Hel Warbixinno Bile",
        stock: "Hel Kaydka",
        GetYearlyReports: "Hel Warbixinno Sannadeed",
        createCategory: "Abuur Qayb Cusub",
        loan: "Abuur Amaah",
        Sale: "Ku Dar Iib Cusub",
        CreatePurchases: "Hel Daynta Meheradaha",
        productList: "Liiska Alaabta",
        dailySales: "Iibka Maanta",
        salesByDate: "Iibka Taariikhda",
        userDailySales: "Iibka Isticmaalaha Maanta",
        userSalesByDate: "Iibka Isticmaalaha Taariikhda",
        financialLog: "Diiwaanka Maaliyadda",
        financialHistory: "Taariikhda Maaliyadda",
      },
      welcome: "Ku Soo dhawoow Dashboard-ka",
      welcomeDesc:
        "Halkan waxaad ka heli kartaa macluumaadka guud ee ganacsigaaga iyo xogta dhaqaale.",
      generalReport: "Warbixinta Guud",
      finance: "Dhaqaale",
      financeDesc: "Halkan waxaad arki kartaa dhaqaalahaga guud",
      productsDesc: "Maareynta alaabta iyo bakhaarka",
      stats: "Tirakoobka",
      quickActions: "Ficilada Degdegga ah",
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
        financial: "Financial",
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
        Sale : "Add New Sale",
        userDailySales: "User Daily Sales",
        userSalesByDate: "User Sales by Date",
        financialLog: "Financial Log",
        financialHistory: "Financial History",
      },
      welcome: "Welcome to your Dashboard",
      welcomeDesc:
        "Here you can find an overview of your business and financial data.",
      generalReport: "General Report",
      finance: "Finance",
      financeDesc: "View your overall financial status here",
      productsDesc: "Manage your products and inventory",
      stats: "Statistics",
      quickActions: "Quick Actions",
    },
  };

  const tabs = [
    {
      id: "dashboard",
      label: content[language].tabs.dashboard,
      icon: Home,
      color: "text-blue-600",
    },
    {
      id: "products",
      label: content[language].tabs.products,
      icon: Package,
      color: "text-green-600",
      subtabs: [
        {
          id: "create",
          label: content[language].subtabs.createProduct,
          icon: PlusCircle,
          path: "/createProduct",
        },
        {
          id: "list",
          label: content[language].subtabs.productList,
          icon: ShoppingBasket,
          path: "/products",
        },
      ],
    },
    {
      id: "stock",
      label: content[language].tabs.stock,
      icon: Boxes,
      color: "text-orange-600",
      subtabs: [
        {
          id: "get",
          label: content[language].subtabs.stock,
          icon: Boxes,
          path: "/stock",
        },
      ],
    },
    {
      id: "categories",
      label: content[language].tabs.categories,
      icon: ShoppingBasket,
      color: "text-purple-600",
      subtabs: [
        {
          id: "create",
          label: content[language].subtabs.createCategory,
          icon: PlusCircle,
          path: "/categories",
        },
      ],
    },
    {
      id: "purchase",
      label: content[language].tabs.Purchases,
      icon: ShoppingBasket,
      color: "text-purple-600",
      subtabs: [
        {
          id: "create",
          label: content[language].subtabs.createCategory,
          icon: PlusCircle,
          path: "/purchases",
        },
      ],
    },
    {
      id: "sales",
      label: content[language].tabs.sales,
      icon: ShoppingCart,
      color: "text-red-600",
      subtabs: [
        {
          id: "Sale",
          label: content[language].subtabs.Sale,
          icon: Calendar,
          path: "/AddSale",
        },
        {
          id: "daily",
          label: content[language].subtabs.dailySales,
          icon: Calendar,
          path: "/DailySales",
        },
        {
          id: "history",
          label: content[language].subtabs.salesByDate,
          icon: FileText,
          path: "/HistorySalesDate",
        },
      ],
    },
    {
      id: "financial",
      label: content[language].tabs.financial,
      icon: CreditCard,
      color: "text-emerald-600",
      subtabs: [
        {
          id: "financialLog",
          label: content[language].subtabs.financialLog,
          icon: FileScanIcon,
          path: "/FinancialLogForm",
        },
        {
          id: "financialHistory",
          label: content[language].subtabs.financialHistory,
          icon: FileScanIcon,
          path: "/FinancialLogDate",
        },
      ],
    },
    {
      id: "reports",
      label: content[language].tabs.reports,
      icon: BarChart3,
      color: "text-indigo-600",
      subtabs: [
        {
          id: "get",
          label: content[language].subtabs.GetReports,
          icon: PlusCircle,
          path: "/reports",
        },
        {
          id: "get",
          label: content[language].subtabs.GetYearlyReports,
          icon: PlusCircle,
          path: "/yearlyreports",
        },
      ],
    },
    {
      id: "users",
      label: content[language].tabs.users,
      icon: Users,
      color: "text-pink-600",
      subtabs: [
        {
          id: "userDaily",
          label: content[language].subtabs.userDailySales,
          icon: Receipt,
          path: "/UserDailySales",
        },
        {
          id: "userHistory",
          label: content[language].subtabs.userSalesByDate,
          icon: FileText,
          path: "/UserProductsByDate",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {content[language].dashboard}
          </motion.h1>

          {/* Language Selector */}
          <motion.div
            className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe size={18} className="text-blue-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-gray-700 focus:outline-none font-medium"
            >
              <option value="so">Somali</option>
              <option value="en">English</option>
            </select>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-80 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <nav className="flex flex-col gap-3">
              {tabs.map((tab) => (
                <div key={tab.id} className="relative">
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.subtabs) toggleTabExpansion(tab.id);
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 shadow-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={22} className={tab.color} />
                      <span className="font-semibold">{tab.label}</span>
                    </div>
                    {tab.subtabs && (
                      <motion.div
                        animate={{ rotate: expandedTabs[tab.id] ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={18} className="text-gray-400" />
                      </motion.div>
                    )}
                  </button>

                  {/* Subtabs */}
                  <AnimatePresence>
                    {tab.subtabs && expandedTabs[tab.id] && (
                      <motion.div
                        className="ml-4 mt-2 flex flex-col gap-2 border-l-2 border-gray-100 pl-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {tab.subtabs.map((subtab) => (
                          <Link
                            key={subtab.id}
                            to={subtab.path}
                            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                          >
                            <subtab.icon size={18} className="text-gray-400" />
                            <span className="text-sm font-medium">
                              {subtab.label}
                            </span>
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
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100 mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {content[language].welcome}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {content[language].welcomeDesc}
                  </p>
                </div>

                {/* Dashboard Content */}
                <DashboardContent language={language} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ language }) => {
  const navigate = useNavigate();

  const { products , fetchProducts } = useProductsStore();
  const { sales , fetchSales } = useSalesStore();

  useEffect(() => {
    fetchProducts();
  } , [fetchProducts])
  
  useEffect(() => {
    fetchSales();
  } , [fetchSales])

  const stats = [
    {
      label: language === "so" ? "Wadarta Alaabta" : "Total Products",
      value: products?.length || 0,
      change: "+12%",
      icon: Package,
      color: "text-green-600",
      path: "/products",
    },
    {
      label: language === "so" ? "Iibka Maanta" : "Today's Sales",
      value: sales?.length || 0,
      change: "+8%",
      icon: ShoppingCart,
      color: "text-blue-600",
      path: "/DailySales",
    },
    {
      label: language === "so" ? "Bakhaarka" : "Inventory",
      value: products?.length || 0,
      change: "-2%",
      icon: Boxes,
      color: "text-orange-600",
      path: "/stock",
    },
    {
      label: language === "so" ? "Isticmaalayaasha" : "Active Users",
      value: "-",
      change: "+5%",
      icon: Users,
      color: "text-purple-600",
      path: "/UserDailySales",
    },
  ];

  const quickActions = [
    {
      label: language === "so" ? "Abuur Alaab" : "Add Product",
      icon: PlusCircle,
      color: "bg-green-500",
      path: "/createProduct",
    },
    {
      label: language === "so" ? "Diiwaan Iib" : "Record Sale",
      icon: ShoppingCart,
      color: "bg-blue-500",
      path: "/DailySales",
    },
    {
      label: language === "so" ? "Arag Warbixin" : "View Report",
      icon: BarChart3,
      color: "bg-purple-500",
      path: "/reports",
    },
    {
      label: language === "so" ? "Maaree Bakhaar" : "Manage Stock",
      icon: Boxes,
      color: "bg-orange-500",
      path: "/stock",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {language === "so" ? "Tirakoobka" : "Statistics"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              whileHover={{ y: -5 }}
              onClick={() => navigate(stat.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={24} className={stat.color} />
                <span
                  className={`text-sm font-semibold ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h4>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {language === "so" ? "Ficilada Degdegga ah" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 text-left group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <action.icon size={24} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
