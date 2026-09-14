import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCircleExclamation,
  FaClock,
  FaScissors,
  FaSpinner,
  FaUsers,
} from "react-icons/fa6";

import { getCustomerStaffByService } from "../../services/customerSalonService";

const API_URL = import.meta.env.VITE_API_URL;

const CustomerStaffSelection = () => {
  const { salonId, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const serviceFromState = location.state?.service || null;
  const salonFromState = location.state?.salon || null;

  const [service, setService] = useState(serviceFromState);
  const [salon, setSalon] = useState(salonFromState);

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH STAFF FOR SELECTED SERVICE
  // =====================================================
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerStaffByService(
          salonId,
          serviceId
        );

        setStaff(
          Array.isArray(data?.staff)
            ? data.staff
            : []
        );

        // Update service from backend response
        if (data?.service) {
          setService((prev) => ({
            ...prev,
            _id: data.service.id,
            name: data.service.name,
            category: data.service.category,
          }));
        }

        // Update salon from backend response
        if (data?.salon) {
          setSalon((prev) => ({
            ...prev,
            _id: data.salon.id,
            name: data.salon.name,
            city: data.salon.city,
          }));
        }
      } catch (err) {
        console.error("Fetch staff error:", err);

        setError(
          err.message ||
            "Unable to load stylists. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (salonId && serviceId) {
      fetchStaff();
    } else {
      setLoading(false);
      setError(
        "Salon or service information is missing."
      );
    }
  }, [salonId, serviceId]);

  // =====================================================
  // CONTINUE TO DATE & TIME
  // =====================================================
  const handleContinue = () => {
    if (!selectedStaff) return;

    navigate(
      `/salons/${salonId}/services/${serviceId}/staff/${selectedStaff._id}/date`,
      {
        state: {
          salon,
          service,
          staff: selectedStaff,
        },
      }
    );
  };

  // =====================================================
  // STAFF INITIALS
  // =====================================================
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8f7fc] text-slate-900">

      {/* =====================================================
          PREMIUM BACKGROUND SYSTEM
      ===================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/15 blur-3xl sm:h-[34rem] sm:w-[34rem]" />

        <div className="absolute bottom-[-12rem] left-[20%] h-[28rem] w-[28rem] rounded-full bg-purple-200/20 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.06),transparent_38%)]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6 md:px-7 md:py-8 lg:px-10 lg:py-10 xl:px-12">

        {/* =====================================================
            PREMIUM HEADER
        ===================================================== */}
        <header className="mb-5 sm:mb-7 md:mb-8 lg:mb-10">
          <div className="flex items-start gap-3 sm:gap-4">

            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="group mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow-[0_14px_35px_rgba(124,58,237,0.16)] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:h-11 sm:w-11"
            >
              <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-700 sm:px-3 sm:text-[11px]">
                  Step 2 of 4
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-violet-300 sm:block" />

                <span className="hidden text-[11px] font-semibold text-slate-400 sm:block">
                  Personalize your appointment
                </span>
              </div>

              <h1 className="max-w-full break-words text-[clamp(1.75rem,6vw,3.5rem)] font-black leading-[0.98] tracking-[-0.04em] text-slate-950">
                Choose your{" "}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  stylist
                </span>
              </h1>

              <p className="mt-2 max-w-2xl break-words text-xs leading-5 text-slate-500 sm:mt-3 sm:text-sm sm:leading-6 md:text-base">
                Select a stylist who can perform your selected service.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            PREMIUM PROGRESS
        ===================================================== */}
        <section className="mb-5 sm:mb-7 md:mb-8">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/90 bg-white/85 p-3 shadow-[0_18px_50px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-4 md:p-5">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />

            <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">

              {/* Step 1 */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-[11px] font-black text-white shadow-lg shadow-violet-200 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  <FaCheck className="text-[10px] sm:text-xs" />
                </div>

                <span className="hidden min-w-0 truncate text-xs font-black text-violet-700 md:block">
                  Service
                </span>
              </div>

              <div className="h-px min-w-2 flex-1 bg-gradient-to-r from-violet-300 to-violet-200 sm:min-w-4" />

              {/* Step 2 */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-[11px] font-black text-white shadow-lg shadow-violet-200 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  2
                </div>

                <span className="hidden min-w-0 truncate text-xs font-black text-violet-700 md:block">
                  Stylist
                </span>
              </div>

              <div className="h-px min-w-2 flex-1 bg-slate-200 sm:min-w-4" />

              {/* Step 3 */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  3
                </div>

                <span className="hidden min-w-0 truncate text-xs font-bold text-slate-400 md:block">
                  Date & Time
                </span>
              </div>

              <div className="h-px min-w-2 flex-1 bg-slate-200 sm:min-w-4" />

              {/* Step 4 */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-400 sm:h-9 sm:w-9 md:h-10 md:w-10">
                  4
                </div>

                <span className="hidden min-w-0 truncate text-xs font-bold text-slate-400 md:block">
                  Confirm
                </span>
              </div>

            </div>

            {/* Mobile step labels */}
            <div className="mt-2 grid grid-cols-4 text-center md:hidden">
              <span className="text-[9px] font-black text-violet-700 sm:text-[10px]">
                Service
              </span>

              <span className="text-[9px] font-black text-violet-700 sm:text-[10px]">
                Stylist
              </span>

              <span className="text-[9px] font-bold text-slate-400 sm:text-[10px]">
                Date
              </span>

              <span className="text-[9px] font-bold text-slate-400 sm:text-[10px]">
                Confirm
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            SELECTED SERVICE HERO CARD
        ===================================================== */}
        <section className="mb-6 sm:mb-8 md:mb-10">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 p-4 text-white shadow-[0_25px_70px_rgba(109,40,217,0.22)] sm:rounded-[2rem] sm:p-5 md:p-6 lg:p-7">

            {/* Glow layers */}
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl transition-transform duration-700 group-hover:scale-110" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-300/20 blur-3xl" />

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/30" />

            <div className="relative flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex min-w-0 items-start gap-3 sm:gap-4 md:items-center">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/25 backdrop-blur-xl sm:h-14 sm:w-14 md:h-16 md:w-16">
                  <FaScissors className="text-lg sm:text-xl md:text-2xl" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/65 sm:text-[10px]">
                    Selected service
                  </p>

                  <h2 className="mt-1 max-w-full break-words text-base font-black leading-snug tracking-tight sm:text-lg md:text-xl lg:text-2xl">
                    {service?.name || "Selected Service"}
                  </h2>

                  {salon?.name && (
                    <p className="mt-1 break-words text-xs leading-5 text-white/70 sm:text-sm">
                      {salon.name}
                      {salon.city ? ` • ${salon.city}` : ""}
                    </p>
                  )}
                </div>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black shadow-inner backdrop-blur-xl sm:px-4 sm:py-2.5 sm:text-xs md:self-center">
                <FaUsers className="shrink-0" />
                <span>
                  {staff.length} stylist
                  {staff.length !== 1 ? "s" : ""}
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            LOADING STATE
        ===================================================== */}
        {loading && (
          <section className="rounded-[1.75rem] border border-white/90 bg-white/90 px-4 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 backdrop-blur-xl sm:rounded-[2rem] sm:px-6 sm:py-20">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-inner ring-1 ring-violet-100 sm:h-16 sm:w-16">
              <FaSpinner className="animate-spin text-xl sm:text-2xl" />
            </div>

            <h3 className="break-words text-base font-black tracking-tight text-slate-900 sm:text-lg md:text-xl">
              Finding available stylists
            </h3>

            <p className="mx-auto mt-2 max-w-md break-words text-xs leading-5 text-slate-500 sm:text-sm">
              Checking stylists assigned to this service...
            </p>
          </section>
        )}

        {/* =====================================================
            ERROR STATE
        ===================================================== */}
        {!loading && error && (
          <section className="relative overflow-hidden rounded-[1.75rem] border border-red-100 bg-white/95 p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] ring-1 ring-red-100/60 backdrop-blur-xl sm:rounded-[2rem] sm:p-10 md:p-14">

            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100 sm:h-16 sm:w-16">
              <FaCircleExclamation className="text-xl sm:text-2xl" />
            </div>

            <h3 className="break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-2xl">
              Unable to load stylists
            </h3>

            <p className="mx-auto mt-2 max-w-lg break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-violet-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:text-sm"
            >
              Try again
            </button>
          </section>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}
        {!loading && !error && staff.length === 0 && (
          <section className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/95 p-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] ring-1 ring-slate-200/60 backdrop-blur-xl sm:rounded-[2rem] sm:p-12 md:p-16">

            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200 sm:h-20 sm:w-20">
              <FaUsers className="text-2xl sm:text-3xl" />
            </div>

            <h3 className="break-words text-lg font-black tracking-tight text-slate-900 sm:text-xl md:text-2xl">
              No stylist available
            </h3>

            <p className="mx-auto mt-2 max-w-lg break-words text-xs leading-6 text-slate-500 sm:text-sm">
              There are currently no active stylists assigned to this
              service. Please choose another service or try again later.
            </p>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-violet-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:text-sm"
            >
              <FaArrowLeft />
              Back to services
            </button>
          </section>
        )}

        {/* =====================================================
            STAFF SECTION
        ===================================================== */}
        {!loading && !error && staff.length > 0 && (
          <section className="pb-36 sm:pb-32 md:pb-28">

            {/* Section heading */}
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 shadow-[0_0_0_4px_rgba(124,58,237,0.08)]" />

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">
                    Professional team
                  </span>
                </div>

                <h2 className="break-words text-[clamp(1.35rem,4vw,2rem)] font-black leading-tight tracking-[-0.03em] text-slate-950">
                  Available stylists
                </h2>

                <p className="mt-1 max-w-xl break-words text-xs leading-5 text-slate-500 sm:text-sm">
                  Choose one stylist for your appointment.
                </p>
              </div>

              {selectedStaff && (
                <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-black text-violet-700 sm:text-xs">
                  <FaCheck className="text-[9px]" />
                  Stylist selected
                </span>
              )}
            </div>

            {/* =====================================================
                STAFF GRID
            ===================================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3 2xl:gap-6">

              {staff.map((item) => {
                const isSelected =
                  selectedStaff?._id === item._id;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedStaff(item)}
                    className={`group relative w-full min-w-0 overflow-hidden rounded-[1.6rem] border p-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:rounded-[1.75rem] sm:p-5 ${
                      isSelected
                        ? "border-violet-400 bg-white shadow-[0_20px_55px_rgba(124,58,237,0.16)] ring-2 ring-violet-100"
                        : "border-slate-200/80 bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_22px_55px_rgba(15,23,42,0.11)]"
                    }`}
                  >

                    {/* Top accent */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1 transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600"
                          : "bg-gradient-to-r from-violet-200 via-purple-200 to-fuchsia-200 opacity-0 group-hover:opacity-100"
                      }`}
                    />

                    {/* Card glow */}
                    <div
                      className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500 ${
                        isSelected
                          ? "bg-violet-200/40 opacity-100"
                          : "bg-violet-100/30 opacity-0 group-hover:opacity-100"
                      }`}
                    />

                    {/* Selection indicator */}
                    <div
                      className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 sm:right-4 sm:top-4 ${
                        isSelected
                          ? "bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200"
                          : "bg-slate-100 text-transparent group-hover:bg-violet-50"
                      }`}
                    >
                      <FaCheck className="text-[10px]" />
                    </div>

                    {/* Profile */}
                    <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">

                      {item.profileImage ? (
  <img
    src={
      item.profileImage.startsWith("http://") || item.profileImage.startsWith("https://")
        ? item.profileImage
        : `${API_URL.replace("api", "")}${
            item.profileImage.startsWith("/")
              ? item.profileImage
              : `/${item.profileImage}`
          }`
    }
    alt={item.name}
    className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm ring-4 ring-slate-50 transition-..."
  />
) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-base font-black text-white shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:scale-[1.03] sm:h-16 sm:w-16 sm:text-lg">
                          {getInitials(item.name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 pr-9">
                        <h3 className="break-words text-base font-black leading-snug tracking-tight text-slate-950 sm:text-lg">
                          {item.name}
                        </h3>

                        <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                          {Array.isArray(item.specialization) &&
                          item.specialization.length > 0
                            ? item.specialization.join(" • ")
                            : "Professional Stylist"}
                        </p>
                      </div>
                    </div>

                    {/* Status chips */}
                    <div className="relative mt-5 flex flex-wrap gap-2">

                      <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black text-emerald-700 sm:px-3 sm:text-[11px]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.10)]" />
                        Available
                      </span>

                      {item.workingHours?.length > 0 && (
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-black text-slate-600 sm:px-3 sm:text-[11px]">
                          <FaClock className="shrink-0" />
                          <span className="break-words">
                            Schedule available
                          </span>
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div
                      className={`relative mt-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl px-3.5 py-3 transition-all duration-300 sm:px-4 ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200"
                          : "bg-slate-50 text-slate-700 group-hover:bg-violet-50 group-hover:text-violet-700"
                      }`}
                    >
                      <span className="min-w-0 break-words text-xs font-black leading-5 sm:text-sm">
                        {isSelected
                          ? "Selected stylist"
                          : "Select stylist"}
                      </span>

                      <FaArrowRight
                        className={`shrink-0 text-[10px] transition-transform duration-300 ${
                          isSelected
                            ? "translate-x-0.5"
                            : "group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* =====================================================
                PREMIUM STICKY ACTION
            ===================================================== */}
            <div className="sticky bottom-2 z-30 mt-6 sm:bottom-3 sm:mt-8 md:mt-10">

              <div className="relative overflow-hidden rounded-[1.4rem] border border-white/90 bg-white/90 p-2.5 shadow-[0_20px_70px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70 backdrop-blur-2xl sm:rounded-[1.6rem] sm:p-3 md:p-3.5">

                <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" />

                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                  {/* Selected info */}
                  <div className="min-w-0 flex-1 px-2 py-1 sm:px-2.5">

                    {selectedStaff ? (
                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                          Selected stylist
                        </p>

                        <p className="mt-0.5 break-words text-sm font-black leading-5 text-slate-950 sm:text-base">
                          {selectedStaff.name}
                        </p>
                      </div>
                    ) : (
                      <p className="break-words text-xs font-bold leading-5 text-slate-500 sm:text-sm">
                        Select a stylist to continue
                      </p>
                    )}
                  </div>

                  {/* Continue */}
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={!selectedStaff}
                    className="group flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none sm:min-h-[3.25rem] sm:w-auto sm:min-w-[220px] sm:px-6 sm:text-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                  >
                    <span className="break-words">
                      Choose date & time
                    </span>

                    <FaArrowRight className="shrink-0 text-[10px] transition-transform duration-300 group-hover:translate-x-1 sm:text-xs" />
                  </button>
                </div>
              </div>
            </div>

          </section>
        )}
      </main>
    </div>
  );
};

export default CustomerStaffSelection;