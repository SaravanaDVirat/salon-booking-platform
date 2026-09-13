import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaCalendarCheck,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCut,
  FaUsers,
  FaStore,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";

import {
  getOwnerDashboard,
} from "../../services/salonOwnerService";

const SalonOwnerDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOwnerDashboard();

      setDashboard(data);
    } catch (error) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="relative flex min-h-[calc(100vh-9rem)] w-full items-center justify-center overflow-hidden px-3 py-8 sm:px-6 lg:px-8">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl sm:h-[28rem] sm:w-[28rem]" />

        <div className="relative w-full max-w-md">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-8">
            {/* Top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 shadow-inner sm:h-24 sm:w-24">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg sm:h-16 sm:w-16">
                  <div className="absolute inset-0 rounded-2xl border-4 border-slate-100" />

                  <div className="absolute inset-0 animate-spin rounded-2xl border-4 border-transparent border-t-pink-500 border-r-purple-500" />

                  <FaStore className="relative text-lg text-pink-500 sm:text-xl" />
                </div>
              </div>

              <div className="mt-7 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pink-500 sm:text-xs">
                  Salon workspace
                </p>

                <h2 className="mt-2 break-words text-xl font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                  Preparing your dashboard
                </h2>

                <p className="mx-auto mt-2 max-w-sm break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  Fetching your salon business information...
                </p>
              </div>

              <div className="mx-auto mt-7 h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="relative flex min-h-[calc(100vh-9rem)] w-full items-center justify-center overflow-hidden px-3 py-8 sm:px-6 lg:px-8">
        {/* Background */}
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-red-100/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-orange-100/30 blur-3xl" />

        <div className="relative w-full max-w-lg">
          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_25px_80px_-30px_rgba(127,29,29,0.25)] backdrop-blur-xl sm:rounded-[2.5rem]">
            <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />

            <div className="p-5 text-center sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-red-50 to-orange-50 text-red-500 shadow-inner sm:h-20 sm:w-20">
                <FaCalendarAlt className="text-xl sm:text-2xl" />
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-red-500 sm:text-xs">
                Something went wrong
              </p>

              <h2 className="mt-2 break-words text-xl font-black leading-tight tracking-tight text-slate-950 sm:text-2xl">
                Unable to load dashboard
              </h2>

              <p className="mx-auto mt-2 max-w-md break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                Something went wrong while loading your salon information.
              </p>

              <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3.5">
                <p className="break-words text-xs font-semibold leading-5 text-red-600 sm:text-sm">
                  {error}
                </p>
              </div>

              <button
                onClick={loadDashboard}
                className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-pink-500 hover:shadow-xl hover:shadow-pink-500/20 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-pink-100 sm:w-auto sm:px-7 sm:text-sm"
              >
                <span>Try Again</span>

                <FaArrowRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  const statCards = [
    {
      title: "Total Salons",
      value: stats.totalSalons || 0,
      icon: FaStore,
      label: "Registered locations",
      gradient: "from-pink-500 to-rose-500",
      soft: "from-pink-50 to-rose-50",
      iconText: "text-pink-500",
    },
    {
      title: "Services",
      value: stats.totalServices || 0,
      icon: FaCut,
      label: "Available services",
      gradient: "from-purple-500 to-violet-600",
      soft: "from-purple-50 to-violet-50",
      iconText: "text-purple-500",
    },
    {
      title: "Staff Members",
      value: stats.totalStaff || 0,
      icon: FaUsers,
      label: "Active team members",
      gradient: "from-blue-500 to-indigo-600",
      soft: "from-blue-50 to-indigo-50",
      iconText: "text-blue-500",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments || 0,
      icon: FaCalendarCheck,
      label: "Total bookings",
      gradient: "from-emerald-500 to-teal-600",
      soft: "from-emerald-50 to-teal-50",
      iconText: "text-emerald-500",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[1700px] min-w-0 overflow-x-hidden pb-8 sm:pb-10 lg:pb-12">
      {/* =====================================================
          GLOBAL DECORATIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-72 w-72 rounded-full bg-pink-200/20 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />

        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-indigo-100/20 blur-3xl" />
      </div>

      <div className="relative space-y-5 sm:space-y-6 lg:space-y-7 xl:space-y-8">
        {/* =====================================================
            HERO HEADER
        ===================================================== */}

        <section className="group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_25px_80px_-35px_rgba(236,72,153,0.18)] sm:rounded-[2rem] lg:rounded-[2.5rem]">
          {/* Gradient top line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600" />

          {/* Background decorations */}
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl transition duration-700 group-hover:scale-125" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-purple-200/25 blur-3xl" />

          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-fuchsia-100/30 blur-3xl" />

          <div className="relative p-4 sm:p-6 md:p-7 lg:p-9 xl:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              {/* LEFT */}
              <div className="min-w-0 flex-1">
                {/* Badge */}
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-pink-100 bg-pink-50/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-pink-500" />

                  <span className="break-words text-[9px] font-black uppercase tracking-[0.18em] text-pink-600 sm:text-[10px] md:text-xs">
                    Salon Management
                  </span>
                </div>

                {/* Heading */}
                <h1 className="mt-4 max-w-4xl break-words text-[clamp(2rem,7vw,4rem)] font-black leading-[1.02] tracking-[-0.045em] text-slate-950">
                  Welcome back,
                  <span className="mt-1 block break-words bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
                    Salon Owner.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-4 max-w-2xl break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6 md:text-base">
                  Manage your salon, services, staff and customer appointments
                  from one powerful workspace.
                </p>
              </div>

              {/* RIGHT SUMMARY */}
              <div className="w-full shrink-0 lg:w-auto">
                <div className="group/overview relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-3.5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-pink-200 hover:bg-white hover:shadow-xl hover:shadow-pink-100/30 sm:p-4">
                  <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-pink-100/50 blur-2xl" />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 transition duration-300 group-hover/overview:scale-105 sm:h-12 sm:w-12">
                      <FaStore />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[10px]">
                        Business Overview
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-800 sm:text-base">
                        {stats.totalSalons || 0} Salon
                        {stats.totalSalons === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 p-4 shadow-[0_15px_50px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:bg-white hover:shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)] sm:rounded-[1.75rem] sm:p-5 lg:p-6"
              >
                {/* Gradient top */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
                />

                {/* Glow */}
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${card.soft} opacity-70 blur-2xl transition duration-500 group-hover:scale-150`}
                />

                <div className="relative">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400 sm:text-[10px] md:text-xs">
                        {card.title}
                      </p>

                      <p className="mt-2 break-words text-3xl font-black leading-none tracking-tight text-slate-950 sm:mt-3 sm:text-4xl">
                        {card.value}
                      </p>
                    </div>

                    {/* Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.soft} ${card.iconText} shadow-sm ring-1 ring-black/[0.02] transition-all duration-300 group-hover:scale-110 group-hover:rotate-2 sm:h-12 sm:w-12`}
                    >
                      <Icon className="text-base sm:text-lg" />
                    </div>
                  </div>

                  {/* Bottom label */}
                  <div className="mt-4 flex min-w-0 items-center gap-2 sm:mt-5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                    <p className="min-w-0 break-words text-[10px] font-medium leading-4 text-slate-400 sm:text-xs">
                      {card.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* =====================================================
            MAIN OVERVIEW
        ===================================================== */}

        <section className="grid min-w-0 grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-3">
          {/* ===================================================
              APPOINTMENT STATUS
          =================================================== */}

          <div className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:rounded-[2rem]">
            <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-pink-100/50 blur-3xl" />

            <div className="relative p-4 sm:p-5 lg:p-6">
              {/* Header */}
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500 shadow-sm">
                      <FaCalendarAlt className="text-sm" />
                    </div>

                    <h2 className="break-words text-sm font-black leading-5 text-slate-900 sm:text-base lg:text-lg">
                      Appointment Status
                    </h2>
                  </div>

                  <p className="mt-2 break-words text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                    Current appointment overview
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-600 sm:px-2.5 sm:text-[9px]">
                  Live
                </span>
              </div>

              {/* Status rows */}
              <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                <StatusRow
                  icon={FaClock}
                  title="Pending"
                  value={stats.pendingAppointments}
                  bg="bg-amber-50"
                  color="text-amber-500"
                  bar="bg-amber-400"
                />

                <StatusRow
                  icon={FaCalendarCheck}
                  title="Confirmed"
                  value={stats.confirmedAppointments}
                  bg="bg-blue-50"
                  color="text-blue-500"
                  bar="bg-blue-400"
                />

                <StatusRow
                  icon={FaCheckCircle}
                  title="Completed"
                  value={stats.completedAppointments}
                  bg="bg-emerald-50"
                  color="text-emerald-500"
                  bar="bg-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* ===================================================
              SALONS
          =================================================== */}

          <div className="min-w-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:rounded-[2rem] xl:col-span-2">
            {/* Header */}
            <div className="border-b border-slate-100/80 p-4 sm:p-5 lg:p-6">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-pink-500 shadow-sm sm:h-12 sm:w-12">
                    <FaStore />
                  </div>

                  <div className="min-w-0">
                    <h2 className="break-words text-sm font-black leading-5 text-slate-900 sm:text-base sm:text-lg">
                      Your Salons
                    </h2>

                    <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                      Manage your registered salon locations
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl border border-pink-100 bg-pink-50 px-2.5 py-1.5 text-center sm:px-3 sm:py-2">
                  <p className="text-[8px] font-black uppercase tracking-wider text-pink-400 sm:text-[9px]">
                    Total
                  </p>

                  <p className="mt-0.5 text-sm font-black text-pink-600">
                    {dashboard?.salons?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Salon list */}
            <div className="p-3.5 sm:p-4 lg:p-5">
              {dashboard?.salons?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                  {dashboard.salons.map((salon) => (
                    <div
                      key={salon._id}
                      className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all duration-300 hover:border-pink-200 hover:bg-white hover:shadow-lg hover:shadow-pink-100/40 sm:p-4"
                    >
                      <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-20 w-20 rounded-full bg-pink-100/40 blur-2xl opacity-0 transition duration-500 group-hover:opacity-100" />

                      <div className="relative flex min-w-0 items-start gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 transition duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
                          <FaStore />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-start gap-1.5 sm:items-center sm:gap-2">
                            <h3 className="min-w-0 flex-1 break-words text-sm font-black leading-5 text-slate-800">
                              {salon.name}
                            </h3>

                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide sm:text-[9px] ${
                                salon.isActive
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {salon.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </div>

                          <p className="mt-1 break-words text-[10px] font-medium leading-4 text-slate-400 sm:text-xs sm:leading-5">
                            {salon.city || "Location not added"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center sm:px-5 sm:py-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
                    <FaStore className="text-xl" />
                  </div>

                  <p className="mt-4 break-words text-sm font-black text-slate-600">
                    No salon added yet
                  </p>

                  <p className="mx-auto mt-1 max-w-sm break-words text-xs leading-5 text-slate-400">
                    Add your salon details to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            UPCOMING APPOINTMENTS
        ===================================================== */}

        <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:rounded-[2rem]">
          {/* Header */}
          <div className="border-b border-slate-100/80 p-4 sm:p-5 lg:p-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500 shadow-sm sm:h-12 sm:w-12">
                  <FaCalendarCheck />
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-sm font-black leading-5 text-slate-900 sm:text-base sm:text-lg">
                    Upcoming Appointments
                  </h2>

                  <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                    Next scheduled customer appointments
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/salon-owner/appointments")
                }
                className="group inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600 hover:shadow-md hover:shadow-pink-100/30 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-pink-100 sm:w-auto sm:text-xs"
              >
                <span>View All</span>

                <FaArrowRight className="text-[9px] transition duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Appointment list */}
          <div className="divide-y divide-slate-100">
            {dashboard?.upcomingAppointments?.length > 0 ? (
              dashboard.upcomingAppointments.map(
                (appointment) => (
                  <div
                    key={appointment._id}
                    className="group p-4 transition duration-300 hover:bg-slate-50/70 sm:p-5 lg:p-6"
                  >
                    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                      {/* Customer */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 shadow-sm transition duration-300 group-hover:from-pink-50 group-hover:to-purple-50 group-hover:text-pink-500 sm:h-12 sm:w-12">
                          <FaUser />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-black leading-5 text-slate-800 sm:text-[15px]">
                            {appointment.customer?.name ||
                              "Customer"}
                          </p>

                          <p className="mt-1 break-words text-[10px] font-medium leading-4 text-slate-400 sm:text-xs sm:leading-5">
                            {appointment.service?.name ||
                              "Service"}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:flex lg:items-center lg:gap-6">
                        {/* Date */}
                        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="shrink-0 text-[10px] text-slate-300" />

                            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400 sm:text-[10px]">
                              Date
                            </p>
                          </div>

                          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-700 sm:text-sm">
                            {new Date(
                              appointment.appointmentDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                          <div className="flex items-center gap-2">
                            <FaClock className="shrink-0 text-[10px] text-slate-300" />

                            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400 sm:text-[10px]">
                              Time
                            </p>
                          </div>

                          <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-700 sm:text-sm">
                            {appointment.startTime}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                          <div className="mb-1.5 flex items-center gap-2 sm:hidden">
                            <FaCheckCircle className="shrink-0 text-[10px] text-slate-300" />

                            <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
                              Status
                            </p>
                          </div>

                          <span
                            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide sm:text-[10px] ${
                              appointment.status ===
                              "CONFIRMED"
                                ? "border-blue-100 bg-blue-50 text-blue-600"
                                : appointment.status ===
                                  "COMPLETED"
                                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                                : "border-amber-100 bg-amber-50 text-amber-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                appointment.status ===
                                "CONFIRMED"
                                  ? "bg-blue-500"
                                  : appointment.status ===
                                    "COMPLETED"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />

                            <span className="break-words">
                              {appointment.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="px-4 py-14 text-center sm:px-5 sm:py-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 shadow-inner">
                  <FaCalendarAlt className="text-2xl" />
                </div>

                <h3 className="mt-5 break-words text-sm font-black text-slate-600">
                  No upcoming appointments
                </h3>

                <p className="mx-auto mt-1 max-w-sm break-words text-xs leading-5 text-slate-400">
                  Your next customer appointments will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   STATUS ROW
========================================================= */

const StatusRow = ({
  icon: Icon,
  title,
  value,
  bg,
  color,
  bar,
}) => (
  <div className="group min-w-0 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/40 sm:p-3.5">
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg} ${color} shadow-sm transition duration-300 group-hover:scale-105 sm:h-10 sm:w-10`}
        >
          <Icon className="text-xs sm:text-sm" />
        </div>

        <div className="min-w-0">
          <p className="break-words text-xs font-bold leading-4 text-slate-700 sm:text-sm">
            {title}
          </p>

          <div className="mt-1.5 h-1 w-14 overflow-hidden rounded-full bg-slate-200 sm:w-16">
            <div
              className={`h-full w-2/3 rounded-full ${bar}`}
            />
          </div>
        </div>
      </div>

      <span className="shrink-0 text-lg font-black leading-none text-slate-900 sm:text-xl">
        {value || 0}
      </span>
    </div>
  </div>
);

export default SalonOwnerDashboard;