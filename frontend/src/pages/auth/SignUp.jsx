import { Loader, Lock, LogIn, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { isLoading, signUp } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    signUp({
      ...formData,
      createdAt: new Date()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 rounded-2xl shadow-2xl overflow-hidden border border-emerald-500/30">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-emerald-800/90 to-teal-700/90 p-6 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-emerald-400/10"></div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-teal-300/10"></div>
            
            <motion.h2
              className="text-3xl font-bold text-white relative z-10"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Create Account
            </motion.h2>
            <p className="mt-2 text-emerald-100 relative z-10">
              Join us to get started today
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-emerald-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 bg-emerald-900/40 border border-emerald-600/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-emerald-300/60 text-white"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-300" />
                  </div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 bg-emerald-900/40 border border-emerald-600/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-emerald-300/60 text-white"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-300" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 bg-emerald-900/40 border border-emerald-600/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-emerald-300/60 text-white"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-300" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 bg-emerald-900/40 border border-emerald-600/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 placeholder-emerald-300/60 text-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              Register
            </button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-emerald-100">
              Already have an account?{" "}
              <Link
                to="/signIn"
                className="font-medium text-white hover:text-emerald-200 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;