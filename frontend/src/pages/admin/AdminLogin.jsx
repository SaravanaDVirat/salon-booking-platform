import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Scissors,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Users,
  Calendar,
} from "lucide-react";

import api from "../../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/admin/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      const { token, admin } = response.data;

      sessionStorage.setItem("adminToken", token);

      sessionStorage.setItem(
        "adminData",
        JSON.stringify(admin)
      );
      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Admin login error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
          "Unable to login. Please check your credentials."
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 font-[Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif]">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-30 blur-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-transparent animate-blob"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-25 blur-3xl bg-gradient-to-tr from-pink-500 via-purple-500 to-transparent animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/4 right-1/3 w-72 h-72 rounded-full opacity-20 blur-3xl bg-gradient-to-br from-cyan-400 to-purple-600 animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        <div className="hidden lg:flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden px-16 py-16">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(168,85,247,0.1),transparent_50%)]"></div>

          <div className="relative z-20 w-full flex flex-col justify-between">
            <div className="flex items-center gap-4 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-400/30 flex items-center justify-center shadow-2xl shadow-purple-600/30 hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
                <Scissors size={36} className="text-white" strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Salon<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ique</span>
                </h2>
                <p className="text-xs font-bold tracking-widest text-purple-300/70 mt-1 uppercase">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <span className="inline-block text-xs font-black tracking-widest text-purple-400/70 mb-6 uppercase px-3 py-1.5 bg-purple-500/10 border border-purple-400/30 rounded-full">
                  Secure Administration
                </span>

                <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-tight text-white mb-10">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Manage</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">your empire.</span>
                </h1>

                <p className="text-lg leading-relaxed text-white/70 max-w-lg font-light">
                  Control every aspect of your salon platform. Manage salons, staff, customers, bookings, and services from one powerful dashboard.
                </p>
              </div>
              <div className="space-y-6 pt-8">

                <div className="flex items-start gap-4 group/feature cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/40 flex items-center justify-center flex-shrink-0 group-hover/feature:from-purple-500/40 group-hover/feature:to-pink-500/40 transition-all duration-500 group-hover/feature:scale-110">
                    <ShieldCheck size={24} className="text-purple-300" strokeWidth={2} />
                  </div>

                  <div>
                    <strong className="block text-sm font-bold text-white mb-1">
                      Secure Administration
                    </strong>
                    <span className="text-xs text-white/60">
                      Enterprise-grade security & encryption
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/feature cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 group-hover/feature:from-cyan-500/40 group-hover/feature:to-blue-500/40 transition-all duration-500 group-hover/feature:scale-110">
                    <Users size={24} className="text-cyan-300" strokeWidth={2} />
                  </div>

                  <div>
                    <strong className="block text-sm font-bold text-white mb-1">
                      Full Platform Control
                    </strong>
                    <span className="text-xs text-white/60">
                      Manage salons, staff, and services
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 group/feature cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/40 flex items-center justify-center flex-shrink-0 group-hover/feature:from-pink-500/40 group-hover/feature:to-rose-500/40 transition-all duration-500 group-hover/feature:scale-110">
                    <Calendar size={24} className="text-pink-300" strokeWidth={2} />
                  </div>

                  <div>
                    <strong className="block text-sm font-bold text-white mb-1">
                      Real-time Insights
                    </strong>
                    <span className="text-xs text-white/60">
                      Monitor bookings and performance metrics
                    </span>
                  </div>
                </div>

              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-white/40 font-medium tracking-wide">
              <span>© 2026 Salonique</span>
              <span className="flex items-center gap-1">
                <Zap size={12} className="text-purple-400" />
                Powered by Salonique
              </span>
            </div>

          </div>
        </div>
        <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 lg:py-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.15),transparent_50%)]"></div>

          <div className="w-full max-w-md relative z-20">
            <div className="lg:hidden mb-8 flex items-center justify-between gap-3 rounded-[28px] bg-gradient-to-r from-violet-900 via-purple-800 to-fuchsia-700 px-4 py-4 shadow-2xl shadow-purple-500/20 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center shadow-lg shadow-purple-950/30 backdrop-blur-sm">
                  <Scissors size={30} className="text-white" strokeWidth={2} />
                </div>

                <div>
                  <h2 className="text-[1.8rem] font-black tracking-[-0.06em] text-white leading-none">
                    Salon<span className="text-purple-200">ique</span>
                  </h2>
                  <p className="text-[0.62rem] font-bold tracking-[0.22em] text-purple-100/90 mt-1 uppercase">
                    Admin
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-3xl border border-white/60 rounded-3xl shadow-2xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-purple-600/20 transition-all duration-500 p-10 sm:p-12">
              <div className="mb-10 relative">

                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex items-center justify-center mb-5 shadow-lg shadow-purple-200/50 ring-1 ring-purple-100/60">
                  <LockKeyhole size={32} className="text-purple-600" strokeWidth={1.5} />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/80 rounded-full shadow-sm">
                  <ShieldCheck size={15} className="text-purple-600" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Secure Admin Access</span>
                </div>

                <h1 className="text-[clamp(2.5rem,5vw,3.2rem)] font-black text-slate-900 tracking-[-0.06em] mb-3 leading-[0.95]">
                  Welcome<br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">back</span>
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Sign in to your admin dashboard and manage your salon platform.
                </p>

              </div>
              {error && (
                <div className="flex items-start gap-4 p-4 mb-8 bg-gradient-to-r from-red-50 via-red-50/70 to-orange-50 border border-red-200/80 rounded-2xl shadow-lg shadow-red-100/30 animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={22} className="text-red-600 flex-shrink-0 mt-0.5 font-bold" strokeWidth={2.5} />

                  <span className="text-sm font-semibold text-red-700 leading-relaxed">
                    {error}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">

                  <label htmlFor="email" className="block text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Email Address
                  </label>

                  <div className="relative group">

                    <Mail size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-all duration-300 pointer-events-none group-focus-within:scale-110" />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@salon.com"
                      autoComplete="email"
                      disabled={loading}
                      className="w-full h-16 pl-16 pr-6 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 hover:border-slate-300 hover:from-slate-100 hover:to-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                    />

                  </div>

                </div>
                <div className="space-y-3">

                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Password
                    </label>

                    <span className="text-xs font-bold text-purple-600 tracking-widest uppercase">
                      Secure
                    </span>
                  </div>

                  <div className="relative group">

                    <LockKeyhole size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-all duration-300 pointer-events-none group-focus-within:scale-110" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your admin password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full h-16 pl-16 pr-16 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 font-medium focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 hover:border-slate-300 hover:from-slate-100 hover:to-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 p-2 hover:scale-110"
                    >
                      {showPassword ? (
                        <EyeOff size={22} strokeWidth={2} />
                      ) : (
                        <Eye size={22} strokeWidth={2} />
                      )}
                    </button>

                  </div>

                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 mt-10 bg-gradient-to-r from-purple-600 via-purple-600 to-purple-700 hover:from-purple-700 hover:via-purple-700 hover:to-purple-800 text-white font-black rounded-2xl shadow-xl shadow-purple-600/30 hover:shadow-2xl hover:shadow-purple-600/40 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 text-lg uppercase tracking-wider ring-2 ring-purple-600/20 hover:ring-purple-600/40"
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={24}
                        className="animate-spin"
                      />

                      <span className="font-black tracking-wider">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-black tracking-wider">Sign in</span>

                      <ArrowRight size={24} strokeWidth={3} />
                    </>
                  )}

                </button>

              </form>
              <div className="mt-10 flex items-center justify-center gap-3 text-xs text-slate-500 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50">

                <ShieldCheck size={18} className="text-purple-600 flex-shrink-0 font-bold" strokeWidth={2.5} />

                <span className="text-center leading-relaxed font-medium">
                  Your login is protected by
                  <br />
                  <span className="text-purple-700 font-bold">enterprise-grade encryption</span>
                </span>

              </div>

            </div>
            <div className="lg:hidden text-center text-xs text-slate-500 mt-8 font-bold tracking-wide">
              © 2026 <span className="text-purple-600">Salonique</span> Admin Portal
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

    </div>
  );
}

export default AdminLogin;