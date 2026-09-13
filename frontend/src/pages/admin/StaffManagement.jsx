import { useEffect, useMemo, useState } from "react";
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  activateStaff,
  deactivateStaff,
} from "../../services/staffService";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUserCheck,
  FaUserSlash,
  FaTimes,
  FaUsers,
  FaPhone,
  FaBriefcase,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaBan,
  FaClock,
  FaImage,
  FaExclamationTriangle,
  FaStore,
} from "react-icons/fa";

const API_URL = "http://localhost:1812";

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const initialForm = {
  salon: "",
  name: "",
  specialization: "",
  services: [],
  phone: "",
  profileImage: null,
  profileImagePreview: "",
  workingHours: [
    {
      day: "MONDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "TUESDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "WEDNESDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "THURSDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "FRIDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "SATURDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: true,
    },
    {
      day: "SUNDAY",
      startTime: "09:00",
      endTime: "18:00",
      isWorking: false,
    },
  ],
};

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salonLoading, setSalonLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [form, setForm] = useState(initialForm);

  /* =========================================================
     LOAD STAFF
  ========================================================= */

  const loadStaff = async () => {
    try {
      setLoading(true);

      const data = await getAllStaff();

      setStaff(Array.isArray(data?.staff) ? data.staff : []);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load staff"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD SALONS
  ========================================================= */

  const loadSalons = async () => {
    try {
      setSalonLoading(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/salons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      const salonList = data?.salons || data || [];

      setSalons(
        Array.isArray(salonList)
          ? salonList
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load salons",
        error
      );
    } finally {
      setSalonLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
    loadSalons();
  }, []);

  const loadServices = async (salonId) => {
    if (!salonId) { setServices([]); return; }
    try {
      setServiceLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/services/salon/${salonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to load services");
      const list = data?.services || data?.data || data || [];
      setServices(Array.isArray(list) ? list.filter((service) => service?.isActive !== false) : []);
    } catch (error) {
      console.error("Failed to load services", error);
      setServices([]);
    } finally { setServiceLoading(false); }
  };

  useEffect(() => {
    if (form.salon) loadServices(form.salon);
    else setServices([]);
  }, [form.salon]);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getSpecializationText = (specialization) => {
    if (Array.isArray(specialization)) {
      return specialization.join(", ");
    }

    return specialization || "General";
  };

  const getSpecializationSearchText = (
    specialization
  ) => {
    if (Array.isArray(specialization)) {
      return specialization
        .join(" ")
        .toLowerCase();
    }

    return String(
      specialization || ""
    ).toLowerCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDay = (day) => {
    if (!day) return "";

    return (
      day.charAt(0) +
      day.slice(1).toLowerCase()
    );
  };

  const getWorkingHourForDay = (
    workingHours,
    day
  ) => {
    return (
      workingHours?.find(
        (item) => item.day === day
      ) || null
    );
  };

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredStaff = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return staff.filter((item) => {
      const salonName =
        item.salon?.name?.toLowerCase() ||
        "";

      const name =
        item.name?.toLowerCase() || "";

      const specialization =
        getSpecializationSearchText(
          item.specialization
        );

      const phone =
        item.phone?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchValue) ||
        salonName.includes(searchValue) ||
        specialization.includes(searchValue) ||
        phone.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          item.isActive) ||
        (statusFilter === "INACTIVE" &&
          !item.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    staff,
    search,
    statusFilter,
  ]);

  /* =========================================================
     CREATE
  ========================================================= */

  const openCreateModal = () => {
    setEditingStaff(null);

    setForm({
      ...initialForm,
      workingHours:
        initialForm.workingHours.map(
          (item) => ({
            ...item,
          })
        ),
    });

    setShowModal(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEditModal = (item) => {
    setEditingStaff(item);

    setForm({
      salon:
        item.salon?._id ||
        item.salon ||
        "",

      name:
        item.name || "",

      specialization:
        Array.isArray(
          item.specialization
        )
          ? item.specialization.join(
              ", "
            )
          : item.specialization || "",

      services: Array.isArray(item.services)
        ? item.services.map((service) =>
            typeof service === "object" ? service?._id : service
          ).filter(Boolean)
        : [],

      phone:
        item.phone || "",

      profileImage: null,

      profileImagePreview:
        item.profileImage
          ? `${API_URL}${item.profileImage}`
          : "",

      workingHours:
        item.workingHours?.length
          ? item.workingHours.map(
              (hour) => ({
                ...hour,
              })
            )
          : initialForm.workingHours.map(
              (hour) => ({
                ...hour,
              })
            ),
    });

    setShowModal(true);
  };

  /* =========================================================
     VIEW DETAILS
     Working Hours + Leaves ONLY
  ========================================================= */

  const openDetailsModal = (item) => {
    setSelectedStaff(item);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedStaff(null);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     SERVICES
  ========================================================= */

  const toggleService = (serviceId) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  /* =========================================================
     IMAGE
  ========================================================= */

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Please select an image file"
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image size should be less than 5 MB"
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      profileImage: file,
      profileImagePreview:
        URL.createObjectURL(file),
    }));
  };

  /* =========================================================
     WORKING HOURS
  ========================================================= */

  const updateWorkingHour = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [
        ...prev.workingHours,
      ];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        workingHours: updated,
      };
    });
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Staff name is required"
      );
      return;
    }

    if (
      !editingStaff &&
      !form.salon
    ) {
      alert(
        "Please select a salon"
      );
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "specialization",
        form.specialization
      );

      formData.append(
        "services",
        JSON.stringify(form.services)
      );

      formData.append(
        "phone",
        form.phone
      );

      formData.append(
        "workingHours",
        JSON.stringify(
          form.workingHours
        )
      );

      if (!editingStaff) {
        formData.append(
          "salon",
          form.salon
        );
      }

      if (
        form.profileImage instanceof
        File
      ) {
        formData.append(
          "profileImage",
          form.profileImage
        );
      }

      if (editingStaff) {
        await updateStaff(
          editingStaff._id,
          formData
        );
      } else {
        await createStaff(
          formData
        );
      }

      setShowModal(false);
      setEditingStaff(null);

      setForm({
        ...initialForm,
        workingHours:
          initialForm.workingHours.map(
            (item) => ({
              ...item,
            })
          ),
      });

      await loadStaff();

      alert(
        editingStaff
          ? "Staff updated successfully"
          : "Staff created successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data
          ?.message ||
          "Operation failed"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDelete = (item) => {
    setSelectedStaff(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedStaff) {
      return;
    }

    try {
      await deleteStaff(
        selectedStaff._id
      );

      setShowDeleteModal(false);
      setSelectedStaff(null);

      await loadStaff();

      alert(
        "Staff deleted successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data
          ?.message ||
          "Failed to delete staff"
      );
    }
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const handleStatusChange = async (
    item
  ) => {
    try {
      if (item.isActive) {
        await deactivateStaff(
          item._id
        );
      } else {
        await activateStaff(
          item._id
        );
      }

      await loadStaff();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data
          ?.message ||
          "Failed to update status"
      );
    }
  };

  /* =========================================================
     STATS
  ========================================================= */

  const totalStaff =
    staff.length;

  const activeStaff =
    staff.filter(
      (item) => item.isActive
    ).length;

  const inactiveStaff =
    staff.filter(
      (item) => !item.isActive
    ).length;

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.06),transparent_28%),#f5f7fb] px-2.5 py-3 text-slate-900 sm:px-4 sm:py-5 md:px-5 lg:px-6 xl:px-8 2xl:px-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-4 w-full min-w-0 overflow-hidden rounded-[22px] border border-white/90 bg-white/90 shadow-[0_20px_70px_rgba(30,35,60,0.08)] backdrop-blur-xl sm:mb-5 sm:rounded-[26px]">

        <div className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">

          <div className="min-w-0">

            <div className="mb-3 flex flex-wrap items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25">
                <FaUsers size={17} />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-500 sm:text-[11px]">
                Administration
              </span>

            </div>

            <h1 className="m-0 break-words text-[clamp(1.5rem,4vw,2.25rem)] font-black leading-tight tracking-[-0.055em] text-slate-950">
              Staff Management
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
              Manage salon staff, working
              schedules, availability and
              account status from one place.
            </p>

          </div>

          <div className="shrink-0">

            <button
              onClick={
                openCreateModal
              }
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-slate-950 via-slate-900 to-violet-950 px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(15,23,42,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(91,33,182,0.24)] active:translate-y-0 sm:w-auto"
            >
              <FaPlus size={13} />
              <span>Add Staff</span>
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:mb-5 lg:grid-cols-3 lg:gap-4">

        {/* Total */}

        <div className="min-w-0 rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_35px_rgba(30,35,60,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(91,33,182,0.12)] sm:p-5">

          <div className="flex min-w-0 items-center justify-between gap-4">

            <div className="min-w-0">
              <small className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                Total Staff
              </small>

              <h3 className="m-0 mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950 sm:text-3xl">
                {totalStaff}
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 sm:h-12 sm:w-12">
              <FaUsers />
            </div>

          </div>

        </div>

        {/* Active */}

        <div className="min-w-0 rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_35px_rgba(30,35,60,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(16,185,129,0.12)] sm:p-5">

          <div className="flex min-w-0 items-center justify-between gap-4">

            <div className="min-w-0">
              <small className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                Active Staff
              </small>

              <h3 className="m-0 mt-2 text-2xl font-black tracking-[-0.05em] text-emerald-600 sm:text-3xl">
                {activeStaff}
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/20 sm:h-12 sm:w-12">
              <FaUserCheck />
            </div>

          </div>

        </div>

        {/* Inactive */}

        <div className="min-w-0 rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_35px_rgba(30,35,60,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(244,63,94,0.12)] sm:p-5">

          <div className="flex min-w-0 items-center justify-between gap-4">

            <div className="min-w-0">
              <small className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 sm:text-[11px]">
                Inactive Staff
              </small>

              <h3 className="m-0 mt-2 text-2xl font-black tracking-[-0.05em] text-rose-600 sm:text-3xl">
                {inactiveStaff}
              </h3>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-lg shadow-rose-500/20 sm:h-12 sm:w-12">
              <FaUserSlash />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="mb-4 w-full min-w-0 rounded-[20px] border border-white/90 bg-white/90 p-3.5 shadow-[0_14px_35px_rgba(30,35,60,0.06)] backdrop-blur-xl sm:mb-5 sm:rounded-[22px] sm:p-5">

        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_240px]">

          <div className="min-w-0">

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                <FaSearch size={14} />
              </span>

              <input
                type="text"
                className="h-12 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                placeholder="Search staff, salon, specialization or phone..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="min-w-0">

            <select
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* =====================================================
          STAFF DIRECTORY
      ===================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-[22px] border border-white/90 bg-white/95 shadow-[0_20px_55px_rgba(30,35,60,0.07)] backdrop-blur-xl sm:rounded-[24px]">

        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">

          <div className="flex min-w-0 items-center justify-between gap-3">

            <div className="min-w-0">

              <h2 className="m-0 break-words text-base font-black tracking-[-0.04em] text-slate-950 sm:text-lg">
                Staff Directory
              </h2>

              <small className="mt-1 block text-xs text-slate-500">
                {filteredStaff.length}{" "}
                staff found
              </small>

            </div>

          </div>

        </div>

        {loading ? (

          <div className="px-4 py-14 text-center sm:py-16">

            <div
              className="spinner-border text-dark"
              role="status"
            />

            <p className="mb-0 mt-3 text-sm text-slate-500">
              Loading staff...
            </p>

          </div>

        ) : filteredStaff.length === 0 ? (

          <div className="px-4 py-14 text-center sm:py-16">

            <FaUsers
              size={40}
              className="mx-auto mb-3 block text-slate-300"
            />

            <h3 className="m-0 text-base font-black text-slate-950 sm:text-lg">
              No staff found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500 sm:text-sm">
              Try changing your search
              or add a new staff member.
            </p>

          </div>

        ) : (

          <>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto xl:block">

              <table className="m-0 w-full min-w-[1050px] align-middle">

                <thead className="bg-slate-50/90">

                  <tr className="border-b border-slate-100">

                    <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Staff
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Salon
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Specialization
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Phone
                    </th>

                    <th className="px-4 py-4 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredStaff.map(
                    (item) => (
                      <tr
                        key={
                          item._id
                        }
                        className="border-b border-slate-100/80 transition hover:bg-violet-50/30"
                      >

                        {/* STAFF */}

                        <td className="px-5 py-4">

                          <div className="flex min-w-0 items-center gap-3">

                            {item.profileImage ? (

                              <img
                                src={`${API_URL}${item.profileImage}`}
                                alt={
                                  item.name
                                }
                                className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200"
                              />

                            ) : (

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-violet-900 text-sm font-black text-white shadow-sm">
                                {item.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </div>

                            )}

                            <div className="min-w-0">

                              <div className="truncate text-sm font-extrabold text-slate-900">
                                {
                                  item.name
                                }
                              </div>

                              <small className="block truncate text-xs text-slate-400">
                                ID:{" "}
                                {item._id?.slice(
                                  -8
                                )}
                              </small>

                            </div>

                          </div>

                        </td>

                        {/* SALON */}

                        <td className="max-w-[190px] px-4 py-4">

                          <div className="break-words text-sm font-bold leading-5 text-slate-800">
  {item.salon?.name || "Unknown"}
</div>
                          <small className="block break-words text-xs leading-4 text-slate-400">
  {item.salon?.city || ""}
</small>
                        </td>

                        {/* SPECIALIZATION */}

                        <td className="max-w-[190px] px-4 py-4">

                          <span className="block break-words text-sm text-slate-600">
                            {getSpecializationText(
                              item.specialization
                            )}
                          </span>

                        </td>

                        {/* PHONE */}

                        <td className="px-4 py-4">

                          <div className="flex items-center whitespace-nowrap text-sm text-slate-600">

                            <FaPhone
                              size={11}
                              className="me-2 shrink-0 text-slate-400"
                            />

                            {item.phone ||
                              "-"}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-extrabold tracking-[0.04em] ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                            }`}
                          >
                            {item.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-700 transition hover:border-violet-200 hover:bg-violet-100"
                              title="View working hours and leaves"
                              onClick={() =>
                                openDetailsModal(
                                  item
                                )
                              }
                            >
                              <FaClock
                                size={13}
                              />
                            </button>

                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                              title="Edit"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                            >
                              <FaEdit
                                size={13}
                              />
                            </button>

                            <button
                              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                                item.isActive
                                  ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              }`}
                              title={
                                item.isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  item
                                )
                              }
                            >
                              {item.isActive ? (
                                <FaUserSlash
                                  size={13}
                                />
                              ) : (
                                <FaUserCheck
                                  size={13}
                                />
                              )}
                            </button>

                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                              title="Delete"
                              onClick={() =>
                                confirmDelete(
                                  item
                                )
                              }
                            >
                              <FaTrash
                                size={13}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
{/* =================================================
    TABLET + MOBILE STAFF CARDS
================================================= */}

<div className="grid min-w-0 grid-cols-1 gap-3 bg-slate-50/60 p-2.5 sm:gap-4 sm:p-4 md:grid-cols-2 md:gap-5 md:p-5 xl:hidden">

  {filteredStaff.map((item) => (

    <div
      key={item._id}
      className="group min-w-0 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(91,33,182,0.10)] sm:rounded-[26px]"
    >

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="min-w-0 p-3.5 sm:p-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="min-w-0">

          {/* Profile + Name + Status */}

          <div className="flex min-w-0 items-start gap-3">

            {/* Profile Image */}

            <div className="shrink-0">

              {item.profileImage ? (

                <img
                  src={`${API_URL}${item.profileImage}`}
                  alt={item.name}
                  className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 sm:h-14 sm:w-14 sm:rounded-[18px]"
                />

              ) : (

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 via-violet-800 to-indigo-900 text-sm font-black text-white shadow-sm ring-1 ring-white sm:h-14 sm:w-14 sm:rounded-[18px] sm:text-base">
                  {item.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

              )}

            </div>


            {/* Name */}

            <div className="min-w-0 flex-1">

              <h3 className="m-0 break-words text-sm font-black leading-5 text-slate-900 sm:text-base sm:leading-6">
                {item.name}
              </h3>

            </div>


            {/* Status */}

            <div className="shrink-0">

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-black tracking-wide shadow-sm sm:px-3 sm:text-[10px] ${
                  item.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                }`}
              >

                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    item.isActive
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

                {item.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}

              </span>

            </div>

          </div>


          {/* =================================================
              SPECIALIZATION
          ================================================= */}

          <div className="mt-2.5 flex min-w-0 items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 sm:mt-3 sm:px-3.5 sm:py-3">

            <span className="mt-0.5 shrink-0 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              Skill
            </span>

            <p className="m-0 min-w-0 flex-1 break-words text-[11px] font-semibold leading-4 text-slate-600 sm:text-xs sm:leading-5">
              {getSpecializationText(
                item.specialization
              )}
            </p>

          </div>

        </div>


        {/* Divider */}

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:my-5" />


        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="grid min-w-0 grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">

          {/* =================================================
              SALON
          ================================================= */}

          <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-3.5">

            <div className="mb-1.5 flex items-center gap-2">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] text-violet-500 shadow-sm">
                <FaStore />
              </div>

              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                Salon
              </div>

            </div>


            <div className="min-w-0 break-words text-xs font-bold leading-5 text-slate-700 sm:text-[13px]">
              {item.salon?.name ||
                "Unknown"}
            </div>


            {item.salon?.city && (

              <div className="mt-1 min-w-0 break-words text-[10px] font-medium leading-4 text-slate-400 sm:text-[11px]">
                {item.salon.city}
              </div>

            )}

          </div>


          {/* =================================================
              PHONE
          ================================================= */}

          <div className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-3.5">

            <div className="mb-1.5 flex items-center gap-2">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] text-slate-500 shadow-sm">
                <FaPhone />
              </div>

              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                Phone
              </div>

            </div>


            <div className="flex min-w-0 items-start gap-2">

              <span className="min-w-0 break-all text-xs font-bold leading-5 text-slate-700 sm:text-[13px]">
                {item.phone || "-"}
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-2.5">

          {/* =================================================
              VIEW DETAILS
          ================================================= */}

          <button
            type="button"
            title="View working hours and leaves"
            onClick={() =>
              openDetailsModal(item)
            }
            className="flex min-w-0 min-h-10 items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2.5 text-xs font-bold text-violet-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-100 hover:shadow-sm active:scale-[0.98] sm:min-h-11"
          >

            <FaClock
              size={13}
              className="shrink-0"
            />

            <span className="break-words text-center leading-4">
              Schedule & Leaves
            </span>

          </button>


          {/* =================================================
              EDIT
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              openEditModal(item)
            }
            className="flex min-w-0 min-h-10 items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-sm active:scale-[0.98] sm:min-h-11"
          >

            <FaEdit
              size={12}
              className="shrink-0"
            />

            <span className="leading-4">
              Edit
            </span>

          </button>


          {/* =================================================
              ACTIVATE / DEACTIVATE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              handleStatusChange(item)
            }
            className={`flex min-w-0 min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] sm:min-h-11 ${
              item.isActive
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >

            {item.isActive ? (
              <FaBan
                size={12}
                className="shrink-0"
              />
            ) : (
              <FaCheckCircle
                size={12}
                className="shrink-0"
              />
            )}

            <span className="break-words text-center leading-4">
              {item.isActive
                ? "Deactivate"
                : "Activate"}
            </span>

          </button>


          {/* =================================================
              DELETE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              confirmDelete(item)
            }
            className="flex min-w-0 min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100 hover:shadow-sm active:scale-[0.98] sm:min-h-11"
          >

            <FaTrash
              size={12}
              className="shrink-0"
            />

            <span className="leading-4">
              Delete
            </span>

          </button>

        </div>

      </div>

    </div>

  ))}

</div>
          </>
        )}

      </div>

     {/* =====================================================
    ADD / EDIT MODAL
===================================================== */}

{showModal && (
  <div
    className="fixed inset-0 z-[2000] flex min-h-0 items-center justify-center bg-slate-950/70 p-1.5 backdrop-blur-md sm:p-3 md:p-4 lg:p-5"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        setShowModal(false);
      }
    }}
  >
    {/* =================================================
        MODAL CONTAINER
    ================================================= */}

    <div className="flex min-h-0 h-[calc(100dvh-12px)] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] sm:h-[calc(100dvh-24px)] sm:rounded-[26px] md:h-[calc(100dvh-32px)] md:max-w-5xl lg:max-w-6xl lg:rounded-[30px]">

      {/* =================================================
          MODAL HEADER
      ================================================= */}

      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-white px-3.5 py-3.5 sm:gap-4 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-7">

        {/* Header Content */}

        <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">

          {/* Icon */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-sm sm:h-10 sm:w-10 sm:rounded-[13px]">
            <FaBriefcase size={14} />
          </div>

          {/* Title */}

          <div className="min-w-0 flex-1">

            <h2 className="m-0 break-words text-base font-black leading-6 tracking-[-0.035em] text-slate-950 sm:text-lg sm:leading-7 md:text-xl">
              {editingStaff
                ? "Edit Staff"
                : "Add New Staff"}
            </h2>

            <p className="m-0 mt-0.5 break-words text-[10px] font-medium leading-4 text-slate-500 sm:text-xs sm:leading-5">
              Manage staff information and working schedule
            </p>

          </div>

        </div>


        {/* Close */}

        <button
          type="button"
          aria-label="Close staff form"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-95 sm:h-10 sm:w-10"
          onClick={() =>
            setShowModal(false)
          }
        >
          <FaTimes size={14} />
        </button>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >

        {/* =================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/40 p-2.5 sm:p-4 md:p-5 lg:p-6">

          <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:gap-4 md:gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:rounded-[24px] sm:p-5">

              {/* Section Header */}

              <div className="mb-4 flex min-w-0 items-start gap-2.5 sm:mb-5 sm:gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-sm sm:h-10 sm:w-10">
                  <FaBriefcase size={14} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="m-0 break-words text-sm font-black leading-5 text-slate-950 sm:text-base sm:leading-6">
                    Basic Information
                  </h3>

                  <p className="m-0 mt-0.5 break-words text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px]">
                    Staff profile details
                  </p>

                </div>

              </div>


              {/* =================================================
                  SALON
              ================================================= */}

              <div className="mb-4 min-w-0">

                <label className="mb-2 block break-words text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">
                  Salon
                </label>

                <select
                  name="salon"
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  value={form.salon}
                  onChange={handleChange}
                  disabled={!!editingStaff}
                  required={!editingStaff}
                >

                  <option value="">
                    {salonLoading
                      ? "Loading salons..."
                      : "Select salon"}
                  </option>

                  {salons.map((salon) => (
                    <option
                      key={salon._id}
                      value={salon._id}
                    >
                      {salon.name}
                      {salon.city
                        ? ` - ${salon.city}`
                        : ""}
                    </option>
                  ))}

                </select>

                {editingStaff && (
                  <small className="mt-2 block break-words text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px]">
                    Salon cannot be changed while editing.
                  </small>
                )}

              </div>


              {/* =================================================
                  NAME
              ================================================= */}

              <div className="mb-4 min-w-0">

                <label className="mb-2 block break-words text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">
                  Staff Name
                </label>

                <input
                  type="text"
                  name="name"
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Enter staff name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* =================================================
                  SPECIALIZATION
              ================================================= */}

              <div className="mb-4 min-w-0">

                <label className="mb-2 block break-words text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">
                  Specialization
                </label>

                <input
                  type="text"
                  name="specialization"
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  placeholder="Hair stylist, Beautician..."
                  value={form.specialization}
                  onChange={handleChange}
                />

                <small className="mt-1.5 block break-words text-[10px] leading-4 text-slate-400 sm:text-xs">
                  Use comma to separate multiple specializations.
                </small>

              </div>


              {/* =================================================
                  SERVICES
              ================================================= */}

              <div className="mb-4 min-w-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">Services</label>
                  {form.services.length > 0 && <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-black text-violet-700 ring-1 ring-violet-100 sm:text-[10px]">{form.services.length} selected</span>}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/60">
                  {serviceLoading ? (
                    <div className="flex min-h-24 items-center justify-center gap-2 px-4 py-5 text-xs font-semibold text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />Loading services...</div>
                  ) : !form.salon ? (
                    <div className="px-4 py-5 text-center text-xs font-bold text-slate-500">Select a salon first to choose services.</div>
                  ) : services.length === 0 ? (
                    <div className="px-4 py-5 text-center"><p className="m-0 text-xs font-bold text-slate-500">No active services found</p><p className="mt-1 text-[10px] text-slate-400">Add active services to this salon first.</p></div>
                  ) : (
                    <div className="grid max-h-64 grid-cols-1 gap-2 overflow-y-auto p-2.5 min-[420px]:grid-cols-2 sm:p-3">
                      {services.map((service) => {
                        const selected = form.services.includes(service._id);
                        return (
                          <button key={service._id} type="button" onClick={() => toggleService(service._id)} className={`min-w-0 rounded-xl border p-3 text-left transition-all duration-200 ${selected ? "border-violet-300 bg-violet-50 shadow-sm ring-2 ring-violet-500/10" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"}`}>
                            <div className="flex min-w-0 items-start gap-2.5">
                              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-300 bg-white text-transparent"}`}><FaCheckCircle size={11} /></span>
                              <span className="min-w-0 flex-1"><span className={`block break-words text-xs font-extrabold leading-5 ${selected ? "text-violet-800" : "text-slate-700"}`}>{service.name || "Unnamed Service"}</span><span className="mt-0.5 block text-[10px] font-medium text-slate-400">{service.duration ? `${service.duration} min` : "Duration not set"}{service.price !== undefined && service.price !== null ? ` · ₹${service.price}` : ""}</span></span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-400 sm:text-xs">Select one or more services this staff member can perform.</p>
              </div>

              {/* =================================================
                  PHONE
              ================================================= */}

              <div className="mb-4 min-w-0">

                <label className="mb-2 block break-words text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>


              {/* =================================================
                  IMAGE
              ================================================= */}

              <div className="mt-5 min-w-0">

                <label className="mb-2 flex min-w-0 items-center gap-2 break-words text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 sm:text-[10px] sm:text-xs">
                  <FaImage className="shrink-0" />
                  <span className="break-words">
                    Profile Image
                  </span>
                </label>


                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block h-auto min-h-11 w-full min-w-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white text-[10px] text-slate-600 shadow-sm outline-none transition hover:border-violet-200 file:mr-2 file:border-0 file:bg-slate-950 file:px-2.5 file:py-2.5 file:text-[10px] file:font-bold file:text-white hover:file:bg-violet-900 sm:text-xs sm:file:mr-3 sm:file:px-3 sm:file:text-xs"
                />

                <p className="mt-2 break-words text-[9px] font-medium leading-4 text-slate-400 sm:text-[10px] sm:text-xs">
                  JPG, JPEG, PNG, WEBP · Maximum 5 MB
                </p>


                {/* Image Preview */}

                {form.profileImagePreview && (

                  <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">

                    <img
                      src={form.profileImagePreview}
                      alt="Profile preview"
                      className="h-14 w-14 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm sm:h-20 sm:w-20"
                    />

                    <div className="min-w-0 flex-1">

                      <p className="m-0 break-words break-all text-[10px] font-bold leading-4 text-slate-700 sm:text-xs sm:leading-5">
                        {form.profileImage
                          ? form.profileImage.name
                          : "Current profile image"}
                      </p>

                      {form.profileImage && (
                        <button
                          type="button"
                          className="mt-2 break-words text-[10px] font-bold text-rose-600 transition hover:text-rose-700 sm:text-xs"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              profileImage: null,
                              profileImagePreview: "",
                            }))
                          }
                        >
                          Remove image
                        </button>
                      )}

                    </div>

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                WORKING HOURS
            ================================================= */}

            <section className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:rounded-[24px] sm:p-5">

              {/* Section Header */}

              <div className="mb-4 flex min-w-0 items-start gap-2.5 sm:mb-5 sm:gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm sm:h-10 sm:w-10">
                  <FaClock size={14} />
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="m-0 break-words text-sm font-black leading-5 text-slate-950 sm:text-base sm:leading-6">
                    Working Hours
                  </h3>

                  <p className="m-0 mt-0.5 break-words text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px] sm:leading-5">
                    Configure the staff's weekly availability.
                  </p>

                </div>

              </div>


              {/* Working Hours List */}

              <div className="space-y-2.5">

                {form.workingHours.map(
                  (item, index) => (

                    <div
                      key={item.day}
                      className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white sm:p-3.5"
                    >

                      {/* =================================================
                          DAY
                      ================================================= */}

                      <div className="grid min-w-0 grid-cols-1 gap-2.5 lg:grid-cols-[minmax(120px,1fr)_minmax(105px,0.8fr)_minmax(105px,0.8fr)] lg:items-center lg:gap-3">

                        {/* Day */}

                        <div className="min-w-0">

                          <label className="flex min-w-0 cursor-pointer items-center gap-2">

                            <input
                              type="checkbox"
                              className="h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                              checked={item.isWorking}
                              onChange={(e) =>
                                updateWorkingHour(
                                  index,
                                  "isWorking",
                                  e.target.checked
                                )
                              }
                            />

                            <span className="min-w-0 break-words text-xs font-extrabold leading-5 text-slate-700 sm:text-[13px]">
                              {formatDay(item.day)}
                            </span>

                          </label>

                        </div>


                        {/* Start Time */}

                        <div className="min-w-0">

                          <label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                            Start time
                          </label>

                          <input
                            type="time"
                            value={item.startTime || ""}
                            disabled={!item.isWorking}
                            onChange={(e) =>
                              updateWorkingHour(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50"
                          />

                        </div>


                        {/* End Time */}

                        <div className="min-w-0">

                          <label className="mb-1 block text-[9px] font-bold uppercase tracking-wide text-slate-400 lg:hidden">
                            End time
                          </label>

                          <input
                            type="time"
                            value={item.endTime || ""}
                            disabled={!item.isWorking}
                            onChange={(e) =>
                              updateWorkingHour(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50"
                          />

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </section>

          </div>

        </div>


        {/* =================================================
            MODAL FOOTER
        ================================================= */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-3 py-3 shadow-[0_-8px_25px_rgba(15,23,42,0.04)] sm:flex-row sm:justify-end sm:px-5 sm:py-3.5 md:px-6 lg:px-7">

          {/* Cancel */}

          <button
            type="button"
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] sm:w-auto"
            onClick={() =>
              setShowModal(false)
            }
          >
            Cancel
          </button>


          {/* Submit */}

          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-0 bg-gradient-to-r from-slate-950 via-violet-950 to-indigo-950 px-5 text-sm font-extrabold text-white shadow-lg shadow-violet-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] sm:w-auto"
            disabled={saving}
          >

            {saving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : editingStaff ? (
              <>
                <FaEdit className="me-2 shrink-0" />
                Update Staff
              </>
            ) : (
              <>
                <FaPlus className="me-2 shrink-0" />
                Create Staff
              </>
            )}

          </button>

        </div>

      </form>

    </div>
  </div>
)}

      {/* =====================================================
          WORKING HOURS + LEAVES VIEW MODAL
          VIEW ONLY — NO ADD / REMOVE ACTIONS
      ===================================================== */}

      {showDetailsModal &&
        selectedStaff && (

          <div
            className="fixed inset-0 z-[2100] flex items-center justify-center overflow-hidden bg-slate-950/70 p-1.5 backdrop-blur-md sm:p-3 md:p-4"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                closeDetailsModal();
              }
            }}
          >

            <div className="flex h-full w-full items-center justify-center">

              <div className="flex max-h-[calc(100dvh-12px)] w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)] sm:max-h-[calc(100dvh-24px)] sm:rounded-[26px] md:max-w-4xl">

                {/* HEADER */}

                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-5 sm:px-6">

                  <div className="flex min-w-0 items-center gap-3">

                    {selectedStaff.profileImage ? (

                      <img
                        src={`${API_URL}${selectedStaff.profileImage}`}
                        alt={
                          selectedStaff.name
                        }
                        className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200"
                      />

                    ) : (

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-violet-900 text-sm font-black text-white">
                        {selectedStaff.name
                          ?.charAt(
                            0
                          )
                          ?.toUpperCase()}
                      </div>

                    )}

                    <div className="min-w-0">

                      <h2 className="m-0 break-words text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">
                        {
                          selectedStaff.name
                        }
                      </h2>

                      <p className="m-0 mt-1 break-words text-xs text-slate-500">
                        {selectedStaff.salon
                          ?.name ||
                          "Unknown Salon"}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    onClick={
                      closeDetailsModal
                    }
                  >
                    <FaTimes
                      size={15}
                    />
                  </button>

                </div>

                {/* CONTENT */}

                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-4 md:p-5 lg:p-6">

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                    {/* WORKING HOURS */}

                    <div className="min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">

                      <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <FaClock />
                        </div>

                        <div className="min-w-0">

                          <h3 className="m-0 text-base font-black text-slate-950">
                            Working Hours
                          </h3>

                          <p className="m-0 mt-0.5 text-[11px] text-slate-500">
                            Weekly staff availability
                          </p>

                        </div>

                      </div>

                      <div className="space-y-2">

                        {days.map(
                          (day) => {
                            const hour =
                              getWorkingHourForDay(
                                selectedStaff.workingHours,
                                day
                              );

                            const isWorking =
                              hour?.isWorking;

                            return (
                              <div
                                key={
                                  day
                                }
                                className="flex min-w-0 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                              >

                                <div className="flex min-w-0 items-center gap-2">

                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                      isWorking
                                        ? "bg-emerald-500"
                                        : "bg-slate-300"
                                    }`}
                                  />

                                  <span className="truncate text-xs font-extrabold text-slate-700">
                                    {formatDay(
                                      day
                                    )}
                                  </span>

                                </div>

                                <div
                                  className={`whitespace-nowrap text-xs font-bold ${
                                    isWorking
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {isWorking
                                    ? `${hour?.startTime || "--:--"} – ${hour?.endTime || "--:--"}`
                                    : "Not Working"}
                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* LEAVES */}

                    <div className="min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">

                      <div className="mb-5 flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                          <FaExclamationTriangle />
                        </div>

                        <div className="min-w-0">

                          <h3 className="m-0 text-base font-black text-slate-950">
                            Staff Leaves
                          </h3>

                          <p className="m-0 mt-0.5 text-[11px] text-slate-500">
                            Scheduled leave periods
                          </p>

                        </div>

                      </div>

                      {!selectedStaff
                        .leaves
                        ?.length ? (

                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center">

                          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <FaClock
                              size={16}
                            />
                          </div>

                          <p className="m-0 text-sm font-extrabold text-slate-700">
                            No leaves recorded
                          </p>

                          <p className="mt-1 max-w-xs text-[11px] leading-5 text-slate-400">
                            There are currently no
                            staff leave periods
                            available for this staff
                            member.
                          </p>

                        </div>

                      ) : (

                        <div className="space-y-3">

                          {selectedStaff.leaves.map(
                            (
                              leave,
                              index
                            ) => (

                              <div
                                key={
                                  `${selectedStaff._id}-leave-${index}`
                                }
                                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"
                              >

                                <div className="flex min-w-0 items-start gap-3">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                    <FaExclamationTriangle
                                      size={13}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">

                                      <span className="text-xs font-extrabold text-slate-800">
                                        Leave{" "}
                                        {index +
                                          1}
                                      </span>

                                      <span className="w-fit rounded-full bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold text-rose-600">
                                        LEAVE
                                      </span>

                                    </div>

                                    <div className="mt-2 break-words text-xs font-bold leading-5 text-slate-600">

                                      {formatDate(
                                        leave.startDate
                                      )}

                                      {" → "}

                                      {formatDate(
                                        leave.endDate
                                      )}

                                    </div>

                                    {leave.reason && (
                                      <p className="m-0 mt-2 break-words text-[11px] leading-5 text-slate-500">
                                        {
                                          leave.reason
                                        }
                                      </p>
                                    )}

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {showDeleteModal &&
        selectedStaff && (

          <div
            className="fixed inset-0 z-[2200] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowDeleteModal(
                  false
                );
              }
            }}
          >

            <div className="w-full max-w-md max-h-[calc(100dvh-24px)] overflow-y-auto">

              <div className="rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.32)] sm:p-7">

                <div className="text-center">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                    <FaExclamationTriangle
                      size={24}
                    />
                  </div>

                  <h2 className="m-0 text-xl font-black tracking-[-0.04em] text-slate-950">
                    Delete Staff?
                  </h2>

                  <p className="mx-auto mt-3 max-w-sm break-words text-sm leading-6 text-slate-500">
                    Are you sure you want
                    to delete{" "}
                    <strong className="text-slate-800">
                      {
                        selectedStaff.name
                      }
                    </strong>
                    ?
                    <br />
                    This action cannot be
                    undone.
                  </p>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">

                    <button
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                      onClick={() =>
                        setShowDeleteModal(
                          false
                        )
                      }
                    >
                      Cancel
                    </button>

                    <button
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border-0 bg-rose-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-700 sm:w-auto"
                      onClick={
                        handleDelete
                      }
                    >
                      <FaTrash className="me-2" />
                      Delete Staff
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default StaffManagement;