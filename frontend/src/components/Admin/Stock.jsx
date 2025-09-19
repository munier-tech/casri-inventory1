import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, PackageSearch } from "lucide-react";
import useProductsStore from "../../store/useProductsStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "";

const tabs = [
  { key: "soldout", label: "Alaabaha Dhamaaday", icon: XCircle, color: "text-rose-400" },
  { key: "low", label: "Alaabta sii Dhamaanaya", icon: AlertTriangle, color: "text-yellow-400" },
  { key: "fine", label: "Alaabta si buuxa u taala", icon: CheckCircle2, color: "text-emerald-400" },
];

const Stock = () => {
  const { products, fetchProducts, loading } = useProductsStore();
  const [activeTab, setActiveTab] = useState("soldout");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const classified = useMemo(() => {
    const soldout = [];
    const low = [];
    const fine = [];
    for (const p of products ?? []) {
      const threshold = Number(p.lowStockThreshold ?? 5);
      const stock = Number(p.stock ?? 0);
      if (stock <= 0) soldout.push(p);
      else if (stock <= threshold) low.push(p);
      else fine.push(p);
    }
    return { soldout, low, fine };
  }, [products]);

  const listForTab = activeTab === "soldout" ? classified.soldout : activeTab === "low" ? classified.low : classified.fine;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
        >
          <div className="px-6 py-5 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Qolka Kaydka Alaabta</h2>
            <p className="text-gray-400">alaabta dhamaatay iyo kuwa u dhow inay dhamaadaan</p>
          </div>

          <div className="px-6 pt-4">
            <div className="flex gap-2 flex-wrap">
              {tabs.map(({ key, label, icon: Icon, color }) => {
                const count = key === "soldout" ? classified.soldout.length : key === "low" ? classified.low.length : classified.fine.length;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      activeTab === key ? "bg-gray-700 border-gray-600" : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    <Icon className={color} size={18} />
                    <span className="text-white">{label}</span>
                    <span className="ml-2 text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded-full">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {loading ? (
              <div className="text-center text-gray-300">...</div>
            ) : listForTab.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <PackageSearch className="mb-3" />
                <span>Wax alaab ah majiraan qaybtan</span>
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="px-4 py-3 text-emerald-300 font-semibold">Sawir</th>
                    <th className="px-4 py-3 text-emerald-300 font-semibold">Magac</th>
                    <th className="px-4 py-3 text-emerald-300 font-semibold">Tirada kuu Taala</th>
                    <th className="px-4 py-3 text-emerald-300 font-semibold">Qaybta ay tirsantahy</th>
                </tr>
                </thead>
                <tbody>
                  {listForTab.map((product, index) => (
                    <motion.tr
                      key={product._id}
                      className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-800/50"}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <td className="px-4 py-3">
                        {product.image ? (
                          <img src={`${API_URL}${product.image}`} alt={product.name} className="h-12 w-12 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white">{product.name}</td>
                      <td className="px-4 py-3 text-gray-300">{product.stock}</td>
                      <td className="px-4 py-3 text-gray-300">{product.category?.name || "-"}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stock;