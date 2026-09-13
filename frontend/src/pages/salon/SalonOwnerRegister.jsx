import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaStore,
  FaUser,
  FaUserTie,
} from "react-icons/fa";

import { registerSalonOwner } from "../../services/authService";

const SalonOwnerRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await registerSalonOwner({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      sessionStorage.setItem("token", data.token);

      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/salon-owner/dashboard");
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Manage your salon profile",
    "Create and manage services",
    "Manage staff and availability",
    "Handle customer appointments",
  ];

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
              LEFT HERO SECTION
          ====================================================== */}

          <div className="relative hidden min-h-[820px] overflow-hidden lg:flex">

            {/* Base background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#080b19] via-[#101326] to-[#171525]" />

            {/* Glow */}
            <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-rose-500/[0.13] blur-[90px]" />

            <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/[0.15] blur-[100px]" />

            <div className="absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-fuchsia-500/[0.05] blur-[80px]" />

            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />

            {/* Hero content */}
            <div className="relative z-10 flex w-full flex-col p-10 xl:p-12 2xl:p-14">

              {/* =================================================
                  BRAND
              ================================================== */}

              <div className="flex items-center gap-4">

                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-purple-600 text-white shadow-[0_12px_35px_rgba(236,72,153,0.3)]">

                  <FaStore className="text-xl" />

                  <div className="absolute -inset-1 -z-10 rounded-2xl bg-fuchsia-500/20 blur-lg" />

                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    Salonify
                  </h1>

                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Beauty Business Platform
                  </p>
                </div>

              </div>

              {/* =================================================
                  HERO CONTENT
              ================================================== */}

              <div className="mt-auto">

                {/* Portal badge */}
                <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2.5 shadow-inner shadow-white/[0.03] backdrop-blur-xl">

                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10">
                    <FaUserTie className="text-xs text-rose-400" />
                  </span>

                  <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-300">
                    Salon Owner Registration
                  </span>

                </div>
<h2 className="max-w-[650px] text-5xl font-black leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl 2xl:text-[4.25rem]">

                  Build your salon.

                  <span className="mt-1 block bg-gradient-to-r from-rose-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Grow digitally.
                  </span>

                </h2>

                <p className="mt-7 max-w-[590px] text-[15px] leading-7 text-slate-400 xl:text-base">
                  Create your salon owner account and take complete control
                  of your business, team, services and customer appointments
                  from one powerful platform.
                </p>

                {/* =================================================
                    FEATURE LIST
                ================================================== */}

                <div className="mt-10 space-y-3">

                  {features.map((item) => (
                    <div
                      key={item}
                      className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                    >

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 ring-1 ring-rose-400/10">
                        <FaCheckCircle className="text-xs text-rose-400" />
                      </div>

                      <span className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                        {item}
                      </span>

                    </div>
                  ))}

                </div>

                {/* =================================================
                    MINI INFO CARDS
                ================================================== */}

                <div className="mt-9 grid grid-cols-2 gap-4">

                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/20 hover:bg-white/[0.07]">

                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-rose-500/10 blur-2xl transition group-hover:bg-rose-500/20" />

                    <div className="relative">

                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                        <FaStore className="text-sm text-rose-400" />
                      </div>

                      <p className="text-xs font-bold text-white">
                        Complete Control
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Run your business from one place
                      </p>

                    </div>

                  </div>

                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/20 hover:bg-white/[0.07]">

                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl transition group-hover:bg-purple-500/20" />

                    <div className="relative">

                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
                        <FaUserTie className="text-sm text-rose-400" />
                      </div>

                      <p className="text-xs font-bold text-white">
                        Owner Access
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Secure business management
                      </p>

                    </div>

                  </div>

                </div>

                {/* Bottom line */}
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
              RIGHT REGISTRATION SECTION
          ====================================================== */}

          <div className="relative flex min-h-[760px] items-center justify-center overflow-hidden bg-white px-5 py-9 sm:px-8 sm:py-10 md:px-12 lg:min-h-[820px] lg:px-14 xl:px-20 2xl:px-24">

            {/* Background decoration */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-rose-50 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full bg-purple-50 blur-3xl" />

            <div className="relative z-10 w-full max-w-[480px]">

              {/* =================================================
                  MOBILE BRAND
              ================================================== */}

              <div className="mb-9 flex items-center justify-center lg:hidden">

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

              <div className="mb-7">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 text-rose-500 shadow-sm ring-1 ring-rose-100">
                  <FaUserTie className="text-xl" />
                </div>

                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">
                  Get Started
                </p>

                <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                  Create your account
                </h2>

                <p className="mt-2.5 max-w-md text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Join Salonify and start managing your salon digitally with
                  a smarter business experience.
                </p>

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
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* =================================================
                    FULL NAME
                ================================================== */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-rose-500">
                      <FaUser />
                    </div>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                  </div>

                </div>

                {/* =================================================
                    EMAIL
                ================================================== */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="group relative">

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="owner@example.com"
                      autoComplete="email"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                  </div>

                </div>

                {/* =================================================
                    PHONE
                ================================================== */}

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Phone Number
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-rose-500">
                      <FaPhone />
                    </div>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                  </div>

                </div>

                {/* =================================================
                    PASSWORD
                ================================================== */}

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
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-14 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                  <p className="mt-2 text-[11px] font-medium text-slate-400">
                    Use at least 8 characters for a stronger password.
                  </p>

                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================== */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2.5 block text-sm font-bold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="group relative">

                    <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 transition-colors group-focus-within:text-rose-500">
                      <FaLock />
                    </div>

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-14 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* =================================================
                    SUBMIT BUTTON
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-3 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500 hover:shadow-[0_18px_35px_rgba(244,63,94,0.25)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >

                  {/* Button shine */}
                  <span className="absolute inset-y-0 -left-20 w-16 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[110%]" />

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      <span>
                        Creating account...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative">
                        Create Salon Owner Account
                      </span>

                      <FaArrowRight className="relative transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  LOGIN LINK
              ================================================== */}

              <div className="mt-7 text-center text-sm text-slate-500">

                <span>
                  Already have an account?
                </span>

                <Link
                  to="/salon-owner/login"
                  className="ml-1.5 font-bold text-rose-500 transition-colors hover:text-rose-600"
                >
                  Sign in
                </Link>

              </div>

              {/* =================================================
                  SECURITY FOOTER
              ================================================== */}

              <div className="mt-7 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
                  <FaLock className="text-sm" />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-bold text-slate-700">
                    Your account is protected
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-xs">
                    Secure access for your salon business
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

export default SalonOwnerRegister;