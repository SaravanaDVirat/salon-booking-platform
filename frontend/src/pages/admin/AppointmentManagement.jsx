import { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaSyncAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaStore,
  FaConciergeBell,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaRupeeSign,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaBan,
  FaTimesCircle,
  FaArrowRight,
  FaChevronDown,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  getAllAppointmentsAdmin,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../services/appointmentService";


// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: FaHourglassHalf,
    className:
      "border border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100",
  },

  CONFIRMED: {
    label: "Confirmed",
    icon: FaCheckCircle,
    className:
      "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100",
  },

  COMPLETED: {
    label: "Completed",
    icon: FaCheckCircle,
    className:
      "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: FaBan,
    className:
      "border border-red-200 bg-red-50 text-red-700 shadow-sm shadow-red-100",
  },

  REJECTED: {
    label: "Rejected",
    icon: FaTimesCircle,
    className:
      "border border-gray-200 bg-gray-100 text-gray-700 shadow-sm shadow-gray-100",
  },
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// =====================================================
// FORMAT FULL DATE
// =====================================================

const formatFullDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};


// =====================================================
// FORMAT TIME
// =====================================================

const formatTime = (time) => {
  if (!time) return "-";

  const [hour, minute] = time.split(":");

  const date = new Date();

  date.setHours(Number(hour));
  date.setMinutes(Number(minute));

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};


// =====================================================
// GET STATUS CONFIG
// =====================================================

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      icon: FaExclamationTriangle,
      className:
        "border border-gray-200 bg-gray-100 text-gray-700",
    }
  );
};


// =====================================================
// MAIN COMPONENT
// =====================================================

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [cancellingAppointment, setCancellingAppointment] =
    useState(false);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD APPOINTMENTS
  // ===================================================

  const loadAppointments = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllAppointmentsAdmin();

      setAppointments(data.appointments || []);
    } catch (error) {
      console.error(
        "Failed to load appointments:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to load appointments"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadAppointments();
  }, []);


  // ===================================================
  // STATISTICS
  // ===================================================

  const stats = useMemo(() => {
    return {
      total: appointments.length,

      pending: appointments.filter(
        (item) => item.status === "PENDING"
      ).length,

      confirmed: appointments.filter(
        (item) => item.status === "CONFIRMED"
      ).length,

      completed: appointments.filter(
        (item) => item.status === "COMPLETED"
      ).length,

      cancelled: appointments.filter(
        (item) =>
          item.status === "CANCELLED" ||
          item.status === "REJECTED"
      ).length,
    };
  }, [appointments]);


  // ===================================================
  // FILTER APPOINTMENTS
  // ===================================================

  const filteredAppointments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const customerName =
        appointment.customer?.name?.toLowerCase() || "";

      const customerEmail =
        appointment.customer?.email?.toLowerCase() || "";

      const customerPhone =
        appointment.customer?.phone?.toLowerCase() || "";

      const salonName =
        appointment.salon?.name?.toLowerCase() || "";

      const serviceName =
        appointment.service?.name?.toLowerCase() || "";

      const staffName =
        appointment.staff?.name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        salonName.includes(searchValue) ||
        serviceName.includes(searchValue) ||
        staffName.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        appointment.status === statusFilter;

      const appointmentDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate)
            .toISOString()
            .split("T")[0]
        : "";

      const matchesDate =
        !dateFilter ||
        appointmentDate === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    appointments,
    search,
    statusFilter,
    dateFilter,
  ]);


  // ===================================================
  // VIEW DETAILS
  // ===================================================

  const handleViewDetails = async (id) => {
    try {
      const data = await getAppointmentById(id);

      setSelectedAppointment(data.appointment);

      setShowDetailsModal(true);
    } catch (error) {
      console.error(
        "Failed to fetch appointment details:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to fetch appointment details"
      );
    }
  };


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingStatus(true);

      const data = await updateAppointmentStatus(
        id,
        status
      );

      const updatedAppointment =
        data.appointment;

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                ...updatedAppointment,
                status,
              }
            : item
        )
      );

      setSelectedAppointment((prev) =>
        prev?._id === id
          ? {
              ...prev,
              ...updatedAppointment,
              status,
            }
          : prev
      );
    } catch (error) {
      console.error(
        "Failed to update status:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update appointment status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  // ===================================================
  // CANCEL APPOINTMENT
  // ===================================================

  const handleCancelAppointment = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingAppointment(true);

      const data = await cancelAppointment(id);

      const cancelledAppointment =
        data.appointment;

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                ...cancelledAppointment,
                status: "CANCELLED",
              }
            : item
        )
      );

      setSelectedAppointment((prev) =>
        prev?._id === id
          ? {
              ...prev,
              ...cancelledAppointment,
              status: "CANCELLED",
            }
          : prev
      );

      alert(
        "Appointment cancelled successfully"
      );
    } catch (error) {
      console.error(
        "Failed to cancel appointment:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to cancel appointment"
      );
    } finally {
      setCancellingAppointment(false);
    }
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 pt-16">
        <div className="w-full max-w-xs text-center">

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
            <FaCalendarAlt className="absolute text-indigo-600" />
          </div>

          <p className="mt-6 text-sm font-bold text-slate-700">
            Loading appointments...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment
          </p>

        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_32%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] px-2.5 pb-6 pt-14 max-[359px]:px-2 max-[359px]:pt-12 sm:px-5 sm:pb-8 sm:pt-20 lg:px-7 lg:pb-10 lg:pt-24 xl:px-10">


      {/* ================================================= */}
{/* HEADER */}
{/* ================================================= */}

<div className="relative mb-5 overflow-hidden rounded-2xl border border-indigo-100/80 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl max-[359px]:rounded-xl sm:mb-6 sm:rounded-3xl lg:mb-7">

  {/* Decorative background */}

  <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-blue-100/30 blur-3xl" />


  <div className="relative p-3.5 sm:p-6 lg:p-7 xl:p-8">

    <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      {/* Heading */}

      <div className="min-w-0 w-full flex-1">

        {/* Breadcrumb */}

        <div className="flex min-w-0 items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs sm:tracking-[0.16em]">

          <span className="shrink-0">
            Admin
          </span>

          <FaArrowRight className="shrink-0 text-[8px]" />

          <span className="min-w-0 truncate">
            Appointments
          </span>

        </div>


        {/* Main Heading */}

        <h1
          className="
            mt-2
            w-full
            whitespace-normal
            text-[clamp(1.55rem,7.5vw,2.25rem)]
            font-black
            leading-[1.08]
            tracking-[-0.035em]
            text-slate-950
            sm:text-3xl
            sm:leading-tight
            lg:text-4xl
            xl:text-[2.6rem]
          "
        >
          Appointment Management
        </h1>


        {/* Description */}

        <p
          className="
            mt-2
            w-full
            max-w-3xl
            whitespace-normal
            text-xs
            leading-5
            text-slate-500
            sm:text-sm
            sm:leading-6
            lg:text-[15px]
            lg:leading-7
          "
        >
          Monitor and manage all salon appointments from one place.
        </p>

      </div>


      {/* Refresh */}

      <button
        type="button"
        onClick={() => loadAppointments(true)}
        disabled={refreshing}
        className="
          group
          inline-flex
          min-h-[44px]
          w-full
          shrink-0
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gradient-to-r
          from-indigo-600
          to-indigo-700
          px-5
          py-2.5
          text-sm
          font-bold
          text-white
          shadow-lg
          shadow-indigo-200/70
          transition
          duration-300
          hover:-translate-y-0.5
          hover:from-indigo-700
          hover:to-indigo-800
          hover:shadow-xl
          hover:shadow-indigo-200
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:w-auto
          sm:min-w-[120px]
        "
      >

        <FaSyncAlt
          className={`transition-transform duration-500 ${
            refreshing
              ? "animate-spin"
              : "group-hover:rotate-180"
          }`}
        />

        {refreshing
          ? "Refreshing..."
          : "Refresh"}

      </button>

    </div>

  </div>

</div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-red-200/80 bg-white shadow-sm sm:mb-6">

          <div className="flex items-start gap-3 border-l-4 border-red-500 bg-red-50/70 p-4 sm:p-5">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FaExclamationTriangle />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-sm font-black text-red-800">
                Unable to load appointments
              </p>

              <p className="mt-1 text-sm leading-5 text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() => loadAppointments()}
                className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try again
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* STAT CARDS */}
      {/* ================================================= */}

      <div className="mb-5 grid min-w-0 grid-cols-2 gap-2.5 sm:mb-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">

        <StatCard
          title="Total"
          value={stats.total}
          icon={<FaCalendarAlt />}
          iconClass="bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<FaHourglassHalf />}
          iconClass="bg-amber-100 text-amber-700"
        />

        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={<FaCheckCircle />}
          iconClass="bg-blue-100 text-blue-700"
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<FaCheckCircle />}
          iconClass="bg-emerald-100 text-emerald-700"
        />

        <StatCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<FaBan />}
          iconClass="bg-red-100 text-red-700"
        />

      </div>


      {/* ================================================= */}
      {/* FILTER PANEL */}
      {/* ================================================= */}

      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl max-[359px]:rounded-xl max-[359px]:p-2 sm:mb-6 sm:rounded-3xl sm:p-5 lg:mb-7">

        <div className="mb-4 flex min-w-0 items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FaSearch className="text-sm" />
          </div>

          <div className="min-w-0">

            <h2 className="truncate text-sm font-black text-slate-900 sm:text-base">
              Find Appointments
            </h2>

            <p className="mt-0.5 truncate text-[11px] text-slate-400 sm:text-xs">
              Search and filter appointment records
            </p>

          </div>

        </div>


        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-12">

          {/* Search */}

          <div className="relative min-w-0 md:col-span-6 lg:col-span-6 xl:col-span-6">

            <FaSearch className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search customer, salon, service, staff..."
              className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

          </div>


          {/* Status */}

          <div className="relative min-w-0 md:col-span-3 lg:col-span-3 xl:col-span-3">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-0 pr-10 text-sm font-semibold leading-normal !text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >

              <option value="ALL">
                All Status
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="CONFIRMED">
                Confirmed
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="REJECTED">
                Rejected
              </option>

            </select>

            <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-slate-400" />

          </div>


          {/* Date */}

          <div className="relative min-w-0 md:col-span-3 lg:col-span-3 xl:col-span-3">

            <FaCalendarAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-3 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

          </div>

        </div>


        {/* Result Count */}

        <div className="mt-4 flex min-w-0 flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="min-w-0 text-xs leading-5 text-slate-500 sm:text-sm">

            Showing{" "}

            <span className="font-black text-slate-900">
              {filteredAppointments.length}
            </span>{" "}

            of{" "}

            <span className="font-black text-slate-900">
              {appointments.length}
            </span>{" "}

            appointments

          </p>


          {(search ||
            statusFilter !== "ALL" ||
            dateFilter) && (

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setDateFilter("");
              }}
              className="self-start rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:self-auto"
            >
              Clear filters
            </button>

          )}

        </div>

      </div>


      {/* ================================================= */}
      {/* DESKTOP / LAPTOP PREMIUM CARDS */}
      {/* ================================================= */}

      <div className="hidden min-w-0 space-y-4 lg:block xl:space-y-5">

        {/* Section Header */}

        <div className="flex min-w-0 items-end justify-between gap-4 px-1">

          <div className="min-w-0">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
              Appointment Records
            </p>

            <h2 className="mt-1 truncate text-xl font-black tracking-tight text-slate-900 xl:text-2xl">
              All Appointments
            </h2>

          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
            {filteredAppointments.length} Records
          </div>

        </div>


        {filteredAppointments.map(
          (appointment) => (
            <AppointmentRow
              key={appointment._id}
              appointment={appointment}
              onView={handleViewDetails}
              onStatusChange={
                handleStatusChange
              }
              onCancel={
                handleCancelAppointment
              }
              updatingStatus={
                updatingStatus
              }
              cancellingAppointment={
                cancellingAppointment
              }
            />
          )
        )}


        {filteredAppointments.length === 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <EmptyState />
          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* MOBILE / TABLET CARDS */}
      {/* ================================================= */}

      <div className="min-w-0 space-y-3 lg:hidden">

        {filteredAppointments.map(
          (appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onView={handleViewDetails}
              onStatusChange={
                handleStatusChange
              }
              onCancel={
                handleCancelAppointment
              }
              updatingStatus={
                updatingStatus
              }
              cancellingAppointment={
                cancellingAppointment
              }
            />
          )
        )}


        {filteredAppointments.length === 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState />
          </div>
        )}

      </div>


      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {showDetailsModal &&
        selectedAppointment && (

          <AppointmentDetailsModal
            appointment={
              selectedAppointment
            }
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedAppointment(null);
            }}
            onStatusChange={
              handleStatusChange
            }
            onCancel={
              handleCancelAppointment
            }
            updatingStatus={
              updatingStatus
            }
            cancellingAppointment={
              cancellingAppointment
            }
          />

        )}

    </div>
  );
};


// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  value,
  icon,
  iconClass,
}) => {
  return (
    <div className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 max-[359px]:rounded-xl max-[359px]:p-2.5 sm:rounded-2xl sm:p-4 lg:p-5">

      <div className="flex min-w-0 items-start justify-between gap-2.5 sm:gap-3">

        <div className="min-w-0">

          <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[10px] sm:tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl font-black tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">
            {value}
          </p>

        </div>


        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm transition duration-300 group-hover:scale-110 sm:h-11 sm:w-11 sm:text-base ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};


// =====================================================
// STATUS BADGE
// =====================================================

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide sm:text-[10px] ${config.className}`}
    >

      <Icon className="shrink-0" />

      <span className="truncate">
        {config.label}
      </span>

    </span>
  );
};


// =====================================================
// DESKTOP / LAPTOP APPOINTMENT CARD
// =====================================================

const AppointmentRow = ({
  appointment,
  onView,
  onStatusChange,
  onCancel,
  updatingStatus,
  cancellingAppointment,
}) => {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_8px_32px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)]">

      {/* Top Accent */}

      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400" />


      <div className="p-5 xl:p-6">

        {/* Header */}

        <div className="flex min-w-0 items-start justify-between gap-5">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shadow-inner">
              <FaUser />
            </div>

            <div className="min-w-0">

              <p className="truncate text-base font-black text-slate-900 xl:text-lg">
                {appointment.customer?.name ||
                  "Unknown Customer"}
              </p>

              <div className="mt-1 flex min-w-0 items-center gap-2">

                <FaPhone className="shrink-0 text-[10px] text-slate-400" />

                <p className="truncate text-xs font-medium text-slate-500">
                  {appointment.customer?.phone ||
                    appointment.customer?.email ||
                    "-"}
                </p>

              </div>

            </div>

          </div>


          <div className="shrink-0">
            <StatusBadge
              status={appointment.status}
            />
          </div>

        </div>


        {/* Details */}

        <div className="mt-5 grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">

          <DesktopInfo
            icon={<FaStore />}
            label="Salon"
            value={
              appointment.salon?.name || "-"
            }
          />

          <DesktopInfo
            icon={<FaConciergeBell />}
            label="Service"
            value={
              appointment.service?.name || "-"
            }
            secondary={
              appointment.service?.price !==
              undefined
                ? `₹${appointment.service.price}`
                : ""
            }
          />

          <DesktopInfo
            icon={<FaUserTie />}
            label="Staff"
            value={
              appointment.staff?.name || "-"
            }
            secondary={
              appointment.staff
                ?.specialization || ""
            }
          />

          <DesktopInfo
            icon={<FaCalendarAlt />}
            label="Schedule"
            value={formatDate(
              appointment.appointmentDate
            )}
            secondary={`${formatTime(
              appointment.startTime
            )} - ${formatTime(
              appointment.endTime
            )}`}
          />

        </div>


        {/* Actions */}

        <div className="mt-5 flex min-w-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">

          {/* View */}

          <button
            type="button"
            onClick={() =>
              onView(appointment._id)
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-900 hover:text-white hover:shadow-lg"
            title="View details"
          >
            <FaEye />
            <span>View Details</span>
          </button>


          {/* Status */}

          <StatusDropdown
            status={appointment.status}
            onChange={(status) =>
              onStatusChange(
                appointment._id,
                status
              )
            }
            disabled={
              updatingStatus ||
              cancellingAppointment
            }
          />


          {/* Cancel */}

          {(appointment.status === "PENDING" ||
            appointment.status === "CONFIRMED") && (

            <button
              type="button"
              onClick={() =>
                onCancel(appointment._id)
              }
              disabled={
                cancellingAppointment ||
                updatingStatus
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-bold text-red-600 shadow-sm transition duration-200 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Cancel appointment"
            >

              {cancellingAppointment ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
              ) : (
                <FaBan />
              )}

              <span>
                {cancellingAppointment
                  ? "Cancelling..."
                  : "Cancel"}
              </span>

            </button>

          )}

        </div>

      </div>

    </div>
  );
};


// =====================================================
// DESKTOP INFO
// =====================================================

const DesktopInfo = ({
  icon,
  label,
  value,
  secondary,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:border-indigo-100 hover:bg-indigo-50/30">

      <div className="flex min-w-0 items-center gap-2">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-indigo-500 shadow-sm">
          {icon}
        </div>

        <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

      </div>


      <p className="mt-2 break-words text-sm font-black leading-5 text-slate-800">
        {value}
      </p>


      {secondary && (
        <p className="mt-1 truncate text-xs font-medium text-slate-500">
          {secondary}
        </p>
      )}

    </div>
  );
};


// =====================================================
// MOBILE CARD
// =====================================================

const AppointmentCard = ({
  appointment,
  onView,
  onStatusChange,
  onCancel,
  updatingStatus,
  cancellingAppointment,
}) => {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_7px_25px_rgba(15,23,42,0.055)] transition duration-300 hover:border-indigo-200 hover:shadow-lg max-[359px]:rounded-xl sm:rounded-2xl">

      {/* Accent */}

      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400" />


      <div className="min-w-0 p-3 max-[359px]:p-2.5 sm:p-4">

        {/* Header */}

        <div className="flex min-w-0 flex-col gap-3 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between">

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm text-slate-600 shadow-inner sm:h-11 sm:w-11">
              <FaUser />
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-black text-slate-900 sm:text-base">
                {appointment.customer?.name ||
                  "Unknown Customer"}
              </p>

              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                {appointment.customer?.phone ||
                  appointment.customer?.email ||
                  "-"}
              </p>

            </div>

          </div>


          <div className="shrink-0 self-start">
            <StatusBadge
              status={appointment.status}
            />
          </div>

        </div>


        {/* Main Details */}

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">

          <InfoItem
            icon={<FaStore />}
            label="Salon"
            value={
              appointment.salon?.name || "-"
            }
          />

          <InfoItem
            icon={<FaConciergeBell />}
            label="Service"
            value={
              appointment.service?.name || "-"
            }
          />

          <InfoItem
            icon={<FaUserTie />}
            label="Staff"
            value={
              appointment.staff?.name || "-"
            }
          />

          <InfoItem
            icon={<FaCalendarAlt />}
            label="Appointment"
            value={formatDate(
              appointment.appointmentDate
            )}
          />

        </div>


        {/* Time / Price */}

        <div className="mt-3 flex min-w-0 flex-col gap-2 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-3 py-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">

          <div className="flex min-w-0 items-center gap-2 text-slate-600">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs text-indigo-500 shadow-sm">
              <FaClock />
            </div>

            <span className="truncate text-xs font-bold sm:text-sm">
              {formatTime(
                appointment.startTime
              )}

              {" - "}

              {formatTime(
                appointment.endTime
              )}
            </span>

          </div>


          <span className="text-sm font-black text-slate-900 min-[360px]:text-right">

            ₹
            {appointment.service?.price ??
              0}

          </span>

        </div>


        {/* Actions */}

        <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">

          {/* View */}

          <button
            type="button"
            onClick={() =>
              onView(appointment._id)
            }
            className="flex min-h-[42px] min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-900 hover:text-white sm:text-sm"
          >
            <FaEye className="shrink-0" />

            <span>
              View Details
            </span>

          </button>


          {/* Status */}

          <StatusDropdown
            status={appointment.status}
            onChange={(status) =>
              onStatusChange(
                appointment._id,
                status
              )
            }
            disabled={
              updatingStatus ||
              cancellingAppointment
            }
            fullWidth
          />


          {/* Cancel */}

          {(appointment.status === "PENDING" ||
            appointment.status === "CONFIRMED") && (

            <button
              type="button"
              onClick={() =>
                onCancel(appointment._id)
              }
              disabled={
                cancellingAppointment ||
                updatingStatus
              }
              className="flex min-h-[42px] w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 sm:text-sm"
            >

              {cancellingAppointment ? (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
              ) : (
                <FaBan className="shrink-0" />
              )}

              <span>
                {cancellingAppointment
                  ? "Cancelling..."
                  : "Cancel Appointment"}
              </span>

            </button>

          )}

        </div>

      </div>

    </div>
  );
};


// =====================================================
// INFO ITEM
// =====================================================

const InfoItem = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:gap-3 sm:p-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs text-indigo-500 sm:h-9 sm:w-9">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-bold leading-5 text-slate-800 sm:text-sm">
          {value}
        </p>

      </div>

    </div>
  );
};


// =====================================================
// STATUS DROPDOWN
// =====================================================

const StatusDropdown = ({
  status,
  onChange,
  disabled,
  fullWidth = false,
}) => {
  return (
    <div
      className={
        fullWidth
          ? "relative w-full min-w-0"
          : "relative min-w-0"
      }
    >

      <select
        value={status}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`h-10 min-w-0 appearance-none rounded-xl border border-slate-200 bg-white px-3 py-0 pr-9 text-xs font-black leading-normal !text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 ${
          fullWidth ? "w-full" : ""
        }`}
      >

        <option value="PENDING">
          Pending
        </option>

        <option value="CONFIRMED">
          Confirmed
        </option>

        <option value="COMPLETED">
          Completed
        </option>

        <option value="CANCELLED">
          Cancelled
        </option>

        <option value="REJECTED">
          Rejected
        </option>

      </select>

      <FaChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400" />

    </div>
  );
};


// =====================================================
// DETAILS MODAL
// =====================================================

const AppointmentDetailsModal = ({
  appointment,
  onClose,
  onStatusChange,
  onCancel,
  updatingStatus,
  cancellingAppointment,
}) => {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/65 px-2 py-2 backdrop-blur-md sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative my-auto flex max-h-[calc(100dvh-16px)] w-full max-w-4xl min-w-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_30px_100px_rgba(2,6,23,0.3)] max-[359px]:rounded-xl sm:max-h-[calc(100dvh-40px)] sm:rounded-3xl">


        {/* Modal Header */}

        <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-r from-white via-white to-indigo-50/70 px-3.5 py-3.5 sm:px-6 sm:py-5">

          <div className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl" />

          <div className="relative flex min-w-0 items-center justify-between gap-3">

            <div className="min-w-0">

              <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500 sm:text-xs">
                Appointment Details
              </p>

              <h2 className="mt-1 truncate text-base font-black text-slate-900 sm:text-xl">
                Booking Information
              </h2>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-600 transition hover:bg-slate-900 hover:text-white sm:h-10 sm:w-10"
            >
              <FaTimes />
            </button>

          </div>

        </div>


        {/* Modal Body */}

        <div className="min-h-0 overflow-y-auto p-3 sm:p-6">

          {/* Status */}

          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-3 shadow-sm sm:p-4">

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="min-w-0">

                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                  Current Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      appointment.status
                    }
                  />
                </div>

              </div>


              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">

                <StatusDropdown
                  status={
                    appointment.status
                  }
                  onChange={(status) =>
                    onStatusChange(
                      appointment._id,
                      status
                    )
                  }
                  disabled={
                    updatingStatus ||
                    cancellingAppointment
                  }
                  fullWidth
                />


                {(appointment.status ===
                  "PENDING" ||
                  appointment.status ===
                    "CONFIRMED") && (

                  <button
                    type="button"
                    onClick={() =>
                      onCancel(
                        appointment._id
                      )
                    }
                    disabled={
                      cancellingAppointment ||
                      updatingStatus
                    }
                    className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {cancellingAppointment ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                    ) : (
                      <FaBan />
                    )}

                    {cancellingAppointment
                      ? "Cancelling..."
                      : "Cancel"}

                  </button>

                )}

              </div>

            </div>

          </div>


          {/* Customer */}

          <DetailSection
            title="Customer"
            icon={<FaUser />}
          >

            <DetailGrid>

              <DetailValue
                icon={<FaUser />}
                label="Name"
                value={
                  appointment.customer
                    ?.name || "-"
                }
              />

              <DetailValue
                icon={<FaEnvelope />}
                label="Email"
                value={
                  appointment.customer
                    ?.email || "-"
                }
              />

              <DetailValue
                icon={<FaPhone />}
                label="Phone"
                value={
                  appointment.customer
                    ?.phone || "-"
                }
              />

            </DetailGrid>

          </DetailSection>


          {/* Salon & Service */}

          <DetailSection
            title="Salon & Service"
            icon={<FaStore />}
          >

            <DetailGrid>

              <DetailValue
                icon={<FaStore />}
                label="Salon"
                value={
                  appointment.salon
                    ?.name || "-"
                }
              />

              <DetailValue
                icon={<FaConciergeBell />}
                label="Service"
                value={
                  appointment.service
                    ?.name || "-"
                }
              />

              <DetailValue
                icon={<FaRupeeSign />}
                label="Price"
                value={`₹${
                  appointment.service
                    ?.price ?? 0
                }`}
              />

              <DetailValue
                icon={<FaClock />}
                label="Duration"
                value={
                  appointment.service
                    ?.duration
                    ? `${appointment.service.duration} minutes`
                    : "-"
                }
              />

            </DetailGrid>

          </DetailSection>


          {/* Schedule */}

          <DetailSection
            title="Schedule"
            icon={<FaCalendarAlt />}
          >

            <DetailGrid>

              <DetailValue
                icon={<FaCalendarAlt />}
                label="Date"
                value={formatFullDate(
                  appointment.appointmentDate
                )}
              />

              <DetailValue
                icon={<FaClock />}
                label="Time"
                value={`${formatTime(
                  appointment.startTime
                )} - ${formatTime(
                  appointment.endTime
                )}`}
              />

              <DetailValue
                icon={<FaUserTie />}
                label="Staff"
                value={
                  appointment.staff
                    ?.name || "-"
                }
              />

              <DetailValue
                icon={<FaUserTie />}
                label="Specialization"
                value={
                  appointment.staff
                    ?.specialization ||
                  "-"
                }
              />

            </DetailGrid>

          </DetailSection>


          {/* Notes */}

          {appointment.notes && (

            <DetailSection
              title="Customer Notes"
              icon={<FaConciergeBell />}
            >

              <div className="break-words rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-6 text-slate-600 sm:p-4">
                {appointment.notes}
              </div>

            </DetailSection>

          )}


          {/* Footer */}

          <div className="mt-5 flex justify-end border-t border-slate-100 pt-4 sm:mt-6">

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-indigo-800 sm:w-auto"
            >
              Close
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


// =====================================================
// DETAIL SECTION
// =====================================================

const DetailSection = ({
  title,
  icon,
  children,
}) => {
  return (
    <section className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/40 p-3 sm:mt-6 sm:p-4">

      <div className="mb-3 flex min-w-0 items-center gap-2">

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs text-indigo-600">
          {icon}
        </span>

        <h3 className="truncate text-sm font-black text-slate-900">
          {title}
        </h3>

      </div>

      {children}

    </section>
  );
};


// =====================================================
// DETAIL GRID
// =====================================================

const DetailGrid = ({ children }) => {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
      {children}
    </div>
  );
};


// =====================================================
// DETAIL VALUE
// =====================================================

const DetailValue = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">

      <div className="flex min-w-0 items-center gap-2 text-slate-400">

        <span className="shrink-0 text-xs">
          {icon}
        </span>

        <span className="truncate text-[9px] font-black uppercase tracking-[0.12em] sm:text-[10px]">
          {label}
        </span>

      </div>

      <p className="mt-2 break-words text-sm font-bold leading-5 text-slate-800">
        {value}
      </p>

    </div>
  );
};


// =====================================================
// EMPTY STATE
// =====================================================

const EmptyState = () => {
  return (
    <div className="px-4 py-12 text-center sm:px-5 sm:py-16">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-400 shadow-inner">
        <FaCalendarAlt className="text-2xl" />
      </div>

      <h3 className="mt-5 text-base font-black text-slate-900 sm:text-lg">
        No appointments found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try changing your search or filters to find the appointments you are looking for.
      </p>

    </div>
  );
};


export default AppointmentManagement;