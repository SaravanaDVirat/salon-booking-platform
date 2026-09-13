import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDollarSign,
  FiScissors,
  FiGrid,
  FiChevronDown,
  FiRefreshCw,
  FiX,
  FiAlertTriangle,
  FiLayers,
  FiTag,
  FiInfo,
} from "react-icons/fi";

import {
  getSalonServices,
  createService,
  updateService,
  deleteService,
  activateService,
} from "../../services/salonmanageService";

const API_ORIGIN = import.meta.env.VITE_API_URL;

const initialForm = {
  salon: "",
  category: "",
  name: "",
  description: "",
  price: "",
  duration: "",
};

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSalon, setSelectedSalon] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [salonLoading, setSalonLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () =>
    sessionStorage.getItem("adminToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");

  const loadSalons = async () => {
    try {
      setSalonLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_ORIGIN}/api/salons/owner/my-salons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load salons");
      }

      const salonList = Array.isArray(data?.salons)
        ? data.salons
        : Array.isArray(data)
        ? data
        : [];

      setSalons(salonList);

      if (salonList.length > 0) {
        setSelectedSalon((prev) => {
          const exists = salonList.some((salon) => salon._id === prev);
          return exists ? prev : salonList[0]._id;
        });
      } else {
        setSelectedSalon("");
      }
    } catch (err) {
      setError(err.message || "Failed to load salons");
    } finally {
      setSalonLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);

      const token = getToken();

      const response = await fetch(`${API_ORIGIN}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load categories");
      }

      const categoryList = Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data)
        ? data
        : [];

      setCategories(
        categoryList.filter((category) => category?.isActive !== false)
      );
    } catch (err) {
      setError(err.message || "Failed to load categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadServices = async (salonId) => {
    if (!salonId) {
      setServices([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getSalonServices(salonId);

      setServices(
        Array.isArray(data?.services)
          ? data.services
          : Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(err?.message || "Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedSalon) {
      loadServices(selectedSalon);
    } else {
      setServices([]);
    }
  }, [selectedSalon]);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    const modalIsOpen = modalOpen || deleteModalOpen;

    if (!modalIsOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (modalOpen && !submitting) {
          closeModal();
        }

        if (deleteModalOpen && !submitting) {
          closeDeleteModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, deleteModalOpen, submitting]);

  const currentSalon = useMemo(
    () => salons.find((salon) => salon._id === selectedSalon),
    [salons, selectedSalon]
  );

  const filteredServices = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return services.filter((service) => {
      const categoryName =
        service?.category?.name ||
        service?.category?.categoryName ||
        "";

      const matchesSearch =
        !search ||
        String(service?.name || "")
          .toLowerCase()
          .includes(search) ||
        String(service?.description || "")
          .toLowerCase()
          .includes(search) ||
        String(categoryName).toLowerCase().includes(search);

      const active = service?.isActive !== false;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchText, statusFilter]);

  const stats = useMemo(() => {
    const total = services.length;

    const active = services.filter(
      (service) => service?.isActive !== false
    ).length;

    const inactive = services.filter(
      (service) => service?.isActive === false
    ).length;

    const prices = services
      .map((service) => Number(service?.price))
      .filter((price) => Number.isFinite(price));

    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;

    return {
      total,
      active,
      inactive,
      averagePrice,
    };
  }, [services]);

  const formatPrice = (price) => {
    const value = Number(price || 0);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDuration = (duration) => {
    const value = Number(duration);

    if (!Number.isFinite(value) || value <= 0) {
      return "—";
    }

    if (value < 60) {
      return `${value} min`;
    }

    const hours = Math.floor(value / 60);
    const mins = value % 60;

    if (mins === 0) {
      return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
  };

  const getCategoryName = (service) =>
    service?.category?.name ||
    service?.category?.categoryName ||
    service?.categoryName ||
    "Uncategorized";

  const openCreateModal = () => {
    setEditingService(null);

    setForm({
      ...initialForm,
      salon: selectedSalon || "",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      salon: service?.salon?._id || service?.salon || selectedSalon || "",
      category: service?.category?._id || service?.category || "",
      name: service?.name || "",
      description: service?.description || "",
      price:
        service?.price !== undefined && service?.price !== null
          ? String(service.price)
          : "",
      duration:
        service?.duration !== undefined && service?.duration !== null
          ? String(service.duration)
          : "",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingService(null);
    setForm(initialForm);
    setError("");
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setError("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (submitting) return;

    setDeleteModalOpen(false);
    setSelectedService(null);
    setError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.salon) {
      return "Please select a salon.";
    }

    if (!form.category) {
      return "Please select a category.";
    }

    if (!form.name.trim()) {
      return "Service name is required.";
    }

    if (form.price === "" || Number(form.price) < 0) {
      return "Please enter a valid price.";
    }

    if (form.duration === "" || Number(form.duration) < 1) {
      return "Duration must be at least 1 minute.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      salon: form.salon,
      category: form.category,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
    };

    try {
      setSubmitting(true);
      setError("");

      if (editingService) {
        await updateService(editingService._id, payload);
        setSuccess("Service updated successfully.");
      } else {
        await createService(payload);
        setSuccess("Service created successfully.");
      }

      setModalOpen(false);
      setEditingService(null);
      setForm(initialForm);

      await loadServices(selectedSalon);
    } catch (err) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedService?._id) return;

    try {
      setSubmitting(true);
      setError("");

      await deleteService(selectedService._id);

      setSuccess("Service deactivated successfully.");

      setDeleteModalOpen(false);
      setSelectedService(null);

      await loadServices(selectedSalon);
    } catch (err) {
      setError(err?.message || "Failed to deactivate service.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (service) => {
    if (!service?._id) return;

    try {
      setActionLoadingId(service._id);
      setError("");

      await activateService(service._id);

      setSuccess("Service activated successfully.");

      await loadServices(selectedSalon);
    } catch (err) {
      setError(err?.message || "Failed to activate service.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRefresh = async () => {
    if (!selectedSalon) return;

    await loadServices(selectedSalon);
    setSuccess("Services refreshed.");
  };

  const pageError =
    error && !modalOpen && !deleteModalOpen ? error : "";

  return (
    <div className="min-h-full w-full min-w-0 overflow-x-hidden bg-[#f7f7fb] text-slate-950">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute right-[5%] top-[18%] h-80 w-80 rounded-full bg-fuchsia-300/15 blur-3xl" />
        <div className="absolute bottom-[5%] left-[35%] h-72 w-72 rounded-full bg-rose-200/15 blur-3xl" />
      </div>

      <main className="mx-auto w-full max-w-[1680px] min-w-0 px-3 py-4 min-[375px]:px-4 sm:px-6 lg:px-8 lg:py-7">
        {/* ERROR */}
        {pageError && (
          <div className="mb-5 flex min-w-0 items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-rose-700 shadow-sm">
            <FiAlertTriangle className="mt-0.5 shrink-0" size={18} />

            <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-6">
              {pageError}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1.5 transition hover:bg-rose-100"
              aria-label="Close error"
            >
              <FiX size={17} />
            </button>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-700 shadow-sm">
            <FiCheckCircle className="mt-0.5 shrink-0" size={18} />

            <p className="min-w-0 flex-1 break-words text-sm font-semibold leading-6">
              {success}
            </p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 rounded-lg p-1.5 transition hover:bg-emerald-100"
              aria-label="Close success message"
            >
              <FiX size={17} />
            </button>
          </div>
        )}

        {/* HERO */}
        <section className="relative mb-5 min-w-0 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/50" />

          <div className="relative min-w-0 p-5 sm:p-7 lg:p-10">
            <div className="mb-7 inline-flex max-w-full items-center gap-2 rounded-full border border-violet-200 bg-white/90 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet-600 shadow-sm sm:text-xs">
              <FiScissors className="shrink-0" size={14} />
              <span className="break-words">Service Management</span>
            </div>

            <div className="flex min-w-0 flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 max-w-3xl">
                <h1 className="break-words text-[clamp(2rem,6vw,3.6rem)] font-black leading-[1.03] tracking-[-0.045em] text-slate-950">
                  Manage Your Services
                </h1>

                <p className="mt-4 max-w-2xl break-words text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">
                  Create, update and manage the beauty services offered by
                  your salons.
                </p>
              </div>

              <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:w-auto xl:min-w-[520px]">
                {/* SALON SELECT */}
                <div className="relative min-w-0">
                  <select
                    value={selectedSalon}
                    onChange={(e) => setSelectedSalon(e.target.value)}
                    disabled={salonLoading}
                   className="h-14 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-xs font-bold text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {salons.length === 0 ? (
                      <option value="">
                        {salonLoading ? "Loading salons..." : "No salons found"}
                      </option>
                    ) : (
                      salons.map((salon) => (
                        <option key={salon._id} value={salon._id}>
                          {salon.name ||
                            salon.salonName ||
                            salon.businessName ||
                            "Unnamed Salon"}
                        </option>
                      ))
                    )}
                  </select>

                  <FiGrid
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-violet-500"
                    size={16}
                  />

                  <FiChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  disabled={!selectedSalon}
                  className="flex h-14 min-w-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(124,58,237,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(124,58,237,0.34)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <FiPlus className="shrink-0" size={19} />
                  <span className="whitespace-nowrap">Add Service</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CURRENT SALON */}
        <section className="relative mb-5 min-w-0 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:rounded-[30px]">
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-rose-400" />

          <div className="flex min-w-0 flex-col gap-5 p-4 pl-5 sm:p-6 sm:pl-7 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200">
                <FiScissors size={24} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-500 sm:text-xs">
                  Currently Managing
                </p>

                <h2 className="break-words text-base font-black leading-6 text-slate-950 sm:text-xl sm:leading-7">
                  {currentSalon?.name ||
                    currentSalon?.salonName ||
                    currentSalon?.businessName ||
                    "No salon selected"}
                </h2>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  {currentSalon?.city ? `${currentSalon.city} • ` : ""}
                  {currentSalon?.address ||
                    currentSalon?.location ||
                    "Salon location"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || !selectedSalon}
              className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Services"
            value={stats.total}
            caption="All services"
            icon={<FiLayers size={20} />}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            label="Active"
            value={stats.active}
            caption={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% active`}
            icon={<FiCheckCircle size={20} />}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
            caption="Hidden services"
            icon={<FiXCircle size={20} />}
            iconClass="bg-rose-50 text-rose-500"
          />

          <StatCard
            label="Avg. Price"
            value={formatPrice(stats.averagePrice)}
            caption="Per service"
            icon={<FiDollarSign size={20} />}
            iconClass="bg-amber-50 text-amber-600"
            valueClass="text-[clamp(1.45rem,5vw,2rem)]"
          />
        </section>

        {/* COMMAND CENTER */}
        <section className="mb-5 min-w-0 overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.05)] sm:rounded-[30px]">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FiGrid className="shrink-0 text-violet-600" size={18} />

                  <h3 className="break-words text-base font-black text-slate-950 sm:text-lg">
                    Services
                  </h3>
                </div>

                <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">
                  {filteredServices.length}{" "}
                  {filteredServices.length === 1 ? "service" : "services"} found
                </p>
              </div>

              <div className="w-full min-w-0 lg:max-w-xl">
                <div className="relative min-w-0">
                  <FiSearch
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={17}
                  />

                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search services..."
                    className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
            <div className="grid w-full min-w-0 grid-cols-3 gap-2 md:w-auto">
              {["ALL", "ACTIVE", "INACTIVE"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`min-w-0 rounded-xl px-3 py-2.5 text-[10px] font-black tracking-wide transition sm:px-4 sm:text-xs ${
                    statusFilter === status
                      ? "bg-slate-950 text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-400">
              <FiInfo className="shrink-0" size={15} />
              <span className="break-words">
                Showing {filteredServices.length} of {services.length}
              </span>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div className="grid min-w-0 grid-cols-1 gap-4 xl:hidden">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[24px] border border-slate-200 bg-white p-5"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                <div className="mt-5 h-5 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* MOBILE / TABLET CARDS */}
        {!loading && filteredServices.length > 0 && (
          <section className="grid min-w-0 grid-cols-1 gap-4 xl:hidden">
            {filteredServices.map((service) => {
              const active = service?.isActive !== false;
              const categoryName = getCategoryName(service);

              return (
                <article
                  key={service._id}
                  className="group relative min-w-0 overflow-hidden rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-5"
                >
                  <div
                    className={`absolute left-0 top-0 h-1 w-full ${
                      active
                        ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-400"
                        : "bg-slate-300"
                    }`}
                  />

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <FiScissors size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-col gap-2 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between">
                        <h3 className="min-w-0 break-words text-sm font-black leading-5 text-slate-950 sm:text-base sm:leading-6">
                          {service?.name || "Unnamed Service"}
                        </h3>

                        <span
                          className={`w-fit shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-2 flex min-w-0 items-start gap-1.5 text-xs font-semibold text-violet-600">
                        <FiTag className="mt-0.5 shrink-0" size={13} />

                        <span className="min-w-0 break-words leading-5">
                          {categoryName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 break-words text-xs leading-6 text-slate-500 sm:text-sm">
                    {service?.description || "No description provided."}
                  </p>

                  {/* PRICE / DURATION */}
                  <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                        <FiDollarSign
                          className="shrink-0 text-violet-500"
                          size={14}
                        />
                        <span>Price</span>
                      </div>

                      <div className="mt-2 whitespace-nowrap text-lg font-black leading-none text-slate-950 sm:text-xl">
                        {formatPrice(service?.price)}
                      </div>
                    </div>

                    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
                        <FiClock
                          className="shrink-0 text-violet-500"
                          size={14}
                        />
                        <span>Duration</span>
                      </div>

                      {/* IMPORTANT: NEVER WRAP */}
                      <div className="mt-2 whitespace-nowrap text-[clamp(0.9rem,4vw,1.05rem)] font-black leading-none tracking-[-0.02em] text-slate-950">
                        {formatDuration(service?.duration)}
                      </div>
                    </div>
                  </div>

                  <div className="my-5 h-px bg-slate-100" />

                  {/* ACTIONS */}
                  <div className="grid min-w-0 grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="flex min-w-0 h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <FiEdit3 className="shrink-0" size={14} />
                      <span className="whitespace-nowrap">Edit</span>
                    </button>

                    {active ? (
                      <button
                        type="button"
                        onClick={() => openDeleteModal(service)}
                        className="flex min-w-0 h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-black text-amber-700 transition hover:bg-amber-100"
                      >
                        <FiXCircle className="shrink-0" size={14} />
                        <span className="whitespace-nowrap">Deactivate</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(service)}
                        disabled={actionLoadingId === service._id}
                        className="flex min-w-0 h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                      >
                        <FiCheckCircle
                          className={`shrink-0 ${
                            actionLoadingId === service._id
                              ? "animate-pulse"
                              : ""
                          }`}
                          size={14}
                        />
                        <span className="whitespace-nowrap">
                          {actionLoadingId === service._id
                            ? "Activating..."
                            : "Activate"}
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* DESKTOP TABLE */}
        {!loading && filteredServices.length > 0 && (
          <section className="hidden min-w-0 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.05)] xl:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Service
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Category
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Price
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Duration
                    </th>
                    <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map((service) => {
                    const active = service?.isActive !== false;

                    return (
                      <tr
                        key={service._id}
                        className="group border-b border-slate-100 last:border-0 hover:bg-violet-50/30"
                      >
                        <td className="max-w-[380px] px-6 py-5 align-top">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                              <FiScissors size={20} />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words text-sm font-black leading-6 text-slate-950">
                                {service?.name || "Unnamed Service"}
                              </p>

                              <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                                {service?.description ||
                                  "No description provided."}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[180px] px-6 py-5 align-top">
                          <span className="inline-flex max-w-full items-start gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                            <FiTag className="mt-0.5 shrink-0" size={13} />

                            <span className="break-words">
                              {getCategoryName(service)}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span className="whitespace-nowrap text-sm font-black text-slate-950">
                            {formatPrice(service?.price)}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-bold text-slate-700">
                            <FiClock
                              className="shrink-0 text-violet-500"
                              size={15}
                            />
                            {formatDuration(service?.duration)}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                              active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-600"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-5 align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(service)}
                              title="Edit service"
                              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                            >
                              <FiEdit3 size={14} />
                              Edit
                            </button>

                            {active ? (
                              <button
                                type="button"
                                onClick={() => openDeleteModal(service)}
                                title="Deactivate service"
                                className="flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                              >
                                <FiXCircle size={14} />
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActivate(service)}
                                disabled={actionLoadingId === service._id}
                                title="Activate service"
                                className="flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                              >
                                <FiCheckCircle size={14} />
                                {actionLoadingId === service._id
                                  ? "Activating..."
                                  : "Activate"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EMPTY */}
        {!loading && filteredServices.length === 0 && (
          <section className="min-w-0 rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:rounded-[30px] sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600">
              <FiScissors size={27} />
            </div>

            <h3 className="mt-5 break-words text-lg font-black text-slate-950 sm:text-xl">
              {services.length === 0
                ? "No services available"
                : "No matching services"}
            </h3>

            <p className="mx-auto mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
              {services.length === 0
                ? "Create your first service for this salon to get started."
                : "Try changing your search or status filter."}
            </p>

            {services.length === 0 && selectedSalon && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex h-11 max-w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                <FiPlus size={17} />
                <span className="whitespace-nowrap">Create Service</span>
              </button>
            )}
          </section>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2.5 backdrop-blur-md sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              closeModal();
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[30px]">
            {/* HEADER */}
            <div className="flex shrink-0 min-w-0 items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-4 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
                  {editingService ? (
                    <FiEdit3 size={20} />
                  ) : (
                    <FiPlus size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="break-words text-lg font-black leading-6 text-slate-950 sm:text-xl">
                    {editingService ? "Edit Service" : "Create New Service"}
                  </h2>

                  <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                    {editingService
                      ? "Update the service details below."
                      : "Add a new beauty service to your salon."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                {error && (
                  <div className="mb-5 flex min-w-0 items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700">
                    <FiAlertTriangle
                      className="mt-0.5 shrink-0"
                      size={17}
                    />

                    <p className="min-w-0 flex-1 break-words text-xs font-bold leading-5 sm:text-sm">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="shrink-0"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}

                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                  {/* SALON */}
                  <FormField label="Salon" required icon={<FiGrid size={14} />}>
                    <select
                      name="salon"
                      value={form.salon}
                      onChange={handleFormChange}
                      disabled={editingService || salonLoading}
                      className="h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">Select salon</option>

                      {salons.map((salon) => (
                        <option key={salon._id} value={salon._id}>
                          {salon.name ||
                            salon.salonName ||
                            salon.businessName ||
                            "Unnamed Salon"}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* CATEGORY */}
                  <FormField
                    label="Category"
                    required
                    icon={<FiTag size={14} />}
                  >
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      disabled={categoryLoading}
                      className="h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:opacity-60"
                    >
                      <option value="">Select category</option>

                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name ||
                            category.categoryName ||
                            "Unnamed Category"}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* NAME */}
                  <div className="md:col-span-2">
                    <FormField
                      label="Service Name"
                      required
                      icon={<FiScissors size={14} />}
                    >
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="e.g. Hair Cut & Styling"
                        className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </FormField>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="md:col-span-2">
                    <FormField
                      label="Description"
                      icon={<FiInfo size={14} />}
                    >
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        rows={4}
                        placeholder="Describe what is included in this service..."
                        className="w-full min-w-0 resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </FormField>
                  </div>

                  {/* PRICE */}
                  <FormField
                    label="Price"
                    required
                    icon={<FiDollarSign size={14} />}
                  >
                    <div className="relative min-w-0">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        name="price"
                        value={form.price}
                        onChange={handleFormChange}
                        placeholder="200"
                        className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </FormField>

                  {/* DURATION */}
                  <FormField
                    label="Duration"
                    required
                    icon={<FiClock size={14} />}
                  >
                    <div className="relative min-w-0">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="duration"
                        value={form.duration}
                        onChange={handleFormChange}
                        placeholder="60"
                        className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 pr-[58px] text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />

                      {/* IMPORTANT: min stays on same line */}
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-black text-slate-400">
                        min
                      </span>
                    </div>
                  </FormField>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex shrink-0 min-w-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="h-12 w-full rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingService ? (
                        <FiEdit3 size={16} />
                      ) : (
                        <FiPlus size={17} />
                      )}
                      {editingService ? "Update Service" : "Create Service"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / DEACTIVATE MODAL */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full min-w-0 max-w-md overflow-hidden rounded-[26px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)] sm:rounded-[30px]">
            <div className="p-5 sm:p-7">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <FiAlertTriangle size={26} />
              </div>

              <h2 className="mt-5 break-words text-xl font-black text-slate-950">
                Deactivate Service?
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                Are you sure you want to deactivate{" "}
                <span className="font-black text-slate-800">
                  {selectedService?.name || "this service"}
                </span>
                ? The service will no longer be active.
              </p>

              {error && (
                <div className="mt-5 flex min-w-0 items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-700">
                  <FiAlertTriangle className="mt-0.5 shrink-0" size={15} />
                  <span className="min-w-0 break-words">{error}</span>
                </div>
              )}

              <div className="mt-7 grid min-w-0 grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={submitting}
                  className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={submitting}
                  className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {submitting ? (
                    <FiRefreshCw className="animate-spin" size={16} />
                  ) : (
                    <FiXCircle size={16} />
                  )}

                  <span className="whitespace-nowrap">
                    {submitting ? "Deactivating..." : "Deactivate"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  caption,
  icon,
  iconClass,
  valueClass = "text-3xl",
}) => {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-3.5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] sm:rounded-[28px] sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
            {label}
          </p>

          <p
            className={`mt-3 min-w-0 whitespace-nowrap font-black leading-none tracking-[-0.04em] text-slate-950 ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-2 break-words text-[9px] font-semibold leading-4 text-slate-400 sm:text-xs">
            {caption}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClass} sm:h-12 sm:w-12`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, required, icon, children }) => {
  return (
    <label className="block min-w-0">
      <div className="mb-2 flex min-w-0 items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-500 sm:text-xs">
        <span className="shrink-0 text-violet-500">{icon}</span>
        <span className="min-w-0 break-words">{label}</span>
        {required && <span className="shrink-0 text-rose-500">*</span>}
      </div>

      {children}
    </label>
  );
};

export default ServiceManagement;