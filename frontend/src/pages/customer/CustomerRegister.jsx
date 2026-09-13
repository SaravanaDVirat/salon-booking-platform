import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaShieldHalved,
  FaUser,
} from "react-icons/fa6";

import {
  registerCustomer,
  saveCustomerSession,
} from "../../services/CustomerAuthService";

import { Sparkles } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =================================
  // PASSWORD STRENGTH
  // =================================
  const passwordStrength = useMemo(() => {
    const password = formData.password;

    if (!password) {
      return {
        score: 0,
        label: "Enter a password",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        score,
        label: "Weak password",
      };
    }

    if (score === 2) {
      return {
        score,
        label: "Fair password",
      };
    }

    if (score === 3) {
      return {
        score,
        label: "Good password",
      };
    }

    return {
      score,
      label: "Strong password",
    };
  }, [formData.password]);

  // =================================
  // INPUT CHANGE
  // =================================
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

  // =================================
  // VALIDATION
  // =================================
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  // =================================
  // REGISTER
  // =================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await registerCustomer({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ""),
        password: formData.password,
      });

      // Backend registration always creates CUSTOMER.
      if (response?.user?.role !== "CUSTOMER") {
        setError("Customer account could not be created.");
        return;
      }

      saveCustomerSession(response);

      navigate("/salons", {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#faf8fb] text-slate-900">
      <div className="min-h-screen w-full lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">

        {/* =====================================================
            FORM SIDE
        ===================================================== */}
        <section className="relative order-2 flex min-h-screen w-full items-center justify-center overflow-hidden px-3 py-5 sm:px-5 sm:py-8 md:px-8 md:py-10 lg:order-1 lg:px-8 lg:py-12 xl:px-12 2xl:px-16">

          {/* Soft background decoration */}
          <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-fuchsia-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-100/60 blur-3xl" />

          <div className="relative z-10 w-full max-w-[590px] min-w-0">

            {/* =================================================
                MOBILE TOP HEADER
            ================================================= */}
            <div className="mb-7 flex min-w-0 items-center justify-between gap-3 lg:hidden">

              <Link
                to="/"
                className="flex min-w-0 items-center gap-2.5 text-slate-900 no-underline sm:gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#32143f] text-[#f4c7dc] shadow-[0_8px_22px_rgba(50,20,63,0.18)] sm:h-11 sm:w-11 sm:rounded-2xl">
                  <Sparkles className="h-5 w-5 sm:h-5 sm:w-5" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg font-black tracking-[0.13em] sm:text-xl">
                    LUMORA
                  </div>

                  <div className="truncate text-[8px] font-bold tracking-[0.18em] text-slate-400 sm:text-[9px] sm:tracking-[0.2em]">
                    BEAUTY • TIME • YOU
                  </div>
                </div>
              </Link>

              <Link
                to="/"
                aria-label="Back to home"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition duration-200 hover:border-[#32143f]/20 hover:bg-[#32143f] hover:text-white sm:h-11 sm:w-11 sm:rounded-2xl"
              >
                <FaArrowLeft className="text-sm" />
              </Link>
            </div>

            {/* =================================================
                DESKTOP BACK LINK
            ================================================= */}
            <Link
              to="/customer/login"
              className="mb-8 hidden items-center gap-2 text-sm font-bold text-slate-400 no-underline transition duration-200 hover:text-[#32143f] lg:inline-flex"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition group-hover:bg-[#32143f]">
                <FaArrowLeft className="text-[10px]" />
              </span>

              <span>Already have an account?</span>
            </Link>

            {/* =================================================
                FORM INTRO
            ================================================= */}
            <div className="min-w-0">

              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f7edf7] to-[#eee2f2] text-[#32143f] shadow-[0_10px_25px_rgba(50,20,63,0.08)] ring-1 ring-white sm:h-14 sm:w-14">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="break-words text-[28px] font-black leading-[1.12] tracking-[-0.04em] text-slate-950 sm:text-4xl sm:leading-[1.08] md:text-[42px] lg:text-[44px]">
                  Create your account
                </h1>

                <p className="mt-3 max-w-xl break-words text-sm leading-6 text-slate-500 sm:text-[15px] sm:leading-7">
                  Join LUMORA and make your next beauty appointment effortless.
                </p>
              </div>
            </div>

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}
            {error && (
              <div
                className="mt-6 flex min-w-0 items-start gap-3 rounded-2xl border border-red-200/80 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3.5 shadow-[0_8px_24px_rgba(239,68,68,0.06)]"
                role="alert"
              >
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.10)]" />

                <span className="min-w-0 break-words text-sm font-medium leading-5 text-red-700">
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4 sm:mt-8 sm:space-y-5"
            >

              {/* =================================================
                  NAME
              ================================================= */}
              <div className="min-w-0">
                <label
                  htmlFor="name"
                  className="mb-2 block text-[13px] font-black tracking-wide text-slate-700 sm:text-sm"
                >
                  Full name
                </label>

                <div className="group relative min-w-0">

                  <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-200 group-focus-within:bg-[#f6edf7] group-focus-within:text-[#32143f] sm:left-4">
                    <FaUser className="text-xs" />
                  </div>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-white pl-[62px] pr-4 text-sm font-semibold text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus:border-[#32143f]/60 focus:bg-white focus:shadow-[0_12px_32px_rgba(50,20,63,0.10)] focus:ring-4 focus:ring-[#32143f]/10 sm:min-h-[58px] sm:text-[15px]"
                  />
                </div>
              </div>

              {/* =================================================
                  EMAIL + PHONE
              ================================================= */}
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">

                {/* EMAIL */}
                <div className="min-w-0">
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[13px] font-black tracking-wide text-slate-700 sm:text-sm"
                  >
                    Email
                  </label>

                  <div className="group relative min-w-0">

                    <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-200 group-focus-within:bg-[#f6edf7] group-focus-within:text-[#32143f] sm:left-4">
                      <FaUser className="text-xs" />
                    </div>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-white pl-[62px] pr-3 text-sm font-semibold text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus:border-[#32143f]/60 focus:shadow-[0_12px_32px_rgba(50,20,63,0.10)] focus:ring-4 focus:ring-[#32143f]/10 sm:min-h-[58px] sm:text-[14px]"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="min-w-0">
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-[13px] font-black tracking-wide text-slate-700 sm:text-sm"
                  >
                    Phone
                  </label>

                  <div className="group relative min-w-0">

                    <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-200 group-focus-within:bg-[#f6edf7] group-focus-within:text-[#32143f] sm:left-4">
                      <FaPhone className="text-xs" />
                    </div>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        setFormData((prev) => ({
                          ...prev,
                          phone: value,
                        }));

                        setError("");
                      }}
                      placeholder="10-digit number"
                      className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-white pl-[62px] pr-3 text-sm font-semibold tracking-wide text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus:border-[#32143f]/60 focus:shadow-[0_12px_32px_rgba(50,20,63,0.10)] focus:ring-4 focus:ring-[#32143f]/10 sm:min-h-[58px] sm:text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  PASSWORD
              ================================================= */}
              <div className="min-w-0">
                <label
                  htmlFor="password"
                  className="mb-2 block text-[13px] font-black tracking-wide text-slate-700 sm:text-sm"
                >
                  Password
                </label>

                <div className="group relative min-w-0">

                  <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-200 group-focus-within:bg-[#f6edf7] group-focus-within:text-[#32143f] sm:left-4">
                    <FaLock className="text-xs" />
                  </div>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-white pl-[62px] pr-[58px] text-sm font-semibold text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus:border-[#32143f]/60 focus:shadow-[0_12px_32px_rgba(50,20,63,0.10)] focus:ring-4 focus:ring-[#32143f]/10 sm:min-h-[58px] sm:text-[15px]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition duration-200 hover:bg-slate-100 hover:text-[#32143f] focus:outline-none focus:ring-2 focus:ring-[#32143f]/10"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* PASSWORD STRENGTH */}
                {formData.password && (
                  <div className="mt-3 rounded-2xl border border-slate-100 bg-white/80 p-3.5 shadow-[0_6px_20px_rgba(15,23,42,0.035)] sm:p-4">

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Password strength
                      </span>

                      <span
                        className={`shrink-0 text-[11px] font-black ${
                          passwordStrength.score >= 4
                            ? "text-emerald-600"
                            : passwordStrength.score === 3
                            ? "text-blue-600"
                            : passwordStrength.score === 2
                            ? "text-amber-600"
                            : "text-red-500"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="mt-2.5 flex gap-1.5">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            item <= passwordStrength.score
                              ? passwordStrength.score >= 4
                                ? "bg-emerald-500"
                                : passwordStrength.score === 3
                                ? "bg-blue-500"
                                : passwordStrength.score === 2
                                ? "bg-amber-500"
                                : "bg-red-500"
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="mt-2 text-[10px] font-medium leading-4 text-slate-400 sm:text-[11px]">
                      Use 8+ characters with uppercase letters, numbers and symbols.
                    </p>
                  </div>
                )}
              </div>

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}
              <div className="min-w-0">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[13px] font-black tracking-wide text-slate-700 sm:text-sm"
                >
                  Confirm password
                </label>

                <div className="group relative min-w-0">

                  <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition duration-200 group-focus-within:bg-[#f6edf7] group-focus-within:text-[#32143f] sm:left-4">
                    <FaLock className="text-xs" />
                  </div>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className="min-h-[56px] w-full min-w-0 rounded-2xl border border-slate-200/90 bg-white pl-[62px] pr-[58px] text-sm font-semibold text-slate-800 shadow-[0_8px_25px_rgba(15,23,42,0.045)] outline-none transition duration-200 placeholder:font-medium placeholder:text-slate-400 hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)] focus:border-[#32143f]/60 focus:shadow-[0_12px_32px_rgba(50,20,63,0.10)] focus:ring-4 focus:ring-[#32143f]/10 sm:min-h-[58px] sm:text-[15px]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition duration-200 hover:bg-slate-100 hover:text-[#32143f] focus:outline-none focus:ring-2 focus:ring-[#32143f]/10"
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
                  SECURITY CARD
              ================================================= */}
              <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-[0_8px_25px_rgba(15,23,42,0.045)] sm:gap-4 sm:p-4.5">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6edf7] text-[#32143f] ring-1 ring-[#32143f]/5 sm:h-11 sm:w-11">
                  <FaShieldHalved className="text-xs sm:text-sm" />
                </div>

                <div className="min-w-0">
                  <div className="break-words text-xs font-black leading-5 text-slate-700 sm:text-[13px]">
                    Your information stays protected
                  </div>

                  <p className="mt-1 break-words text-[10px] font-medium leading-5 text-slate-400 sm:text-[11px]">
                    Your password is securely encrypted before it is stored.
                  </p>
                </div>
              </div>

              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex min-h-[56px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#32143f] px-5 text-sm font-black text-white shadow-[0_16px_38px_rgba(50,20,63,0.22)] outline-none transition duration-300 hover:-translate-y-0.5 hover:bg-[#421b52] hover:shadow-[0_20px_42px_rgba(50,20,63,0.27)] focus:ring-4 focus:ring-[#32143f]/15 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[58px] sm:text-[15px]"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 opacity-0 transition duration-500 group-hover:translate-x-full group-hover:opacity-100" />

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create my account</span>
                    <FaArrowRight className="text-xs transition duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* =================================================
                LOGIN LINK
            ================================================= */}
            <p className="mt-6 break-words px-1 text-center text-xs leading-5 text-slate-500 sm:mt-7 sm:text-sm">
              Already have an account?{" "}
              <Link
                to="/customer/login"
                className="font-black text-[#32143f] no-underline transition hover:text-[#5a246e] hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* =================================================
                BENEFITS
            ================================================= */}
            <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2.5 border-t border-slate-200/70 pt-5 text-[10px] font-bold text-slate-400 sm:mt-7 sm:gap-x-6 sm:text-[11px]">

              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                  <FaCheck className="text-[8px] text-emerald-500" />
                </span>
                Free account
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                  <FaCheck className="text-[8px] text-emerald-500" />
                </span>
                Instant booking
              </span>

              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                  <FaCheck className="text-[8px] text-emerald-500" />
                </span>
                Secure
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            BRAND SIDE
        ===================================================== */}
        <section className="order-1 relative hidden min-h-screen overflow-hidden bg-[#32143f] lg:order-2 lg:flex">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-40 -top-40 h-[620px] w-[620px] rounded-full bg-fuchsia-300/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[560px] w-[560px] rounded-full bg-violet-300/15 blur-3xl" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/[0.06] blur-3xl" />

          {/* Decorative rings */}
          <div className="pointer-events-none absolute right-[-90px] top-[25%] h-[300px] w-[300px] rounded-full border border-white/[0.05]" />
          <div className="pointer-events-none absolute right-[-60px] top-[29%] h-[240px] w-[240px] rounded-full border border-white/[0.05]" />

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">

            {/* =================================================
                BRAND HEADER
            ================================================= */}
            <Link
              to="/"
              className="inline-flex w-fit max-w-full items-center gap-3 text-white no-underline"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#f4c7dc] shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/15">
                <Sparkles />
              </div>

              <div className="min-w-0">
                <div className="truncate text-[25px] font-black tracking-[0.16em]">
                  LUMORA
                </div>

                <div className="truncate text-[10px] tracking-[0.25em] text-white/50">
                  BEAUTY • TIME • YOU
                </div>
              </div>
            </Link>

            {/* =================================================
                BRAND CONTENT
            ================================================= */}
            <div className="max-w-2xl">

              <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 shrink-0 text-[#f4c7dc]" />

                <span className="break-words">
                  One account. Endless beauty possibilities.
                </span>
              </div>

              <h2 className="break-words text-[46px] font-black leading-[0.98] tracking-[-0.045em] text-white xl:text-6xl 2xl:text-7xl">
                Your beauty.
                <span className="block text-[#efb8d3]">
                  Your way.
                </span>
              </h2>

              <p className="mt-7 max-w-xl break-words text-base leading-7 text-white/65 xl:text-lg xl:leading-8">
                Find the right salon, the right specialist and the right time
                — without the usual back and forth.
              </p>

              {/* =================================================
                  FEATURE LIST
              ================================================= */}
              <div className="mt-9 space-y-3">

                {[
                  "Discover salons around you",
                  "Choose your preferred service",
                  "Pick your favourite stylist",
                  "Book your perfect time",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#f4c7dc] ring-1 ring-white/10">
                      <FaCheck className="text-[10px]" />
                    </div>

                    <span className="min-w-0 break-words text-sm font-semibold leading-5 text-white/75">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                BRAND FOOTER
            ================================================= */}
            <div className="flex max-w-xl items-start gap-3 text-xs leading-5 text-white/45">
              <FaShieldHalved className="mt-0.5 shrink-0 text-white/60" />

              <span className="break-words">
                Designed for a simpler, more beautiful booking experience.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerRegister;