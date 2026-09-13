import { useEffect, useMemo, useState } from "react";

import {
  getAdminSalons,
  updateSalon,
  deleteSalon,
  activateSalon,
  deactivateSalon,
} from "../../services/salonService";

import {
  Search,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Trash2,
  Power,
  Eye,
  X,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ImagePlus,
  Clock3,
  Navigation,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:1812";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const defaultWorkingHours = {
  MONDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  TUESDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  WEDNESDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  THURSDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  FRIDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  SATURDAY: {
    isOpen: true,
    openTime: "09:00",
    closeTime: "18:00",
  },
  SUNDAY: {
    isOpen: false,
    openTime: "",
    closeTime: "",
  },
};

const createDefaultWorkingHours = () => {
  return Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        ...defaultWorkingHours[day],
      },
    ])
  );
};

const normalizeWorkingHours = (workingHours) => {
  const result = createDefaultWorkingHours();

  if (!Array.isArray(workingHours)) {
    return result;
  }

  workingHours.forEach((item) => {
    if (!item?.day) {
      return;
    }

    const day = String(item.day).toUpperCase();

    if (!DAYS.includes(day)) {
      return;
    }

    result[day] = {
      isOpen: Boolean(item.isOpen),
      openTime: item.openTime || "",
      closeTime: item.closeTime || "",
    };
  });

  return result;
};

const convertWorkingHoursForBackend = (workingHours) => {
  return DAYS.map((day) => {
    const current = workingHours?.[day] || {};

    return {
      day,
      isOpen: Boolean(current.isOpen),
      openTime: current.isOpen
        ? current.openTime || ""
        : "",
      closeTime: current.isOpen
        ? current.closeTime || ""
        : "",
    };
  });
};

