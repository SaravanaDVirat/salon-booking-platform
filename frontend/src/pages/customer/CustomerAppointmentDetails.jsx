import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaCheck,
  FaCircleCheck,
  FaCircleExclamation,
  FaClock,
  FaLocationDot,
  FaScissors,
  FaSpinner,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

import {
  cancelCustomerAppointment,
  getCustomerAppointmentById,
} from "../../services/CustomerAppointmentService";

const CustomerAppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerAppointmentById(id);

      setAppointment(data?.appointment || null);
    } catch (err) {
      console.error("Appointment details error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load appointment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "COMPLETED":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "CANCELLED":
        return "border-slate-200 bg-slate-100 text-slate-500";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  };

  const canCancel =
    appointment &&
    !["COMPLETED", "CANCELLED", "REJECTED"].includes(
      appointment.status
    );

  const handleCancel = async () => {
    try {
      setCancelling(true);

      const response =
        await cancelCustomerAppointment(id);

      setAppointment(
        response?.appointment || {
          ...appointment,
          status: "CANCELLED",
        }
      );

      setShowCancel(false);
    } catch (err) {
      console.error("Cancel appointment error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#faf8fc] px-4 py-10 text-slate-900">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl sm:h-96 sm:w-96" />

          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-7 text-center shadow-[0_25px_80px_rgba(76,29,149,0.12)] backdrop-blur-xl sm:p-9">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-inner">
              <FaSpinner className="animate-spin text-2xl text-violet-600" />
            </div>

            <h2 className="mt-5 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
              Loading appointment
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Please wait while we retrieve your booking details.
            </p>

            <div className="mx-auto mt-6 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-violet-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !appointment) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#faf8fc] px-4 py-8 text-slate-900 sm:px-6">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-violet-200/25 blur-3xl" />

          <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-fuchsia-200/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="overflow-hidden rounded-[2rem] border border-red-100/80 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-fuchsia-500" />

            <div className="p-6 text-center sm:p-9">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 text-red-500 shadow-inner">
                <FaCircleExclamation className="text-2xl" />
              </div>

              <h2 className="mt-5 break-words text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Unable to load appointment
              </h2>

              <p className="mt-3 break-words text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/customer/appointments")
                }
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-slate-300/30 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-violet-200/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:w-auto"
              >
                <FaArrowLeft />
                My Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) return null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf8fc] text-slate-900">
      {/* =====================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl sm:h-[30rem] sm:w-[30rem]" />

        <div className="absolute right-[-10rem] top-[25%] h-80 w-80 rounded-full bg-fuchsia-300/15 blur-3xl sm:h-[32rem] sm:w-[32rem]" />

        <div className="absolute bottom-[-12rem] left-[25%] h-72 w-72 rounded-full bg-purple-200/15 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-8 md:px-6 lg:px-8 lg:py-10">
        {/* =====================================================
            TOP NAV / HEADER
        ====================================================== */}

        <header className="mb-5 sm:mb-7 lg:mb-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() =>
                navigate("/customer/appointments")
              }
              aria-label="Back to appointments"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 hover:shadow-lg hover:shadow-violet-100/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:h-11 sm:w-11"
            >
              <FaArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 sm:text-xs">
                  Appointment
                </p>

                <span className="h-1 w-1 shrink-0 rounded-full bg-violet-300" />

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                  Booking details
                </p>
              </div>

              <h1 className="mt-1 break-words text-[clamp(1.35rem,5vw,2.25rem)] font-black leading-[1.1] tracking-tight text-slate-950">
                Appointment Details
              </h1>
            </div>
          </div>
        </header>

        {/* =====================================================
            ERROR BANNER
        ====================================================== */}

        {error && (
          <div className="mb-5 flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm font-semibold leading-6 text-red-700 shadow-sm sm:mb-6">
            <FaCircleExclamation className="mt-1 shrink-0" />

            <span className="min-w-0 break-words">
              {error}
            </span>
          </div>
        )}

        {/* =====================================================
            MAIN APPOINTMENT CARD
        ====================================================== */}

        <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 shadow-[0_25px_90px_rgba(76,29,149,0.10)] backdrop-blur-xl sm:rounded-[2rem]">
          {/* =================================================
              HERO
          ================================================== */}

          <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-5 py-6 text-white sm:px-7 sm:py-8 lg:px-9 lg:py-9">
            {/* Hero decorative lights */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:h-80 sm:w-80" />

            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl" />

            {/* Subtle decorative ring */}
            <div className="pointer-events-none absolute right-5 top-5 hidden h-32 w-32 rounded-full border border-white/10 sm:block lg:h-44 lg:w-44" />

            <div className="relative flex min-w-0 flex-col gap-6 sm:gap-7 lg:flex-row lg:items-center lg:justify-between">
              {/* Service */}
              <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/20 bg-white/15 text-xl shadow-lg shadow-violet-950/10 backdrop-blur-xl sm:h-16 sm:w-16 sm:rounded-[1.25rem] sm:text-2xl">
                  <FaScissors />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 sm:text-xs">
                    Selected service
                  </p>

                  <h2 className="mt-1.5 break-words text-[clamp(1.2rem,5vw,1.8rem)] font-black leading-tight tracking-tight text-white">
                    {appointment.service?.name ||
                      "Salon Service"}
                  </h2>

                  <p className="mt-1.5 flex min-w-0 items-start gap-2 text-sm leading-5 text-white/75">
                    <FaLocationDot className="mt-0.5 shrink-0 text-xs" />

                    <span className="min-w-0 break-words">
                      {appointment.salon?.name || "Salon"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex shrink-0 self-start lg:self-center">
                <span
                  className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] shadow-lg shadow-black/10 sm:px-5 sm:py-3 sm:text-xs ${
                    appointment.status === "CONFIRMED"
                      ? "border-white/20 bg-white/15 text-white backdrop-blur-xl"
                      : "border-white/20 bg-black/10 text-white backdrop-blur-xl"
                  }`}
                >
                  {appointment.status === "CONFIRMED" && (
                    <FaCircleCheck className="shrink-0" />
                  )}

                  <span className="break-words">
                    {appointment.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK INFO
          ================================================== */}

          <div className="border-b border-slate-100/90 bg-gradient-to-b from-white to-slate-50/50 p-4 sm:p-6 lg:p-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Date */}
              <div className="group rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/30 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <FaCalendarDays />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                  Date
                </p>

                <p className="mt-1.5 break-words text-sm font-black leading-6 text-slate-900 sm:text-[15px]">
                  {formatDate(
                    appointment.appointmentDate
                  )}
                </p>
              </div>

              {/* Time */}
              <div className="group rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/30 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <FaClock />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                  Time
                </p>

                <p className="mt-1.5 break-words text-sm font-black leading-6 text-slate-900 sm:text-[15px]">
                  {appointment.startTime || "—"}

                  {appointment.endTime
                    ? ` - ${appointment.endTime}`
                    : ""}
                </p>
              </div>

              {/* Stylist */}
              <div className="group rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/30 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <FaUser />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                  Stylist
                </p>

                <p className="mt-1.5 break-words text-sm font-black leading-6 text-slate-900 sm:text-[15px]">
                  {appointment.staff?.name || "—"}
                </p>
              </div>

              {/* Location */}
              <div className="group rounded-[1.25rem] border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/30 sm:p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition duration-300 group-hover:bg-violet-600 group-hover:text-white">
                  <FaLocationDot />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                  Location
                </p>

                <p className="mt-1.5 break-words text-sm font-black leading-6 text-slate-900 sm:text-[15px]">
                  {appointment.salon?.city || "Salon"}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              BOOKING INFORMATION
          ================================================== */}

          <div className="border-b border-slate-100 p-5 sm:p-7 lg:p-8">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 sm:text-xs">
                  Reservation overview
                </p>

                <h3 className="mt-1 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Booking information
                </h3>
              </div>

              <div className="hidden h-px flex-1 bg-gradient-to-r from-violet-100 to-transparent sm:ml-6 sm:block" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Price */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-100/50 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                    Service price
                  </p>

                  <p className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    ₹{appointment.service?.price ?? "—"}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="relative overflow-hidden rounded-[1.25rem] border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-fuchsia-100/50 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                    Service duration
                  </p>

                  <p className="mt-2 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    {appointment.service?.duration
                      ? `${appointment.service.duration} min`
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2">
                  <FaLocationDot className="shrink-0 text-violet-600" />

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                    Salon address
                  </p>
                </div>

                <p className="mt-2 break-words text-sm font-bold leading-6 text-slate-700">
                  {appointment.salon?.address ||
                    "Address unavailable"}
                </p>
              </div>

              {/* Appointment ID */}
              <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex items-center gap-2">
                  <FaCheck className="shrink-0 text-violet-600" />

                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-xs">
                    Appointment ID
                  </p>
                </div>

                <p className="mt-2 break-all font-mono text-xs font-bold leading-5 text-slate-600 sm:text-sm">
                  {appointment._id}
                </p>
              </div>
            </div>

            {/* =================================================
                NOTES
            ================================================== */}

            {appointment.notes && (
              <div className="relative mt-5 overflow-hidden rounded-[1.25rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-purple-50/70 to-fuchsia-50/50 p-5 sm:p-6">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-violet-200/30 blur-2xl" />

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500 shadow-sm shadow-violet-300" />

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 sm:text-xs">
                      Your notes
                    </p>
                  </div>

                  <p className="mt-3 break-words text-sm leading-7 text-violet-950 sm:text-[15px]">
                    {appointment.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="bg-gradient-to-b from-white to-slate-50/70 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate("/customer/appointments")
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-lg hover:shadow-violet-100/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:w-auto"
              >
                <FaArrowLeft />
                Back to Appointments
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancel(true)}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-200/50 transition duration-300 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-200/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200 sm:w-auto"
                >
                  <FaXmark />
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Bottom breathing space */}
        <div className="h-5 sm:h-8" />
      </main>

      {/* =======================================================
          CANCEL MODAL
      ======================================================== */}

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md sm:items-center sm:p-5">
          <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/30 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:rounded-[2rem]">
            {/* Modal top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-fuchsia-500" />

            <div className="p-5 sm:p-7">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 shadow-inner">
                <FaCircleExclamation className="text-xl" />
              </div>

              <h2 className="mt-5 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Cancel appointment?
              </h2>

              <p className="mt-3 break-words text-sm leading-6 text-slate-500 sm:text-[15px]">
                This will mark your appointment as cancelled.
                You can no longer use this booking after
                cancellation.
              </p>

              {/* Appointment summary */}
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Booking
                </p>

                <p className="mt-1 break-words text-sm font-black text-slate-900">
                  {appointment.service?.name ||
                    "Salon Service"}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                  {formatDate(
                    appointment.appointmentDate
                  )}

                  {appointment.startTime
                    ? ` • ${appointment.startTime}`
                    : ""}
                </p>
              </div>

              {/* Modal actions */}
              <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowCancel(false)}
                  disabled={cancelling}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition duration-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Keep Appointment
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-200/40 transition duration-300 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                >
                  {cancelling ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaXmark />
                  )}

                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAppointmentDetails;