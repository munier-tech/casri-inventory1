import React, { useState } from "react";
import useSalesStore from "../../store/UseSalesStore";

const GetAllUsersSalesByDate = () => {
  const { allUsersSalesByDate, fetchAllUsersSalesByDate, loading, error } = useSalesStore();
  const [date, setDate] = useState("");
  const [somaliLanguage] = useState(true); // Default to Somali language

  // Somali translations
  const translations = {
    title: "Iibka Isticmaalayaasha Maalinta",
    selectDate: "Xulo Taariikh",
    fetchButton: "Soo Qaad",
    loading: "Soo dejinaya...",
    total: "Wadarta",
    noSales: "Wax iib ah ma jiraan taariikhdan",
    user: "Isticmaale",
    role: "Doorka",
    product: "Alaabta",
    quantity: "Tiro",
    price: "Qiimo",
    amount: "Qadarta",
    salesByDate: "Iibka Maalinta",
    salesReport: "Warbixinta Iibka",
    noData: "Xog malahan oo la heli karo",
    error: ""
  };

  const handleFetch = () => {
    if (date) {
      fetchAllUsersSalesByDate(date);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-emerald-300 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-emerald-400">{translations.salesReport}</h1>
          <p className="text-gray-400">{translations.salesByDate}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 text-emerald-400 border-b border-gray-700 pb-2">
            {translations.title}
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {translations.selectDate}
              </label>
              <input
                type="date"
                className="w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleFetch}
              disabled={!date}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mt-5 md:mt-0"
            >
              {translations.fetchButton}
            </button>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-lg">{translations.loading}</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
              <p className="font-medium">{translations.error}: {error}</p>
            </div>
          )}

          {allUsersSalesByDate?.data && allUsersSalesByDate.data.length > 0 ? (
            <div className="space-y-6">
              {allUsersSalesByDate.data.map((user, index) => (
                <div key={index} className="bg-gray-750 border border-gray-700 p-5 rounded-xl shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <h3 className="font-semibold text-lg text-emerald-400">
                      {user.username} <span className="text-gray-400 text-sm">({user.role})</span>
                    </h3>
                    <p className="text-lg font-bold mt-2 md:mt-0">
                      {translations.total}: <span className="text-emerald-300">{formatCurrency(user.total)}</span>
                    </p>
                  </div>
                  
                  {user.sales && user.sales.length > 0 ? (
                    <ul className="space-y-3">
                      {user.sales.map((sale) => (
                        <li key={sale._id} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium">{sale.product?.name}</p>
                            <p className="text-sm text-gray-400">{sale.quantity} x {formatCurrency(sale.sellingCost)}</p>
                          </div>
                          <div className="text-emerald-400 font-semibold">
                            {formatCurrency(sale.totalAmount)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 py-4 text-center">{translations.noSales}</p>
                  )}
                </div>
              ))}
            </div>
          ) : allUsersSalesByDate?.data && allUsersSalesByDate.data.length === 0 ? (
            <div className="bg-gray-750 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-xl text-gray-300">{translations.noData}</p>
            </div>
          ) : null}
        </div>

        <div className="text-center text-gray-500 text-sm mt-8">
          <p>© {new Date().getFullYear()} - Warbixinta Iibka</p>
        </div>
      </div>
    </div>
  );
};

export default GetAllUsersSalesByDate;