const Salons = () => {
  const [salons, setSalons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedSalon, setSelectedSalon] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    location: "",
    workingHours: createDefaultWorkingHours(),
  });

  const fetchSalons = async () => {
    try {
      setLoading(true);

      const response = await getAdminSalons();

      setSalons(response.salons || []);
    } catch (error) {
      console.error("Failed to fetch salons:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch salons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const response = await getAdminSalons();

      setSalons(response.salons || []);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to refresh salons"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const filteredSalons = useMemo(() => {
    return salons.filter((salon) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        salon.name
          ?.toLowerCase()
          .includes(searchValue) ||
        salon.city
          ?.toLowerCase()
          .includes(searchValue) ||
        salon.owner?.name
          ?.toLowerCase()
          .includes(searchValue) ||
        salon.owner?.email
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && salon.isActive) ||
        (statusFilter === "INACTIVE" && !salon.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [salons, search, statusFilter]);

  const totalSalons = salons.length;

  const activeSalons = salons.filter(
    (salon) => salon.isActive
  ).length;

  const inactiveSalons = salons.filter(
    (salon) => !salon.isActive
  ).length;

  const handleView = (salon) => {
    setSelectedSalon(salon);
    setShowViewModal(true);
  };

  const handleEdit = (salon) => {
    setSelectedSalon(salon);

    setFormData({
      name: salon.name || "",
      description: salon.description || "",
      phone: salon.phone || "",
      email: salon.email || "",
      address: salon.address || "",
      city: salon.city || "",
      location: salon.location || "",
      workingHours: normalizeWorkingHours(
        salon.workingHours
      ),
    });

    setImageFiles([]);
    setImagePreviews([]);

    setShowEditModal(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleWorkingHourChange = (
    day,
    field,
    value
  ) => {
    setFormData((prev) => ({
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

  const handleWorkingHourToggle = (day) => {
    setFormData((prev) => {
      const current =
        prev.workingHours?.[day] || {};

      const nextIsOpen = !current.isOpen;

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...current,
            isOpen: nextIsOpen,
            openTime: nextIsOpen
              ? current.openTime || "09:00"
              : "",
            closeTime: nextIsOpen
              ? current.closeTime || "18:00"
              : "",
          },
        },
      };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (files.length > 10) {
      alert(
        "You can upload a maximum of 10 images."
      );

      e.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      alert("Please select only image files.");

      e.target.value = "";
      return;
    }

    const largeFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (largeFile) {
      alert(
        "Each image should be less than 5 MB."
      );

      e.target.value = "";
      return;
    }

    imagePreviews.forEach((url) => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(files);
    setImagePreviews(previews);

    e.target.value = "";
  };

  const clearSelectedImages = () => {
    imagePreviews.forEach((url) => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedSalon?._id) {
      return;
    }

    try {
      setUpdateLoading(true);

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "phone",
        formData.phone.trim()
      );

      data.append(
        "email",
        formData.email.trim()
      );

      data.append(
        "address",
        formData.address.trim()
      );

      data.append(
        "city",
        formData.city.trim()
      );

      data.append(
        "location",
        formData.location.trim()
      );

      const workingHoursArray =
        convertWorkingHoursForBackend(
          formData.workingHours
        );

      data.append(
        "workingHours",
        JSON.stringify(workingHoursArray)
      );

      imageFiles.forEach((file) => {
        data.append("images", file);
      });

      const response = await updateSalon(
        selectedSalon._id,
        data
      );

      setSalons((prev) =>
        prev.map((salon) =>
          salon._id === selectedSalon._id
            ? response.salon
            : salon
        )
      );

      setSelectedSalon(response.salon);

      clearSelectedImages();

      setShowEditModal(false);

      alert("Salon updated successfully");
    } catch (error) {
      console.error(
        "Failed to update salon:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update salon"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleStatusChange = async (salon) => {
    const isActivating = !salon.isActive;

    const confirmMessage = isActivating
      ? `Activate ${salon.name}?`
      : `Deactivate ${salon.name}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setStatusLoading(salon._id);

      let response;

      if (isActivating) {
        response = await activateSalon(
          salon._id
        );
      } else {
        response = await deactivateSalon(
          salon._id
        );
      }

      setSalons((prev) =>
        prev.map((item) =>
          item._id === salon._id
            ? response.salon
            : item
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update salon status"
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async (salon) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${salon.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(salon._id);

      await deleteSalon(salon._id);

      setSalons((prev) =>
        prev.filter(
          (item) => item._id !== salon._id
        )
      );

      alert("Salon deleted successfully");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete salon"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    const normalizedPath = image.startsWith("/")
      ? image
      : `/${image}`;

    return `${API_ORIGIN}${normalizedPath}`;
  };

  const formatDay = (day) => {
    return (
      day.charAt(0) +
      day.slice(1).toLowerCase()
    );
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const closeEditModal = () => {
    if (updateLoading) {
      return;
    }

    setShowEditModal(false);
    clearSelectedImages();
  };

  const ActionButtons = ({ salon }) => (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        title="View"
        onClick={() => handleView(salon)}
        className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 hover:shadow-md hover:shadow-sky-100 active:translate-y-0"
      >
        <Eye
          size={16}
          className="transition-transform group-hover:scale-110"
        />
      </button>

      <button
        type="button"
        title="Edit"
        onClick={() => handleEdit(salon)}
        className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-100 hover:shadow-md hover:shadow-violet-100 active:translate-y-0"
      >
        <Edit3
          size={16}
          className="transition-transform group-hover:scale-110"
        />
      </button>

      <button
        type="button"
        title={
          salon.isActive
            ? "Deactivate"
            : "Activate"
        }
        disabled={
          statusLoading === salon._id
        }
        onClick={() =>
          handleStatusChange(salon)
        }
        className={`group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 ${
          salon.isActive
            ? "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-md hover:shadow-emerald-100"
        }`}
      >
        <Power
          size={16}
          className="transition-transform group-hover:scale-110"
        />
      </button>

      <button
        type="button"
        title="Delete"
        disabled={
          deleteLoading === salon._id
        }
        onClick={() => handleDelete(salon)}
        className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md hover:shadow-rose-100 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleteLoading === salon._id ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
        ) : (
          <Trash2
            size={16}
            className="transition-transform group-hover:scale-110"
          />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,0.12),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(217,70,239,0.10),transparent_25%),linear-gradient(135deg,#f8fafc_0%,#f5f3ff_48%,#f8fafc_100%)] px-2.5 py-3 text-slate-900 sm:px-4 sm:py-5 md:px-5 lg:px-6 xl:px-8">

      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="relative mb-4 overflow-hidden rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[0_18px_55px_rgba(30,35,60,0.07)] backdrop-blur-2xl sm:mb-6 sm:rounded-[28px] sm:p-6 lg:p-7">

        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-fuchsia-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 items-start gap-3 sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 sm:h-14 sm:w-14 sm:rounded-[19px]">
              <Building2
                size={23}
                strokeWidth={2.2}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-1 inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-violet-600 sm:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Administration
              </div>

              <h1 className="break-words text-[22px] font-black leading-tight tracking-[-0.055em] text-slate-950 sm:text-3xl lg:text-[34px]">
                Salon Management
              </h1>

              <p className="mt-1 max-w-2xl break-words text-[11px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
                Manage salons, owners and salon
                availability from one powerful
                workspace.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-600 hover:shadow-lg hover:shadow-violet-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={`transition-transform ${
                refreshing
                  ? "animate-spin"
                  : "group-hover:rotate-180"
              }`}
            />
            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

        </div>
      </div>

      {/* =========================================================
          STAT CARDS
      ========================================================== */}

      <div className="mb-4 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">

        {/* Total */}

        <div className="group relative overflow-hidden rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_40px_rgba(30,35,60,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(91,33,182,0.12)] sm:rounded-[24px] sm:p-5">

          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-100/70 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-center gap-3 sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20 sm:h-14 sm:w-14">
              <Building2 size={21} />
            </div>

            <div className="min-w-0">
              <span className="block break-words text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                Total Salons
              </span>

              <strong className="mt-1 block text-2xl font-black leading-none tracking-[-0.06em] text-slate-950 sm:text-3xl">
                {totalSalons}
              </strong>
            </div>

          </div>
        </div>

        {/* Active */}

        <div className="group relative overflow-hidden rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_40px_rgba(30,35,60,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,185,129,0.12)] sm:rounded-[24px] sm:p-5">

          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-center gap-3 sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/20 sm:h-14 sm:w-14">
              <CheckCircle2 size={21} />
            </div>

            <div className="min-w-0">
              <span className="block break-words text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                Active Salons
              </span>

              <strong className="mt-1 block text-2xl font-black leading-none tracking-[-0.06em] text-slate-950 sm:text-3xl">
                {activeSalons}
              </strong>
            </div>

          </div>
        </div>

        {/* Inactive */}

        <div className="group relative overflow-hidden rounded-[22px] border border-white/90 bg-white/90 p-4 shadow-[0_14px_40px_rgba(30,35,60,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(244,63,94,0.12)] sm:col-span-2 sm:rounded-[24px] sm:p-5 xl:col-span-1">

          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-rose-100/70 blur-2xl transition-transform duration-500 group-hover:scale-150" />

          <div className="relative flex items-center gap-3 sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-lg shadow-rose-500/20 sm:h-14 sm:w-14">
              <XCircle size={21} />
            </div>

            <div className="min-w-0">
              <span className="block break-words text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                Inactive Salons
              </span>

              <strong className="mt-1 block text-2xl font-black leading-none tracking-[-0.06em] text-slate-950 sm:text-3xl">
                {inactiveSalons}
              </strong>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================
          SEARCH + FILTER
      ========================================================== */}

      <div className="mb-4 rounded-[22px] border border-white/90 bg-white/90 p-3 shadow-[0_14px_40px_rgba(30,35,60,0.06)] backdrop-blur-xl sm:mb-5 sm:rounded-[24px] sm:p-4 lg:p-5">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full lg:max-w-[600px]">

            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search salon, city or owner..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            )}

          </div>

          <div className="grid w-full grid-cols-3 gap-2 lg:w-auto lg:min-w-[315px]">

            <button
              type="button"
              onClick={() =>
                setStatusFilter("ALL")
              }
              className={`min-h-10 rounded-xl px-2 text-xs font-black transition-all sm:px-4 sm:text-sm ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter("ACTIVE")
              }
              className={`min-h-10 rounded-xl px-2 text-xs font-black transition-all sm:px-4 sm:text-sm ${
                statusFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() =>
                setStatusFilter("INACTIVE")
              }
              className={`min-h-10 rounded-xl px-2 text-xs font-black transition-all sm:px-4 sm:text-sm ${
                statusFilter === "INACTIVE"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              }`}
            >
              Inactive
            </button>

          </div>

        </div>
      </div>

      {/* =========================================================
          MAIN SALON SECTION
      ========================================================== */}

      <div className="overflow-hidden rounded-[24px] border border-white/90 bg-white/95 shadow-[0_20px_60px_rgba(30,35,60,0.07)] backdrop-blur-2xl sm:rounded-[28px]">

        {/* Section header */}

        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500 shadow-sm shadow-violet-400" />

                <h3 className="break-words text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">
                  All Salons
                </h3>
              </div>

              <p className="mt-1 break-words text-xs font-medium text-slate-500 sm:text-sm">
                {filteredSalons.length} salon
                {filteredSalons.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            <div className="self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 sm:self-auto">
              {statusFilter === "ALL"
                ? "All Status"
                : statusFilter}
            </div>

          </div>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-16 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-100 border-t-violet-600" />
            </div>

            <p className="m-0 text-sm font-extrabold text-slate-700">
              Loading salons...
            </p>

            <span className="mt-1 text-xs text-slate-400">
              Please wait while we fetch the latest data
            </span>

          </div>
        ) : filteredSalons.length === 0 ? (

          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-16 text-center">

            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-slate-100 to-violet-50 text-slate-400">
              <Building2 size={30} />
            </div>

            <h4 className="m-0 text-lg font-black text-slate-800">
              No salons found
            </h4>

            <p className="mt-1 max-w-sm break-words text-center text-sm text-slate-500">
              Try changing your search keyword
              or selected status filter.
            </p>

            {(search ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                }}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-600"
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (

          <>
           {/* =====================================================
    RESPONSIVE SALON CARDS
====================================================== */}

<div className="w-full p-3 sm:p-4 md:p-5 lg:p-6">

  <div
    className="
      grid w-full grid-cols-1 gap-4
      min-[640px]:grid-cols-2
      min-[1024px]:grid-cols-2
      min-[1280px]:grid-cols-3
      2xl:gap-5
    "
  >

    {filteredSalons.map((salon) => (

      <article
        key={salon._id}
        className="
          group relative flex min-w-0 flex-col overflow-hidden
          rounded-[24px] border border-slate-200/80
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.05)]
          transition-all duration-300
          hover:-translate-y-1
          hover:border-violet-200
          hover:shadow-[0_20px_50px_rgba(91,33,182,0.12)]
        "
      >

        {/* =================================================
            DECORATIVE BACKGROUND
        ================================================== */}

        <div
          className="
            pointer-events-none absolute -right-10 -top-10
            h-32 w-32 rounded-full
            bg-violet-100/70 blur-3xl
            transition-all duration-500
            group-hover:bg-fuchsia-100/80
          "
        />

        <div
          className="
            pointer-events-none absolute -bottom-16 -left-10
            h-32 w-32 rounded-full
            bg-fuchsia-100/40 blur-3xl
          "
        />

        {/* =================================================
            CARD HEADER
        ================================================== */}

        <div className="relative border-b border-slate-100 p-4 sm:p-5">

          <div className="flex min-w-0 items-start gap-3">

            {/* Avatar */}

            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-[16px]
                bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600
                text-base font-black uppercase text-white
                shadow-lg shadow-violet-500/20
                ring-4 ring-violet-50
                transition-transform duration-300
                group-hover:scale-105
              "
            >
              {salon.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            {/* Name */}

            <div className="min-w-0 flex-1">

              <div className="flex min-w-0 items-start justify-between gap-2">

                <div className="min-w-0 flex-1">

                  <h3
                    className="
                      m-0
                      break-words
                      text-sm font-black leading-5
                      text-slate-900
                      sm:text-[15px]
                      lg:text-base
                    "
                  >
                    {salon.name || "Unnamed Salon"}
                  </h3>

                  <p
                    className="
                      mt-1
                      flex items-center gap-1.5
                      text-[10px] font-bold
                      uppercase tracking-[0.1em]
                      text-slate-400
                    "
                  >
                    <Building2 size={11} />
                    Salon
                  </p>

                </div>

                {/* Status */}

                <div className="shrink-0">

                  {salon.isActive ? (

                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        border border-emerald-200
                        bg-emerald-50
                        px-2.5 py-1.5
                        text-[9px] font-black
                        text-emerald-700
                        sm:px-3
                      "
                    >
                      <CheckCircle2 size={11} />
                      <span>Active</span>
                    </span>

                  ) : (

                    <span
                      className="
                        inline-flex items-center gap-1.5
                        rounded-full
                        border border-rose-200
                        bg-rose-50
                        px-2.5 py-1.5
                        text-[9px] font-black
                        text-rose-600
                        sm:px-3
                      "
                    >
                      <XCircle size={11} />
                      <span>Inactive</span>
                    </span>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            CARD BODY
        ================================================== */}

        <div className="relative flex flex-1 flex-col p-4 sm:p-5">

          {/* =================================================
              OWNER
          ================================================== */}

          <div
            className="
              rounded-[18px]
              border border-slate-100
              bg-slate-50/70
              p-3.5
              sm:p-4
            "
          >

            <div className="mb-2 flex items-center gap-2">

              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-violet-100
                  text-violet-600
                "
              >
                <Building2 size={14} />
              </div>

              <span
                className="
                  text-[9px] font-black
                  uppercase tracking-[0.14em]
                  text-slate-400
                "
              >
                Salon Owner
              </span>

            </div>

            <p
              className="
                break-words
                text-sm font-black
                leading-5 text-slate-800
              "
            >
              {salon.owner?.name || "Unknown Owner"}
            </p>

            <p
              className="
                mt-1
                break-words
                text-[11px] font-medium
                leading-5 text-slate-400
              "
            >
              {salon.owner?.email || "No owner email available"}
            </p>

          </div>


          {/* =================================================
              LOCATION
          ================================================== */}

          <div
            className="
              mt-3
              rounded-[18px]
              border border-slate-100
              bg-white
              p-3.5
              sm:p-4
            "
          >

            <div className="flex min-w-0 items-start gap-3">

              <div
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                "
              >
                <MapPin size={15} />
              </div>

              <div className="min-w-0 flex-1">

                <p
                  className="
                    mb-1
                    text-[9px] font-black
                    uppercase tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Location
                </p>

                <p
                  className="
                    break-words
                    text-sm font-black
                    leading-5 text-slate-700
                  "
                >
                  {salon.city || "City unavailable"}
                </p>

                <p
                  className="
                    mt-1
                    break-words
                    text-[11px] font-medium
                    leading-5 text-slate-400
                  "
                >
                  {salon.address || "Address unavailable"}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              CONTACT INFORMATION
          ================================================== */}

          <div className="mt-3 grid grid-cols-1 gap-2">

            {/* Phone */}

            <div
              className="
                flex min-w-0 items-start gap-3
                rounded-[16px]
                border border-slate-100
                bg-slate-50/60
                px-3.5 py-3
              "
            >

              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-white
                  text-slate-500
                  shadow-sm
                "
              >
                <Phone size={13} />
              </div>

              <div className="min-w-0 flex-1">

                <p
                  className="
                    text-[8px] font-black
                    uppercase tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Phone
                </p>

                <p
                  className="
                    mt-0.5
                    break-words
                    text-[11px] font-bold
                    leading-5 text-slate-600
                  "
                >
                  {salon.phone || "No phone number"}
                </p>

              </div>

            </div>


            {/* Email */}

            <div
              className="
                flex min-w-0 items-start gap-3
                rounded-[16px]
                border border-slate-100
                bg-slate-50/60
                px-3.5 py-3
              "
            >

              <div
                className="
                  flex h-7 w-7 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-white
                  text-slate-500
                  shadow-sm
                "
              >
                <Mail size={13} />
              </div>

              <div className="min-w-0 flex-1">

                <p
                  className="
                    text-[8px] font-black
                    uppercase tracking-[0.12em]
                    text-slate-400
                  "
                >
                  Email
                </p>

                <p
                  className="
                    mt-0.5
                    break-words
                    [overflow-wrap:anywhere]
                    text-[11px] font-bold
                    leading-5 text-slate-600
                  "
                >
                  {salon.email || "No email address"}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              QUICK INFO
          ================================================== */}

          <div
            className="
              mt-3
              flex flex-wrap items-center
              gap-2
              rounded-[16px]
              border border-violet-100
              bg-gradient-to-r from-violet-50/70 to-fuchsia-50/50
              px-3 py-2.5
            "
          >

            <span
              className="
                inline-flex items-center gap-1.5
                text-[9px] font-black
                uppercase tracking-[0.1em]
                text-violet-600
              "
            >
              <CheckCircle2 size={12} />
              {salon.isActive ? "Currently Active" : "Currently Inactive"}
            </span>

          </div>


          {/* =================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              mt-4
              flex min-w-0
              flex-col gap-3
              border-t border-slate-100
              pt-4
              min-[400px]:flex-row
              min-[400px]:items-center
              min-[400px]:justify-between
            "
          >

            <div className="min-w-0">

              <p
                className="
                  text-[8px] font-black
                  uppercase tracking-[0.15em]
                  text-slate-400
                "
              >
                Manage Salon
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px] font-semibold
                  text-slate-400
                "
              >
                View, edit or change status
              </p>

            </div>

            <div className="flex shrink-0 justify-start min-[400px]:justify-end">

              <ActionButtons salon={salon} />

            </div>

          </div>

        </div>

      </article>

    ))}

  </div>


  {/* =====================================================
      EMPTY STATE
  ====================================================== */}

  {filteredSalons.length === 0 && !loading && (

    <div
      className="
        flex min-h-[280px]
        w-full items-center justify-center
        rounded-[24px]
        border border-dashed
        border-slate-200
        bg-slate-50/50
        p-6
        text-center
      "
    >

      <div className="max-w-sm">

        <div
          className="
            mx-auto flex h-16 w-16
            items-center justify-center
            rounded-[20px]
            bg-violet-50
            text-violet-500
          "
        >
          <Building2 size={28} />
        </div>

        <h3
          className="
            mt-4
            text-base font-black
            text-slate-800
          "
        >
          No salons found
        </h3>

        <p
          className="
            mt-1.5
            text-xs font-medium
            leading-5 text-slate-400
          "
        >
          Try changing your search or status filter to find more salons.
        </p>

      </div>

    </div>

  )}

</div>
          </>
        )}

      </div>

      {/* =========================================================
          VIEW MODAL
      ========================================================== */}

      {showViewModal && selectedSalon && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-2 backdrop-blur-md sm:p-4"
          onClick={closeViewModal}
        >

          <div
            className="relative my-auto flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:rounded-[30px]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal header */}

            <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-4 sm:px-6 sm:py-5">

              <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-violet-200/30 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">

                <div className="min-w-0">

                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
                    <Building2
                      size={11}
                    />
                    Salon Details
                  </div>

                  <h3 className="break-words text-lg font-black leading-6 tracking-[-0.04em] text-slate-950 sm:text-2xl">
                    {selectedSalon.name ||
                      "Salon Details"}
                  </h3>

                  <p className="mt-1 break-words text-xs font-medium text-slate-500">
                    Complete salon information
                    and availability
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeViewModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            {/* Modal body */}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">

              {/* Profile */}

              <div className="relative mb-5 overflow-hidden rounded-[22px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 sm:p-5">

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl font-black uppercase text-white shadow-lg shadow-violet-500/20 sm:h-16 sm:w-16">
                    {selectedSalon.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <h4 className="m-0 break-words text-base font-black leading-6 text-slate-900 sm:text-xl">
                      {selectedSalon.name}
                    </h4>

                    <div className="mt-2">

                      {selectedSalon.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                          <CheckCircle2
                            size={12}
                          />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600">
                          <XCircle
                            size={12}
                          />
                          Inactive
                        </span>
                      )}

                    </div>
                  </div>

                </div>
              </div>

              {/* Information */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-violet-500" />
                  <h4 className="m-0 text-sm font-black text-slate-800">
                    Salon Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">

                  {[
                    [
                      "Owner",
                      selectedSalon.owner
                        ?.name || "N/A",
                    ],
                    [
                      "Owner Email",
                      selectedSalon.owner
                        ?.email || "N/A",
                    ],
                    [
                      "Phone",
                      selectedSalon.phone ||
                        "N/A",
                    ],
                    [
                      "Email",
                      selectedSalon.email ||
                        "N/A",
                    ],
                    [
                      "City",
                      selectedSalon.city ||
                        "N/A",
                    ],
                    [
                      "Address",
                      selectedSalon.address ||
                        "N/A",
                    ],
                    [
                      "Location",
                      selectedSalon.location ||
                        "N/A",
                    ],
                    [
                      "Images",
                      `${
                        selectedSalon.images
                          ?.length || 0
                      } image${
                        (selectedSalon.images
                          ?.length || 0) !== 1
                          ? "s"
                          : ""
                      }`,
                    ],
                  ].map(
                    ([label, value]) => (
                      <div
                        key={label}
                        className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
                      >
                        <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          {label}
                        </span>

                        <strong className="mt-1.5 block break-words text-xs font-bold leading-5 text-slate-700 sm:text-sm">
                          {value}
                        </strong>
                      </div>
                    )
                  )}

                </div>
              </div>

              {/* Description */}

              {selectedSalon.description && (
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Description
                  </span>

                  <p className="m-0 mt-2 break-words whitespace-pre-wrap text-xs font-medium leading-6 text-slate-600 sm:text-sm">
                    {selectedSalon.description}
                  </p>

                </div>
              )}

              {/* Location */}

              <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">

                <div className="mb-2 flex items-center gap-2">

                  <Navigation
                    size={17}
                    className="shrink-0 text-violet-500"
                  />

                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-violet-600">
                    Salon Location
                  </span>

                </div>

                <p className="m-0 break-words text-xs font-semibold leading-6 text-slate-700 sm:text-sm">
                  {selectedSalon.location ||
                    "Location not provided"}
                </p>

              </div>

              {/* Working Hours */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <Clock3
                    size={18}
                    className="text-violet-500"
                  />

                  <h4 className="m-0 text-sm font-black text-slate-800">
                    Working Hours
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  {DAYS.map((day) => {

                    const workingHour =
                      Array.isArray(
                        selectedSalon.workingHours
                      )
                        ? selectedSalon.workingHours.find(
                            (item) =>
                              String(
                                item.day
                              ).toUpperCase() ===
                              day
                          )
                        : null;

                    return (
                      <div
                        key={day}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
                      >

                        <span className="min-w-0 break-words text-xs font-black text-slate-700">
                          {formatDay(day)}
                        </span>

                        {workingHour?.isOpen ? (
                          <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-right text-[10px] font-black text-emerald-600">
                            {workingHour.openTime ||
                              "--:--"}{" "}
                            -{" "}
                            {workingHour.closeTime ||
                              "--:--"}
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-500">
                            Closed
                          </span>
                        )}

                      </div>
                    );
                  })}

                </div>
              </div>

              {/* Images */}

              <div>

                <div className="mb-3 flex items-center gap-2">
                  <ImagePlus
                    size={18}
                    className="text-violet-500"
                  />

                  <h4 className="m-0 text-sm font-black text-slate-800">
                    Salon Images
                  </h4>
                </div>

                {selectedSalon.images &&
                selectedSalon.images.length > 0 ? (

                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">

                    {selectedSalon.images.map(
                      (image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                        >

                          <img
                            src={getImageUrl(
                              image
                            )}
                            alt={`Salon ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />

                          <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-[9px] font-bold text-white backdrop-blur">
                            Image {index + 1}
                          </div>

                        </div>
                      )
                    )}

                  </div>

                ) : (

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-500">
                    No salon images available
                  </div>

                )}

              </div>

            </div>

            {/* Footer */}

            <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-3 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">

              <button
                type="button"
                onClick={closeViewModal}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(
                    selectedSalon
                  );
                }}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25 sm:w-auto"
              >
                <Edit3 size={16} />
                Edit Salon
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          EDIT MODAL
      ========================================================== */}

      {showEditModal && selectedSalon && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-2 backdrop-blur-md sm:p-4"
          onClick={closeEditModal}
        >

          <div
            className="relative my-auto flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:rounded-[30px]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Edit header */}

            <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-4 py-4 sm:px-6 sm:py-5">

              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">

                <div className="min-w-0">

                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
                    <Edit3 size={11} />
                    Edit Mode
                  </div>

                  <h3 className="break-words text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-2xl">
                    Edit Salon
                  </h3>

                  <p className="mt-1 break-words text-xs font-medium text-slate-500">
                    Update salon information,
                    working hours and images.
                  </p>

                </div>

                <button
                  type="button"
                  disabled={updateLoading}
                  onClick={closeEditModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>

              </div>
            </div>

            <form
              onSubmit={handleUpdate}
              className="min-h-0 flex-1 overflow-y-auto"
            >

              <div className="px-3 py-4 sm:px-6 sm:py-6">

                {/* Basic information */}

                <div className="mb-6">

                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-violet-500" />

                    <h4 className="m-0 text-sm font-black text-slate-800">
                      Basic Information
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    {/* Name */}

                    <div className="sm:col-span-2">

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Salon Name
                      </label>

                      <input
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />

                    </div>

                    {/* Description */}

                    <div className="sm:col-span-2">

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Description
                      </label>

                      <textarea
                        className="min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="description"
                        rows="3"
                        value={
                          formData.description
                        }
                        onChange={handleChange}
                      />

                    </div>

                    {/* Phone */}

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Phone
                      </label>

                      <input
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />

                    </div>

                    {/* Email */}

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Email
                      </label>

                      <input
                        type="email"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />

                    </div>

                    {/* City */}

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        City
                      </label>

                      <input
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />

                    </div>

                    {/* Address */}

                    <div>

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Address
                      </label>

                      <input
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="address"
                        value={
                          formData.address
                        }
                        onChange={handleChange}
                      />

                    </div>

                    {/* Location */}

                    <div className="sm:col-span-2">

                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                        Location
                      </label>

                      <input
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        name="location"
                        value={
                          formData.location
                        }
                        onChange={handleChange}
                        placeholder="Enter salon location or Google Maps link"
                      />

                    </div>

                  </div>
                </div>

                {/* =================================================
                    WORKING HOURS
                ================================================== */}

                <div className="mb-6">

                  <div className="mb-3 flex items-center gap-2">
                    <Clock3
                      size={18}
                      className="text-violet-500"
                    />

                    <h4 className="m-0 text-sm font-black text-slate-800">
                      Working Hours
                    </h4>
                  </div>

                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-2.5 sm:p-4">

                    <div className="space-y-2.5">

                      {DAYS.map((day) => {

                        const current =
                          formData
                            .workingHours?.[
                            day
                          ] || {
                            isOpen: false,
                            openTime: "",
                            closeTime: "",
                          };

                        return (
                          <div
                            key={day}
                            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                          >

                            <div className="flex flex-col gap-3">

                              {/* Day */}

                              <div className="flex min-w-0 items-center justify-between gap-3">

                                <span className="break-words text-xs font-black text-slate-700 sm:text-sm">
                                  {formatDay(day)}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    updateLoading
                                  }
                                  onClick={() =>
                                    handleWorkingHourToggle(
                                      day
                                    )
                                  }
                                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black transition-all ${
                                    current.isOpen
                                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                      : "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  }`}
                                >
                                  {current.isOpen
                                    ? "Open"
                                    : "Closed"}
                                </button>

                              </div>

                              {/* Times */}

                              {current.isOpen ? (

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                                  <div className="min-w-0">

                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                      Opens
                                    </label>

                                    <input
                                      type="time"
                                      className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                      value={
                                        current.openTime ||
                                        ""
                                      }
                                      disabled={
                                        updateLoading
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        handleWorkingHourChange(
                                          day,
                                          "openTime",
                                          e
                                            .target
                                            .value
                                        )
                                      }
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <label className="mb-1 block text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                      Closes
                                    </label>

                                    <input
                                      type="time"
                                      className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                      value={
                                        current.closeTime ||
                                        ""
                                      }
                                      disabled={
                                        updateLoading
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        handleWorkingHourChange(
                                          day,
                                          "closeTime",
                                          e
                                            .target
                                            .value
                                        )
                                      }
                                    />

                                  </div>

                                </div>

                              ) : (

                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-[10px] font-bold text-slate-400">
                                  Salon closed on this
                                  day
                                </div>

                              )}

                            </div>

                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>

                {/* =================================================
                    IMAGE UPLOAD
                ================================================== */}

                <div>

                  <div className="mb-3 flex items-center gap-2">
                    <ImagePlus
                      size={18}
                      className="text-violet-500"
                    />

                    <h4 className="m-0 text-sm font-black text-slate-800">
                      Salon Images
                    </h4>
                  </div>

                  <label className="group flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-center transition hover:border-violet-300 hover:bg-violet-50/50">

                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-500 shadow-sm transition group-hover:scale-105">
                      <ImagePlus
                        size={20}
                      />
                    </div>

                    <span className="break-words text-xs font-black text-slate-700">
                      Choose salon images
                    </span>

                    <span className="mt-1 break-words text-[10px] font-medium leading-5 text-slate-400">
                      Up to 10 images · Maximum 5 MB
                      each
                    </span>

                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                      disabled={
                        updateLoading
                      }
                    />

                  </label>

                  {/* Existing */}

                  {selectedSalon.images &&
                    selectedSalon.images
                      .length > 0 && (

                      <div className="mt-4">

                        <div className="mb-2 flex items-center justify-between gap-2">

                          <small className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                            Current Images
                          </small>

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                            {
                              selectedSalon
                                .images.length
                            }{" "}
                            images
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">

                          {selectedSalon.images.map(
                            (
                              image,
                              index
                            ) => (
                              <div
                                key={`${image}-${index}`}
                                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                              >

                                <img
                                  src={getImageUrl(
                                    image
                                  )}
                                  alt={`Salon ${
                                    index +
                                    1
                                  }`}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  {/* New */}

                  {imagePreviews.length >
                    0 && (

                    <div className="mt-5">

                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

                        <small className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-600">
                          New Images
                        </small>

                        <button
                          type="button"
                          onClick={
                            clearSelectedImages
                          }
                          disabled={
                            updateLoading
                          }
                          className="rounded-lg px-2 py-1 text-[10px] font-black text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        >
                          Clear
                        </button>

                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">

                        {imagePreviews.map(
                          (
                            preview,
                            index
                          ) => (
                            <div
                              key={preview}
                              className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-violet-200 bg-violet-50"
                            >

                              <img
                                src={
                                  preview
                                }
                                alt={`New salon ${
                                  index +
                                  1
                                }`}
                                className="h-full w-full object-cover"
                              />

                              <div className="absolute bottom-2 left-2 rounded-lg bg-violet-600/90 px-2 py-1 text-[9px] font-black text-white backdrop-blur">
                                New
                              </div>

                            </div>
                          )
                        )}

                      </div>

                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <span className="mt-0.5 shrink-0 text-xs">
                          ⚠️
                        </span>

                        <small className="break-words text-[10px] font-bold leading-5 text-amber-700">
                          Selecting new images will
                          replace the current salon
                          images.
                        </small>
                      </div>

                    </div>
                  )}

                  {/* No new images */}

                  {imagePreviews.length ===
                    0 && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">

                      <ImagePlus
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <span className="break-words text-[10px] font-semibold leading-5 text-slate-500">
                        No new images selected.
                        Existing images will remain
                        unchanged.
                      </span>

                    </div>
                  )}

                </div>

              </div>

              {/* Footer */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white/95 px-3 py-3 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-6 sm:py-4">

                <button
                  type="button"
                  disabled={updateLoading}
                  onClick={closeEditModal}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updateLoading}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >

                  {updateLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Salons;