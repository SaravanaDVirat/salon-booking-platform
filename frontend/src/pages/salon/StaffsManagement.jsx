import React, {useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaUserTie,
  FaUsers,
  FaStore,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaBriefcase,
  FaChevronDown,
  FaChevronUp,
  FaImage,
  FaTimes,
  FaSave,
  FaBan,
  FaUserCheck,
  FaCalendarPlus,
  FaCalendarMinus,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

import {
  MdDashboard,
  MdWork,
  MdAccessTime,
  MdEventAvailable,
} from "react-icons/md";

import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = import.meta.env.VITE_API_URL;


const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const createDefaultWorkingHours = () => {
  const hours = {};

  DAYS.forEach((day) => {
    hours[day] = {
      isWorking: true,
      startTime: "09:00",
      endTime: "18:00",
    };
  });

  return hours;
};

const emptyForm = () => ({
  salon: "",
  name: "",
  specialization: [],
  specializationInput: "",
  services: [],
  phone: "",
  profileImage: null,
  workingHours: createDefaultWorkingHours(),
});

const getToken = () => {
  return (
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("user")
  );
};

const authHeaders = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const StaffsManagement = () => {
  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);

  const [selectedSalon, setSelectedSalon] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [salonLoading, setSalonLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [form, setForm] = useState(emptyForm());

  const [imagePreview, setImagePreview] = useState("");

  const [expandedStaff, setExpandedStaff] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStaff, setLeaveStaff] = useState(null);

  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ---------------------------------------------------------
  // TOAST
  // ---------------------------------------------------------

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

  // ---------------------------------------------------------
  // LOAD SALONS
  // ---------------------------------------------------------

  const loadSalons = async () => {
    try {
      setSalonLoading(true);

      const response = await fetch(
        `${API_URL}/salons/owner/my-salons`,
        {
          headers: {
            ...authHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch salons"
        );
      }

      const salonList = data.salons || data || [];

      setSalons(
        Array.isArray(salonList)
          ? salonList
          : []
      );

      // Important:
      // Do NOT auto-select first salon.
      setSelectedSalon("");
      setStaff([]);
    } catch (error) {
      console.error("Load salons error:", error);

      showToast(
        error.message || "Failed to load salons",
        "error"
      );
    } finally {
      setSalonLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD SERVICES FOR SELECTED SALON
  // ---------------------------------------------------------

  const loadServices = async (salonId) => {
    if (!salonId) {
      setServices([]);
      return;
    }

    try {
      setServiceLoading(true);

      const response = await fetch(
        `${API_URL}/services/salon/${salonId}`,
        {
          headers: {
            ...authHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch services"
        );
      }

      const serviceList =
        data.services || data.data || data || [];

      setServices(
        Array.isArray(serviceList)
          ? serviceList.filter(
              (service) => service.isActive !== false
            )
          : []
      );
    } catch (error) {
      console.error("Load services error:", error);

      setServices([]);
      showToast(
        error.message || "Failed to load services",
        "error"
      );
    } finally {
      setServiceLoading(false);
    }
  };

  // ---------------------------------------------------------
  // LOAD STAFF
  // ---------------------------------------------------------

  const loadStaff = async () => {
    if (!selectedSalon) {
      setStaff([]);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/staff`,
        {
          headers: {
            ...authHeaders(),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch staff"
        );
      }

      const staffList = data.staff || [];

      // Backend returns all owner's salon staff.
      // Frontend shows selected salon only.
      const filteredStaff = staffList.filter(
        (item) => {
          const salonId =
            item.salon?._id ||
            item.salon;

          return (
            salonId?.toString() ===
            selectedSalon?.toString()
          );
        }
      );

      setStaff(filteredStaff);
    } catch (error) {
      console.error("Load staff error:", error);

      showToast(
        error.message || "Failed to load staff",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      loadStaff();
    } else {
      setStaff([]);
    }
  }, [selectedSalon]);
 
  useEffect(() => {
    if (form.salon) {
      loadServices(form.salon);
    } else {
      setServices([]);
    }
  }, [form.salon]);

  // ---------------------------------------------------------
  // FILTERED STAFF
  // ---------------------------------------------------------

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const search =
        searchText.trim().toLowerCase();

      const matchesSearch =
        !search ||
        item.name
          ?.toLowerCase()
          .includes(search) ||
        item.phone
          ?.toLowerCase()
          .includes(search) ||
        item.specialization?.some((spec) =>
          spec.toLowerCase().includes(search)
        );

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
  }, [staff, searchText, statusFilter]);

  // ---------------------------------------------------------
  // STATS
  // ---------------------------------------------------------

  const stats = useMemo(() => {
    const total = staff.length;

    const active = staff.filter(
      (item) => item.isActive
    ).length;

    const inactive = staff.filter(
      (item) => !item.isActive
    ).length;

    const onLeaveToday = staff.filter(
      (item) => {
        if (!item.leaves?.length) return false;

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return item.leaves.some((leave) => {
          const start = new Date(
            leave.startDate
          );

          const end = new Date(
            leave.endDate
          );

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return (
            today >= start &&
            today <= end
          );
        });
      }
    ).length;

    return {
      total,
      active,
      inactive,
      onLeaveToday,
    };
  }, [staff]);

  // ---------------------------------------------------------
  // OPEN CREATE
  // ---------------------------------------------------------

  const openCreateModal = () => {
    setEditingStaff(null);

    setForm({
      ...emptyForm(),
      salon: selectedSalon,
    });

    setImagePreview("");

    setShowModal(true);
  };

  // ---------------------------------------------------------
  // OPEN EDIT
  // ---------------------------------------------------------

  const openEditModal = (item) => {
    setEditingStaff(item);

    const existingSalon =
      item.salon?._id ||
      item.salon ||
      selectedSalon;

    const workingHours =
      createDefaultWorkingHours();

    if (Array.isArray(item.workingHours)) {
      item.workingHours.forEach((day) => {
        if (
          day.day &&
          workingHours[day.day]
        ) {
          workingHours[day.day] = {
            isWorking:
              day.isWorking !== false,
            startTime:
              day.startTime || "09:00",
            endTime:
              day.endTime || "18:00",
          };
        }
      });
    }

    setForm({
      salon: existingSalon,
      name: item.name || "",
      specialization:
        Array.isArray(
          item.specialization
        )
          ? item.specialization
          : [],
      specializationInput: "",
      services: Array.isArray(item.services)
        ? item.services
            .map((service) =>
              typeof service === "object"
                ? service?._id
                : service
            )
            .filter(Boolean)
        : [],
      phone: item.phone || "",
      profileImage: null,
      workingHours,
    });

    if (item.profileImage) {
      setImagePreview(
        `${API_URL.replace(
          "/api",
          ""
        )}${item.profileImage}`
      );
    } else {
      setImagePreview("");
    }

    setShowModal(true);
  };

  // ---------------------------------------------------------
  // FORM CHANGE
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // IMAGE
  // ---------------------------------------------------------

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        "Please select a valid image",
        "error"
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(
        "Image size must be below 5MB",
        "error"
      );
      return;
    }

    setForm((prev) => ({
      ...prev,
      profileImage: file,
    }));

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  // ---------------------------------------------------------
  // SPECIALIZATION
  // ---------------------------------------------------------

  const addSpecialization = () => {
    const value =
      form.specializationInput.trim();

    if (!value) return;

    const exists =
      form.specialization.some(
        (item) =>
          item.toLowerCase() ===
          value.toLowerCase()
      );

    if (exists) {
      setForm((prev) => ({
        ...prev,
        specializationInput: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      specialization: [
        ...prev.specialization,
        value,
      ],
      specializationInput: "",
    }));
  };

  const removeSpecialization = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,
      specialization:
        prev.specialization.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const handleSpecializationKeyDown = (
    e
  ) => {
    if (
      e.key === "Enter" ||
      e.key === ","
    ) {
      e.preventDefault();
      addSpecialization();
    }
  };

  // ---------------------------------------------------------
  // SERVICES
  // ---------------------------------------------------------

  const toggleService = (serviceId) => {
    setForm((prev) => {
      const selected = prev.services || [];

      return {
        ...prev,
        services: selected.includes(serviceId)
          ? selected.filter((id) => id !== serviceId)
          : [...selected, serviceId],
      };
    });
  };

  // ---------------------------------------------------------
  // WORKING HOURS
  // ---------------------------------------------------------

  const updateWorkingHour = (
    day,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          isWorking:
            !prev.workingHours[day]
              .isWorking,
        },
      },
    }));
  };

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast(
        "Staff name is required",
        "error"
      );
      return;
    }

    if (!form.salon) {
      showToast(
        "Please select a salon",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "salon",
        form.salon
      );

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      form.specialization.forEach(
        (item) => {
          formData.append(
            "specialization",
            item
          );
        }
      );

      formData.append(
        "services",
        JSON.stringify(form.services || [])
      );

      const workingHoursArray =
        DAYS.map((day) => ({
          day,
          isWorking:
            form.workingHours[day]
              .isWorking,
          startTime:
            form.workingHours[day]
              .isWorking
              ? form.workingHours[day]
                  .startTime
              : "",
          endTime:
            form.workingHours[day]
              .isWorking
              ? form.workingHours[day]
                  .endTime
              : "",
        }));

      formData.append(
        "workingHours",
        JSON.stringify(
          workingHoursArray
        )
      );

      if (form.profileImage) {
        formData.append(
          "profileImage",
          form.profileImage
        );
      }

      const url = editingStaff
        ? `${API_URL}/staff/${editingStaff._id}`
        : `${API_URL}/staff`;

      const method = editingStaff
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,
          headers: {
            ...authHeaders(),
          },
          body: formData,
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save staff"
        );
      }

      showToast(
        editingStaff
          ? "Staff updated successfully"
          : "Staff created successfully"
      );

      setShowModal(false);

      setEditingStaff(null);

      setForm(emptyForm());

      setImagePreview("");

      await loadStaff();
    } catch (error) {
      console.error(
        "Save staff error:",
        error
      );

      showToast(
        error.message ||
          "Failed to save staff",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // ACTIVATE / DEACTIVATE
  // ---------------------------------------------------------

  const toggleStatus = async (
    item
  ) => {
    const action = item.isActive
      ? "deactivate"
      : "activate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} "${item.name}"?`
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${API_URL}/staff/${item._id}/${action}`,
          {
            method: "PATCH",
            headers: {
              ...authHeaders(),
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} staff`
        );
      }

      showToast(
        data.message ||
          `Staff ${action}d successfully`
      );

      await loadStaff();
    } catch (error) {
      console.error(
        `${action} staff error:`,
        error
      );

      showToast(
        error.message ||
          `Failed to ${action} staff`,
        "error"
      );
    }
  };

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------

  const deleteStaff = async (
    item
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${item.name}" permanently?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${API_URL}/staff/${item._id}`,
          {
            method: "DELETE",
            headers: {
              ...authHeaders(),
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete staff"
        );
      }

      showToast(
        data.message ||
          "Staff deleted successfully"
      );

      await loadStaff();
    } catch (error) {
      console.error(
        "Delete staff error:",
        error
      );

      showToast(
        error.message ||
          "Failed to delete staff",
        "error"
      );
    }
  };

  // ---------------------------------------------------------
  // LEAVE MODAL
  // ---------------------------------------------------------

  const openLeaveModal = (
    item
  ) => {
    setLeaveStaff(item);

    setLeaveForm({
      startDate: "",
      endDate: "",
      reason: "",
    });

    setShowLeaveModal(true);
  };

  const handleLeaveChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitLeave = async (
    e
  ) => {
    e.preventDefault();

    if (
      !leaveForm.startDate ||
      !leaveForm.endDate
    ) {
      showToast(
        "Start date and end date are required",
        "error"
      );
      return;
    }

    if (
      new Date(
        leaveForm.startDate
      ) >
      new Date(
        leaveForm.endDate
      )
    ) {
      showToast(
        "Start date cannot be after end date",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/staff/${leaveStaff._id}/leaves`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...authHeaders(),
            },
            body: JSON.stringify(
              leaveForm
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add leave"
        );
      }

      showToast(
        data.message ||
          "Staff leave added successfully"
      );

      setShowLeaveModal(false);

      setLeaveStaff(null);

      await loadStaff();
    } catch (error) {
      console.error(
        "Add leave error:",
        error
      );

      showToast(
        error.message ||
          "Failed to add leave",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------
  // REMOVE LEAVE
  // ---------------------------------------------------------

  const removeLeave = async (
    item,
    leaveIndex
  ) => {
    const confirmed =
      window.confirm(
        "Remove this leave?"
      );

    if (!confirmed) return;

    try {
      const response =
        await fetch(
          `${API_URL}/staff/${item._id}/leaves/${leaveIndex}`,
          {
            method: "DELETE",
            headers: {
              ...authHeaders(),
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove leave"
        );
      }

      showToast(
        data.message ||
          "Leave removed successfully"
      );

      await loadStaff();
    } catch (error) {
      console.error(
        "Remove leave error:",
        error
      );

      showToast(
        error.message ||
          "Failed to remove leave",
        "error"
      );
    }
  };

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const selectedSalonData =
    salons.find(
      (salon) =>
        salon._id === selectedSalon
    );

  const getSalonName = (
    item
  ) => {
    return (
      item.salon?.name ||
      selectedSalonData?.name ||
      "Salon"
    );
  };

  const getInitials = (name) => {
    if (!name) return "ST";

    return name
      .split(" ")
      .map((word) =>
        word.charAt(0)
      )
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDay = (day) => {
    return (
      DAY_LABELS[day] ||
      day
    );
  };

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] w-[calc(100%-2rem)] sm:w-auto">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-white text-slate-800"
            }`}
          >
            {toast.type ===
            "error" ? (
              <FaExclamationTriangle className="mt-0.5 text-red-500" />
            ) : (
              <FaCheckCircle className="mt-0.5 text-emerald-500" />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
              className="text-slate-400 transition hover:text-slate-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

     {/* =====================================================
     HEADER
===================================================== */}

<div className="relative overflow-hidden border-b border-slate-200/80 bg-white">
  {/* Background glow */}
  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-100/50 blur-3xl" />
  <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full bg-violet-100/40 blur-3xl" />

  <div className="relative mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
    <div
      className="
        flex w-full min-w-0
        flex-col
        gap-6
        lg:gap-7
        xl:flex-row
        xl:items-center
        xl:justify-between
      "
    >
      {/* =================================================
          LEFT — TITLE AREA
      ================================================= */}

      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4 lg:gap-5">
        {/* Icon */}
        <div
          className="
            flex h-12 w-12 shrink-0
            items-center justify-center
            rounded-[18px]
            bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600
            text-lg text-white
            shadow-lg shadow-indigo-200/60
            ring-4 ring-indigo-50
            sm:h-14 sm:w-14
            sm:rounded-2xl
            sm:text-xl
            lg:h-16 lg:w-16
            lg:rounded-[20px]
          "
        >
          <FaUserTie />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
            <span
              className="
                inline-flex max-w-full items-center
                rounded-full
                bg-indigo-50
                px-2.5 py-1
                text-[9px] font-extrabold
                uppercase tracking-[0.12em]
                text-indigo-600
                ring-1 ring-indigo-100
                sm:px-3 sm:text-[10px]
                lg:text-[11px]
              "
            >
              Staff Management
            </span>

            {selectedSalonData && (
              <span
                className="
                  inline-flex min-w-0 max-w-full
                  items-center
                  rounded-full
                  bg-emerald-50
                  px-2.5 py-1
                  text-[9px] font-bold
                  text-emerald-600
                  ring-1 ring-emerald-100
                  sm:px-3 sm:text-[10px]
                  lg:text-[11px]
                "
              >
                <span className="truncate">
                  {selectedSalonData.name}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="
              max-w-full
              break-words
              text-[clamp(1.55rem,6vw,2.25rem)]
              font-black
              leading-[1.1]
              tracking-[-0.035em]
              text-slate-950
            "
          >
            Manage Your Team
          </h1>

          {/* Description */}
          <p
            className="
              mt-2
              max-w-2xl
              break-words
              text-xs
              font-medium
              leading-5
              text-slate-500
              sm:text-sm
              sm:leading-6
            "
          >
            Manage staff members, schedules, specializations,
            leaves and availability across your salons.
          </p>
        </div>
      </div>

      {/* =================================================
          RIGHT — SALON SELECTOR
      ================================================= */}

      <div
        className="
          w-full
          min-w-0
          xl:w-[320px]
          xl:shrink-0
          2xl:w-[350px]
        "
      >
        <label
          className="
            mb-2 block
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.14em]
            text-slate-500
            sm:text-[11px]
          "
        >
          Select Salon
        </label>

        <div className="relative">
          {/* Store icon */}
          <FaStore
            className="
              pointer-events-none
              absolute left-3.5 top-1/2
              z-10 -translate-y-1/2
              text-sm text-indigo-500
              sm:left-4
            "
          />

          <select
            value={selectedSalon}
            onChange={(e) => setSelectedSalon(e.target.value)}
            disabled={salonLoading}
            className="
              block
              w-full
              min-w-0
              appearance-none
              rounded-[18px]
              border border-slate-200
              bg-slate-50
              py-3
              pl-10
              pr-10
              text-xs
              font-bold
              text-slate-800
              outline-none
              transition-all
              duration-200
              hover:border-indigo-200
              hover:bg-white
              focus:border-indigo-400
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-100
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:rounded-2xl
              sm:py-3.5
              sm:pl-11
              sm:pr-11
              sm:text-sm
            "
          >
            <option value="">
              {salonLoading
                ? "Loading salons..."
                : "Select salon"}
            </option>

            {salons.map((salon) => (
              <option key={salon._id} value={salon._id}>
                {salon.name}
              </option>
            ))}
          </select>

          {/* Chevron */}
          <FaChevronDown
            className="
              pointer-events-none
              absolute right-3.5 top-1/2
              -translate-y-1/2
              text-[11px]
              text-slate-400
              sm:right-4
            "
          />
        </div>
      </div>
    </div>
  </div>
</div>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* =====================================================
            NO SALON SELECTED
        ===================================================== */}

        {!selectedSalon ? (
          <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-sm">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-3xl text-indigo-500">
                <FaStore />
              </div>

              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                Select a salon to
                continue
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose one of your
                salons from the dropdown
                above to view and manage
                its staff members.
              </p>

              {salons.length === 0 &&
                !salonLoading && (
                  <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    No salons are currently
                    associated with your
                    account.
                  </div>
                )}
            </div>
          </div>
        ) : (
          <>
          {/* =====================================================
     STATS
===================================================== */}

<div className="mb-6 w-full min-w-0">
  <div
    className="
      grid
      w-full
      min-w-0
      grid-cols-1
      gap-3
      min-[400px]:grid-cols-2
      min-[400px]:gap-3.5
      sm:gap-4
      lg:gap-5
      xl:grid-cols-4
    "
  >

    {/* =================================================
        TOTAL STAFF
    ================================================= */}

    <div
      className="
        group relative
        min-w-0
        min-h-[164px]
        overflow-hidden
        rounded-[22px]
        border border-slate-200/80
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-indigo-200
        hover:shadow-[0_20px_50px_rgba(79,70,229,0.13)]
        sm:min-h-[176px]
        sm:rounded-[26px]
        sm:p-5
        lg:min-h-[185px]
      "
    >
      {/* Top gradient accent */}
      <div
        className="
          absolute inset-x-0 top-0 h-[3px]
          bg-gradient-to-r
          from-indigo-500
          via-violet-500
          to-purple-500
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Large decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-indigo-50
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      {/* Bottom glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-16
          h-32
          w-32
          rounded-full
          bg-indigo-50/60
          blur-2xl
        "
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {/* Icon row */}
        <div className="flex min-w-0 items-start justify-between">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-[14px]
              bg-indigo-50
              text-indigo-600
              ring-1 ring-indigo-100
              transition-all duration-300
              group-hover:scale-105
              group-hover:bg-indigo-100
              sm:h-12 sm:w-12
              sm:rounded-2xl
            "
          >
            <FaUsers className="text-base sm:text-lg" />
          </div>

          <span
            className="
              mt-1.5
              h-2
              w-2
              shrink-0
              rounded-full
              bg-indigo-500
              ring-4 ring-indigo-50
              sm:h-2.5
              sm:w-2.5
            "
          />
        </div>

        {/* Content */}
        <div className="mt-auto min-w-0 pt-5">
          <p
            className="
              min-w-0
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.14em]
              text-slate-400
              sm:text-[10px]
              sm:tracking-[0.16em]
              lg:text-[11px]
            "
          >
            Total Staff
          </p>

          <h3
            className="
              mt-1
              text-[28px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-slate-950
              sm:text-3xl
            "
          >
            {stats.total}
          </h3>

          <p
            className="
              mt-2
              min-w-0
              break-words
              text-[10px]
              font-medium
              leading-4
              text-slate-500
              sm:text-xs
            "
          >
            Team members
          </p>
        </div>
      </div>
    </div>


    {/* =================================================
        ACTIVE STAFF
    ================================================= */}

    <div
      className="
        group relative
        min-w-0
        min-h-[164px]
        overflow-hidden
        rounded-[22px]
        border border-slate-200/80
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-emerald-200
        hover:shadow-[0_20px_50px_rgba(16,185,129,0.13)]
        sm:min-h-[176px]
        sm:rounded-[26px]
        sm:p-5
        lg:min-h-[185px]
      "
    >
      {/* Top accent */}
      <div
        className="
          absolute inset-x-0 top-0 h-[3px]
          bg-gradient-to-r
          from-emerald-500
          via-teal-500
          to-green-500
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-emerald-50
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      {/* Bottom glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-16
          h-32
          w-32
          rounded-full
          bg-emerald-50/60
          blur-2xl
        "
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {/* Icon */}
        <div className="flex min-w-0 items-start justify-between">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-[14px]
              bg-emerald-50
              text-emerald-600
              ring-1 ring-emerald-100
              transition-all duration-300
              group-hover:scale-105
              group-hover:bg-emerald-100
              sm:h-12 sm:w-12
              sm:rounded-2xl
            "
          >
            <FaUserCheck className="text-base sm:text-lg" />
          </div>

          <span
            className="
              mt-1.5
              h-2
              w-2
              shrink-0
              rounded-full
              bg-emerald-500
              ring-4 ring-emerald-50
              sm:h-2.5
              sm:w-2.5
            "
          />
        </div>

        {/* Content */}
        <div className="mt-auto min-w-0 pt-5">
          <p
            className="
              min-w-0
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.14em]
              text-slate-400
              sm:text-[10px]
              sm:tracking-[0.16em]
              lg:text-[11px]
            "
          >
            Active
          </p>

          <h3
            className="
              mt-1
              text-[28px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-emerald-600
              sm:text-3xl
            "
          >
            {stats.active}
          </h3>

          <p
            className="
              mt-2
              min-w-0
              break-words
              text-[10px]
              font-medium
              leading-4
              text-slate-500
              sm:text-xs
            "
          >
            Currently working
          </p>
        </div>
      </div>
    </div>


    {/* =================================================
        INACTIVE STAFF
    ================================================= */}

    <div
      className="
        group relative
        min-w-0
        min-h-[164px]
        overflow-hidden
        rounded-[22px]
        border border-slate-200/80
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-rose-200
        hover:shadow-[0_20px_50px_rgba(244,63,94,0.13)]
        sm:min-h-[176px]
        sm:rounded-[26px]
        sm:p-5
        lg:min-h-[185px]
      "
    >
      {/* Top accent */}
      <div
        className="
          absolute inset-x-0 top-0 h-[3px]
          bg-gradient-to-r
          from-rose-500
          via-pink-500
          to-red-500
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-rose-50
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      {/* Bottom glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-16
          h-32
          w-32
          rounded-full
          bg-rose-50/60
          blur-2xl
        "
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {/* Icon */}
        <div className="flex min-w-0 items-start justify-between">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-[14px]
              bg-rose-50
              text-rose-600
              ring-1 ring-rose-100
              transition-all duration-300
              group-hover:scale-105
              group-hover:bg-rose-100
              sm:h-12 sm:w-12
              sm:rounded-2xl
            "
          >
            <FaBan className="text-base sm:text-lg" />
          </div>

          <span
            className="
              mt-1.5
              h-2
              w-2
              shrink-0
              rounded-full
              bg-rose-500
              ring-4 ring-rose-50
              sm:h-2.5
              sm:w-2.5
            "
          />
        </div>

        {/* Content */}
        <div className="mt-auto min-w-0 pt-5">
          <p
            className="
              min-w-0
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.14em]
              text-slate-400
              sm:text-[10px]
              sm:tracking-[0.16em]
              lg:text-[11px]
            "
          >
            Inactive
          </p>

          <h3
            className="
              mt-1
              text-[28px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-rose-600
              sm:text-3xl
            "
          >
            {stats.inactive}
          </h3>

          <p
            className="
              mt-2
              min-w-0
              break-words
              text-[10px]
              font-medium
              leading-4
              text-slate-500
              sm:text-xs
            "
          >
            Not available
          </p>
        </div>
      </div>
    </div>


    {/* =================================================
        ON LEAVE TODAY
    ================================================= */}

    <div
      className="
        group relative
        min-w-0
        min-h-[164px]
        overflow-hidden
        rounded-[22px]
        border border-slate-200/80
        bg-white
        p-4
        shadow-[0_8px_30px_rgba(15,23,42,0.055)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-amber-200
        hover:shadow-[0_20px_50px_rgba(245,158,11,0.13)]
        sm:min-h-[176px]
        sm:rounded-[26px]
        sm:p-5
        lg:min-h-[185px]
      "
    >
      {/* Top accent */}
      <div
        className="
          absolute inset-x-0 top-0 h-[3px]
          bg-gradient-to-r
          from-amber-500
          via-orange-500
          to-yellow-500
          opacity-0
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      {/* Decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          -right-12
          -top-12
          h-32
          w-32
          rounded-full
          bg-amber-50
          transition-transform duration-500
          group-hover:scale-125
        "
      />

      {/* Bottom glow */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -left-16
          h-32
          w-32
          rounded-full
          bg-amber-50/60
          blur-2xl
        "
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col">
        {/* Icon */}
        <div className="flex min-w-0 items-start justify-between">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-[14px]
              bg-amber-50
              text-amber-600
              ring-1 ring-amber-100
              transition-all duration-300
              group-hover:scale-105
              group-hover:bg-amber-100
              sm:h-12 sm:w-12
              sm:rounded-2xl
            "
          >
            <FaCalendarAlt className="text-base sm:text-lg" />
          </div>

          <span
            className="
              mt-1.5
              h-2
              w-2
              shrink-0
              rounded-full
              bg-amber-500
              ring-4 ring-amber-50
              sm:h-2.5
              sm:w-2.5
            "
          />
        </div>

        {/* Content */}
        <div className="mt-auto min-w-0 pt-5">
          <p
            className="
              min-w-0
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.11em]
              text-slate-400
              sm:text-[10px]
              sm:tracking-[0.13em]
              lg:text-[11px]
            "
          >
            On Leave Today
          </p>

          <h3
            className="
              mt-1
              text-[28px]
              font-black
              leading-none
              tracking-[-0.04em]
              text-amber-600
              sm:text-3xl
            "
          >
            {stats.onLeaveToday}
          </h3>

          <p
            className="
              mt-2
              min-w-0
              break-words
              text-[10px]
              font-medium
              leading-4
              text-slate-500
              sm:text-xs
            "
          >
            Staff unavailable
          </p>
        </div>
      </div>
    </div>

  </div>
</div>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  {/* Search */}
                  <div className="relative min-w-0 flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) =>
                        setSearchText(
                          e.target.value
                        )
                      }
                      placeholder="Search staff, phone or specialization..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Status */}
                  <div className="relative sm:w-[190px]">
                    <select
                      value={
                        statusFilter
                      }
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="ALL">
                        All Staff
                      </option>

                      <option value="ACTIVE">
                        Active
                      </option>

                      <option value="INACTIVE">
                        Inactive
                      </option>
                    </select>

                    <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                  </div>
                </div>

                {/* Add */}
                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                >
                  <FaPlus />
                  Add Staff
                </button>
              </div>
            </div>

            {/* =================================================
                STAFF LIST
            ================================================= */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Staff Members
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Showing{" "}
                      <span className="font-bold text-slate-700">
                        {
                          filteredStaff.length
                        }
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-slate-700">
                        {staff.length}
                      </span>{" "}
                      staff
                    </p>
                  </div>

                  {loading && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <FaSpinner className="animate-spin" />
                      Loading staff...
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[350px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <FaSpinner className="animate-spin text-xl" />
                    </div>

                    <p className="text-sm font-semibold text-slate-600">
                      Loading staff members...
                    </p>
                  </div>
                </div>
              ) : filteredStaff.length ===
                0 ? (
                <div className="flex min-h-[350px] items-center justify-center p-8">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                      <FaUserTie />
                    </div>

                    <h3 className="text-lg font-black text-slate-800">
                      No staff found
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {searchText ||
                      statusFilter !==
                        "ALL"
                        ? "Try changing your search or status filter."
                        : "Add your first staff member to this salon."}
                    </p>

                    {!searchText &&
                      statusFilter ===
                        "ALL" && (
                        <button
                          type="button"
                          onClick={
                            openCreateModal
                          }
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200"
                        >
                          <FaPlus />
                          Add Staff
                        </button>
                      )}
                  </div>
                </div>
              ) : (
                <>
                  {/* =================================================
                      DESKTOP TABLE
                  ================================================= */}

                <div className="hidden overflow-x-auto lg:block">
  <table className="w-full min-w-[1050px]">
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50/80">
        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          Staff
        </th>

        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          Specialization
        </th>

        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          Contact
        </th>

        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          Status
        </th>

        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
          Leaves
        </th>

        <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-wider text-slate-400">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-slate-100">
      {filteredStaff.map((item) => (
        <React.Fragment key={item._id}>
          {/* ================= STAFF ROW ================= */}
          <tr className="group transition hover:bg-slate-50/70">

            {/* Staff */}
            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                {item.profileImage ? (
                  <img
                    src={`${API_URL.replace("/api", "")}${item.profileImage}`}
                    alt={item.name}
                    className="h-12 w-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-sm">
                    {getInitials(item.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {item.name}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <FaStore className="text-[9px]" />
                    {getSalonName(item)}
                  </p>
                </div>
              </div>
            </td>

            {/* Specialization */}
            <td className="px-6 py-5">
              <div className="flex max-w-[230px] flex-wrap gap-1.5">
                {item.specialization?.length > 0 ? (
                  <>
                    {item.specialization.slice(0, 3).map((spec, index) => (
                      <span
                        key={index}
                        className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600"
                      >
                        {spec}
                      </span>
                    ))}

                    {item.specialization.length > 3 && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                        +{item.specialization.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400">
                    Not specified
                  </span>
                )}
              </div>
            </td>

            {/* Contact */}
            <td className="px-6 py-5">
              {item.phone ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                    <FaPhone />
                  </div>

                  {item.phone}
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  No phone
                </span>
              )}
            </td>

            {/* Status */}
            <td className="px-6 py-5">
              {item.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Inactive
                </span>
              )}
            </td>

            {/* Leaves */}
            <td className="px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setExpandedStaff(
                    expandedStaff === item._id
                      ? null
                      : item._id
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  expandedStaff === item._id
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <FaCalendarAlt className="text-indigo-500" />

                {item.leaves?.length || 0}

                {expandedStaff === item._id ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>
            </td>

            {/* Actions */}
            <td className="px-6 py-5">
              <div className="flex justify-end gap-2">

                {/* Edit */}
                <button
                  type="button"
                  title="Edit staff"
                  onClick={() => openEditModal(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                >
                  <FaEdit className="text-xs" />
                </button>

                {/* Activate / Deactivate */}
                <button
                  type="button"
                  title={
                    item.isActive
                      ? "Deactivate"
                      : "Activate"
                  }
                  onClick={() => toggleStatus(item)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                    item.isActive
                      ? "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {item.isActive ? (
                    <FaBan className="text-xs" />
                  ) : (
                    <FaCheckCircle className="text-xs" />
                  )}
                </button>

                {/* Manage Leave */}
                <button
                  type="button"
                  title="Manage leave"
                  onClick={() => openLeaveModal(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition hover:bg-purple-600 hover:text-white"
                >
                  <FaCalendarPlus className="text-xs" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  title="Delete staff"
                  onClick={() => deleteStaff(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </td>
          </tr>

          {/* ================================================= */}
          {/* EXPANDED STAFF DETAILS - DESKTOP / LAPTOP */}
          {/* ================================================= */}

          {expandedStaff === item._id && (
            <tr className="bg-slate-50/60">
              <td colSpan={6} className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                  {/* ================= SCHEDULE ================= */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          Working Schedule
                        </h4>

                        <p className="mt-1 text-xs text-slate-400">
                          Weekly working hours
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <FaClock />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {item.workingHours?.length > 0 ? (
                        item.workingHours.map((schedule, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  schedule.isWorking
                                    ? "bg-emerald-500"
                                    : "bg-slate-300"
                                }`}
                              />

                              <span className="text-xs font-bold text-slate-700">
                                {schedule.day}
                              </span>
                            </div>

                            {schedule.isWorking ? (
                              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600">
                                {schedule.startTime || "--"}{" "}
                                -{" "}
                                {schedule.endTime || "--"}
                              </span>
                            ) : (
                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-400">
                                Off Day
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-slate-50 px-4 py-5 text-center">
                          <p className="text-xs font-semibold text-slate-400">
                            Working schedule not configured
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ================= LEAVES ================= */}
               
<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

  <div className="mb-4 flex items-center justify-between">
    <div>
      <h4 className="text-sm font-black text-slate-900">
        Staff Leaves
      </h4>

      <p className="mt-1 text-xs text-slate-400">
        Leave history and upcoming leaves
      </p>
    </div>

    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
      <FaCalendarAlt />
    </div>
  </div>

  {item.leaves?.length > 0 ? (
    <div className="space-y-2">
      {item.leaves.map((leave, index) => {
        const startDate = new Date(
          leave.startDate
        );

        const endDate = new Date(
          leave.endDate
        );

        return (
          <div
            key={index}
            className="rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">

              {/* Leave Information */}
              <div className="flex min-w-0 items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FaCalendarAlt className="text-xs" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800">
                    {startDate.toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}

                    {" - "}

                    {endDate.toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>

                  {leave.reason && (
                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      {leave.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Leave Actions */}
              <div className="flex shrink-0 items-center gap-2">

                <span className="hidden rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-black text-purple-600 sm:inline-flex">
                  Leave
                </span>

                <button
                  type="button"
                  title="Remove leave"
                  onClick={() =>
                    removeLeave(item, index)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition-all duration-200 hover:bg-rose-500 hover:text-white hover:shadow-md"
                >
                  <FaCalendarMinus className="text-xs" />
                </button>

              </div>

            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="rounded-xl bg-emerald-50 px-4 py-6 text-center">

      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <FaCheckCircle />
      </div>

      <p className="text-xs font-bold text-emerald-600">
        No leaves scheduled
      </p>

      <p className="mt-1 text-[11px] text-emerald-500/70">
        This staff member has no recorded leaves.
      </p>

    </div>
  )}

</div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>

                  {/* =================================================
                      MOBILE / TABLET CARDS
                  ================================================= */}

                 <div className="block bg-slate-50/50 p-3 sm:p-4 md:p-5 lg:hidden">
  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
    {filteredStaff.map((item) => {
      const isExpanded = expandedStaff === item._id;

      return (
        <div
          key={item._id}
          className="group min-w-0 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,23,42,0.09)] sm:rounded-[28px]"
        >
          {/* =====================================================
              MAIN CARD
          ===================================================== */}
          <div className="min-w-0 p-3.5 sm:p-5">

            {/* =================================================
                HEADER
            ================================================= */}
           
<div className="min-w-0">

  {/* Profile + Name + Status */}
  <div className="flex min-w-0 items-start gap-3">

    {/* Profile */}
    <div className="shrink-0">
      {item.profileImage ? (
        <img
          src={`${API_URL.replace("/api", "")}${item.profileImage}`}
          alt={item.name}
          className="h-12 w-12 rounded-[16px] object-cover shadow-sm ring-2 ring-white sm:h-14 sm:w-14 sm:rounded-[18px]"
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-sm font-black text-white shadow-sm ring-2 ring-white sm:h-14 sm:w-14 sm:rounded-[18px] sm:text-base">
          {getInitials(item.name)}
        </div>
      )}
    </div>

    {/* Staff Name */}
    <div className="min-w-0 flex-1">
      <h3 className="break-words text-sm font-black leading-5 text-slate-900 sm:text-[15px] sm:leading-6">
        {item.name}
      </h3>
    </div>

    {/* Status */}
    <div className="shrink-0">
      {item.isActive ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black text-emerald-600 shadow-sm sm:px-3 sm:text-[10px]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1.5 text-[9px] font-black text-rose-600 shadow-sm sm:px-3 sm:text-[10px]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          Inactive
        </span>
      )}
    </div>
  </div>

  {/* Salon Name */}
  <div className="mt-4 flex min-w-0 items-start gap-1.5 pl-1">
    <FaStore className="mt-1 shrink-0 text-[9px] text-slate-400" />

    <p className="min-w-0 break-words text-[11px] font-medium leading-4 text-slate-400 sm:text-xs">
      {getSalonName(item)}
    </p>
  </div>

</div>

            {/* =================================================
                SPECIALIZATION
            ================================================= */}
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:mt-5 sm:p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                  Specialization
                </p>

                {item.specialization?.length > 0 && (
                  <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-slate-400 shadow-sm">
                    {item.specialization.length} skill
                    {item.specialization.length === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-wrap gap-1.5">
                {item.specialization?.length > 0 ? (
                  item.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="max-w-full break-words rounded-xl border border-indigo-100 bg-white px-2.5 py-1.5 text-[10px] font-bold leading-4 text-indigo-600 shadow-sm sm:text-[11px]"
                    >
                      {spec}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    Not specified
                  </span>
                )}
              </div>
            </div>

            {/* =================================================
                INFORMATION GRID
            ================================================= */}
            <div className="mt-3 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:mt-4 sm:gap-3">

              {/* Phone */}
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[11px] text-slate-500">
                    <FaPhone />
                  </div>

                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Phone
                  </p>
                </div>

                <p className="mt-2 break-words break-all text-xs font-bold leading-5 text-slate-700">
                  {item.phone || "Not added"}
                </p>
              </div>

              {/* Leaves */}
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[11px] text-purple-500">
                    <FaCalendarAlt />
                  </div>

                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Leaves
                  </p>
                </div>

                <p className="mt-2 break-words text-xs font-bold leading-5 text-slate-700">
                  {item.leaves?.length || 0} record
                  {item.leaves?.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-2.5">

              {/* Edit */}
              <button
                type="button"
                title="Edit staff"
                onClick={() => openEditModal(item)}
                className="flex h-10 min-w-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:text-white hover:shadow-md active:scale-[0.98] sm:h-11"
              >
                <FaEdit className="text-sm" />
              </button>

              {/* Activate / Deactivate */}
              <button
                type="button"
                title={
                  item.isActive
                    ? "Deactivate"
                    : "Activate"
                }
                onClick={() => toggleStatus(item)}
                className={`flex h-10 min-w-0 items-center justify-center rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] sm:h-11 ${
                  item.isActive
                    ? "bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                }`}
              >
                {item.isActive ? (
                  <FaBan className="text-sm" />
                ) : (
                  <FaCheckCircle className="text-sm" />
                )}
              </button>

              {/* Manage Leave */}
              <button
                type="button"
                title="Manage leave"
                onClick={() => openLeaveModal(item)}
                className="flex h-10 min-w-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-600 hover:text-white hover:shadow-md active:scale-[0.98] sm:h-11"
              >
                <FaCalendarPlus className="text-sm" />
              </button>

              {/* Delete */}
              <button
                type="button"
                title="Delete staff"
                onClick={() => deleteStaff(item)}
                className="flex h-10 min-w-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-600 hover:text-white hover:shadow-md active:scale-[0.98] sm:h-11"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>

            {/* =================================================
                EXPAND BUTTON
            ================================================= */}
            <button
              type="button"
              onClick={() =>
                setExpandedStaff(
                  isExpanded ? null : item._id
                )
              }
              className={`mt-2.5 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.99] sm:mt-3 ${
                isExpanded
                  ? "border-indigo-100 bg-indigo-50 text-indigo-600"
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span className="break-words text-center">
                {isExpanded
                  ? "Hide details"
                  : "View schedule & leaves"}
              </span>

              {isExpanded ? (
                <FaChevronUp className="shrink-0 text-[10px]" />
              ) : (
                <FaChevronDown className="shrink-0 text-[10px]" />
              )}
            </button>
          </div>

          {/* =====================================================
              EXPANDED DETAILS
          ===================================================== */}
          {isExpanded && (
            <div className="border-t border-slate-200 bg-slate-50/80 p-3.5 sm:p-5">

              {/* =================================================
                  WORKING HOURS
              ================================================= */}
              <div className="min-w-0">

                <div className="mb-3.5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                    <FaClock className="text-xs" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800">
                      Working Hours
                    </h4>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      Weekly schedule
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {DAYS.map((day) => {
                    const wh =
                      item.workingHours?.find(
                        (value) =>
                          value.day === day
                      );

                    return (
                      <div
                        key={day}
                        className="flex min-w-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between sm:px-3.5 sm:py-3"
                      >
                        {/* Day */}
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              wh?.isWorking
                                ? "bg-emerald-500"
                                : "bg-slate-300"
                            }`}
                          />

                          <span className="break-words text-xs font-bold leading-5 text-slate-600">
                            {formatDay(day)}
                          </span>
                        </div>

                        {/* Time */}
                        {wh?.isWorking ? (
                          <span className="w-fit max-w-full break-words rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold leading-4 text-emerald-600 sm:text-[11px]">
                            {wh.startTime || "--:--"}
                            {" - "}
                            {wh.endTime || "--:--"}
                          </span>
                        ) : (
                          <span className="w-fit rounded-xl bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-400 sm:text-[11px]">
                            Off
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  LEAVE HISTORY
              ================================================= */}
              <div className="mt-6 min-w-0">

                <div className="mb-3.5 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 shadow-sm">
                    <FaCalendarAlt className="text-xs" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-800">
                      Leave History
                    </h4>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      Previous and upcoming leaves
                    </p>
                  </div>
                </div>

                {item.leaves?.length > 0 ? (
                  <div className="space-y-2">
                    {item.leaves.map(
                      (leave, index) => (
                        <div
                          key={index}
                          className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-3.5"
                        >
                          <div className="flex min-w-0 items-start gap-3">

                            {/* Leave Content */}
                            <div className="flex min-w-0 flex-1 items-start gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                                <FaCalendarAlt className="text-[10px]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="break-words text-xs font-bold leading-5 text-slate-700">
                                  {formatDate(
                                    leave.startDate
                                  )}{" "}
                                  <span className="text-slate-300">
                                    →
                                  </span>{" "}
                                  {formatDate(
                                    leave.endDate
                                  )}
                                </p>

                                {leave.reason && (
                                  <p className="mt-1 break-words text-[11px] font-medium leading-4 text-slate-400">
                                    {leave.reason}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Remove */}
                            <button
                              type="button"
                              title="Remove leave"
                              onClick={() =>
                                removeLeave(
                                  item,
                                  index
                                )
                              }
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition-all duration-200 hover:bg-rose-500 hover:text-white hover:shadow-md active:scale-95"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-center">
                    <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <FaCheckCircle />
                    </div>

                    <p className="text-xs font-bold text-emerald-600">
                      No leave records
                    </p>

                    <p className="mt-1 break-words text-[10px] font-medium leading-4 text-emerald-500/70">
                      This staff member has no scheduled
                      leaves.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
                </>
              )}
            </div>
          </>
        )}
      </main>

     {/* =====================================================
    CREATE / EDIT MODAL
===================================================== */}

{showModal && (
  <div
    className="
      fixed inset-0 z-[1000]
      flex items-center justify-center
      bg-slate-950/65
      p-2
      backdrop-blur-md
      sm:p-4
      lg:p-6
    "
  >
    <div
      className="
        flex h-[calc(100dvh-1rem)] w-full
        max-w-6xl flex-col
        overflow-hidden
        rounded-[22px]
        border border-white/20
        bg-white
        shadow-[0_25px_80px_rgba(15,23,42,0.28)]
        sm:h-[calc(100dvh-2rem)]
        sm:rounded-[28px]
        lg:h-auto
        lg:max-h-[94dvh]
        xl:rounded-[32px]
      "
    >
      {/* =================================================
          MODAL HEADER
      ================================================= */}

      <div
        className="
          shrink-0
          border-b border-slate-200/80
          bg-white
          px-4 py-3.5
          sm:px-5 sm:py-4
          lg:px-6 lg:py-5
        "
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          {/* Header Left */}

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-indigo-500 to-violet-600
                text-sm text-white
                shadow-lg shadow-indigo-200
                sm:h-12 sm:w-12
                sm:rounded-2xl
                sm:text-base
              "
            >
              {editingStaff ? <FaEdit /> : <FaUserTie />}
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2
                  className="
                    min-w-0
                    truncate
                    text-base font-black
                    tracking-tight
                    text-slate-900
                    sm:text-lg
                    lg:text-xl
                  "
                >
                  {editingStaff
                    ? "Edit Staff"
                    : "Add New Staff"}
                </h2>

                <span
                  className="
                    hidden shrink-0
                    rounded-full
                    bg-indigo-50
                    px-2.5 py-1
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-indigo-600
                    sm:inline-flex
                  "
                >
                  {editingStaff ? "Update" : "New"}
                </span>
              </div>

              <p
                className="
                  mt-0.5
                  hidden
                  max-w-xl
                  text-[11px]
                  leading-4
                  text-slate-400
                  sm:block
                  lg:text-xs
                "
              >
                {editingStaff
                  ? "Update staff information, specializations and working schedule."
                  : "Create a professional staff profile with working schedule and availability."}
              </p>
            </div>
          </div>

          {/* Close */}

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-slate-500
              transition-all duration-200
              hover:border-rose-200
              hover:bg-rose-50
              hover:text-rose-500
              active:scale-95
              sm:h-10 sm:w-10
              sm:rounded-2xl
            "
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>

      {/* =================================================
          MODAL FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="
          flex min-h-0
          flex-1 flex-col
          overflow-hidden
        "
      >
        {/* =================================================
            SCROLLABLE BODY
        ================================================= */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            bg-slate-50/70
            overscroll-contain
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-6xl
              p-3
              sm:p-4
              md:p-5
              lg:p-6
              xl:p-7
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:gap-5
                lg:gap-6
                xl:grid-cols-12
              "
            >
              {/* =================================================
                  LEFT - PROFILE
              ================================================= */}

              <div
                className="
                  min-w-0
                  space-y-4
                  sm:space-y-5
                  xl:col-span-5
                "
              >
                {/* =================================================
                    PROFILE PHOTO
                ================================================= */}

                <div
                  className="
                    relative overflow-hidden
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  {/* Decorative Background */}

                  <div
                    className="
                      pointer-events-none
                      absolute -right-12 -top-12
                      h-32 w-32
                      rounded-full
                      bg-indigo-50
                      blur-2xl
                    "
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute -bottom-16 -left-16
                      h-32 w-32
                      rounded-full
                      bg-violet-50
                      blur-2xl
                    "
                  />

                  <div className="relative z-10">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-xl
                            bg-indigo-50
                            text-indigo-600
                          "
                        >
                          <FaImage className="text-xs" />
                        </div>

                        <h3
                          className="
                            text-sm
                            font-black
                            text-slate-800
                          "
                        >
                          Profile Photo
                        </h3>
                      </div>

                      <p
                        className="
                          mt-1.5
                          pl-10
                          text-[10px]
                          leading-4
                          text-slate-400
                          sm:text-xs
                        "
                      >
                        JPG, PNG or WEBP · Maximum 5MB
                      </p>
                    </div>

                    {/* Image */}

                    <div className="flex justify-center">
                      <div className="relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="
                              h-24 w-24
                              rounded-[24px]
                              object-cover
                              shadow-xl
                              ring-4 ring-white
                              sm:h-28 sm:w-28
                              sm:rounded-[28px]
                            "
                          />
                        ) : (
                          <div
                            className="
                              flex h-24 w-24
                              items-center justify-center
                              rounded-[24px]
                              border border-dashed
                              border-slate-300
                              bg-slate-50
                              text-2xl
                              text-slate-300
                              shadow-sm
                              sm:h-28 sm:w-28
                              sm:rounded-[28px]
                              sm:text-3xl
                            "
                          >
                            <FaImage />
                          </div>
                        )}

                        <label
                          className="
                            absolute -bottom-2 -right-2
                            flex h-9 w-9
                            cursor-pointer
                            items-center justify-center
                            rounded-xl
                            bg-gradient-to-br
                            from-indigo-600 to-violet-600
                            text-white
                            shadow-lg
                            shadow-indigo-200
                            transition-all duration-200
                            hover:scale-105
                            hover:shadow-xl
                            active:scale-95
                            sm:h-10 sm:w-10
                            sm:rounded-2xl
                          "
                        >
                          <FaImage className="text-xs" />

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SALON
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  <label
                    className="
                      mb-2 block
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                      sm:text-xs
                    "
                  >
                    Salon
                  </label>

                  <div className="relative min-w-0">
                    <FaStore
                      className="
                        pointer-events-none
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                        text-indigo-500
                        sm:left-4
                      "
                    />

                    <select
                      name="salon"
                      value={form.salon}
                      onChange={handleChange}
                      disabled={!!editingStaff}
                      className="
                        w-full min-w-0
                        appearance-none
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        py-3
                        pl-10 pr-10
                        text-xs
                        font-bold
                        text-slate-700
                        outline-none
                        transition-all duration-200
                        focus:border-indigo-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-100
                        disabled:cursor-not-allowed
                        disabled:bg-slate-100
                        disabled:text-slate-500
                        sm:py-3.5
                        sm:pl-11
                        sm:text-sm
                      "
                    >
                      <option value="">
                        Select salon
                      </option>

                      {salons.map((salon) => (
                        <option
                          key={salon._id}
                          value={salon._id}
                        >
                          {salon.name}
                        </option>
                      ))}
                    </select>

                    <FaChevronDown
                      className="
                        pointer-events-none
                        absolute right-3.5 top-1/2
                        -translate-y-1/2
                        text-[10px]
                        text-slate-400
                        sm:right-4
                      "
                    />
                  </div>

                  {editingStaff && (
                    <div
                      className="
                        mt-2.5
                        flex items-start gap-2
                        rounded-xl
                        bg-amber-50
                        px-3 py-2
                        text-[10px]
                        font-semibold
                        leading-4
                        text-amber-700
                        sm:text-[11px]
                      "
                    >
                      <span className="mt-0.5 shrink-0">
                        ⚠
                      </span>

                      <span>
                        Salon cannot be changed while
                        editing existing staff.
                      </span>
                    </div>
                  )}
                </div>

                {/* =================================================
                    STAFF NAME
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  <label
                    className="
                      mb-2 block
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                      sm:text-xs
                    "
                  >
                    Staff Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter staff name"
                    className="
                      w-full min-w-0
                      rounded-2xl
                      border border-slate-200
                      bg-slate-50
                      px-3.5 py-3
                      text-xs
                      font-semibold
                      text-slate-700
                      outline-none
                      transition-all duration-200
                      placeholder:text-slate-400
                      focus:border-indigo-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-indigo-100
                      sm:px-4
                      sm:py-3.5
                      sm:text-sm
                    "
                  />
                </div>

                {/* =================================================
                    PHONE
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  <label
                    className="
                      mb-2 block
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                      sm:text-xs
                    "
                  >
                    Phone Number
                  </label>

                  <div className="relative min-w-0">
                    <FaPhone
                      className="
                        pointer-events-none
                        absolute left-3.5 top-1/2
                        -translate-y-1/2
                        text-slate-400
                        sm:left-4
                      "
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="
                        w-full min-w-0
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        py-3
                        pl-10 pr-3.5
                        text-xs
                        font-semibold
                        text-slate-700
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        focus:border-indigo-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-100
                        sm:py-3.5
                        sm:pl-11
                        sm:pr-4
                        sm:text-sm
                      "
                    />
                  </div>
                </div>

                {/* =================================================
                    SPECIALIZATIONS
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  <label
                    className="
                      mb-2 block
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                      sm:text-xs
                    "
                  >
                    Specializations
                  </label>

                  <div className="flex min-w-0 gap-2">
                    <input
                      type="text"
                      value={form.specializationInput}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          specializationInput:
                            e.target.value,
                        }))
                      }
                      onKeyDown={
                        handleSpecializationKeyDown
                      }
                      placeholder="e.g. Hair Styling"
                      className="
                        min-w-0 flex-1
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        px-3.5 py-3
                        text-xs
                        font-semibold
                        outline-none
                        transition-all duration-200
                        placeholder:text-slate-400
                        focus:border-indigo-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-indigo-100
                        sm:px-4
                        sm:py-3.5
                        sm:text-sm
                      "
                    />

                    <button
                      type="button"
                      onClick={addSpecialization}
                      className="
                        flex h-[46px] w-[46px]
                        shrink-0
                        items-center justify-center
                        rounded-2xl
                        bg-gradient-to-br
                        from-indigo-600 to-violet-600
                        text-white
                        shadow-lg
                        shadow-indigo-100
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:shadow-xl
                        active:scale-95
                        sm:h-[50px]
                        sm:w-[50px]
                      "
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                    </button>
                  </div>

                  {form.specialization.length > 0 && (
                    <div
                      className="
                        mt-3
                        flex min-w-0
                        flex-wrap gap-2
                      "
                    >
                      {form.specialization.map(
                        (item, index) => (
                          <span
                            key={index}
                            className="
                              inline-flex
                              max-w-full
                              items-center
                              gap-2
                              rounded-xl
                              border border-indigo-100
                              bg-indigo-50
                              px-2.5 py-1.5
                              text-[10px]
                              font-bold
                              text-indigo-600
                              sm:px-3 sm:py-2
                              sm:text-xs
                            "
                          >
                            <span className="min-w-0 break-words">
                              {item}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                removeSpecialization(index)
                              }
                              className="
                                shrink-0
                                text-indigo-400
                                transition
                                hover:text-rose-500
                              "
                            >
                              <FaTimes className="text-[9px]" />
                            </button>
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* =================================================
                    SERVICES
                ================================================= */}

                <div
                  className="
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.04)]
                    sm:rounded-[26px]
                    sm:p-5
                  "
                >
                  <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <label
                        className="
                          block
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.14em]
                          text-slate-500
                          sm:text-xs
                        "
                      >
                        Services
                      </label>

                      <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400 sm:text-xs">
                        Select the services this staff member can perform.
                      </p>
                    </div>

                    <span
                      className="
                        shrink-0
                        rounded-full
                        bg-indigo-50
                        px-2.5 py-1
                        text-[9px]
                        font-extrabold
                        text-indigo-600
                        ring-1 ring-indigo-100
                        sm:px-3 sm:text-[10px]
                      "
                    >
                      {(form.services || []).length} selected
                    </span>
                  </div>

                  {!form.salon ? (
                    <div
                      className="
                        flex min-h-[100px]
                        items-center justify-center
                        rounded-2xl
                        border border-dashed border-slate-200
                        bg-slate-50
                        px-4 py-5
                        text-center
                        text-[11px]
                        font-semibold
                        text-slate-400
                        sm:text-xs
                      "
                    >
                      Select a salon first to view its services.
                    </div>
                  ) : serviceLoading ? (
                    <div
                      className="
                        flex min-h-[100px]
                        items-center justify-center
                        gap-2
                        rounded-2xl
                        border border-slate-200
                        bg-slate-50
                        px-4 py-5
                        text-[11px]
                        font-semibold
                        text-indigo-500
                        sm:text-xs
                      "
                    >
                      <FaSpinner className="animate-spin" />
                      Loading services...
                    </div>
                  ) : services.length === 0 ? (
                    <div
                      className="
                        flex min-h-[100px]
                        items-center justify-center
                        rounded-2xl
                        border border-dashed border-slate-200
                        bg-slate-50
                        px-4 py-5
                        text-center
                        text-[11px]
                        font-semibold
                        text-slate-400
                        sm:text-xs
                      "
                    >
                      No active services found for this salon.
                    </div>
                  ) : (
                    <div
                      className="
                        grid
                        max-h-[300px]
                        grid-cols-1
                        gap-2
                        overflow-y-auto
                        pr-1
                        min-[420px]:grid-cols-2
                        sm:gap-2.5
                      "
                    >
                      {services.map((service) => {
                        const serviceId =
                          service._id || service.id;

                        const selected =
                          (form.services || []).some(
                            (id) =>
                              id?.toString() ===
                              serviceId?.toString()
                          );

                        return (
                          <button
                            key={serviceId}
                            type="button"
                            onClick={() =>
                              toggleService(serviceId)
                            }
                            className={`
                              group flex min-w-0
                              items-center gap-3
                              rounded-2xl
                              border px-3 py-3
                              text-left
                              transition-all duration-200
                              ${
                                selected
                                  ? "border-indigo-200 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-100"
                                  : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                              }
                            `}
                          >
                            <span
                              className={`
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-xl
                                transition-all duration-200
                                ${
                                  selected
                                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100"
                                    : "bg-white text-slate-300 ring-1 ring-slate-200 group-hover:text-indigo-400"
                                }
                              `}
                            >
                              {selected ? (
                                <FaCheckCircle className="text-sm" />
                              ) : (
                                <FaBriefcase className="text-xs" />
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span
                                className={`
                                  block truncate
                                  text-[11px]
                                  font-extrabold
                                  sm:text-xs
                                  ${
                                    selected
                                      ? "text-indigo-700"
                                      : "text-slate-700"
                                  }
                                `}
                              >
                                {service.name || "Unnamed Service"}
                              </span>

                              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] font-semibold text-slate-400 sm:text-[10px]">
                                {service.duration ? (
                                  <span>
                                    {service.duration} min
                                  </span>
                                ) : null}

                                {service.price !== undefined &&
                                service.price !== null ? (
                                  <span>
                                    ₹{service.price}
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  RIGHT - WORKING SCHEDULE
              ================================================= */}

              <div
                className="
                  min-w-0
                  xl:col-span-7
                "
              >
                <div
                  className="
                    relative overflow-hidden
                    rounded-[22px]
                    border border-slate-200/80
                    bg-white
                    p-4
                    shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                    sm:rounded-[26px]
                    sm:p-5
                    lg:p-6
                  "
                >
                  {/* Decorative Background */}

                  <div
                    className="
                      pointer-events-none
                      absolute -right-20 -top-20
                      h-48 w-48
                      rounded-full
                      bg-indigo-50/80
                      blur-3xl
                    "
                  />

                  <div
                    className="
                      pointer-events-none
                      absolute -bottom-20 -left-20
                      h-48 w-48
                      rounded-full
                      bg-violet-50/60
                      blur-3xl
                    "
                  />

                  <div className="relative z-10">
                    {/* Schedule Header */}

                    <div
                      className="
                        mb-4
                        flex flex-col
                        gap-3
                        sm:mb-5
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                      "
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="
                              flex h-9 w-9
                              shrink-0
                              items-center justify-center
                              rounded-xl
                              bg-indigo-50
                              text-indigo-600
                              ring-1 ring-indigo-100
                            "
                          >
                            <FaClock className="text-xs" />
                          </div>

                          <h3
                            className="
                              text-sm
                              font-black
                              text-slate-800
                              sm:text-base
                            "
                          >
                            Working Schedule
                          </h3>
                        </div>

                        <p
                          className="
                            mt-2
                            max-w-xl
                            text-[10px]
                            leading-4
                            text-slate-400
                            sm:text-xs
                            sm:leading-5
                          "
                        >
                          Configure staff working days
                          and operating hours.
                        </p>
                      </div>

                      <span
                        className="
                          hidden
                          shrink-0
                          rounded-full
                          border border-indigo-100
                          bg-indigo-50
                          px-3 py-1.5
                          text-[9px]
                          font-extrabold
                          uppercase
                          tracking-wider
                          text-indigo-600
                          sm:inline-flex
                        "
                      >
                        Weekly Schedule
                      </span>
                    </div>

                    {/* =================================================
                        DAYS
                    ================================================= */}

                    <div className="space-y-2.5">
                      {DAYS.map((day) => {
                        const current =
                          form.workingHours[day];

                        return (
                          <div
                            key={day}
                            className={`
                              min-w-0
                              overflow-hidden
                              rounded-2xl
                              border
                              p-3
                              transition-all duration-200
                              sm:p-3.5
                              ${
                                current.isWorking
                                  ? "border-slate-200 bg-white"
                                  : "border-slate-200/80 bg-slate-100/70"
                              }
                            `}
                          >
                            {/* Day Header */}

                            <div
                              className="
                                flex min-w-0
                                items-center
                                justify-between
                                gap-3
                              "
                            >
                              <div
                                className="
                                  flex min-w-0
                                  items-center
                                  gap-2.5
                                "
                              >
                                {/* Toggle */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleWorkingDay(day)
                                  }
                                  aria-label={`Toggle ${formatDay(
                                    day
                                  )}`}
                                  className={`
                                    relative
                                    h-6 w-11
                                    shrink-0
                                    rounded-full
                                    transition-all duration-200
                                    ${
                                      current.isWorking
                                        ? "bg-indigo-600 shadow-md shadow-indigo-100"
                                        : "bg-slate-300"
                                    }
                                  `}
                                >
                                  <span
                                    className={`
                                      absolute top-1
                                      h-4 w-4
                                      rounded-full
                                      bg-white
                                      shadow-sm
                                      transition-all duration-200
                                      ${
                                        current.isWorking
                                          ? "left-6"
                                          : "left-1"
                                      }
                                    `}
                                  />
                                </button>

                                {/* Day */}

                                <span
                                  className="
                                    min-w-0
                                    truncate
                                    text-xs
                                    font-black
                                    text-slate-700
                                    sm:text-sm
                                  "
                                >
                                  {formatDay(day)}
                                </span>
                              </div>

                              {/* Status */}

                              <span
                                className={`
                                  shrink-0
                                  rounded-full
                                  px-2 py-1
                                  text-[8px]
                                  font-extrabold
                                  uppercase
                                  tracking-wider
                                  sm:px-2.5
                                  sm:text-[9px]
                                  ${
                                    current.isWorking
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-200 text-slate-500"
                                  }
                                `}
                              >
                                {current.isWorking
                                  ? "Working"
                                  : "Day Off"}
                              </span>
                            </div>

                            {/* =================================================
                                TIME CONTROLS
                            ================================================= */}

                            {current.isWorking ? (
                              <div
                                className="
                                  mt-3
                                  grid
                                  grid-cols-1
                                  gap-2
                                  min-[400px]:grid-cols-2
                                  sm:gap-2.5
                                "
                              >
                                {/* Start */}

                                <div className="min-w-0">
                                  <label
                                    className="
                                      mb-1.5
                                      block
                                      text-[9px]
                                      font-bold
                                      uppercase
                                      tracking-wider
                                      text-slate-400
                                    "
                                  >
                                    Start Time
                                  </label>

                                  <div className="relative min-w-0">
                                    <FaClock
                                      className="
                                        pointer-events-none
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[10px]
                                        text-slate-400
                                      "
                                    />

                                    <input
                                      type="time"
                                      value={
                                        current.startTime
                                      }
                                      onChange={(e) =>
                                        updateWorkingHour(
                                          day,
                                          "startTime",
                                          e.target.value
                                        )
                                      }
                                      className="
                                        w-full
                                        min-w-0
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        py-2.5
                                        pl-8
                                        pr-2
                                        text-[11px]
                                        font-bold
                                        text-slate-700
                                        outline-none
                                        transition-all
                                        focus:border-indigo-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-indigo-100
                                        sm:text-xs
                                      "
                                    />
                                  </div>
                                </div>

                                {/* End */}

                                <div className="min-w-0">
                                  <label
                                    className="
                                      mb-1.5
                                      block
                                      text-[9px]
                                      font-bold
                                      uppercase
                                      tracking-wider
                                      text-slate-400
                                    "
                                  >
                                    End Time
                                  </label>

                                  <div className="relative min-w-0">
                                    <FaClock
                                      className="
                                        pointer-events-none
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[10px]
                                        text-slate-400
                                      "
                                    />

                                    <input
                                      type="time"
                                      value={
                                        current.endTime
                                      }
                                      onChange={(e) =>
                                        updateWorkingHour(
                                          day,
                                          "endTime",
                                          e.target.value
                                        )
                                      }
                                      className="
                                        w-full
                                        min-w-0
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        py-2.5
                                        pl-8
                                        pr-2
                                        text-[11px]
                                        font-bold
                                        text-slate-700
                                        outline-none
                                        transition-all
                                        focus:border-indigo-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-indigo-100
                                        sm:text-xs
                                      "
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="
                                  mt-3
                                  flex
                                  items-center
                                  gap-2
                                  rounded-xl
                                  border
                                  border-slate-200/80
                                  bg-slate-100
                                  px-3 py-2.5
                                  text-[10px]
                                  font-bold
                                  text-slate-400
                                  sm:text-xs
                                "
                              >
                                <FaTimes className="shrink-0 text-[9px]" />
                                <span>
                                  Staff is unavailable
                                  on this day
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            shrink-0
            border-t border-slate-200
            bg-white
            px-3 py-3
            sm:px-5 sm:py-4
            lg:px-6
          "
        >
          <div
            className="
              flex
              flex-col-reverse
              gap-2.5
              sm:flex-row
              sm:items-center
              sm:justify-end
              sm:gap-3
            "
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="
                w-full
                rounded-2xl
                border border-slate-200
                bg-white
                px-5 py-3
                text-xs
                font-bold
                text-slate-600
                transition-all duration-200
                hover:border-slate-300
                hover:bg-slate-50
                active:scale-[0.98]
                sm:w-auto
                sm:text-sm
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                px-5 py-3
                text-xs
                font-bold
                text-white
                shadow-lg
                shadow-indigo-200
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-xl
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
                sm:px-6
                sm:text-sm
              "
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  {editingStaff
                    ? "Update Staff"
                    : "Create Staff"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}


{/* =====================================================
    LEAVE MODAL
===================================================== */}

{showLeaveModal && leaveStaff && (
  <div
    className="
      fixed inset-0 z-[1100]
      flex items-center justify-center
      bg-slate-950/65
      p-2
      backdrop-blur-md
      sm:p-4
      lg:p-6
    "
  >
    <div
      className="
        flex
        max-h-[calc(100dvh-1rem)]
        w-full
        max-w-xl
        flex-col
        overflow-hidden
        rounded-[22px]
        border border-white/20
        bg-white
        shadow-[0_25px_80px_rgba(15,23,42,0.28)]
        sm:max-h-[calc(100dvh-2rem)]
        sm:rounded-[28px]
        xl:rounded-[30px]
      "
    >
      {/* =================================================
          LEAVE HEADER
      ================================================= */}

      <div
        className="
          shrink-0
          border-b border-slate-200/80
          bg-white
          px-4 py-3.5
          sm:px-5 sm:py-4
          lg:px-6 lg:py-5
        "
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-amber-400 to-orange-500
                text-sm
                text-white
                shadow-lg
                shadow-amber-100
                sm:h-12 sm:w-12
                sm:rounded-2xl
                sm:text-base
              "
            >
              <FaCalendarPlus />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h2
                  className="
                    min-w-0
                    truncate
                    text-base
                    font-black
                    tracking-tight
                    text-slate-900
                    sm:text-lg
                  "
                >
                  Add Leave
                </h2>

                <span
                  className="
                    hidden
                    shrink-0
                    rounded-full
                    bg-amber-50
                    px-2.5 py-1
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-amber-600
                    sm:inline-flex
                  "
                >
                  Leave
                </span>
              </div>

              <p
                className="
                  mt-0.5
                  max-w-[220px]
                  truncate
                  text-[10px]
                  font-medium
                  text-slate-400
                  sm:max-w-xs
                  sm:text-xs
                "
              >
                {leaveStaff.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowLeaveModal(false)
            }
            className="
              flex h-9 w-9
              shrink-0
              items-center justify-center
              rounded-xl
              border border-slate-200
              bg-slate-50
              text-slate-500
              transition-all duration-200
              hover:border-rose-200
              hover:bg-rose-50
              hover:text-rose-500
              active:scale-95
              sm:h-10 sm:w-10
              sm:rounded-2xl
            "
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>

      {/* =================================================
          LEAVE FORM
      ================================================= */}

      <form
        onSubmit={submitLeave}
        className="
          flex
          min-h-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* Body */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overflow-x-hidden
            bg-slate-50/70
          "
        >
          <div
            className="
              p-3
              sm:p-5
              lg:p-6
            "
          >
            {/* Intro */}

            <div
              className="
                mb-4
                rounded-2xl
                border border-amber-100
                bg-gradient-to-r
                from-amber-50
                to-orange-50
                p-3.5
                sm:p-4
              "
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex h-8 w-8
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-white
                    text-amber-500
                    shadow-sm
                  "
                >
                  <FaCalendarPlus className="text-xs" />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-black
                      text-slate-700
                    "
                  >
                    Schedule staff leave
                  </p>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      leading-4
                      text-slate-500
                      sm:text-xs
                      sm:leading-5
                    "
                  >
                    Select the leave period and
                    optionally provide a reason.
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              "
            >
              {/* Start Date */}

              <div className="min-w-0">
                <label
                  className="
                    mb-2 block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                    sm:text-xs
                  "
                >
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={leaveForm.startDate}
                  onChange={handleLeaveChange}
                  className="
                    w-full
                    min-w-0
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    px-3.5 py-3
                    text-xs
                    font-bold
                    text-slate-700
                    outline-none
                    transition-all duration-200
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-100
                    sm:px-4
                    sm:py-3.5
                    sm:text-sm
                  "
                />
              </div>

              {/* End Date */}

              <div className="min-w-0">
                <label
                  className="
                    mb-2 block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                    sm:text-xs
                  "
                >
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={leaveForm.endDate}
                  onChange={handleLeaveChange}
                  className="
                    w-full
                    min-w-0
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    px-3.5 py-3
                    text-xs
                    font-bold
                    text-slate-700
                    outline-none
                    transition-all duration-200
                    focus:border-indigo-400
                    focus:ring-4
                    focus:ring-indigo-100
                    sm:px-4
                    sm:py-3.5
                    sm:text-sm
                  "
                />
              </div>
            </div>

            {/* Reason */}

            <div className="mt-4">
              <label
                className="
                  mb-2 block
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                  sm:text-xs
                "
              >
                Reason
              </label>

              <textarea
                name="reason"
                rows="4"
                value={leaveForm.reason}
                onChange={handleLeaveChange}
                placeholder="Optional leave reason..."
                className="
                  min-h-[110px]
                  w-full
                  resize-none
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  px-3.5 py-3
                  text-xs
                  leading-5
                  text-slate-700
                  outline-none
                  transition-all duration-200
                  placeholder:text-slate-400
                  focus:border-indigo-400
                  focus:ring-4
                  focus:ring-indigo-100
                  sm:px-4
                  sm:py-3.5
                  sm:text-sm
                "
              />
            </div>
          </div>
        </div>

        {/* =================================================
            LEAVE FOOTER
        ================================================= */}

        <div
          className="
            shrink-0
            border-t border-slate-200
            bg-white
            px-3 py-3
            sm:px-5 sm:py-4
            lg:px-6
          "
        >
          <div
            className="
              flex
              flex-col-reverse
              gap-2.5
              sm:flex-row
              sm:justify-end
              sm:gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                setShowLeaveModal(false)
              }
              className="
                w-full
                rounded-2xl
                border border-slate-200
                bg-white
                px-5 py-3
                text-xs
                font-bold
                text-slate-600
                transition-all duration-200
                hover:bg-slate-50
                active:scale-[0.98]
                sm:w-auto
                sm:text-sm
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-gradient-to-r
                from-amber-500
                to-orange-500
                px-5 py-3
                text-xs
                font-bold
                text-white
                shadow-lg
                shadow-amber-100
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-xl
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:w-auto
                sm:px-6
                sm:text-sm
              "
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FaCalendarPlus />
                  Add Leave
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
)}
</div>
  );
};

export default StaffsManagement;