import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRegHeart,
  FaShieldHalved,
  FaUser,
} from "react-icons/fa6";
import { Sparkles } from "lucide-react";

import {
  loginCustomer,
  saveCustomerSession,
} from "../../services/CustomerAuthService";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from || "/salons";

  // ==============================
  // INPUT CHANGE
  // ==============================
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

  // ==============================
  // LOGIN
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCustomer({
        email: formData.email.trim(),
        password: formData.password,
      });

      // --------------------------------
      // CUSTOMER ONLY
      // --------------------------------
      if (response?.user?.role !== "CUSTOMER") {
        setError(
          "This account is not a customer account. Please use the correct login."
        );
        return;
      }

      saveCustomerSession(response);

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to login. Please check your credentials and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f6fa] text-slate-900">
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* =========================================================
            LEFT PREMIUM BRAND PANEL
        ========================================================= */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#32143f] lg:flex">
          {/* Background glow */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-fuchsia-400/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-48 -right-28 h-[560px] w-[560px] rounded-full bg-violet-400/20 blur-3xl" />

          <div className="pointer-events-none absolute left-[42%] top-[18%] h-40 w-40 rounded-full bg-pink-300/10 blur-3xl" />

          {/* Decorative circles */}
          <div className="pointer-events-none absolute right-20 top-24 h-32 w-32 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute right-28 top-32 h-16 w-16 rounded-full border border-white/5" />

          <div className="pointer-events-none absolute bottom-28 left-20 h-20 w-20 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute bottom-32 left-24 h-10 w-10 rounded-full bg-white/5" />

          {/* Main container */}
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between overflow-y-auto p-8 xl:p-12 2xl:p-16">
            {/* =====================================================
                LOGO
            ===================================================== */}
            <Link
              to="/"
              className="group inline-flex w-fit items-center gap-3 text-white no-underline"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-xl ring-1 ring-white/15 backdrop-blur-xl transition duration-300 group-hover:bg-white/15 group-hover:ring-white/25">
                <Sparkles className="text-[17px] text-[#f4c7dc]" />
              </div>

              <div>
                <div className="text-[25px] font-black tracking-[0.16em]">
                  LUMORA
                </div>

                <div className="text-[10px] font-medium tracking-[0.25em] text-white/50">
                  BEAUTY • TIME • YOU
                </div>
              </div>
            </Link>

            {/* =====================================================
                BRAND CONTENT
            ===================================================== */}
            <div className="my-12 max-w-2xl">
              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 shadow-lg backdrop-blur-xl">
                <Sparkles className="text-[#f4c7dc]" />
                Welcome back to your beauty space
              </div>

              {/* Heading */}
              <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-white xl:text-6xl 2xl:text-7xl">
                Beauty that
                <span className="block text-[#efb8d3]">
                  fits your time.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-7 text-white/60 xl:text-lg xl:leading-8">
                Discover trusted salons, choose your favourite professionals
                and book your next beauty experience — all from one elegant
                place.
              </p>

              {/* Stats */}
              <div className="mt-9 grid max-w-xl grid-cols-1 gap-3 min-[420px]:grid-cols-3">
                {[
                  ["500+", "Salons"],
                  ["10K+", "Bookings"],
                  ["4.9/5", "Experience"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.09]"
                  >
                    <div className="text-xl font-black text-white">
                      {value}
                    </div>

                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Small feature */}
              <div className="mt-7 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f4c7dc]">
                  <FaRegHeart className="text-sm" />
                </div>

                <span className="text-xs leading-5 text-white/55">
                  Your favourite beauty experiences, all in one place.
                </span>
              </div>
            </div>

            {/* =====================================================
                SECURITY FOOTER
            ===================================================== */}
            <div className="flex items-center gap-3 text-xs text-white/45">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <FaShieldHalved className="text-white/60" />
              </div>

              <span>
                Your account and personal information are protected.
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT LOGIN PANEL
        ========================================================= */}
        <section className="relative flex min-h-screen min-w-0 items-center justify-center overflow-hidden px-4 py-5 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-8 xl:px-12 2xl:px-16">
          {/* Mobile / form background decorations */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#ead8ed]/50 blur-3xl sm:h-96 sm:w-96" />

          <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[#f2dce8]/40 blur-3xl sm:h-96 sm:w-96" />

          <div className="relative z-10 w-full min-w-0 max-w-[580px]">
            {/* =====================================================
                PREMIUM FORM CARD
            ===================================================== */}
            <div className="rounded-[26px] border border-white/80 bg-white/80 p-4 shadow-[0_25px_80px_rgba(50,20,63,0.08)] backdrop-blur-xl sm:rounded-[30px] sm:p-6 md:p-7 lg:bg-white/70 lg:p-8 xl:p-9">
              {/* =================================================
                  MOBILE LOGO
              ================================================= */}
              <div className="mb-7 flex items-center justify-between gap-4 lg:hidden">
                <Link
                  to="/"
                  className="flex min-w-0 items-center gap-3 text-slate-900 no-underline"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#32143f] text-[#f4c7dc] shadow-lg shadow-[#32143f]/15">
                    <Sparkles />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xl font-black tracking-[0.14em]">
                      LUMORA
                    </div>

                    <div className="truncate text-[9px] font-bold tracking-[0.2em] text-slate-400">
                      BEAUTY • TIME • YOU
                    </div>
                  </div>
                </Link>

                <Link
                  to="/"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm transition duration-200 hover:border-[#32143f]/20 hover:bg-[#faf7fb] hover:text-[#32143f]"
                >
                  <FaArrowLeft />
                </Link>
              </div>

              {/* =================================================
                  DESKTOP BACK
              ================================================= */}
              <Link
                to="/"
                className="mb-8 hidden items-center gap-2 text-sm font-bold text-slate-500 no-underline transition hover:text-[#32143f] lg:inline-flex"
              >
                <FaArrowLeft className="text-xs" />
                Back to LUMORA
              </Link>

              {/* =================================================
                  HEADING
              ================================================= */}
              <div>
                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f6eaf5] to-[#eee1f1] text-[#32143f] shadow-sm ring-1 ring-[#32143f]/5">
                  <FaUser />
                </div>

                {/* Small badge */}
                <div className="mb-3 inline-flex items-center rounded-full border border-[#ead9eb] bg-[#faf5fa] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#32143f]">
                  Customer Login
                </div>

                <h2 className="text-[30px] font-black tracking-[-0.04em] text-slate-900 sm:text-4xl">
                  Welcome back
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Sign in to continue your beauty journey with LUMORA.
                </p>
              </div>

              {/* =================================================
                  ERROR
              ================================================= */}
              {error && (
                <div
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-50 to-white px-4 py-3.5 text-sm text-red-700 shadow-sm"
                  role="alert"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />

                  <span className="min-w-0 break-words leading-5">
                    {error}
                  </span>
                </div>
              )}

              {/* =================================================
                  FORM
              ================================================= */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* =================================================
                    EMAIL
                ================================================= */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-[12px] font-black uppercase tracking-[0.09em] text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    {/* Icon */}
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-400 transition duration-200 group-focus-within:text-[#32143f]">
                      <FaUser />
                    </div>

                    {/* Input */}
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-11 pr-4 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(15,23,42,0.03)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#32143f] focus:bg-white focus:ring-4 focus:ring-[#32143f]/10"
                    />
                  </div>
                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-[12px] font-black uppercase tracking-[0.09em] text-slate-700"
                    >
                      Password
                    </label>

                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Secure
                    </span>
                  </div>

                  <div className="group relative">
                    {/* Lock Icon */}
                    <div className="pointer-events-none absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-400 transition duration-200 group-focus-within:text-[#32143f]">
                      <FaLock />
                    </div>

                    {/* Password Input */}
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-slate-50/70 pl-11 pr-14 text-sm font-semibold text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(15,23,42,0.03)] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#32143f] focus:bg-white focus:ring-4 focus:ring-[#32143f]/10"
                    />

                    {/* Password Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition duration-200 hover:bg-[#f5edf5] hover:text-[#32143f] active:scale-95"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* =================================================
                    SECURITY INFO
                ================================================= */}
                <div className="relative overflow-hidden rounded-2xl border border-[#eadceb] bg-gradient-to-br from-[#fbf7fc] via-[#f8f1f8] to-white p-3.5 shadow-sm sm:p-4">
                  {/* Glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#e7c9e9]/30 blur-2xl" />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#32143f] shadow-sm ring-1 ring-[#32143f]/5">
                      <FaShieldHalved className="text-sm" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-700">
                        Secure authentication
                      </div>

                      <div className="mt-0.5 text-[11px] leading-5 text-slate-500">
                        Your login is protected with encrypted authentication.
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SUBMIT BUTTON
                ================================================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex min-h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#32143f] via-[#4a1c59] to-[#6a2b78] px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(50,20,63,0.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(50,20,63,0.30)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {/* Button shine */}
                  <span className="pointer-events-none absolute inset-y-0 -left-20 w-20 rotate-12 bg-white/10 blur-md transition duration-700 group-hover:left-[110%]" />

                  {loading ? (
                    <>
                      <span
                        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />

                      <span className="relative">
                        Signing you in...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative">
                        Continue to LUMORA
                      </span>

                      <FaArrowRight className="relative transition duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* =================================================
                  REGISTER DIVIDER
              ================================================= */}
              <div className="my-7 flex items-center gap-3 sm:gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-200" />

                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  New here?
                </span>

                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-200" />
              </div>

              {/* =================================================
                  REGISTER BUTTON
              ================================================= */}
              <Link
                to="/customer/register"
                state={{ from }}
                className="group flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-4 text-center text-sm font-black text-slate-700 no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#32143f]/25 hover:bg-[#fcf8fc] hover:text-[#32143f] hover:shadow-md"
              >
                <span className="truncate">
                  Create your LUMORA account
                </span>
              </Link>

              {/* =================================================
                  TRUST FEATURES
              ================================================= */}
              <div className="mt-7 grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-3">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50/80 px-2 py-2.5 text-[10px] font-bold text-slate-500">
                  <FaCheck className="shrink-0 text-[9px] text-emerald-500" />
                  <span className="truncate">Easy booking</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50/80 px-2 py-2.5 text-[10px] font-bold text-slate-500">
                  <FaCheck className="shrink-0 text-[9px] text-emerald-500" />
                  <span className="truncate">Trusted salons</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50/80 px-2 py-2.5 text-[10px] font-bold text-slate-500">
                  <FaCheck className="shrink-0 text-[9px] text-emerald-500" />
                  <span className="truncate">Secure account</span>
                </div>
              </div>

              {/* =================================================
                  TERMS
              ================================================= */}
              <p className="mt-7 text-center text-[10px] leading-5 text-slate-400">
                By continuing, you agree to LUMORA's terms and privacy policy.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerLogin;