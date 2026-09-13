import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaEdit,
  FaImage,
  FaMapMarkerAlt,
  FaPlus,
  FaPowerOff,
  FaSearch,
  FaStore,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import {
  createSalon,
  deleteSalon,
  getMySalons,
  updateSalon,
  updateSalonStatus,
} from "../../services/salonOwnerService";

const API_ORIGIN = import.meta.env.VITE_API_URL;

const initialWorkingHours = {
  monday: "09:00 - 18:00",
  tuesday: "09:00 - 18:00",
  wednesday: "09:00 - 18:00",
  thursday: "09:00 - 18:00",
  friday: "09:00 - 18:00",
  saturday: "09:00 - 18:00",
  sunday: "Closed",
};

const createInitialForm = () => ({
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  location: "",
  images: [],
  imagePreviews: [],
  existingImages: [],
  workingHours: {
    ...initialWorkingHours,
  },
});

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API_ORIGIN.replace("/api", "")}${image.startsWith("/") ? image : `/${image}`}`;
};

const formatDay = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const workingHoursToArray = (workingHours = {}) => {
  return Object.entries(workingHours).map(([day, value]) => {
    if (value === "Closed") {
  return {
    day: day.toUpperCase(),
    openTime: "",
    closeTime: "",
    isOpen: false,
  };
}

    const [openTime = "", closeTime = ""] = value
      .split("-")
      .map((time) => time.trim());

    return {
      day: day.toUpperCase(),
      openTime,
      closeTime,
     isOpen: true,
    };
  });
};
const workingHoursToForm = (workingHours = []) => {
  const result = {
    ...initialWorkingHours,
  };

  if (!Array.isArray(workingHours)) {
    return result;
  }

  workingHours.forEach((item) => {
    if (!item?.day) return;

    const day = item.day.toLowerCase();

   if (item.isOpen === false) {
  result[day] = "Closed";
  return;
}

    result[day] = `${item.openTime || ""} - ${
      item.closeTime || ""
    }`.trim();
  });

  return result;
};

const MySalons = () => {
  const [salons, setSalons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  const [form, setForm] = useState(createInitialForm());

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    if (!modalOpen && !deleteTarget) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, deleteTarget]);

  const loadSalons = async () => {
    try {
      setLoading(true);
      setActionError("");

      const data = await getMySalons();

      setSalons(data.salons || []);
    } catch (error) {
      console.error(error);

      setActionError(
        error?.response?.data?.message ||
          "Failed to load salons."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredSalons = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return salons;

    return salons.filter((salon) =>
      [
        salon.name,
        salon.city,
        salon.address,
        salon.phone,
        salon.email,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toString().toLowerCase().includes(keyword)
        )
    );
  }, [salons, search]);

  const activeSalons = salons.filter(
    (salon) => salon.isActive
  ).length;

  const inactiveSalons = salons.filter(
    (salon) => !salon.isActive
  ).length;

  const resetForm = () => {
    setForm(createInitialForm());
  };

  const openCreateModal = () => {
    setEditingSalon(null);
    resetForm();
    setError("");
    setActionError("");
    setModalOpen(true);
  };

  const openEditModal = (salon) => {
    setEditingSalon(salon);

    setForm({
      name: salon.name || "",
      description: salon.description || "",
      phone: salon.phone || "",
      email: salon.email || "",
      address: salon.address || "",
      city: salon.city || "",
      location:
        typeof salon.location === "string"
          ? salon.location
          : salon.location
          ? JSON.stringify(salon.location)
          : "",
      images: [],
      imagePreviews: [],
      existingImages: Array.isArray(salon.images)
        ? salon.images
        : [],
      workingHours: workingHoursToForm(
        salon.workingHours
      ),
    });

    setError("");
    setActionError("");
    setModalOpen(true);
  };

 const closeModal = (force = false) => {
  if (saving && !force) return;

    form.imagePreviews.forEach((preview) => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    setModalOpen(false);
    setEditingSalon(null);
    resetForm();
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkingHourChange = (day, value) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      e.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Please select only image files.");
      e.target.value = "";
      return;
    }

    const largeFile = files.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (largeFile) {
      setError("Each image should be less than 5 MB.");
      e.target.value = "";
      return;
    }

    form.imagePreviews.forEach((preview) => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setForm((prev) => ({
      ...prev,
      images: files,
      imagePreviews: previews,
    }));

    setError("");

    e.target.value = "";
  };

  const removeNewImage = (index) => {
    const preview = form.imagePreviews[index];

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
      imagePreviews: prev.imagePreviews.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Salon name is required.");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    if (form.images.length > 10) {
      setError("You can upload a maximum of 10 images.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("name", form.name.trim());

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "phone",
        form.phone.trim()
      );

      formData.append(
        "email",
        form.email.trim()
      );

      formData.append(
        "address",
        form.address.trim()
      );

      formData.append(
        "city",
        form.city.trim()
      );

      if (form.location.trim()) {
        formData.append(
          "location",
          form.location.trim()
        );
      }

    
      const workingHoursArray = workingHoursToArray(
        form.workingHours
      );

      formData.append(
        "workingHours",
        JSON.stringify(workingHoursArray)
      );

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      let data;

      if (editingSalon) {
        data = await updateSalon(
          editingSalon._id,
          formData
        );

        setSalons((prev) =>
          prev.map((salon) =>
            salon._id === editingSalon._id
              ? data.salon
              : salon
          )
        );
      } else {
        data = await createSalon(formData);

        setSalons((prev) => [
          data.salon,
          ...prev,
        ]);
      }

      closeModal(true);
    } catch (error) {
      console.error(
        "Failed to save salon:",
        error
      );

      setError(
        error?.response?.data?.message ||
          "Failed to save salon."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (salon) => {
    try {
      setStatusLoading(salon._id);
      setActionError("");

      const nextStatus = !salon.isActive;

      const data = await updateSalonStatus(
        salon._id,
        nextStatus
      );

      setSalons((prev) =>
        prev.map((item) =>
          item._id === salon._id
            ? data.salon
            : item
        )
      );
    } catch (error) {
      console.error(error);

      setActionError(
        error?.response?.data?.message ||
          "Failed to update salon status."
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setStatusLoading(deleteTarget._id);
      setActionError("");

      await deleteSalon(deleteTarget._id);

      setSalons((prev) =>
        prev.filter(
          (salon) =>
            salon._id !== deleteTarget._id
        )
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);

      setActionError(
        error?.response?.data?.message ||
          "Failed to delete salon."
      );
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-w-0 w-full space-y-6">

        {/* Header Skeleton */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="h-4 w-36 animate-pulse rounded-full bg-slate-200" />
                <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-slate-100" />
              </div>

              <div className="h-12 w-40 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
            />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-80 animate-pulse rounded-[24px] bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full space-y-6 pb-6">

      {/* =========================================================
          PREMIUM HEADER
      ========================================================== */}
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.07)]">

        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-purple-100/40 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">

          <div className="min-w-0">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-pink-600">
              <FaStore className="text-[10px]" />
              Salon Management
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-[34px]">
              My Salons
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
              Create, manage and control all your salon
              locations from one centralized workspace.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">

              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                {salons.length}{" "}
                {salons.length === 1 ? "Salon" : "Salons"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeSalons} Active
              </span>

              {inactiveSalons > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  {inactiveSalons} Inactive
                </span>
              )}

            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(219,39,119,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(219,39,119,0.32)] focus:outline-none focus:ring-4 focus:ring-pink-500/20 sm:w-auto"
          >
            <FaPlus className="transition-transform duration-300 group-hover:rotate-90" />
            Add New Salon
          </button>

        </div>
      </section>

      {/* =========================================================
          STAT CARDS
      ========================================================== */}
      <section className="grid gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 transition duration-500 group-hover:scale-125" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                Total Salons
              </p>

              <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                {salons.length}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Registered locations
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shadow-sm">
              <FaStore />
            </div>

          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(16,185,129,0.12)]">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-50 transition duration-500 group-hover:scale-125" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-500">
                Active
              </p>

              <p className="mt-3 text-3xl font-black tracking-tight text-emerald-600">
                {activeSalons}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Currently available
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
              <FaCheck />
            </div>

          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(239,68,68,0.12)]">

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-50 transition duration-500 group-hover:scale-125" />

          <div className="relative flex items-start justify-between">

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-red-400">
                Inactive
              </p>

              <p className="mt-3 text-3xl font-black tracking-tight text-red-500">
                {inactiveSalons}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Currently disabled
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500 shadow-sm">
              <FaPowerOff />
            </div>

          </div>
        </div>

      </section>

      {/* =========================================================
          SEARCH / TOOLBAR
      ========================================================== */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-5">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center justify-between">

              <div>
                <p className="text-sm font-black text-slate-800">
                  Salon Directory
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Search and manage your locations.
                </p>
              </div>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs font-bold text-pink-600 transition hover:text-pink-700"
                >
                  Clear
                </button>
              )}

            </div>

            <div className="relative">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search salon, city, phone or email..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
              />

            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

            <FaStore className="text-xs text-pink-500" />

            <span className="text-xs font-bold text-slate-500">
              Showing
            </span>

            <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-slate-800 shadow-sm">
              {filteredSalons.length}
            </span>

          </div>

        </div>
      </section>

      {/* =========================================================
          GLOBAL ERROR
      ========================================================== */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">

          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm text-red-600">
            <FaTimes />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-extrabold text-red-700">
              Something went wrong
            </p>

            <p className="mt-0.5 break-words text-xs leading-5 text-red-600">
              {actionError}
            </p>
          </div>

          <button
            onClick={() => setActionError("")}
            className="ml-auto shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-red-100 hover:text-red-600"
          >
            <FaTimes />
          </button>

        </div>
      )}

      {/* =========================================================
          EMPTY STATE
      ========================================================== */}
      {filteredSalons.length === 0 ? (
        <section className="relative overflow-hidden rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-12 lg:p-16">

          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-pink-100/50 blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-pink-50 to-purple-50 text-3xl text-pink-500 shadow-inner">
              {search ? <FaSearch /> : <FaStore />}
            </div>

            <h3 className="mt-6 text-xl font-black tracking-tight text-slate-800">
              {search
                ? "No salons found"
                : "Create your first salon"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {search
                ? "We couldn't find any salon matching your search. Try another keyword."
                : "Add your first salon location and start managing your beauty business from one place."}
            </p>

            {!search && (
              <button
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
              >
                <FaPlus />
                Create Salon
              </button>
            )}

          </div>
        </section>
      ) : (
        <>

          {/* =====================================================
              DESKTOP TABLE
          ====================================================== */}
          <section className="hidden overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] lg:block">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>
                <p className="text-sm font-black text-slate-800">
                  All Salons
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Manage your salon information and status.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                {filteredSalons.length} results
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">

                    <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Salon
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Location
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredSalons.map((salon) => (
                    <tr
                      key={salon._id}
                      className="group transition duration-200 hover:bg-slate-50/70"
                    >

                      <td className="px-6 py-5">

                        <div className="flex min-w-0 items-center gap-3">

                          {salon.images?.[0] ? (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                              <img
                                src={getImageUrl(
                                  salon.images[0]
                                )}
                                alt={salon.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 text-pink-500 shadow-sm">
                              <FaStore />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-extrabold text-slate-800">
                              {salon.name}
                            </p>

                            <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                              {salon.description ||
                                "No description available"}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <FaMapMarkerAlt className="shrink-0 text-pink-500" />
                          <span className="truncate">
                            {salon.city || "—"}
                          </span>
                        </p>

                        <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                          {salon.address || "No address"}
                        </p>

                      </td>

                      <td className="px-6 py-5">

                        <p className="truncate text-sm font-semibold text-slate-600">
                          {salon.phone || "—"}
                        </p>

                        <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
                          {salon.email || "—"}
                        </p>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                            salon.isActive
                              ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                              : "border-red-100 bg-red-50 text-red-500"
                          }`}
                        >

                          <span
                            className={`h-2 w-2 rounded-full ${
                              salon.isActive
                                ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]"
                                : "bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                            }`}
                          />

                          {salon.isActive
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(salon)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
                            title="Edit Salon"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() =>
                              handleStatus(salon)
                            }
                            disabled={
                              statusLoading ===
                              salon._id
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
                              salon.isActive
                                ? "border-orange-100 bg-orange-50 text-orange-600 hover:border-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20"
                                : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
                            }`}
                            title={
                              salon.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {statusLoading ===
                            salon._id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                            ) : salon.isActive ? (
                              <FaPowerOff />
                            ) : (
                              <FaCheck />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              setDeleteTarget(
                                salon
                              )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition duration-200 hover:-translate-y-0.5 hover:border-red-500 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
                            title="Delete Salon"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          </section>

          {/* =====================================================
              MOBILE + TABLET PREMIUM CARDS
          ====================================================== */}
          <section className="grid min-w-0 gap-4 lg:hidden">

            {filteredSalons.map((salon) => (
              <article
                key={salon._id}
                className="group relative min-w-0 overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
              >

                <div
                  className={`h-1 w-full ${
                    salon.isActive
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : "bg-gradient-to-r from-red-400 to-orange-400"
                  }`}
                />

                <div className="p-4 sm:p-5">

                  <div className="flex min-w-0 items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      {salon.images?.[0] ? (
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                          <img
                            src={getImageUrl(
                              salon.images[0]
                            )}
                            alt={salon.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-lg text-pink-500 shadow-sm">
                          <FaStore />
                        </div>
                      )}

                      <div className="min-w-0">

                       <h3 className="min-w-0 break-words text-base font-black leading-6 text-slate-800 sm:text-lg sm:leading-7">
  {salon.name}
</h3>

                        <p className="mt-1 flex min-w-0 items-start gap-1.5 text-xs font-medium leading-4 text-slate-400">
  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-pink-500" />

  <span className="min-w-0 break-words leading-4">
    {salon.city || "Location unavailable"}
  </span>
</p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider ${
                        salon.isActive
                          ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                          : "border-red-100 bg-red-50 text-red-500"
                      }`}
                    >
                      {salon.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {salon.images?.length > 0 && (
                    <div className="mt-5">

                      <div className="mb-2 flex items-center justify-between">

                        <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                          <FaImage />
                          Gallery
                        </p>

                        <span className="text-[10px] font-bold text-slate-400">
                          {salon.images.length}{" "}
                          {salon.images.length === 1
                            ? "image"
                            : "images"}
                        </span>

                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">

                        {salon.images
                          .slice(0, 5)
                          .map((image, index) => (
                            <div
                              key={`${image}-${index}`}
                              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                            >

                              <img
                                src={getImageUrl(
                                  image
                                )}
                                alt={`${salon.name} ${
                                  index + 1
                                }`}
                                className="h-full w-full object-cover"
                              />

                              {index === 4 &&
                                salon.images.length >
                                  5 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-xs font-black text-white">
                                    +{salon.images.length - 5}
                                  </div>
                                )}

                            </div>
                          ))}

                      </div>
                    </div>
                  )}

                  <div className="mt-5">

                    <p className="break-words text-sm leading-6 text-slate-500">
  {salon.description ||
    "No description available for this salon."}
</p>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
    Address
  </p>

  <p className="mt-1 break-words text-xs font-semibold leading-5 text-slate-700">
    {salon.address || "Address unavailable"}
  </p>
</div>

                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-3">

                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Contact
                      </p>

                      <p className="mt-1 break-all text-xs font-bold leading-5 text-slate-600">
                        {salon.phone ||
                          salon.email ||
                          "No contact information"}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">

                    <button
                      onClick={() =>
                        openEditModal(salon)
                      }
                      className="group/action flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-2 text-[11px] font-extrabold text-blue-600 transition duration-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                    >
                      <FaEdit className="transition group-hover/action:scale-110" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() =>
                        handleStatus(salon)
                      }
                      disabled={
                        statusLoading ===
                        salon._id
                      }
                      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 text-[11px] font-extrabold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                        salon.isActive
                          ? "border-orange-100 bg-orange-50 text-orange-600 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                          : "border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                      }`}
                    >
                      {statusLoading ===
                      salon._id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current/20 border-t-current" />
                      ) : salon.isActive ? (
                        <FaPowerOff />
                      ) : (
                        <FaCheck />
                      )}

                      <span>
                        {salon.isActive
                          ? "Off"
                          : "On"}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget(
                          salon
                        )
                      }
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-2 text-[11px] font-extrabold text-red-600 transition duration-200 hover:border-red-500 hover:bg-red-600 hover:text-white"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>

                  </div>

                </div>
              </article>
            ))}

          </section>
        </>
      )}

      {/* =========================================================
          CREATE / EDIT MODAL
      ========================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-md sm:p-4">

          <div className="flex min-h-full items-center justify-center">

            <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[26px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)] sm:my-4 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[30px]">

              {/* Modal Header */}
              <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-white px-5 py-5 sm:px-7 lg:px-8">

                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-pink-100/60 blur-3xl" />

                <div className="relative flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-pink-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-pink-600">
                      <FaStore />
                      Salon Workspace
                    </div>

                    <h2 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                      {editingSalon
                        ? "Edit Salon"
                        : "Create New Salon"}
                    </h2>

                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      Configure your salon profile, location,
                      images and working hours.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition duration-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <FaTimes />
                  </button>

                </div>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={handleSubmit}
                className="min-h-0 overflow-y-auto"
              >

                <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-2 lg:gap-6 lg:p-8">

                  {/* Form Error */}
                  {error && (
                    <div className="lg:col-span-2 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm text-red-600">
                        <FaTimes />
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-extrabold text-red-700">
                          Please check the form
                        </p>

                        <p className="mt-0.5 break-words text-xs leading-5 text-red-600">
                          {error}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* BASIC INFORMATION */}
                  <section className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                        <FaStore />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-800">
                          Basic Information
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Tell customers about your salon.
                        </p>
                      </div>

                    </div>

                    <div className="space-y-4">

                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                          Salon Name
                          <span className="ml-1 text-pink-500">
                            *
                          </span>
                        </label>

                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Luxury Beauty Studio"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                          Description
                        </label>

                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Describe your salon, specialties and experience..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div className="min-w-0">

                          <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                            Phone
                          </label>

                          <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="9876543210"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                          />

                        </div>

                        <div className="min-w-0">

                          <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                            Email
                          </label>

                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="salon@example.com"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                          />

                        </div>

                      </div>

                    </div>
                  </section>

                  {/* LOCATION */}
                  <section className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <FaMapMarkerAlt />
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-slate-800">
                          Location Details
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Help customers find your salon.
                        </p>
                      </div>

                    </div>

                    <div className="space-y-4">

                      <div>

                        <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                          Address
                          <span className="ml-1 text-pink-500">
                            *
                          </span>
                        </label>

                        <textarea
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Full salon address"
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                        />

                      </div>

                      <div>

                        <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                          City
                          <span className="ml-1 text-pink-500">
                            *
                          </span>
                        </label>

                        <input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Nagercoil"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                        />

                      </div>

                      <div>

                        <label className="mb-1.5 block text-xs font-extrabold text-slate-600">
                          Location / Map URL
                        </label>

                        <input
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          placeholder="Google Maps URL or coordinates"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10"
                        />

                        <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                          You can provide a Google Maps URL or
                          supported coordinates.
                        </p>

                      </div>

                    </div>
                  </section>

                  {/* IMAGE UPLOAD */}
                  <section className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                          <FaImage />
                        </div>

                        <div>

                          <h3 className="text-sm font-black text-slate-800">
                            Salon Images
                          </h3>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Upload high-quality images of your
                            salon.
                          </p>

                        </div>

                      </div>

                      <span className="self-start rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-black text-pink-600 sm:self-auto">
                        {form.images.length}/10 selected
                      </span>

                    </div>

                    <label className="group mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-5 py-8 text-center transition duration-300 hover:border-pink-300 hover:bg-pink-50/30 sm:py-10">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 text-xl text-pink-500 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                        <FaUpload />
                      </div>

                      <p className="mt-4 text-sm font-black text-slate-700">
                        Upload salon images
                      </p>

                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                        Click here to browse JPG, JPEG, PNG or
                        WEBP images.
                      </p>

                      <span className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500">
                        Maximum 10 files · 5 MB each
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />

                    </label>

                    {editingSalon &&
                      form.existingImages.length > 0 && (
                        <div className="mt-6">

                          <div className="mb-3 flex items-center justify-between gap-3">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">
                              Current Images
                            </p>

                            <span className="text-[10px] font-bold text-slate-400">
                              {form.existingImages.length}{" "}
                              saved
                            </span>

                          </div>

                          <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">

                            {form.existingImages.map(
                              (image, index) => (
                                <div
                                  key={`${image}-${index}`}
                                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                                >

                                  <img
                                    src={getImageUrl(
                                      image
                                    )}
                                    alt={`Current ${
                                      index + 1
                                    }`}
                                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                                  />

                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-2 pt-5">

                                    <span className="text-[9px] font-bold text-white">
                                      Image {index + 1}
                                    </span>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                          {form.images.length > 0 && (
                            <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3">

                              <p className="text-[11px] font-semibold leading-5 text-orange-600">
                                Selecting new images will replace
                                the current salon images when the
                                form is submitted.
                              </p>

                            </div>
                          )}

                        </div>
                      )}

                    {form.imagePreviews.length > 0 && (
                      <div className="mt-6">

                        <div className="mb-3 flex items-center justify-between gap-3">

                          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500">
                            Selected Images
                          </p>

                          <span className="text-[10px] font-bold text-pink-500">
                            Ready to upload
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">

                          {form.imagePreviews.map(
                            (preview, index) => (
                              <div
                                key={preview}
                                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                              >

                                <img
                                  src={preview}
                                  alt={`Preview ${
                                    index + 1
                                  }`}
                                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                                />

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-5">

                                  <span className="text-[9px] font-bold text-white">
                                    New Image
                                  </span>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeNewImage(
                                      index
                                    )
                                  }
                                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs text-white opacity-100 shadow-lg transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                                  title="Remove image"
                                  aria-label="Remove image"
                                >
                                  <FaTimes />
                                </button>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </section>

                  {/* WORKING HOURS */}
                  <section className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5">

                    <div className="mb-5 flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <FaStore />
                      </div>

                      <div>

                        <h3 className="text-sm font-black text-slate-800">
                          Working Hours
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Set your weekly business schedule.
                        </p>

                      </div>

                    </div>

                    <div className="grid gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">

                      {Object.entries(
                        form.workingHours
                      ).map(([day, value]) => (
                        <div
                          key={day}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <label className="text-xs font-extrabold capitalize text-slate-600">
                              {formatDay(day)}
                            </label>

                            {value === "Closed" && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[8px] font-black uppercase text-red-500">
                                Closed
                              </span>
                            )}

                          </div>

                          <input
                            value={value}
                            onChange={(e) =>
                              handleWorkingHourChange(
                                day,
                                e.target.value
                              )
                            }
                            placeholder="09:00 - 18:00"
                            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-500/10"
                          />

                        </div>
                      ))}

                    </div>
                  </section>

                </div>

                {/* MODAL FOOTER */}
                <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-6 lg:px-8">

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-6 text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 px-7 text-sm font-extrabold text-white shadow-lg shadow-pink-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {editingSalon
                          ? "Update Salon"
                          : "Create Salon"}
                      </>
                    )}

                  </button>

                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION
      ========================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5">

          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">

            <div className="relative overflow-hidden px-6 pb-5 pt-7 text-center sm:px-7">

              <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-40 -translate-x-1/2 rounded-full bg-red-100 blur-3xl" />

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500 shadow-sm">
                <FaTrash />
              </div>

              <h2 className="relative mt-5 text-xl font-black tracking-tight text-slate-900">
                Delete Salon?
              </h2>

              <p className="relative mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to permanently delete{" "}
                <strong className="font-extrabold text-slate-700">
                  {deleteTarget.name}
                </strong>
                ?
              </p>

              <div className="relative mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-left">

                <p className="text-[11px] font-semibold leading-5 text-red-600">
                  This action cannot be undone. All salon
                  information associated with this location may
                  be removed.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:p-5">

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={
                  statusLoading ===
                  deleteTarget._id
                }
                className="min-h-12 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  statusLoading ===
                  deleteTarget._id
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-extrabold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >

                {statusLoading ===
                deleteTarget._id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MySalons;