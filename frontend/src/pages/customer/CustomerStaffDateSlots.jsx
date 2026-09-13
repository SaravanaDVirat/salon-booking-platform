import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarDays,
  FaCheck,
  FaCircleExclamation,
  FaClock,
  FaScissors,
  FaSpinner,
  FaUser,
} from "react-icons/fa6";

import {
  getCustomerStaffAvailability,
  getCustomerAvailableSlots,
} from "../../services/customerSalonService";

const CustomerStaffDateSlots = () => {
  const { salonId, serviceId, staffId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [salon] = useState(location.state?.salon || null);
  const [service] = useState(location.state?.service || null);
  const [staff] = useState(location.state?.staff || null);

  const [selectedDate, setSelectedDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // MINIMUM DATE
  // =====================================================

  const minDate = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // =====================================================
  // FETCH STAFF AVAILABILITY
  // =====================================================

  useEffect(() => {
    if (!selectedDate || !staffId) {
      setAvailability(null);
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setSlots([]);
        setSelectedSlot(null);
        setError("");

        /* ==========================================
           STAFF AVAILABILITY
           ========================================== */

        const data = await getCustomerStaffAvailability(
          staffId,
          selectedDate
        );

        setAvailability(data);

        if (!data.available) {
          setSlots([]);
          return;
        }

        /* ==========================================
           AVAILABLE APPOINTMENT SLOTS
           ========================================== */

        await fetchAvailableSlots(selectedDate);
      } catch (err) {
        console.error("Availability error:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to check staff availability."
        );
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, staffId, salonId, serviceId]);

  // =====================================================
  // FETCH AVAILABLE SLOTS
  // =====================================================

  const fetchAvailableSlots = async (date) => {
    try {
      setSlotsLoading(true);

      const data = await getCustomerAvailableSlots({
        salonId,
        serviceId,
        staffId,
        date,
      });

      setSlots(
        Array.isArray(data.slots)
          ? data.slots
          : Array.isArray(data.availableSlots)
          ? data.availableSlots
          : []
      );
    } catch (err) {
      console.error("Available slots error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load available time slots."
      );

      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = () => {
    if (!selectedSlot) return;

    navigate(
      `/salons/${salonId}/services/${serviceId}/staff/${staffId}/confirm`,
      {
        state: {
          salon,
          service,
          staff,
          date: selectedDate,
          slot: selectedSlot,
        },
      }
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf9fc] text-slate-900 selection:bg-violet-200 selection:text-violet-900">
      {/* =====================================================
          PREMIUM BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Main ambient glow */}
        <div className="absolute left-[-12rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-violet-300/20 blur-[100px]" />

        <div className="absolute right-[-12rem] top-[18rem] h-[32rem] w-[32rem] rounded-full bg-fuchsia-300/15 blur-[110px]" />

        <div className="absolute bottom-[-14rem] left-[25%] h-[28rem] w-[28rem] rounded-full bg-purple-200/20 blur-[100px]" />

        {/* Fine radial highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.06),transparent_38%)]" />

        {/* Subtle grid texture */}
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="relative mx-auto w-full max-w-[1440px] px-3 py-4 pb-36 sm:px-5 sm:py-6 sm:pb-36 md:px-7 md:py-8 lg:px-10 lg:py-10 lg:pb-40">
        {/* =====================================================
            HEADER
            ===================================================== */}

        <header className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="group mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow-[0_12px_35px_rgba(124,58,237,0.14)] focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:h-12 sm:w-12"
            >
              <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5 sm:text-base" />
            </button>

            {/* Header content */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex max-w-full items-center rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm sm:text-[11px]">
                Step 3 of 4
              </div>

              <h1 className="max-w-full break-words text-[clamp(1.65rem,6vw,3rem)] font-black leading-[1.05] tracking-[-0.04em] text-slate-950">
                Choose date & time
              </h1>

              <p className="mt-2 max-w-2xl break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6 md:text-[15px]">
                Pick a date and an available appointment slot that works best
                for you.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            PREMIUM PROGRESS STEPPER
            ===================================================== */}

        <section className="mb-6 rounded-[1.5rem] border border-white/80 bg-white/80 p-3 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:mb-8 sm:rounded-[1.75rem] sm:p-4 md:p-5">
          <div className="flex items-center">
            {/* Step 1 */}
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-[11px] font-black text-white shadow-lg shadow-violet-200 sm:h-9 sm:w-9">
                <FaCheck />

                <span className="absolute inset-0 rounded-full ring-1 ring-white/40" />
              </div>

              <span className="hidden min-w-0 break-words text-xs font-black text-violet-700 sm:block">
                Service
              </span>
            </div>

            <div className="mx-1 h-px flex-1 bg-gradient-to-r from-violet-300 to-violet-100 sm:mx-2" />

            {/* Step 2 */}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-[11px] font-black text-white shadow-lg shadow-violet-200 sm:h-9 sm:w-9">
                <FaCheck />

                <span className="absolute inset-0 rounded-full ring-1 ring-white/40" />
              </div>

              <span className="hidden min-w-0 break-words text-xs font-black text-violet-700 sm:block">
                Stylist
              </span>
            </div>

            <div className="mx-1 h-px flex-1 bg-slate-200 sm:mx-2" />

            {/* Step 3 */}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-violet-200 bg-violet-50 text-[11px] font-black text-violet-700 shadow-sm sm:h-9 sm:w-9">
                3
              </div>

              <span className="hidden min-w-0 break-words text-xs font-black text-violet-700 sm:block">
                Date & Time
              </span>
            </div>

            <div className="mx-1 h-px flex-1 bg-slate-200 sm:mx-2" />

            {/* Step 4 */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-400 sm:h-9 sm:w-9">
                4
              </div>

              <span className="hidden min-w-0 break-words text-xs font-black text-slate-400 sm:block">
                Confirm
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            SELECTED STAFF + SERVICE
            ===================================================== */}

        <section className="mb-6 grid min-w-0 grid-cols-1 gap-4 sm:mb-8 md:grid-cols-2 md:gap-5">
          {/* Staff card */}
          <div className="group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)] sm:p-5 lg:p-6">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl transition duration-500 group-hover:bg-violet-300/40" />

            <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 shadow-sm ring-1 ring-violet-100 sm:h-14 sm:w-14">
                <FaUser className="text-base sm:text-lg" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
                  Selected stylist
                </p>

                <h2 className="mt-1 max-w-full break-words text-[15px] font-black leading-5 text-slate-950 sm:text-lg sm:leading-6">
                  {staff?.name || "Selected Stylist"}
                </h2>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                  {Array.isArray(staff?.specialization) &&
                  staff.specialization.length > 0
                    ? staff.specialization.join(" • ")
                    : "Professional Stylist"}
                </p>
              </div>
            </div>
          </div>

          {/* Service card */}
          <div className="group relative min-w-0 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/85 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)] sm:p-5 lg:p-6">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-fuchsia-200/30 blur-3xl transition duration-500 group-hover:bg-fuchsia-300/40" />

            <div className="relative flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 text-fuchsia-600 shadow-sm ring-1 ring-fuchsia-100 sm:h-14 sm:w-14">
                <FaScissors className="text-base sm:text-lg" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
                  Selected service
                </p>

                <h2 className="mt-1 max-w-full break-words text-[15px] font-black leading-5 text-slate-950 sm:text-lg sm:leading-6">
                  {service?.name || "Selected Service"}
                </h2>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                  {salon?.name || "Salon"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DATE SECTION
            ===================================================== */}

        <section className="relative mb-5 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6 md:p-7">
          {/* Top accent */}
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-200/20 blur-3xl" />

          <div className="relative">
            {/* Section heading */}
            <div className="mb-5 flex min-w-0 items-start gap-3 sm:mb-6 sm:items-center sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 shadow-sm ring-1 ring-violet-100 sm:h-12 sm:w-12">
                <FaCalendarDays />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-base font-black leading-5 text-slate-950 sm:text-lg sm:leading-6">
                  Select appointment date
                </h2>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                  Choose a date to see available slots.
                </p>
              </div>
            </div>

            {/* Date input */}
            <div className="w-full">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                Appointment date
              </label>

              <input
                type="date"
                min={minDate}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="box-border block h-14 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition-all duration-300 hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:max-w-md"
              />
            </div>

            {/* Selected date */}
            {selectedDate && (
              <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-3.5 shadow-sm sm:items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <FaCalendarDays className="text-xs" />
                </div>

                <p className="min-w-0 break-words text-xs font-black leading-5 text-violet-700 sm:text-sm">
                  {formatDate(selectedDate)}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            AVAILABILITY + SLOTS
            ===================================================== */}

        {selectedDate && (
          <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:p-6 md:p-7">
            {/* Top accent */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-500 to-purple-500" />

            {/* Decorative glow */}
            <div className="pointer-events-none absolute -left-20 top-20 h-44 w-44 rounded-full bg-violet-200/15 blur-3xl" />

            <div className="relative">
              {/* Section heading */}
              <div className="mb-5 flex min-w-0 items-start justify-between gap-4 sm:mb-6 sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-black leading-5 text-slate-950 sm:text-lg sm:leading-6">
                      Available time slots
                    </h2>

                    {availability?.available && (
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 ml-5 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    )}
                  </div>

                  <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                    {availability?.workingHours
                      ? `${availability.workingHours.startTime} - ${availability.workingHours.endTime}`
                      : availabilityLoading
                      ? "Checking working hours..."
                      : "Working hours unavailable"}
                  </p>
                </div>

                {availabilityLoading && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <FaSpinner className="animate-spin text-sm text-violet-600" />
                  </div>
                )}
              </div>

              {/* =====================================================
                  ERROR
                  ===================================================== */}

              {error && (
                <div className="mb-5 flex min-w-0 items-start gap-3 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm sm:p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm">
                    <FaCircleExclamation className="text-sm" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wider text-red-500">
                      Something went wrong
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold leading-6 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* =====================================================
                  STAFF UNAVAILABLE
                  ===================================================== */}

              {!availabilityLoading &&
                availability &&
                !availability.available && (
                  <div className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm sm:p-6">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                        <FaCircleExclamation />
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-black text-amber-950 sm:text-base">
                          Stylist unavailable
                        </h3>

                        <p className="mt-1 break-words text-xs leading-6 text-amber-800 sm:text-sm">
                          {availability.reason ||
                            "This stylist is not available on the selected date."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* =====================================================
                  SLOTS LOADING
                  ===================================================== */}

              {availability?.available && slotsLoading && (
                <div className="rounded-[1.5rem] border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white py-14 text-center sm:py-16">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-violet-100">
                    <FaSpinner className="animate-spin text-xl text-violet-600" />
                  </div>

                  <p className="mt-4 break-words px-4 text-sm font-black text-slate-700">
                    Finding available slots...
                  </p>

                  <p className="mt-1 break-words px-4 text-xs text-slate-400">
                    Checking appointments and working hours
                  </p>
                </div>
              )}

              {/* =====================================================
                  AVAILABLE SLOTS
                  ===================================================== */}

              {availability?.available &&
                !slotsLoading &&
                slots.length > 0 && (
                  <div>
                    {/* Slot count */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />

                        {slots.length} available slot
                        {slots.length !== 1 ? "s" : ""}
                      </div>

                      <p className="hidden text-[11px] font-semibold text-slate-400 sm:block">
                        Select your preferred time
                      </p>
                    </div>

                    {/* Slots grid */}
                    <div className="grid grid-cols-2 gap-2.5 min-[400px]:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {slots.map((slot, index) => {
                        const slotValue =
                          typeof slot === "string"
                            ? slot
                            : slot.startTime || slot.time;

                        const slotLabel =
                          typeof slot === "string"
                            ? slot
                            : slot.startTime && slot.endTime
                            ? `${slot.startTime} - ${slot.endTime}`
                            : slot.startTime || slot.time;

                        const isSelected =
                          selectedSlot?.startTime === slot.startTime &&
                          selectedSlot?.endTime === slot.endTime;

                        return (
                          <button
                            key={`${slotValue}-${index}`}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`group relative min-w-0 overflow-hidden rounded-2xl border p-3 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 min-[400px]:p-3.5 sm:p-4 ${
                              isSelected
                                ? "border-violet-500 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)]"
                                : "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50/70 hover:shadow-[0_12px_30px_rgba(124,58,237,0.10)]"
                            }`}
                          >
                            {/* Selected glow */}
                            {isSelected && (
                              <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/20 blur-2xl" />
                            )}

                            <div className="relative">
                              <div
                                className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${
                                  isSelected
                                    ? "bg-white/15"
                                    : "bg-violet-50 group-hover:bg-white"
                                }`}
                              >
                                <FaClock
                                  className={`text-xs ${
                                    isSelected
                                      ? "text-white"
                                      : "text-violet-500"
                                  }`}
                                />
                              </div>

                              <span
                                className={`block break-words text-center text-[11px] font-black leading-4 min-[400px]:text-xs sm:text-sm ${
                                  isSelected
                                    ? "text-white"
                                    : "text-slate-800"
                                }`}
                              >
                                {slotLabel}
                              </span>

                              {isSelected && (
                                <div className="mx-auto mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                  <FaCheck className="text-[9px] text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* =====================================================
                  NO SLOTS
                  ===================================================== */}

              {availability?.available &&
                !slotsLoading &&
                !error &&
                slots.length === 0 && (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-7 text-center sm:p-10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-100">
                      <FaClock className="text-xl" />
                    </div>

                    <h3 className="mt-4 break-words text-base font-black text-slate-800 sm:text-lg">
                      No slots available
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg break-words text-xs leading-6 text-slate-500 sm:text-sm">
                      This stylist is working on this day, but all appointment
                      slots are already booked.
                    </p>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* =====================================================
            STICKY CONTINUE BAR
            ===================================================== */}

        {selectedDate && availability?.available && (
          <div className="sticky bottom-3 z-30 mt-5 sm:bottom-4 sm:mt-7">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/90 p-2.5 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl sm:rounded-[1.75rem] sm:p-3">
              {/* Gradient accent */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

              <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {/* Selected information */}
                <div className="min-w-0 flex-1 px-2 py-1.5 sm:px-3">
                  {selectedSlot ? (
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-500">
                        Selected time
                      </p>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="break-words text-sm font-black leading-5 text-slate-900 sm:text-base">
                          {typeof selectedSlot === "string"
                            ? selectedSlot
                            : selectedSlot.startTime &&
                              selectedSlot.endTime
                            ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                            : selectedSlot.startTime ||
                              selectedSlot.time ||
                              "Selected slot"}
                        </p>

                        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-slate-300 sm:block" />

                        <span className="break-words text-xs font-semibold text-slate-500">
                          {formatDate(selectedDate)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="break-words text-xs font-black text-slate-700 sm:text-sm">
                        Select a time slot to continue
                      </p>

                      <p className="mt-0.5 break-words text-[11px] text-slate-400">
                        Your selected appointment time will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedSlot}
                  className="group flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 px-5 py-3.5 text-xs font-black text-white shadow-lg shadow-slate-300/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 hover:shadow-xl hover:shadow-violet-200/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-100 disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none sm:w-auto sm:min-w-[240px] sm:px-6 sm:text-sm"
                >
                  <span className="break-words">
                    Continue to confirmation
                  </span>

                  <FaArrowRight className="shrink-0 text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerStaffDateSlots;