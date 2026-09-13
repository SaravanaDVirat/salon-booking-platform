import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../services/salonAppointmentService";

import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaStore,
  FaCut,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBan,
  FaEye,
  FaTimes,
  FaChevronDown,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
} from "react-icons/fa";

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [salonFilter, setSalonFilter] = useState("ALL");

  const [dateFilter, setDateFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [showSalonDropdown, setShowSalonDropdown] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null);

  // =====================================================
  // LOAD APPOINTMENTS
  // =====================================================

  const loadAppointments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllAppointments();

      setAppointments(
        Array.isArray(data.appointments)
          ? data.appointments
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load appointments"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // =====================================================
  // SALON LIST
  // =====================================================

  const salons = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      if (appointment.salon?._id) {
        map.set(
          appointment.salon._id,
          appointment.salon
        );
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT DATE FOR INPUT
  // =====================================================

  const getInputDate = (date) => {
    if (!date) return "";

    return new Date(date)
      .toISOString()
      .split("T")[0];
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Confirmed",
          icon: <FaCheckCircle />,
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          icon: <FaCheckCircle />,
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: <FaTimesCircle />,
          className:
            "border-red-200 bg-red-50 text-red-700",
        };

      case "REJECTED":
        return {
          label: "Rejected",
          icon: <FaBan />,
          className:
            "border-slate-200 bg-slate-100 text-slate-600",
        };

      default:
        return {
          label: "Pending",
          icon: <FaHourglassHalf />,
          className:
            "border-amber-200 bg-amber-50 text-amber-700",
        };
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredAppointments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const customerName =
        appointment.customer?.name?.toLowerCase() || "";

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
        customerPhone.includes(searchValue) ||
        salonName.includes(searchValue) ||
        serviceName.includes(searchValue) ||
        staffName.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        appointment.status === statusFilter;

      const matchesSalon =
        salonFilter === "ALL" ||
        appointment.salon?._id === salonFilter;

      const matchesDate =
        !dateFilter ||
        getInputDate(
          appointment.appointmentDate
        ) === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSalon &&
        matchesDate
      );
    });
  }, [
    appointments,
    search,
    statusFilter,
    salonFilter,
    dateFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

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

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusChange = async (
    appointment,
    status
  ) => {
    try {
      setUpdatingId(appointment._id);

      const data =
        await updateAppointmentStatus(
          appointment._id,
          status
        );

      const updated = data.appointment;

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appointment._id
            ? updated || {
                ...item,
                status,
              }
            : item
        )
      );

      if (
        selectedAppointment?._id ===
        appointment._id
      ) {
        setSelectedAppointment(
          updated || {
            ...appointment,
            status,
          }
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update appointment status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const openCancelModal = (appointment) => {
    setCancelTarget(appointment);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;

    try {
      setUpdatingId(cancelTarget._id);

      const data =
        await cancelAppointment(
          cancelTarget._id
        );

      const updated = data.appointment;

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === cancelTarget._id
            ? updated || {
                ...item,
                status: "CANCELLED",
              }
            : item
        )
      );

      if (
        selectedAppointment?._id ===
        cancelTarget._id
      ) {
        setSelectedAppointment(
          updated || {
            ...cancelTarget,
            status: "CANCELLED",
          }
        );
      }

      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to cancel appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSalonFilter("ALL");
    setDateFilter("");
  };

  // =====================================================
  // DETAILS
  // =====================================================

  const openDetails = async (appointment) => {
    if (!appointment?._id) return;

    setSelectedAppointment(appointment);
    setShowDetails(true);
    setDetailsLoading(true);

    try {
      const data =
        await getAppointmentById(
          appointment._id
        );

      if (data?.appointment) {
        setSelectedAppointment(
          data.appointment
        );

        setAppointments((prev) =>
          prev.map((item) =>
            item._id === appointment._id
              ? data.appointment
              : item
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch appointment details:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to fetch appointment details"
      );

      setShowDetails(false);
      setSelectedAppointment(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.10),transparent_30%),#f6f7fb] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="animate-pulse space-y-5 sm:space-y-6">
            <div className="h-28 rounded-[2rem] bg-white shadow-sm sm:h-32" />

            <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 rounded-2xl bg-white shadow-sm sm:h-36"
                  />
                )
              )}
            </div>

            <div className="h-24 rounded-2xl bg-white shadow-sm" />

            <div className="h-[500px] rounded-[2rem] bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full min-w-0 overflow-x-clip bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.11),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.06),transparent_25%),#f6f7fb] px-3 py-4 text-slate-900 sm:px-5 sm:py-6 md:px-6 lg:px-7 lg:py-7 xl:px-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="relative mb-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(30,41,59,0.07)] backdrop-blur-xl sm:mb-6 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-fuchsia-300/10 blur-3xl" />

          <div className="relative flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-violet-600 shadow-sm sm:text-[10px] sm:tracking-[0.17em]">
                <FaCalendarAlt className="shrink-0" />
                <span className="break-words">
                  Appointment Center
                </span>
              </div>

              <h1 className="max-w-full whitespace-nowrap text-[clamp(2rem,7vw,3.5rem)] font-black leading-[1.03] tracking-[-0.04em] text-slate-950">
  Appointments
</h1>

             <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
  View and manage appointments across your salons from one place.
</p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAppointments(true)
              }
              disabled={refreshing}
              className="group inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-[0_8px_25px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 hover:shadow-[0_12px_30px_rgba(124,58,237,0.12)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <FaSyncAlt
                className={
                  refreshing
                    ? "animate-spin"
                    : "transition-transform duration-300 group-hover:rotate-180"
                }
              />

              <span className="whitespace-nowrap">
                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {/* TOTAL */}

          <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white p-4 shadow-[0_14px_40px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(30,41,59,0.10)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/70 blur-2xl transition duration-300 group-hover:bg-violet-200/70" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 shadow-sm sm:h-12 sm:w-12">
                <FaCalendarAlt />
              </div>

              <span className="max-w-[55%] break-words text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400">
                Total
              </span>
            </div>

            <div className="relative mt-5 break-words text-[clamp(1.8rem,6vw,2.5rem)] font-black leading-none tracking-tight text-slate-900">
              {stats.total}
            </div>

            <p className="relative mt-2 break-words text-xs leading-5 text-slate-500">
              All appointments
            </p>
          </div>

          {/* PENDING */}

          <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white p-4 shadow-[0_14px_40px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(30,41,59,0.10)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100/70 blur-2xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm sm:h-12 sm:w-12">
                <FaHourglassHalf />
              </div>

              <span className="max-w-[55%] break-words text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400">
                Pending
              </span>
            </div>

            <div className="relative mt-5 break-words text-[clamp(1.8rem,6vw,2.5rem)] font-black leading-none tracking-tight text-slate-900">
              {stats.pending}
            </div>

            <p className="relative mt-2 break-words text-xs leading-5 text-slate-500">
              Awaiting action
            </p>
          </div>

          {/* CONFIRMED */}

          <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white p-4 shadow-[0_14px_40px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(30,41,59,0.10)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm sm:h-12 sm:w-12">
                <FaCheckCircle />
              </div>

              <span className="max-w-[55%] break-words text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400">
                Confirmed
              </span>
            </div>

            <div className="relative mt-5 break-words text-[clamp(1.8rem,6vw,2.5rem)] font-black leading-none tracking-tight text-slate-900">
              {stats.confirmed}
            </div>

            <p className="relative mt-2 break-words text-xs leading-5 text-slate-500">
              Upcoming bookings
            </p>
          </div>

          {/* COMPLETED */}

          <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white p-4 shadow-[0_14px_40px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(30,41,59,0.10)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/70 blur-2xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm sm:h-12 sm:w-12">
                <FaCheckCircle />
              </div>

              <span className="max-w-[55%] break-words text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400">
                Completed
              </span>
            </div>

            <div className="relative mt-5 break-words text-[clamp(1.8rem,6vw,2.5rem)] font-black leading-none tracking-tight text-slate-900">
              {stats.completed}
            </div>

            <p className="relative mt-2 break-words text-xs leading-5 text-slate-500">
              Successfully served
            </p>
          </div>

          {/* CANCELLED */}

          <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-white p-4 shadow-[0_14px_40px_rgba(30,41,59,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(30,41,59,0.10)] sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-rose-400" />

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100/70 blur-2xl" />

            <div className="relative flex min-w-0 items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm sm:h-12 sm:w-12">
                <FaBan />
              </div>

              <span className="max-w-[55%] break-words text-right text-[9px] font-black uppercase leading-4 tracking-[0.12em] text-slate-400">
                Cancelled
              </span>
            </div>

            <div className="relative mt-5 break-words text-[clamp(1.8rem,6vw,2.5rem)] font-black leading-none tracking-tight text-slate-900">
              {stats.cancelled}
            </div>

            <p className="relative mt-2 break-words text-xs leading-5 text-slate-500">
              Cancelled / rejected
            </p>
          </div>
        </div>
{/* =================================================
    FILTER PANEL — MOBILE / TABLET ULTRA RESPONSIVE
    DESKTOP/LAPTOP XL LAYOUT PRESERVED
================================================= */}

<div
  className="
    relative
    mb-6
    overflow-visible
    rounded-[1.5rem]
    border
    border-slate-200/80
    bg-white
    p-3.5
    shadow-[0_16px_45px_rgba(15,23,42,0.07)]
    sm:rounded-[1.75rem]
    sm:p-4
    md:p-5
    lg:p-6
  "
>

  {/* =================================================
      PREMIUM AMBIENT GLOW
  ================================================= */}

  <div
    className="
      pointer-events-none
      absolute
      -right-14
      -top-14
      h-36
      w-36
      rounded-full
      bg-violet-200/20
      blur-3xl
      sm:h-44
      sm:w-44
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -bottom-16
      left-[30%]
      h-32
      w-32
      rounded-full
      bg-fuchsia-200/15
      blur-3xl
      sm:h-40
      sm:w-40
    "
  />


  <div className="relative min-w-0">


    {/* =================================================
        FILTER HEADER
    ================================================= */}

    <div
      className="
        mb-4
        flex
        min-w-0
        flex-col
        gap-3
        sm:mb-5
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:gap-4
      "
    >

      {/* LEFT — TITLE */}

      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

        <div
          className="
            relative
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-violet-600
            via-purple-600
            to-fuchsia-600
            text-white
            shadow-[0_8px_20px_rgba(124,58,237,0.22)]
            sm:h-11
            sm:w-11
            sm:rounded-2xl
          "
        >

          <FaFilter className="text-xs sm:text-sm" />

          <span
            className="
              absolute
              inset-0
              rounded-xl
              ring-1
              ring-white/30
              sm:rounded-2xl
            "
          />

        </div>


        <div className="min-w-0 flex-1">

          <h2
            className="
              truncate
              text-sm
              font-black
              leading-5
              text-slate-800
              sm:text-base
            "
          >
            Filter Appointments
          </h2>


          <p
            className="
              mt-0.5
              whitespace-nowrap
              text-[11px]
              font-medium
              leading-5
              text-slate-400
              sm:mt-1
              sm:text-xs
            "
          >

            <span className="font-black text-violet-600">
              {filteredAppointments.length}
            </span>{" "}

            appointment
            {filteredAppointments.length !== 1
              ? "s"
              : ""}{" "}
            found

          </p>

        </div>

      </div>


      {/* =================================================
          CLEAR FILTERS
      ================================================= */}

      <button
        type="button"
        onClick={clearFilters}
        className="
          flex
          h-10
          w-full
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-violet-100
          bg-violet-50
          px-3.5
          text-xs
          font-black
          whitespace-nowrap
          text-violet-600
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:border-violet-200
          hover:bg-violet-100
          hover:text-violet-800
          hover:shadow-sm
          active:translate-y-0
          sm:h-10
          sm:w-auto
        "
      >
        Clear filters
      </button>

    </div>


    {/* =================================================
        FILTER CONTROLS
    ================================================= */}

    <div
      className="
        grid
        min-w-0
        grid-cols-1
        gap-2.5
        sm:gap-3
        md:grid-cols-2
        xl:grid-cols-[minmax(280px,1.8fr)_minmax(170px,1fr)_minmax(240px,1.35fr)_minmax(170px,1fr)]
      "
    >


      {/* =================================================
          SEARCH
      ================================================= */}

      <div
        className="
          relative
          min-w-0
          md:col-span-2
          xl:col-span-1
        "
      >

        <FaSearch
          className="
            pointer-events-none
            absolute
            left-3.5
            top-1/2
            z-10
            -translate-y-1/2
            text-xs
            text-slate-400
            sm:left-4
            sm:text-sm
          "
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search customer, service, staff..."
          className="
            h-12
            w-full
            min-w-0
            rounded-xl
            border
            border-slate-200
            bg-slate-50/80
            pl-10
            pr-3.5
            text-xs
            font-semibold
            text-slate-800
            outline-none
            transition-all
            duration-200
            placeholder:truncate
            placeholder:text-slate-400
            hover:border-slate-300
            hover:bg-white
            focus:border-violet-400
            focus:bg-white
            focus:ring-4
            focus:ring-violet-500/10
            sm:h-[52px]
            sm:rounded-2xl
            sm:pl-11
            sm:pr-4
            sm:text-sm
          "
        />

      </div>


      {/* =================================================
          STATUS
      ================================================= */}

      <div className="relative min-w-0">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            h-12
            w-full
            min-w-0
            cursor-pointer
            appearance-none
            rounded-xl
            border
            border-slate-200
            bg-slate-50/80
            px-3.5
            pr-10
            text-xs
            font-bold
            text-slate-700
            outline-none
            transition-all
            duration-200
            hover:border-slate-300
            hover:bg-white
            focus:border-violet-400
            focus:bg-white
            focus:ring-4
            focus:ring-violet-500/10
            sm:h-[52px]
            sm:rounded-2xl
            sm:px-4
            sm:pr-11
            sm:text-sm
          "
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


        <FaChevronDown
          className="
            pointer-events-none
            absolute
            right-3.5
            top-1/2
            -translate-y-1/2
            text-[10px]
            text-slate-400
            sm:right-4
            sm:text-xs
          "
        />

      </div>


      {/* =================================================
          SALON — CUSTOM DROPDOWN
      ================================================= */}

      <div className="relative min-w-0">

        <button
          type="button"
          onClick={() =>
            setShowSalonDropdown(
              (prev) => !prev
            )
          }
          className={`
            flex
            min-h-[48px]
            w-full
            min-w-0
            items-center
            justify-between
            gap-2.5
            rounded-xl
            border
            bg-slate-50/80
            px-3.5
            py-2.5
            text-left
            transition-all
            duration-200
            sm:min-h-[52px]
            sm:gap-3
            sm:rounded-2xl
            sm:px-4
            ${
              showSalonDropdown
                ? "border-violet-400 bg-white ring-4 ring-violet-500/10"
                : "border-slate-200 hover:border-slate-300 hover:bg-white"
            }
          `}
        >

          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">

            <FaStore
              className="
                shrink-0
                text-xs
                text-violet-500
                sm:text-sm
              "
            />

            <span
              className="
                min-w-0
                flex-1
                text-xs
                font-bold
                leading-5
                text-slate-700
                sm:text-sm
              "
            >

              {salonFilter === "ALL"
                ? "All Salons"
                : salons.find(
                    (salon) =>
                      salon._id ===
                      salonFilter
                  )?.name ||
                  "All Salons"}

            </span>

          </div>


          <FaChevronDown
            className={`
              shrink-0
              text-[10px]
              text-slate-400
              transition-transform
              duration-200
              sm:text-xs
              ${
                showSalonDropdown
                  ? "rotate-180 text-violet-500"
                  : ""
              }
            `}
          />

        </button>


        {/* =================================================
            SALON DROPDOWN
        ================================================= */}

        {showSalonDropdown && (

          <div
            className="
              absolute
              left-0
              right-0
              top-[calc(100%+7px)]
              z-[100]
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-1.5
              shadow-[0_22px_60px_rgba(15,23,42,0.16)]
            "
          >

            <div
              className="
                max-h-60
                overflow-y-auto
                overscroll-contain
                sm:max-h-72
              "
            >


              {/* =================================================
                  ALL SALONS
              ================================================= */}

              <button
                type="button"
                onClick={() => {
                  setSalonFilter("ALL");
                  setShowSalonDropdown(false);
                }}
                className={`
                  flex
                  min-h-[44px]
                  w-full
                  items-center
                  gap-2.5
                  rounded-xl
                  px-2.5
                  py-2
                  text-left
                  transition-all
                  duration-150
                  sm:min-h-[46px]
                  sm:gap-3
                  sm:px-3
                  sm:py-2.5
                  ${
                    salonFilter === "ALL"
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }
                `}
              >

                <div
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      salonFilter === "ALL"
                        ? "bg-violet-100 text-violet-600"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  <FaStore className="text-[10px] sm:text-xs" />
                </div>


                <span
                  className="
                    min-w-0
                    flex-1
                    text-xs
                    font-bold
                    leading-5
                    sm:text-sm
                  "
                >
                  All Salons
                </span>


                {salonFilter === "ALL" && (
                  <FaCheckCircle
                    className="
                      shrink-0
                      text-[10px]
                      text-violet-500
                      sm:text-xs
                    "
                  />
                )}

              </button>


              {/* =================================================
                  SALONS
              ================================================= */}

              {salons.map((salon) => {

                const isSelected =
                  salonFilter ===
                  salon._id;

                return (

                  <button
                    key={salon._id}
                    type="button"
                    onClick={() => {
                      setSalonFilter(
                        salon._id
                      );

                      setShowSalonDropdown(
                        false
                      );
                    }}
                    className={`
                      flex
                      min-h-[48px]
                      w-full
                      items-start
                      gap-2.5
                      rounded-xl
                      px-2.5
                      py-2
                      text-left
                      transition-all
                      duration-150
                      sm:min-h-[50px]
                      sm:gap-3
                      sm:px-3
                      sm:py-2.5
                      ${
                        isSelected
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >

                    <div
                      className={`
                        mt-0.5
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${
                          isSelected
                            ? "bg-violet-100 text-violet-600"
                            : "bg-slate-100 text-slate-500"
                        }
                      `}
                    >
                      <FaStore className="text-[10px] sm:text-xs" />
                    </div>


                    <span
                      className="
                        min-w-0
                        flex-1
                        whitespace-normal
                        text-xs
                        font-bold
                        leading-5
                        sm:text-sm
                      "
                    >
                      {salon.name}
                    </span>


                    {isSelected && (
                      <FaCheckCircle
                        className="
                          mt-1
                          shrink-0
                          text-[10px]
                          text-violet-500
                          sm:text-xs
                        "
                      />
                    )}

                  </button>

                );

              })}

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          DATE
      ================================================= */}

      <div className="relative min-w-0">

        <input
          type="date"
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(
              e.target.value
            )
          }
          className="
            h-12
            w-full
            min-w-0
            cursor-pointer
            rounded-xl
            border
            border-slate-200
            bg-slate-50/80
            px-3.5
            text-xs
            font-bold
            text-slate-700
            outline-none
            transition-all
            duration-200
            hover:border-slate-300
            hover:bg-white
            focus:border-violet-400
            focus:bg-white
            focus:ring-4
            focus:ring-violet-500/10
            sm:h-[52px]
            sm:rounded-2xl
            sm:px-4
            sm:text-sm
          "
        />

      </div>


    </div>

  </div>

</div>

{/* ================================================= 
    DESKTOP / LAPTOP — ULTRA PRO APPOINTMENT CENTER
================================================= */}

<div className="hidden min-w-0 lg:block">

  {/* =================================================
      DESKTOP SECTION HEADER
  ================================================= */}

  <div
    className="
      relative
      mb-5
      overflow-hidden
      rounded-[2rem]
      border
      border-slate-200/80
      bg-gradient-to-br
      from-white
      via-slate-50/80
      to-violet-50/60
      px-6
      py-5
      shadow-[0_20px_60px_rgba(15,23,42,0.08)]
      xl:px-7
      xl:py-6
    "
  >

    {/* Decorative Glow */}

    <div
      className="
        pointer-events-none
        absolute
        -right-20
        -top-24
        h-56
        w-56
        rounded-full
        bg-violet-300/20
        blur-3xl
      "
    />

    <div
      className="
        pointer-events-none
        absolute
        -bottom-16
        left-1/3
        h-40
        w-52
        rounded-full
        bg-fuchsia-200/20
        blur-3xl
      "
    />

    <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

      {/* LEFT */}

      <div className="flex min-w-0 items-center gap-3.5">

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-violet-100
            bg-gradient-to-br
            from-violet-50
            via-purple-50
            to-fuchsia-50
            text-violet-600
            shadow-sm
          "
        >
          <FaCalendarAlt className="text-base" />
        </div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2.5">

            <h2 className="text-lg font-black leading-6 text-slate-800">
              Appointment Records
            </h2>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-emerald-600
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>

          </div>

          <p className="mt-1.5 text-xs font-medium text-slate-400">

            Showing{" "}

            <span className="font-black text-slate-700">
              {filteredAppointments.length}
            </span>{" "}

            appointment
            {filteredAppointments.length !== 1 ? "s" : ""}

          </p>

        </div>

      </div>


      {/* RIGHT — MANAGEMENT */}

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-2.5
          rounded-2xl
          border
          border-slate-200/80
          bg-white/80
          px-4
          py-2.5
          shadow-sm
          xl:flex
        "
      >

        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-xl
            bg-violet-50
            text-violet-600
          "
        >
          <FaCalendarAlt className="text-xs" />
        </div>

        <div>

          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
            Management
          </p>

          <p className="mt-0.5 text-xs font-black text-slate-700">
            Appointment Center
          </p>

        </div>

      </div>

    </div>

  </div>


  {/* =================================================
      EMPTY STATE
  ================================================= */}

  {filteredAppointments.length === 0 ? (

    <div
      className="
        flex
        min-h-[420px]
        items-center
        justify-center
        rounded-[2rem]
        border
        border-slate-200/80
        bg-white
        shadow-[0_20px_60px_rgba(15,23,42,0.07)]
      "
    >

      <div className="flex flex-col items-center text-center">

        <div
          className="
            mb-5
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-[1.5rem]
            border
            border-slate-200
            bg-gradient-to-br
            from-slate-50
            to-slate-100
            text-2xl
            text-slate-400
            shadow-inner
          "
        >
          <FaCalendarAlt />
        </div>

        <h3 className="text-base font-black text-slate-700">
          No appointments found
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Try changing your search or filters.
        </p>

      </div>

    </div>

  ) : (

    /* =================================================
       MAIN APPOINTMENT LIST CONTAINER
    ================================================= */

    <div
      className="
        rounded-[2rem]
        border
        border-slate-200/80
        bg-gradient-to-b
        from-slate-50/80
        to-white
        p-4
        shadow-[0_24px_80px_rgba(15,23,42,0.08)]
        xl:p-5
      "
    >

      {/* =================================================
          LIST HEADER
      ================================================= */}

      <div
        className="
          mb-4
          flex
          flex-col
          gap-3
          px-2
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex items-center gap-2.5">

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              bg-violet-100
              text-violet-600
            "
          >
            <FaCalendarAlt className="text-xs" />
          </div>

          <div>

            <p className="text-xs font-black text-slate-700">
              All Appointments
            </p>

            <p className="text-[10px] font-medium text-slate-400">
              Manage customer bookings and schedules
            </p>

          </div>

        </div>


        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-slate-200
            bg-white
            px-3
            py-1.5
            shadow-sm
          "
        >

          <span className="h-2 w-2 rounded-full bg-emerald-500" />

          <span className="text-[10px] font-black text-slate-500">
            {filteredAppointments.length} Records
          </span>

        </div>

      </div>


      {/* =================================================
          APPOINTMENT CARDS
      ================================================= */}

      <div className="space-y-4 xl:space-y-5">

        {filteredAppointments.map((appointment) => {

          const status = getStatusConfig(
            appointment.status
          );

          return (

            <article
              key={appointment._id}
              className="
                group
                relative
                overflow-hidden
                rounded-[1.75rem]
                border
                border-slate-200/80
                bg-white
                shadow-[0_12px_38px_rgba(15,23,42,0.06)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-violet-200
                hover:shadow-[0_22px_60px_rgba(124,58,237,0.12)]
              "
            >

              {/* =================================================
                  CARD TOP ACCENT
              ================================================= */}

              <div
                className="
                  h-1
                  w-full
                  bg-gradient-to-r
                  from-violet-500
                  via-purple-500
                  to-fuchsia-500
                  opacity-80
                "
              />


              {/* =================================================
                  CARD CONTENT
              ================================================= */}

              <div className="relative p-5 xl:p-6">


                {/* =================================================
                    TOP — CUSTOMER + STATUS
                ================================================= */}

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-slate-100
                    pb-5
                    xl:flex-row
                    xl:items-center
                    xl:justify-between
                  "
                >

                  {/* CUSTOMER */}

                  <div className="flex min-w-0 items-center gap-3.5">

                    <div
                      className="
                        relative
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-violet-500
                        via-purple-500
                        to-fuchsia-500
                        text-base
                        font-black
                        text-white
                        shadow-[0_10px_28px_rgba(124,58,237,0.22)]
                      "
                    >

                      {appointment.customer?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}

                      <span
                        className="
                          absolute
                          -bottom-1
                          -right-1
                          h-4
                          w-4
                          rounded-full
                          border-[3px]
                          border-white
                          bg-emerald-400
                        "
                      />

                    </div>


                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3
                          className="
                            text-base
                            font-black
                            leading-6
                            text-slate-800
                          "
                        >
                          {appointment.customer?.name ||
                            "Unknown customer"}
                        </h3>

                        <span
                          className="
                            rounded-full
                            bg-slate-100
                            px-2
                            py-0.5
                            text-[8px]
                            font-black
                            uppercase
                            tracking-[0.1em]
                            text-slate-400
                          "
                        >
                          Customer
                        </span>

                      </div>


                      <div
                        className="
                          mt-1.5
                          flex
                          items-center
                          gap-1.5
                        "
                      >

                        <FaPhone className="shrink-0 text-[9px] text-slate-400" />

                        <span
                          className="
                            whitespace-nowrap
                            text-xs
                            font-medium
                            text-slate-400
                          "
                        >
                          {appointment.customer?.phone ||
                            "No phone"}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="flex items-center gap-3">

                    <div className="hidden text-right xl:block">

                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Current Status
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        Booking state
                      </p>

                    </div>

                    <span
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        whitespace-nowrap
                        rounded-full
                        border
                        px-4
                        py-2
                        text-[9px]
                        font-black
                        uppercase
                        tracking-wide
                        shadow-sm
                        ${status.className}
                      `}
                    >

                      <span className="shrink-0">
                        {status.icon}
                      </span>

                      <span>
                        {status.label}
                      </span>

                    </span>

                  </div>

                </div>


                {/* =================================================
                    INFORMATION GRID
                ================================================= */}

                <div
                  className="
                    mt-5
                    grid
                    min-w-0
                    gap-3
                    lg:grid-cols-2
                    xl:grid-cols-4
                  "
                >

                  {/* =================================================
                      SALON
                  ================================================= */}

                  <div
                    className="
                      min-w-0
                      rounded-2xl
                      border
                      border-slate-200/70
                      bg-gradient-to-br
                      from-slate-50
                      to-white
                      p-4
                      transition-all
                      duration-200
                      group-hover:border-violet-100
                    "
                  >

                    <div className="flex min-w-0 items-start gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-violet-100
                          bg-violet-50
                          text-violet-500
                        "
                      >
                        <FaStore className="text-xs" />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Salon
                        </p>

                        <p
                          className="
                            mt-1.5
                            whitespace-normal
                            text-sm
                            font-black
                            leading-5
                            text-slate-800
                          "
                        >
                          {appointment.salon?.name ||
                            "Unknown salon"}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      SERVICE
                  ================================================= */}

                  <div
                    className="
                      min-w-0
                      rounded-2xl
                      border
                      border-slate-200/70
                      bg-gradient-to-br
                      from-slate-50
                      to-white
                      p-4
                      transition-all
                      duration-200
                      group-hover:border-violet-100
                    "
                  >

                    <div className="flex min-w-0 items-start gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          border-fuchsia-100
                          bg-fuchsia-50
                          text-fuchsia-500
                        "
                      >
                        <FaCut className="text-xs" />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Service
                        </p>

                        <p
                          className="
                            mt-1.5
                            whitespace-normal
                            text-sm
                            font-black
                            leading-5
                            text-slate-800
                          "
                        >
                          {appointment.service?.name ||
                            "Unknown service"}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      STAFF
                  ================================================= */}

                  <div
                    className="
                      min-w-0
                      rounded-2xl
                      border
                      border-slate-200/70
                      bg-gradient-to-br
                      from-slate-50
                      to-white
                      p-4
                      transition-all
                      duration-200
                      group-hover:border-violet-100
                    "
                  >

                    <div className="flex min-w-0 items-start gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-slate-100
                          text-slate-500
                        "
                      >
                        <FaUser className="text-xs" />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Staff
                        </p>

                        <p
                          className="
                            mt-1.5
                            whitespace-normal
                            text-sm
                            font-black
                            leading-5
                            text-slate-800
                          "
                        >
                          {appointment.staff?.name ||
                            "Not assigned"}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      SCHEDULE
                  ================================================= */}

                  <div
                    className="
                      min-w-0
                      rounded-2xl
                      border
                      border-slate-200/70
                      bg-gradient-to-br
                      from-violet-50/60
                      to-white
                      p-4
                      transition-all
                      duration-200
                      group-hover:border-violet-100
                    "
                  >

                    <div className="flex min-w-0 items-start gap-3">

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-violet-100
                          text-violet-600
                        "
                      >
                        <FaCalendarAlt className="text-xs" />
                      </div>

                      <div className="min-w-0">

                        <p
                          className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Schedule
                        </p>

                        <p
                          className="
                            mt-1.5
                            whitespace-nowrap
                            text-sm
                            font-black
                            leading-5
                            text-slate-800
                          "
                        >
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </p>

                        <div
                          className="
                            mt-2
                            inline-flex
                            max-w-full
                            items-center
                            gap-1.5
                            rounded-xl
                            border
                            border-violet-100
                            bg-white
                            px-2.5
                            py-1.5
                            text-[10px]
                            font-black
                            text-violet-600
                            shadow-sm
                          "
                        >

                          <FaClock className="shrink-0 text-[9px]" />

                          <span className="whitespace-nowrap">
                            {appointment.startTime}
                          </span>

                          <span className="text-violet-300">
                            -
                          </span>

                          <span className="whitespace-nowrap">
                            {appointment.endTime}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ACTION BAR
                ================================================= */}

                <div
                  className="
                    mt-5
                    flex
                    flex-col
                    gap-3
                    border-t
                    border-slate-100
                    pt-5
                    xl:flex-row
                    xl:items-center
                    xl:justify-between
                  "
                >

                  {/* LEFT ACTION INFO */}

                  <div className="flex min-w-0 items-center gap-2">

                    <div
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-100
                        text-slate-400
                      "
                    >
                      <FaFilter className="text-[10px]" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Quick Actions
                      </p>

                      <p className="text-[10px] font-medium text-slate-400">
                        Manage this appointment
                      </p>

                    </div>

                  </div>


                  {/* =================================================
                      ACTION BUTTONS
                  ================================================= */}

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        openDetails(appointment)
                      }
                      className="
                        flex
                        h-10
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-xs
                        font-black
                        text-slate-600
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:border-violet-200
                        hover:bg-violet-50
                        hover:text-violet-600
                        hover:shadow-md
                        active:translate-y-0
                      "
                      title="View details"
                    >
                      <FaEye className="text-[11px]" />
                      <span>View</span>
                    </button>


                    {/* PENDING */}

                    {appointment.status === "PENDING" && (
                      <>

                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment,
                              "CONFIRMED"
                            )
                          }
                          className="
                            flex
                            h-10
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            whitespace-nowrap
                            rounded-xl
                            bg-gradient-to-r
                            from-emerald-500
                            to-teal-500
                            px-4
                            text-xs
                            font-black
                            text-white
                            shadow-[0_7px_18px_rgba(16,185,129,0.18)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-lg
                            active:translate-y-0
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <FaCheckCircle className="text-[11px]" />
                          <span>Confirm</span>
                        </button>


                        <button
                          type="button"
                          disabled={
                            updatingId ===
                            appointment._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              appointment,
                              "REJECTED"
                            )
                          }
                          className="
                            flex
                            h-10
                            shrink-0
                            items-center
                            justify-center
                            gap-2
                            whitespace-nowrap
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            text-xs
                            font-black
                            text-red-600
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:bg-red-100
                            hover:shadow-md
                            active:translate-y-0
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <FaTimesCircle className="text-[11px]" />
                          <span>Reject</span>
                        </button>

                      </>
                    )}


                    {/* CONFIRMED */}

                    {appointment.status === "CONFIRMED" && (

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
                        onClick={() =>
                          handleStatusChange(
                            appointment,
                            "COMPLETED"
                          )
                        }
                        className="
                          flex
                          h-10
                          shrink-0
                          items-center
                          justify-center
                          gap-2
                          whitespace-nowrap
                          rounded-xl
                          bg-gradient-to-r
                          from-blue-600
                          to-cyan-500
                          px-4
                          text-xs
                          font-black
                          text-white
                          shadow-[0_7px_18px_rgba(37,99,235,0.18)]
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          hover:shadow-lg
                          active:translate-y-0
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <FaCheckCircle className="text-[11px]" />
                        <span>Complete</span>
                      </button>

                    )}


                    {/* CANCEL */}

                    {[
                      "PENDING",
                      "CONFIRMED",
                    ].includes(
                      appointment.status
                    ) && (

                      <button
                        type="button"
                        disabled={
                          updatingId ===
                          appointment._id
                        }
                        onClick={() =>
                          openCancelModal(
                            appointment
                          )
                        }
                        className="
                          flex
                          h-10
                          shrink-0
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-red-200
                          bg-white
                          px-4
                          text-xs
                          font-black
                          text-red-500
                          transition-all
                          duration-200
                          hover:-translate-y-0.5
                          hover:border-red-300
                          hover:bg-red-50
                          hover:shadow-md
                          active:translate-y-0
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                        title="Cancel appointment"
                      >
                        <FaTimes className="text-[11px]" />
                        <span>Cancel</span>
                      </button>

                    )}

                  </div>

                </div>

              </div>

            </article>

          );

        })}

      </div>

    </div>

  )}

</div>
        {/* =================================================
            MOBILE / TABLET CARDS
        ================================================= */}

        <div className="grid min-w-0 grid-cols-1 gap-4 lg:hidden">
          {filteredAppointments.length === 0 ? (
            <div className="rounded-[2rem] border border-white/90 bg-white px-5 py-16 text-center shadow-[0_16px_45px_rgba(30,41,59,0.07)]">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400 shadow-inner">
                <FaCalendarAlt />
              </div>

              <h3 className="break-words text-base font-black text-slate-700">
                No appointments found
              </h3>

              <p className="mx-auto mt-1 max-w-sm break-words text-sm leading-6 text-slate-400">
                Try changing your filters.
              </p>
            </div>
          ) : (
            filteredAppointments.map(
              (appointment) => {
                const status =
                  getStatusConfig(
                    appointment.status
                  );

                return (
                  <div
                    key={appointment._id}
                    className="group relative min-w-0 overflow-hidden rounded-[2rem] border border-white/90 bg-white shadow-[0_16px_45px_rgba(30,41,59,0.07)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(30,41,59,0.11)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-400" />

                    {/* CARD HEADER */}

                    <div className="border-b border-slate-100 bg-gradient-to-r from-white to-violet-50/30 p-4 pt-5 sm:p-5 sm:pt-6">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-black text-white shadow-[0_8px_22px_rgba(124,58,237,0.22)] sm:h-14 sm:w-14">
                            {appointment
                              .customer
                              ?.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "C"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-sm font-black leading-5 text-slate-800 sm:text-base sm:leading-6">
                              {appointment
                                .customer
                                ?.name ||
                                "Unknown customer"}
                            </h3>

                            <p className="mt-1 flex min-w-0 items-start gap-1 text-xs leading-5 text-slate-400">
                              <FaPhone className="mt-1 shrink-0 text-[9px]" />

                              <span className="min-w-0 break-all">
                                {appointment
                                  .customer
                                  ?.phone ||
                                  "No phone"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex max-w-[44%] shrink-0 items-center justify-center gap-1 rounded-full border px-2.5 py-1.5 text-center text-[8px] font-black uppercase leading-4 tracking-wide min-[400px]:text-[9px] sm:max-w-[45%] sm:px-3 sm:text-[10px] ${status.className}`}
                        >
                          {status.icon}

                          <span className="break-words">
                            {status.label}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* CARD BODY */}

                    <div className="grid min-w-0 grid-cols-1 gap-3 p-4 min-[430px]:grid-cols-2 sm:gap-4 sm:p-5">
                      {/* SALON */}

                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-violet-100 hover:bg-violet-50/40 sm:p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                          Salon
                        </p>

                        <p className="flex min-w-0 items-start gap-2 text-sm font-black leading-5 text-slate-700">
                          <FaStore className="mt-1 shrink-0 text-xs text-violet-500" />

                          <span className="min-w-0 break-words">
                            {appointment
                              .salon
                              ?.name ||
                              "Unknown salon"}
                          </span>
                        </p>

                        {appointment.salon
                          ?.city && (
                          <p className="mt-2 flex min-w-0 items-start gap-1 text-xs leading-5 text-slate-400">
                            <FaMapMarkerAlt className="mt-1 shrink-0" />

                            <span className="min-w-0 break-words">
                              {
                                appointment
                                  .salon
                                  .city
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      {/* SERVICE */}

                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-violet-100 hover:bg-violet-50/40 sm:p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                          Service
                        </p>

                        <p className="flex min-w-0 items-start gap-2 text-sm font-black leading-5 text-slate-700">
                          <FaCut className="mt-1 shrink-0 text-xs text-violet-500" />

                          <span className="min-w-0 break-words">
                            {appointment
                              .service
                              ?.name ||
                              "Unknown service"}
                          </span>
                        </p>

                        {appointment.service
                          ?.price !==
                          undefined && (
                          <p className="mt-2 flex items-center gap-1 text-xs font-bold leading-5 text-emerald-600">
                            <FaRupeeSign className="shrink-0" />

                            <span className="break-words">
                              {
                                appointment
                                  .service
                                  .price
                              }
                            </span>
                          </p>
                        )}
                      </div>

                      {/* DATE & TIME */}

                      <div className="min-w-0 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 transition hover:bg-violet-50 sm:p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.13em] text-violet-400">
                          Date & Time
                        </p>

                        <p className="break-words text-sm font-black leading-5 text-slate-700">
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </p>

                        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs font-bold leading-5 text-violet-600">
                          <FaClock className="shrink-0" />

                          <span>
                            {
                              appointment.startTime
                            }
                          </span>

                          <span>-</span>

                          <span>
                            {
                              appointment.endTime
                            }
                          </span>
                        </p>
                      </div>

                      {/* STAFF */}

                      <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:border-violet-100 hover:bg-violet-50/40 sm:p-4">
                        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                          Staff
                        </p>

                        <p className="flex min-w-0 items-start gap-2 text-sm font-black leading-5 text-slate-700">
                          <FaUser className="mt-1 shrink-0 text-xs text-violet-500" />

                          <span className="min-w-0 break-words">
                            {appointment
                              .staff
                              ?.name ||
                              "Not assigned"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* CARD ACTIONS */}

                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                      <div className="grid min-w-0 grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              appointment
                            )
                          }
                          className="flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600"
                        >
                          <FaEye className="shrink-0" />
                          <span>
                            Details
                          </span>
                        </button>

                        {appointment.status ===
                          "PENDING" && (
                          <>
                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                appointment._id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  appointment,
                                  "CONFIRMED"
                                )
                              }
                              className="min-h-[44px] min-w-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 text-xs font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Confirm
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId ===
                                appointment._id
                              }
                              onClick={() =>
                                handleStatusChange(
                                  appointment,
                                  "REJECTED"
                                )
                              }
                              className="min-h-[44px] min-w-0 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {appointment.status ===
                          "CONFIRMED" && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              appointment._id
                            }
                            onClick={() =>
                              handleStatusChange(
                                appointment,
                                "COMPLETED"
                              )
                            }
                            className="min-h-[44px] min-w-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-3 text-xs font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Complete
                          </button>
                        )}

                        {[
                          "PENDING",
                          "CONFIRMED",
                        ].includes(
                          appointment.status
                        ) && (
                          <button
                            type="button"
                            disabled={
                              updatingId ===
                              appointment._id
                            }
                            onClick={() =>
                              openCancelModal(
                                appointment
                              )
                            }
                            className="min-h-[44px] min-w-0 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-500 transition duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span className="inline-flex items-center justify-center gap-2">
                              <FaTimes className="shrink-0" />
                              Cancel
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>

      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

      {showDetails &&
        selectedAppointment && (
          <div
            className="fixed inset-0 z-[2000] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-2 backdrop-blur-md sm:p-4"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowDetails(false);
                setSelectedAppointment(
                  null
                );
              }
            }}
          >
            <div className="my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-[0_35px_120px_rgba(0,0,0,0.30)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem]">
              {/* MODAL HEADER */}

              <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-4 text-white sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-3xl" />

                <div className="relative flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[9px] font-black uppercase tracking-[0.16em] text-violet-200 sm:text-[10px] sm:tracking-[0.2em]">
                      Appointment Details
                    </p>

                    <h2 className="mt-1 break-words text-lg font-black leading-6 tracking-tight sm:text-2xl sm:leading-7">
                      {
                        selectedAppointment
                          .customer
                          ?.name
                      }
                    </h2>

                    <p className="mt-1 break-words text-sm leading-5 text-violet-100">
                      {
                        selectedAppointment
                          .service?.name
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(
                        false
                      );
                      setSelectedAppointment(
                        null
                      );
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-sm backdrop-blur-sm transition duration-200 hover:bg-white/25 hover:scale-105 active:scale-95"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {/* MODAL BODY */}

              <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
                {detailsLoading && (
                  <div className="mb-4 flex min-w-0 items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-bold leading-5 text-violet-700">
                    <span className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />

                    <span className="break-words">
                      Loading latest appointment details...
                    </span>
                  </div>
                )}

                <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* CUSTOMER */}

                  <div className="group min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/40">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      Customer
                    </p>

                    <p className="mt-2 break-words text-sm font-black leading-5 text-slate-800">
                      {
                        selectedAppointment
                          .customer?.name
                      }
                    </p>

                    <p className="mt-1 break-all text-sm leading-5 text-slate-500">
                      {
                        selectedAppointment
                          .customer
                          ?.email ||
                        "No email"
                      }
                    </p>

                    <p className="mt-1 break-all text-sm leading-5 text-slate-500">
                      {
                        selectedAppointment
                          .customer
                          ?.phone ||
                        "No phone"
                      }
                    </p>
                  </div>

                  {/* SALON */}

                  <div className="group min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/40">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      Salon
                    </p>

                    <p className="mt-2 break-words text-sm font-black leading-5 text-slate-800">
                      {
                        selectedAppointment
                          .salon?.name
                      }
                    </p>

                    <p className="mt-1 flex min-w-0 items-start gap-1 text-sm leading-5 text-slate-500">
                      <FaMapMarkerAlt className="mt-1 shrink-0" />

                      <span className="min-w-0 break-words">
                        {
                          selectedAppointment
                            .salon?.city
                        }
                      </span>
                    </p>

                    <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                      {
                        selectedAppointment
                          .salon?.address
                      }
                    </p>
                  </div>

                  {/* SERVICE */}

                  <div className="group min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/40">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      Service
                    </p>

                    <p className="mt-2 break-words text-sm font-black leading-5 text-slate-800">
                      {
                        selectedAppointment
                          .service?.name
                      }
                    </p>

                    <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                      Duration:{" "}
                      {
                        selectedAppointment
                          .service
                          ?.duration
                      }{" "}
                      min
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-sm font-bold leading-5 text-emerald-600">
                      <FaRupeeSign className="shrink-0" />

                      <span className="break-words">
                        {
                          selectedAppointment
                            .service
                            ?.price
                        }
                      </span>
                    </p>
                  </div>

                  {/* STAFF */}

                  <div className="group min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/40">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      Staff
                    </p>

                    <p className="mt-2 break-words text-sm font-black leading-5 text-slate-800">
                      {
                        selectedAppointment
                          .staff?.name ||
                        "Not assigned"
                      }
                    </p>

                    {Array.isArray(
                      selectedAppointment
                        .staff
                        ?.specialization
                    ) && (
                      <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                        {selectedAppointment.staff.specialization.join(
                          ", "
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* DATE / TIME */}

                <div className="min-w-0 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-4 shadow-sm">
                  <div className="grid min-w-0 grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-400">
                        Date
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-800">
                        {formatDate(
                          selectedAppointment.appointmentDate
                        )}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-400">
                        Start
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-800">
                        {
                          selectedAppointment.startTime
                        }
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-400">
                        End
                      </p>

                      <p className="mt-1 break-words text-sm font-black leading-5 text-slate-800">
                        {
                          selectedAppointment.endTime
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* NOTES */}

                {selectedAppointment.notes && (
                  <div className="mt-4 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                      Customer Notes
                    </p>

                    <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                      {
                        selectedAppointment.notes
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div className="shrink-0 border-t border-slate-100 bg-slate-50 p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap sm:justify-end">
                  {selectedAppointment.status ===
                    "PENDING" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            selectedAppointment,
                            "REJECTED"
                          )
                        }
                        disabled={
                          detailsLoading ||
                          updatingId ===
                            selectedAppointment._id
                        }
                        className="min-h-[46px] rounded-xl border border-red-200 bg-white px-5 text-sm font-black text-red-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            selectedAppointment,
                            "CONFIRMED"
                          )
                        }
                        disabled={
                          detailsLoading ||
                          updatingId ===
                            selectedAppointment._id
                        }
                        className="min-h-[46px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Confirm Appointment
                      </button>
                    </>
                  )}

                  {selectedAppointment.status ===
                    "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(
                          selectedAppointment,
                          "COMPLETED"
                        )
                      }
                      disabled={
                        detailsLoading ||
                        updatingId ===
                          selectedAppointment._id
                      }
                      className="min-h-[46px] rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetails(
                        false
                      );
                      setSelectedAppointment(
                        null
                      );
                    }}
                    className="min-h-[46px] rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition duration-200 hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ===================================================
          CANCEL CONFIRMATION MODAL
      =================================================== */}

      {showCancelModal &&
        cancelTarget && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-md sm:p-4">
            <div className="my-auto w-full max-w-md min-w-0 overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-[0_35px_120px_rgba(0,0,0,0.30)] sm:rounded-[2rem]">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

              <div className="p-4 sm:p-6">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg text-red-500 shadow-sm sm:h-14 sm:w-14 sm:text-xl">
                    <FaTimesCircle />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-black leading-6 text-slate-800 sm:text-xl">
                      Cancel Appointment?
                    </h3>

                    <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                      Are you sure you want to cancel this appointment?
                    </p>
                  </div>
                </div>

                <div className="mt-5 min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="break-words text-sm font-black leading-5 text-slate-800">
                    {
                      cancelTarget
                        .customer?.name
                    }
                  </p>

                  <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                    {
                      cancelTarget
                        .service?.name
                    }
                  </p>

                  <p className="mt-2 break-words text-xs font-bold leading-5 text-violet-600">
                    {formatDate(
                      cancelTarget.appointmentDate
                    )}{" "}
                    •{" "}
                    {
                      cancelTarget.startTime
                    }
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(
                        false
                      );
                      setCancelTarget(null);
                    }}
                    className="min-h-[46px] rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 shadow-sm transition duration-200 hover:bg-slate-50"
                  >
                    Keep
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={
                      updatingId ===
                      cancelTarget._id
                    }
                    className="min-h-[46px] rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingId ===
                    cancelTarget._id
                      ? "Cancelling..."
                      : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AppointmentManagement;