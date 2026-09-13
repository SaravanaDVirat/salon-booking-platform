import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarDays,
  FaCheck,
  FaCircleExclamation,
  FaClock,
  FaLocationDot,
  FaScissors,
  FaSpinner,
  FaStar,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

import {
  cancelCustomerAppointment,
  getCustomerAppointments,
} from "../../services/CustomerAppointmentService";

import CustomerReviewModal from "./CustomerReviewModal";

const CustomerMyAppointments = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("ALL");
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  /* =========================================================
      REVIEW STATE
  ========================================================= */

  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState({});

  /* =========================================================
      LOAD APPOINTMENTS
  ========================================================= */

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerAppointments();

      setAppointments(
        Array.isArray(data?.appointments)
          ? data.appointments
          : []
      );
    } catch (err) {
      console.error("Appointments error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* =========================================================
      FILTER
  ========================================================= */

  const filteredAppointments = useMemo(() => {
    if (filter === "ALL") return appointments;

    return appointments.filter(
      (appointment) => appointment.status === filter
    );
  }, [appointments, filter]);

  /* =========================================================
      DATE FORMAT
  ========================================================= */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
      STATUS STYLE
  ========================================================= */

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

  /* =========================================================
      CAN CANCEL
  ========================================================= */

  const canCancel = (appointment) => {
    return ![
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ].includes(appointment.status);
  };

  /* =========================================================
      CANCEL APPOINTMENT
  ========================================================= */

  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      setCancelling(true);

      await cancelCustomerAppointment(cancelId);

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment._id === cancelId
            ? {
                ...appointment,
                status: "CANCELLED",
              }
            : appointment
        )
      );

      setCancelId(null);
    } catch (err) {
      console.error("Cancel error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  /* =========================================================
      OPEN REVIEW
  ========================================================= */

  const handleOpenReview = (appointment) => {
    setReviewAppointment(appointment);
    setShowReviewModal(true);
  };

  /* =========================================================
      CLOSE REVIEW
  ========================================================= */

  const handleCloseReview = () => {
    if (reviewAppointment) {
      const appointmentId =
        reviewAppointment._id ||
        reviewAppointment.id;

      /*
        If the modal is currently submitting,
        CustomerReviewModal itself prevents closing.
      */

      setShowReviewModal(false);
      setReviewAppointment(null);
    }
  };

  /* =========================================================
      REVIEW SUCCESS
  ========================================================= */

  const handleReviewSuccess = () => {
    if (!reviewAppointment) return;

    const appointmentId =
      reviewAppointment._id ||
      reviewAppointment.id;

    if (appointmentId) {
      setReviewedAppointments((previous) => ({
        ...previous,
        [appointmentId]: true,
      }));
    }

    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#faf9fc] text-slate-900">

      {/* =====================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-violet-300/20 blur-[110px]" />

        <div className="absolute right-[-180px] top-[20%] h-[480px] w-[480px] rounded-full bg-fuchsia-300/15 blur-[120px]" />

        <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-purple-200/20 blur-[120px]" />
      </div>

      <main className="relative mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 sm:py-7 md:px-7 md:py-9 lg:px-10 lg:py-11 xl:px-12">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <section className="mb-7 sm:mb-9 lg:mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">

            {/* Header content */}

            <div className="min-w-0 max-w-3xl">

              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-xl sm:px-4">

                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />

                <span className="break-words text-[9px] font-black uppercase tracking-[0.18em] text-violet-700 sm:text-[10px] sm:tracking-[0.22em]">
                  Customer Dashboard
                </span>

              </div>

              <h1 className="max-w-full break-words text-[clamp(2rem,7vw,3.8rem)] font-black leading-[0.98] tracking-[-0.045em] text-slate-950">
                My Appointments
              </h1>

              <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                Track your salon bookings, appointment status and
                upcoming visits.
              </p>

            </div>

            {/* Book button */}

            <div className="w-full shrink-0 lg:w-auto">

              <button
                type="button"
                onClick={() => navigate("/salons")}
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-300/30 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-600 hover:bg-violet-600 hover:shadow-violet-200/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:px-6 lg:w-auto"
              >

                <span className="break-words">
                  Book a new appointment
                </span>

                <FaArrowRight className="shrink-0 text-xs transition-transform duration-300 group-hover:translate-x-1" />

              </button>

            </div>

          </div>
        </section>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <section className="mb-6">

          <div className="overflow-x-auto pb-1">

            <div className="flex min-w-max rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-lg shadow-slate-200/30 backdrop-blur-xl sm:p-2">

              {[
                ["ALL", "All"],
                ["PENDING", "Pending"],
                ["CONFIRMED", "Confirmed"],
                ["COMPLETED", "Completed"],
                ["CANCELLED", "Cancelled"],
              ].map(([value, label]) => (

                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`relative shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-black transition-all duration-300 sm:px-5 ${
                    filter === value
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-200/70"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>

              ))}

            </div>

          </div>

        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200/80 bg-red-50/90 p-4 shadow-sm backdrop-blur-xl sm:p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <FaCircleExclamation />
              </div>

              <div className="min-w-0 flex-1">

                <p className="break-words text-sm font-bold leading-6 text-red-700">
                  {error}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (

          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 px-5 py-20 text-center shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:py-24">

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 shadow-inner">

              <FaSpinner className="animate-spin text-2xl text-violet-600" />

            </div>

            <p className="mt-5 break-words text-sm font-bold text-slate-500">
              Loading your appointments...
            </p>

          </div>

        ) : filteredAppointments.length === 0 ? (

          /* =====================================================
             EMPTY STATE
          ====================================================== */

          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 px-5 py-20 text-center shadow-xl shadow-slate-200/40 backdrop-blur-xl sm:px-8 sm:py-24">

            <div className="absolute left-1/2 top-0 h-1 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-2xl text-violet-600 shadow-lg shadow-violet-100">
              <FaCalendarDays />
            </div>

            <h2 className="mt-6 break-words text-[clamp(1.3rem,5vw,1.75rem)] font-black tracking-tight text-slate-900">
              No appointments found
            </h2>

            <p className="mx-auto mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
              You don't have any appointments in this category
              yet.
            </p>

            <button
              type="button"
              onClick={() => navigate("/salons")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-violet-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
            >
              Explore Salons
              <FaArrowRight className="text-xs" />
            </button>

          </div>

        ) : (

          /* =====================================================
             APPOINTMENT GRID
          ====================================================== */

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">

            {filteredAppointments.map((appointment) => {

              const appointmentId =
                appointment._id || appointment.id;

              const hasBeenReviewed =
                !!reviewedAppointments[appointmentId];

              return (

                <article
                  key={appointment._id}
                  className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-lg shadow-slate-200/35 transition-all duration-500 hover:-translate-y-1 hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100/50"
                >

                  {/* Premium top accent */}

                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-80" />

                  {/* =================================================
                      CARD TOP
                  ================================================== */}

                  <div className="border-b border-slate-100/90 p-4 pt-6 sm:p-6 sm:pt-7">

                    <div className="flex items-start gap-3 sm:gap-4">

                      {/* Service icon */}

                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-600 shadow-sm ring-1 ring-violet-100 sm:h-14 sm:w-14">

                        <FaScissors className="text-base sm:text-lg" />

                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-white" />

                      </div>

                      {/* Service information */}

                      <div className="min-w-0 flex-1 pr-1">

                        <h2 className="max-w-full break-words text-base font-black leading-6 tracking-tight text-slate-950 sm:text-lg sm:leading-7">
                          {appointment.service?.name ||
                            "Salon Service"}
                        </h2>

                        <div className="mt-1.5 flex items-start gap-1.5">

                          <FaLocationDot className="mt-0.5 shrink-0 text-[11px] text-violet-500" />

                          <p className="min-w-0 break-words text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            {appointment.salon?.name ||
                              "Salon"}
                          </p>

                        </div>

                      </div>

                      {/* Status */}

                      <span
                        className={`max-w-[42%] shrink-0 break-words rounded-full border px-2.5 py-1.5 text-center text-[9px] font-black uppercase leading-4 tracking-[0.08em] sm:px-3 sm:text-[10px] sm:tracking-wider ${getStatusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================== */}

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-6">

                    {/* Date */}

                    <div className="group/detail rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-all duration-300 hover:border-violet-100 hover:shadow-sm">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <FaCalendarDays className="text-sm" />
                      </div>

                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Date
                      </p>

                      <p className="mt-1.5 break-words text-sm font-black leading-5 text-slate-800">
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </p>

                    </div>

                    {/* Time */}

                    <div className="group/detail rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-all duration-300 hover:border-violet-100 hover:shadow-sm">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <FaClock className="text-sm" />
                      </div>

                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Time
                      </p>

                      <p className="mt-1.5 break-words text-sm font-black leading-5 text-slate-800">
                        {appointment.startTime || "—"}
                      </p>

                    </div>

                    {/* Stylist */}

                    <div className="group/detail rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition-all duration-300 hover:border-violet-100 hover:shadow-sm">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <FaUser className="text-sm" />
                      </div>

                      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Stylist
                      </p>

                      <p className="mt-1.5 break-words text-sm font-black leading-5 text-slate-800">
                        {appointment.staff?.name || "—"}
                      </p>

                    </div>

                  </div>

                  {/* =================================================
                      FOOTER
                  ================================================== */}

                  <div className="border-t border-slate-100/90 p-4 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* Appointment ID */}

                      <div className="min-w-0 flex-1">

                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                          Appointment ID
                        </p>

                        <p className="mt-1 break-all font-mono text-[10px] font-bold leading-5 text-slate-500 sm:text-xs">
                          {appointment._id}
                        </p>

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================== */}

                      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:shrink-0">

                        {/* =================================================
                            REVIEW BUTTON
                        ================================================== */}

                        {appointment.status === "COMPLETED" &&
                          (hasBeenReviewed ? (

                            <div
                              className="
                                inline-flex
                                min-h-[44px]
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-emerald-200
                                bg-emerald-50
                                px-4
                                py-3
                                text-xs
                                font-black
                                text-emerald-600
                                sm:min-h-0
                              "
                            >
                              <FaCheck className="shrink-0" />
                              <span>Review Submitted</span>
                            </div>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenReview(
                                  appointment
                                )
                              }
                              className="
                                group/review
                                inline-flex
                                min-h-[44px]
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-amber-400
                                to-orange-500
                                px-4
                                py-3
                                text-xs
                                font-black
                                text-white
                                shadow-md
                                shadow-orange-200
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:shadow-lg
                                hover:shadow-orange-300
                                focus:outline-none
                                focus-visible:ring-4
                                focus-visible:ring-orange-100
                                sm:min-h-0
                              "
                            >
                              <FaStar
                                className="
                                  shrink-0
                                  transition-transform
                                  duration-300
                                  group-hover/review:rotate-12
                                "
                              />

                              <span>
                                Write Review
                              </span>
                            </button>

                          ))}

                        {/* =================================================
                            CANCEL
                        ================================================== */}

                        {canCancel(appointment) && (

                          <button
                            type="button"
                            onClick={() =>
                              setCancelId(
                                appointment._id
                              )
                            }
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition-all duration-300 hover:border-red-200 hover:bg-red-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100 sm:min-h-0"
                          >

                            <FaXmark className="shrink-0" />

                            <span>
                              Cancel
                            </span>

                          </button>

                        )}

                        {/* =================================================
                            VIEW DETAILS
                        ================================================== */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/customer/appointments/${appointment._id}`
                            )
                          }
                          className="group/view inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white shadow-md shadow-slate-200 transition-all duration-300 hover:bg-violet-600 hover:shadow-violet-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 sm:min-h-0"
                        >

                          <span>
                            View Details
                          </span>

                          <FaArrowRight className="shrink-0 text-[10px] transition-transform duration-300 group-hover/view:translate-x-1" />

                        </button>

                      </div>

                    </div>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </main>

      {/* =========================================================
          CANCEL MODAL
      ========================================================== */}

      {cancelId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-md sm:p-5">

          <div className="relative my-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.30)]">

            {/* Modal accent */}

            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500" />

            <div className="p-5 sm:p-7">

              {/* Icon */}

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 shadow-sm sm:h-16 sm:w-16">
                <FaCircleExclamation className="text-xl sm:text-2xl" />
              </div>

              {/* Content */}

              <h2 className="mt-5 break-words text-[clamp(1.3rem,6vw,1.6rem)] font-black leading-tight tracking-tight text-slate-950">
                Cancel appointment?
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                Are you sure you want to cancel this appointment?
                This action will change its status to cancelled.
              </p>

              {/* Buttons */}

              <div className="mt-7 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">

                <button
                  type="button"
                  onClick={() => setCancelId(null)}
                  disabled={cancelling}
                  className="min-h-[46px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
                >
                  Keep Appointment
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-200 transition-all duration-300 hover:bg-red-700 hover:shadow-red-300 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                >

                  {cancelling && (
                    <FaSpinner className="shrink-0 animate-spin" />
                  )}

                  <span className="break-words">
                    {cancelling
                      ? "Cancelling..."
                      : "Yes, Cancel"}
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =========================================================
          CUSTOMER REVIEW MODAL
      ========================================================== */}

      <CustomerReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReview}
        appointment={reviewAppointment}
        onSuccess={handleReviewSuccess}
      />

    </div>
  );
};

export default CustomerMyAppointments;