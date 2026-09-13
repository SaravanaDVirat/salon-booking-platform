import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaCheck,
  FaClock,
  FaLocationDot,
  FaScissors,
  FaSpinner,
  FaUser,
} from "react-icons/fa6";

import { createCustomerAppointment } from "../../services/CustomerAppointmentService";

const CustomerAppointmentConfirm = () => {
  const { salonId, serviceId, staffId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const {
    salon,
    service,
    staff,
    date,
    slot,
  } = location.state || {};

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (value) => {
    if (!value) return "";

    return new Date(`${value}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const handleBooking = async () => {
    if (!salonId || !serviceId || !staffId || !date || !slot) {
      setError("Appointment information is incomplete.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await createCustomerAppointment({
        salonId,
        serviceId,
        staffId,
        appointmentDate: date,
        startTime:
          typeof slot === "string"
            ? slot
            : slot.startTime || slot.time,
        notes: notes.trim(),
      });

      const appointment = response?.appointment;

      if (appointment?._id) {
        navigate(`/customer/appointments/${appointment._id}`, {
          state: {
            appointment,
            bookingSuccess: true,
          },
        });

        return;
      }

      navigate("/customer/appointments");
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to book appointment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!salon || !service || !staff || !date || !slot) {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12 lg:px-8">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-100/20 blur-3xl" />
        </div>

        <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center sm:min-h-[calc(100dvh-6rem)]">
          <div className="w-full max-w-xl">
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_25px_80px_-25px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:rounded-[2.5rem] sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 text-red-500 shadow-inner sm:h-20 sm:w-20">
                <FaLocationDot className="text-xl sm:text-2xl" />
              </div>

              <div className="mt-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500 sm:text-xs">
                  Booking unavailable
                </p>

                <h2 className="mt-2 break-words text-[clamp(1.5rem,6vw,2rem)] font-black leading-tight tracking-tight text-slate-950">
                  Booking information missing
                </h2>

                <p className="mx-auto mt-3 max-w-md break-words text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Please go back and select the service, stylist, date and
                  time again.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-600/20 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-violet-100 sm:py-4"
              >
                <FaArrowLeft />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const startTime =
    typeof slot === "string"
      ? slot
      : slot.startTime || slot.time;

  const endTime =
    typeof slot === "object"
      ? slot.endTime
      : null;

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#f7f7fb] text-slate-900">
      {/* =========================================================
          PREMIUM BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-72 w-72 rounded-full bg-violet-200/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="absolute right-[-10rem] top-24 h-80 w-80 rounded-full bg-fuchsia-200/20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />

        <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-indigo-100/25 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_35%)]" />
      </div>

      {/* =========================================================
          MAIN CONTAINER
      ========================================================= */}
      <main className="relative mx-auto w-full max-w-7xl px-3 py-5 sm:px-5 sm:py-8 md:px-7 lg:px-8 lg:py-10 xl:px-10">
        {/* =======================================================
            HEADER
        ======================================================= */}
        <header className="mb-7 sm:mb-9 lg:mb-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="group mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow-lg hover:shadow-violet-100/60 active:scale-95 focus:outline-none focus:ring-4 focus:ring-violet-100 sm:h-12 sm:w-12"
            >
              <FaArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-600 sm:text-xs">
                  Final step
                </p>

                <span className="h-1 w-1 rounded-full bg-violet-300" />

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                  Review & confirm
                </p>
              </div>

              <h1 className="mt-2 max-w-4xl break-words text-[clamp(1.75rem,7vw,3.2rem)] font-black leading-[1.06] tracking-[-0.035em] text-slate-950">
                Confirm your appointment
              </h1>

              <p className="mt-2 max-w-2xl break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6 md:text-[15px]">
                Review your booking details before confirming your appointment.
              </p>
            </div>
          </div>
        </header>

        {/* =======================================================
            MAIN GRID
        ======================================================= */}
        <div className="grid grid-cols-1 items-start gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(330px,0.82fr)] lg:gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}
          <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* ===================================================
                SALON CARD
            =================================================== */}
            <section className="group relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_24px_70px_-30px_rgba(124,58,237,0.2)] sm:rounded-[2rem] sm:p-6">
              {/* top shine */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent" />

              <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 shadow-inner sm:h-14 sm:w-14">
                  <div className="absolute inset-0 rounded-2xl bg-violet-400/10 blur-md" />
                  <FaLocationDot className="relative text-base sm:text-lg" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                    Salon
                  </p>

                  <h2 className="mt-1 break-words text-base font-black leading-6 text-slate-950 sm:text-lg sm:leading-7">
                    {salon?.name || "Salon"}
                  </h2>

                  {salon?.city && (
                    <p className="mt-1 break-words text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                      {salon.city}
                    </p>
                  )}
                </div>

                <div className="hidden shrink-0 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-600 sm:block">
                  Selected
                </div>
              </div>
            </section>

            {/* ===================================================
                APPOINTMENT DETAILS
            =================================================== */}
            <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              <div className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-40 w-40 rounded-full bg-violet-100/40 blur-3xl" />

              <div className="relative mb-5 sm:mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 sm:text-xs">
                  Appointment details
                </p>

                <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
                  <h2 className="break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Your booking
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Review
                  </span>
                </div>
              </div>

              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {/* Service */}
                <div className="group/item min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-300 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-100/30 sm:p-4.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover/item:scale-105 group-hover/item:ring-violet-100">
                      <FaScissors />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Service
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                        {service?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stylist */}
                <div className="group/item min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-300 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-100/30 sm:p-4.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover/item:scale-105 group-hover/item:ring-violet-100">
                      <FaUser />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Stylist
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                        {staff?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="group/item min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-300 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-100/30 sm:p-4.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover/item:scale-105 group-hover/item:ring-violet-100">
                      <FaCalendarDays />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                        {formatDate(date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="group/item min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-300 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-md hover:shadow-violet-100/30 sm:p-4.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100 transition-all duration-300 group-hover/item:scale-105 group-hover/item:ring-violet-100">
                      <FaClock />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-900 sm:text-[15px]">
                        {startTime}
                        {endTime ? ` - ${endTime}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================
                NOTES
            =================================================== */}
            <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-4 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              <div className="pointer-events-none absolute bottom-[-4rem] right-[-4rem] h-32 w-32 rounded-full bg-violet-100/40 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div className="min-w-0">
                    <label className="block break-words text-sm font-black text-slate-900 sm:text-[15px]">
                      Notes
                    </label>

                    <p className="mt-1 break-words text-xs leading-5 text-slate-400 sm:text-sm">
                      Add anything you would like the salon to know.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Optional
                  </span>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Anything you'd like the salon to know?"
                  className="mt-4 min-h-[120px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 sm:min-h-[130px] sm:px-5 sm:py-4"
                />

                <div className="mt-2 flex justify-end">
                  <p className="text-[10px] font-bold tracking-wide text-slate-400 sm:text-xs">
                    {notes.length}/500
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =====================================================
              RIGHT SUMMARY
          ===================================================== */}
          <aside className="min-w-0 lg:sticky lg:top-5">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-4 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
              {/* premium glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-200/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-fuchsia-200/20 blur-3xl" />

              <div className="relative">
                {/* =================================================
                    SUMMARY HERO
                ================================================= */}
                <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-violet-500/20 sm:rounded-[1.75rem] sm:p-6">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                  <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-2xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 sm:text-xs">
                        Booking summary
                      </p>

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                        <FaCheck className="text-xs" />
                      </div>
                    </div>

                    <h2 className="mt-3 break-words text-xl font-black leading-7 tracking-tight sm:text-2xl sm:leading-8">
                      {service?.name}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-white/20 pt-4">
                      <span className="text-xs font-medium text-white/75 sm:text-sm">
                        Service price
                      </span>

                      <span className="break-words text-2xl font-black tracking-tight sm:text-3xl">
                        ₹{service?.price ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}
                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-2xl border border-red-100 bg-red-50/90 p-4 text-sm font-semibold leading-6 text-red-700 shadow-sm"
                  >
                    <p className="break-words">{error}</p>
                  </div>
                )}

                {/* =================================================
                    QUICK DETAILS
                ================================================= */}
                <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100">
                        <FaCalendarDays className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Date
                        </p>

                        <p className="mt-0.5 break-words text-sm font-black leading-5 text-slate-900">
                          {formatDate(date)}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100">
                        <FaClock className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Time
                        </p>

                        <p className="mt-0.5 break-words text-sm font-black leading-5 text-slate-900">
                          {startTime}
                          {endTime ? ` - ${endTime}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Stylist */}
                    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-100">
                        <FaUser className="text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Stylist
                        </p>

                        <p className="mt-0.5 break-words text-sm font-black leading-5 text-slate-900">
                          {staff?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* =================================================
                    CONFIRM BUTTON
                ================================================= */}
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={loading}
                  className="group relative flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl hover:shadow-violet-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-violet-100 sm:min-h-[56px] sm:py-4"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck className="transition-transform duration-300 group-hover:scale-110" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>

                {/* =================================================
                    STATUS NOTE
                ================================================= */}
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50/70 px-3.5 py-3">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

                  <p className="break-words text-center text-[10px] font-medium leading-5 text-slate-500 sm:text-xs">
                    Your appointment will be created with
                    <strong className="mx-1 font-black text-slate-700">
                      PENDING
                    </strong>
                    status.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CustomerAppointmentConfirm;