import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaShieldAlt,
  FaStore,
  FaUserTie,
} from "react-icons/fa";

import { loginUser } from "../../services/authService";

const SalonOwnerLogin = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(form);

      if (data.user?.role !== "SALON_OWNER") {
        setError("This login is only available for salon owners.");
        return;
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      navigate("/salon-owner/dashboard");
    } catch (error) {
      setError(
        error?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a16] px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">

      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />

        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/[0.04] blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.035),transparent_35%)]" />
      </div>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1440px] items-center sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)]">

        <div className="grid w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_35px_100px_rgba(0,0,0,0.45)] sm:rounded-[2rem] lg:grid-cols-[0.95fr_1.05fr] lg:rounded-[2.5rem]">

          {/* =====================================================
              LEFT BRAND / HERO SECTION
          ====================================================== */}

          <div className="relative hidden min-h-[760px] overflow-hidden lg:flex">

            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#080b19] via-[#101326] to-[#171525]" />

            {/* Glow layers */}
            <div className="absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-rose-500/[0.12] blur-[90px]" />

            <div className="absolute -bottom-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/[0.14] blur-[100px]" />

            <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-fuchsia-500/[0.05] blur-[80px]" />

            {/* Subtle grid */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex w-full flex-col p-10 xl:p-12 2xl:p-14">

              {/* Brand */}
              <div className="flex items-center gap-4">

                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-600 shadow-[0_12px_35px_rgba(236,72,153,0.3)]">
                  <FaStore className="text-xl text-white" />

                  <div className="absolute -inset-1 -z-10 rounded-2xl bg-fuchsia-500/20 blur-lg" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    Salonify
                  </h1>
                </div>

              </div>

              {/* Hero */}
              <div className="mt-auto">

                <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2.5 shadow-inner shadow-white/[0.03] backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10">
                    <FaUserTie className="text-xs text-rose-400" />
                  </span>

                  <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-300">
                    Salon Owner Portal
                  </span>
                </div>

                <h2 className="max-w-[650px] text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl 2xl:text-[4.25rem]">
                  Run your salon.
                  <span className="mt-1 block bg-gradient-to-r from-rose-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Grow your business.
                  </span>
                </h2>

                <p className="mt-7 max-w-[590px] text-[15px] leading-7 text-slate-400 xl:text-base">
                  Manage appointments, services, staff, customers and your
                  entire salon business from one powerful and secure platform.
                </p>

                {/* Feature Cards */}
                <div className="mt-10 grid grid-cols-2 gap-4">

                  {/* Salon Management */}
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/25 hover:bg-white/[0.07]">

                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-rose-500/10 blur-2xl transition-all duration-500 group-hover:bg-rose-500/20" />

                    <div className="relative">

                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-400/10">
                        <FaStore className="text-lg text-rose-400" />
                      </div>

                      <p className="text-sm font-bold text-white xl:text-base">
                        Salon Management
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-slate-500 xl:text-sm">
                        Everything in one place
                      </p>

                    </div>
                  </div>

                  {/* Secure Access */}
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/25 hover:bg-white/[0.07]">

                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all duration-500 group-hover:bg-purple-500/20" />

                    <div className="relative">

                      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-400/10">
                        <FaShieldAlt className="text-lg text-rose-400" />
                      </div>

                      <p className="text-sm font-bold text-white xl:text-base">
                        Secure Access
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-slate-500 xl:text-sm">
                        Protected business data
                      </p>

                    </div>
                  </div>

                </div>

                {/* Bottom Trust */}
                <div className="mt-7 flex items-center gap-3 text-xs text-slate-500">

                  <span className="h-px flex-1 bg-white/10" />

                  <span className="whitespace-nowrap">
                    Built for modern beauty businesses
                  </span>

                  <span className="h-px flex-1 bg-white/10" />

                </div>

              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT LOGIN SECTION
          ====================================================== */}

          <div className="relative flex min-h-[700px] items-center justify-center overflow-hidden bg-white px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:min-h-[760px] lg:px-14 xl:px-20 2xl:px-24">

            {/* Soft background decoration */}
            <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-rose-50 blur-3xl" />

            <div className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-80 w-80 rounded-full bg-purple-50 blur-3xl" />

            <div className="relative z-10 w-full max-w-[480px]">

              {/* =================================================
                  MOBILE BRAND
              ================================================== */}

              <div className="mb-10 flex items-center justify-center lg:hidden">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-600 text-white shadow-lg shadow-rose-500/20">
                    <FaStore className="text-lg" />
                  </div>

                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                      Salonify
                    </h1>

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Salon Owner Portal
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  HEADER
              ================================================== */}

              <div className="mb-8">

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 text-rose-500 shadow-sm ring-1 ring-rose-100">
                  <FaUserTie className="text-xl" />
                </div>

                <div className="flex items-end justify-between gap-4">

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">
                      Owner Access
                    </p>

                    <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                      Welcome back
                    </h2>

                    <p className="mt-2.5 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                      Sign in to manage your salon business and keep everything
                      running smoothly.
                    </p>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-600 shadow-sm">

                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-black">
                    !
                  </div>

                  <p className="leading-5">
                    {error}
                  </p>

                </div>
              )}

              {/* =================================================
                  LOGIN FORM
              ================================================== */}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-rose-500">
                      <FaUserTie />
                    </div>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="owner@example.com"
                      autoComplete="email"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label
                    htmlFor="password"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-rose-500">
                      <FaLock />
                    </div>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>

                  </div>

                </div>

                {/* Remember / Forgot */}
                <div className="flex flex-col gap-3 pt-1 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">

                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-500">

                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-rose-500 focus:ring-rose-500"
                    />

                    <span>
                      Remember me
                    </span>

                  </label>


                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500 hover:shadow-[0_18px_35px_rgba(244,63,94,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {/* Button shine */}
                  <span className="absolute inset-y-0 -left-20 w-16 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[110%]" />

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      <span>
                        Signing in...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative">
                        Sign In
                      </span>

                      <FaArrowRight className="relative transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  REGISTER
              ================================================== */}

              <div className="mt-7 text-center text-sm text-slate-500">

                <span>
                  Don't have a salon owner account?
                </span>

                <Link
                  to="/salon-owner/register"
                  className="ml-1.5 font-bold text-rose-500 transition-colors hover:text-rose-600"
                >
                  Register now
                </Link>

              </div>

              {/* =================================================
                  SECURITY INFO
              ================================================== */}

              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
                  <FaShieldAlt className="text-sm" />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-bold text-slate-700">
                    Secure salon management platform
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
                    Your business access is protected
                  </p>

                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SalonOwnerLogin;