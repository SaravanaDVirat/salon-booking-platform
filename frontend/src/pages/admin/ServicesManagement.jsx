import { useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaConciergeBell,
  FaClock,
  FaRupeeSign,
  FaStore,
  FaTags,
  FaLayerGroup,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";

import {
  getAllServicesAdmin,
  createService,
  updateService,
  deactivateService,
  activateService,
} from "../../services/serviceService";

const API_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  salon: "",
  category: "",
  name: "",
  description: "",
  price: "",
  duration: "",
};

const ServicesManagement = () => {
  const [services, setServices] = useState([]);
const [allServices, setAllServices] = useState([]);
const [salons, setSalons] = useState([]);
const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSalons, setLoadingSalons] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [search, setSearch] = useState("");
  const [salonFilter, setSalonFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState(initialForm);

  // --------------------------------------------------
  // LOAD SALONS
  // --------------------------------------------------

  const loadSalons = async () => {
    try {
      setLoadingSalons(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/salons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      const salonData = data?.salons || data?.data || data || [];

      setSalons(Array.isArray(salonData) ? salonData : []);
    } catch (error) {
      console.error("Failed to load salons:", error);
      setSalons([]);
    } finally {
      setLoadingSalons(false);
    }
  };

  // --------------------------------------------------
  // LOAD CATEGORIES
  // --------------------------------------------------

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      const token = sessionStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      const categoryData =
        data?.categories || data?.data || data || [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // --------------------------------------------------
  // LOAD SERVICES
  // --------------------------------------------------

  const loadServices = async () => {
  try {
    setLoading(true);

    const params = {};

    if (salonFilter) params.salon = salonFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    const response = await getAllServicesAdmin(params);

    const serviceData = response?.services || [];

    setServices(Array.isArray(serviceData) ? serviceData : []);
    const allResponse = await getAllServicesAdmin({});

    const allServiceData = allResponse?.services || [];

    setAllServices(
      Array.isArray(allServiceData) ? allServiceData : []
    );
  } catch (error) {
    console.error("Failed to load services:", error);
    setServices([]);
    setAllServices([]);
  } finally {
    setLoading(false);
  }
};

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadSalons();
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, salonFilter, categoryFilter, statusFilter]);

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const stats = useMemo(() => {
  const total = allServices.length;

  const active = allServices.filter(
    (service) => service.isActive !== false
  ).length;

  const inactive = allServices.filter(
    (service) => service.isActive === false
  ).length;

  const prices = allServices
    .map((service) => Number(service.price))
    .filter((price) => !Number.isNaN(price));

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
}, [allServices]);
  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // OPEN CREATE MODAL
  // --------------------------------------------------

  const openCreateModal = () => {
    setEditingService(null);
    setForm(initialForm);
    setShowModal(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      salon:
        service?.salon?._id ||
        service?.salon?.id ||
        service?.salon ||
        "",

      category:
        service?.category?._id ||
        service?.category?.id ||
        service?.category ||
        "",

      name: service?.name || "",
      description: service?.description || "",
      price: service?.price ?? "",
      duration: service?.duration ?? "",
    });

    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE CREATE / EDIT MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    setEditingService(null);
    setForm(initialForm);
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.salon ||
      !form.category ||
      !form.name.trim() ||
      !form.price ||
      !form.duration
    ) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        salon: form.salon,
        category: form.category,
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
      };

      if (editingService) {
        await updateService(editingService._id, payload);
      } else {
        await createService(payload);
      }

      closeModal();
      await loadServices();
    } catch (error) {
      console.error("Failed to save service:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // DEACTIVATE
  // --------------------------------------------------

  const openDeactivateModal = (service) => {
    setSelectedService(service);
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    if (loading) return;

    setSelectedService(null);
    setShowDeactivateModal(false);
  };

  const handleDeactivate = async () => {
    if (!selectedService) return;

    try {
      setLoading(true);

      await deactivateService(selectedService._id);

      closeDeactivateModal();
      await loadServices();
    } catch (error) {
      console.error("Failed to deactivate service:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ACTIVATE
  // --------------------------------------------------

  const handleActivate = async (service) => {
    try {
      setLoading(true);

      await activateService(service._id);

      await loadServices();
    } catch (error) {
      console.error("Failed to activate service:", error);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RESET FILTERS
  // --------------------------------------------------

  const resetFilters = () => {
    setSearch("");
    setSalonFilter("");
    setCategoryFilter("");
    setStatusFilter("");
  };

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getSalonName = (service) => {
    if (service?.salon?.name) return service.salon.name;
    if (service?.salon?.salonName) return service.salon.salonName;

    const salon = salons.find(
      (item) =>
        item?._id === service?.salon ||
        item?.id === service?.salon
    );

    return salon?.name || salon?.salonName || "Salon";
  };

  const getCategoryName = (service) => {
    if (service?.category?.name) return service.category.name;

    const category = categories.find(
      (item) =>
        item?._id === service?.category ||
        item?.id === service?.category
    );

    return category?.name || "Category";
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 px-2 pt-16 pb-4 max-[359px]:pt-14 sm:px-5 sm:pt-20 sm:pb-5 lg:px-7 lg:pt-24 lg:pb-6 xl:px-8">
      <div className="mx-auto w-full max-w-[1600px] min-w-0">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="relative mb-4 overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/80 p-3 shadow-sm max-[359px]:rounded-xl sm:mb-6 sm:rounded-[26px] sm:p-6 lg:mb-7 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-fuchsia-200/20 blur-2xl" />
          <div className="relative">
          {/* Breadcrumb */}
          <div className="mb-3 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400 sm:gap-2 sm:text-sm">
            <span className="shrink-0">Admin</span>

            <span className="text-slate-300">/</span>

            <span className="truncate text-slate-600">
              Services Management
            </span>
          </div>

          {/* Header content */}
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-200 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <FaConciergeBell className="text-lg sm:text-xl" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                    Services Management
                  </h1>

                  <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-sm">
                    Manage salon services, pricing and duration.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <button
                type="button"
                onClick={loadServices}
                disabled={loading}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-white hover:text-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <FaSyncAlt
                  className={loading ? "animate-spin" : ""}
                />

                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl active:scale-[0.98] sm:w-auto"
              >
                <FaPlus />

                <span>Add Service</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <StatCard
            title="Total Services"
            value={stats.total}
            icon={<FaLayerGroup />}
            iconClass="bg-violet-100 text-violet-600"
          />

          <StatCard
            title="Active Services"
            value={stats.active}
            icon={<FaCheckCircle />}
            iconClass="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            title="Inactive Services"
            value={stats.inactive}
            icon={<FaTimes />}
            iconClass="bg-rose-100 text-rose-600"
          />

          <StatCard
            title="Average Price"
            value={`₹${Math.round(
              stats.averagePrice
            ).toLocaleString("en-IN")}`}
            icon={<FaRupeeSign />}
            iconClass="bg-amber-100 text-amber-600"
          />
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm shadow-slate-200/60 max-[359px]:rounded-xl max-[359px]:p-2 sm:p-4 lg:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 sm:text-base">
                Search & Filters
              </h2>

              <p className="text-xs text-slate-400">
                Quickly find and filter salon services.
              </p>
            </div>

            {(search ||
              salonFilter ||
              categoryFilter ||
              statusFilter) && (
              <button
                type="button"
                onClick={resetFilters}
                className="self-start text-xs font-bold text-violet-600 transition hover:text-violet-700 sm:self-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="min-w-0 lg:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Search
              </label>

              <div className="relative">
                <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search service name..."
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Salon */}
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Salon
              </label>

              <div className="relative">
                <FaStore className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

                <select
                  value={salonFilter}
                  onChange={(e) => setSalonFilter(e.target.value)}
                  className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">All Salons</option>

                  {salons.map((salon) => (
                    <option
                      key={salon._id || salon.id}
                      value={salon._id || salon.id}
                    >
                      {salon.name || salon.salonName}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Category
              </label>

              <div className="relative">
                <FaTags className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(e.target.value)
                  }
                  className="h-11 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">All Categories</option>

                  {categories.map((category) => (
                    <option
                      key={category._id || category.id}
                      value={category._id || category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="min-w-0 sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">
            <FaSyncAlt className="shrink-0 animate-spin" />

            <span>Updating services...</span>
          </div>
        )}

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm sm:px-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-500">
              <FaConciergeBell />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
              No services found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              There are no services matching your current
              filters.
            </p>

            {(search ||
              salonFilter ||
              categoryFilter ||
              statusFilter) && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex min-h-[42px] items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ======================================================
            SERVICES GRID
        ====================================================== */}

        {!loading && services.length > 0 && (
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                salonName={getSalonName(service)}
                categoryName={getCategoryName(service)}
                onEdit={() => openEditModal(service)}
                onDeactivate={() =>
                  openDeactivateModal(service)
                }
                onActivate={() => handleActivate(service)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-2 py-2 backdrop-blur-sm sm:px-5 sm:py-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) {
              closeModal();
            }
          }}
        >
          <div
            className="my-auto flex w-full max-w-3xl min-w-0 max-h-[calc(100dvh-16px)] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20 max-[359px]:rounded-xl sm:max-h-[calc(100dvh-40px)] sm:rounded-[28px]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-3 sm:px-6 sm:py-5 lg:px-7">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600 sm:text-xs">
                    {editingService
                      ? "Edit Service"
                      : "New Service"}
                  </div>

                  <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl lg:text-2xl">
                    {editingService
                      ? "Edit salon service"
                      : "Create salon service"}
                  </h2>

                  <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                    Add service details, pricing and duration.
                  </p>
                </div>

                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  aria-label="Close modal"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                >
                  <FaTimes className="text-base sm:text-lg" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              <div className="grid min-w-0 grid-cols-1 gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6 md:grid-cols-2 lg:px-7 lg:py-7">
                {/* Salon */}
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                    Salon
                  </label>

                  <div className="relative">
                    <FaStore className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

                    <select
                      name="salon"
                      value={form.salon}
                      onChange={handleChange}
                      disabled={loadingSalons}
                      className="h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60 sm:h-13"
                    >
                      <option value="">
                        {loadingSalons
                          ? "Loading salons..."
                          : "Select salon"}
                      </option>

                      {salons.map((salon) => (
                        <option
                          key={salon._id || salon.id}
                          value={salon._id || salon.id}
                        >
                          {salon.name || salon.salonName}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                    Category
                  </label>

                  <div className="relative">
                    <FaTags className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      disabled={loadingCategories}
                      className="h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {loadingCategories
                          ? "Loading categories..."
                          : "Select category"}
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category._id || category.id}
                          value={category._id || category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Service Name */}
                <div className="min-w-0 md:col-span-2">
                  <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                    Service Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Eg: Hair Cut"
                    className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* Description */}
                <div className="min-w-0 md:col-span-2">
                  <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe this service..."
                    className="min-h-[110px] w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                {/* Price + Duration */}
                <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-2">
                  {/* Price */}
                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                      Price (₹)
                    </label>

                    <div className="relative">
                      <FaRupeeSign className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        min="0"
                        placeholder="500"
                        className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="min-w-0">
                    <label className="mb-2 block text-xs font-extrabold text-slate-700 sm:text-sm">
                      Duration (minutes)
                    </label>

                    <div className="relative">
                      <FaClock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                      <input
                        type="number"
                        name="duration"
                        value={form.duration}
                        onChange={handleChange}
                        min="1"
                        placeholder="45"
                        className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 sm:py-4 lg:px-7">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && (
                      <FaSyncAlt className="animate-spin" />
                    )}

                    <span>
                      {loading
                        ? "Saving..."
                        : editingService
                        ? "Update Service"
                        : "Create Service"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          DEACTIVATE MODAL
      ======================================================== */}

      {showDeactivateModal && selectedService && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:px-5">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl sm:rounded-3xl">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <FaExclamationTriangle />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    Deactivate Service?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Are you sure you want to deactivate{" "}
                    <span className="font-bold text-slate-700">
                      {selectedService.name}
                    </span>
                    ?
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeDeactivateModal}
                  disabled={loading}
                  className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={loading}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <FaSyncAlt className="animate-spin" />
                  )}

                  <span>
                    {loading ? "Deactivating..." : "Deactivate"}
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

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  icon,
  iconClass,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-400 sm:text-sm">
            {title}
          </p>

          <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base sm:h-12 sm:w-12 sm:text-lg ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SERVICE CARD
// ============================================================

const ServiceCard = ({
  service,
  salonName,
  categoryName,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  const isActive = service?.isActive !== false;

  return (
    <div className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/70">
      {/* Card Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-600 px-4 py-4 sm:px-5">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
              <FaConciergeBell />
            </div>

            <span className="max-w-[150px] truncate rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur sm:max-w-[180px]">
              {categoryName}
            </span>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white/15 text-white"
            }`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-1 break-words text-base font-extrabold text-slate-900 sm:text-lg">
          {service?.name || "Unnamed Service"}
        </h3>

        <p className="mt-2 min-h-[40px] line-clamp-2 break-words text-xs leading-5 text-slate-500 sm:text-sm">
          {service?.description || "No description available."}
        </p>

        {/* Salon */}
        <div className="mt-4 flex min-w-0 items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
  <FaStore className="mt-0.5 shrink-0 text-xs text-violet-500" />

  <span className="min-w-0 break-words text-xs font-bold leading-5 text-slate-600">
    {salonName}
  </span>
</div>

        {/* Price + Duration */}
        <div className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <FaRupeeSign />

              <span>Price</span>
            </div>

            <p className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-base">
              ₹{Number(service?.price || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <FaClock />

              <span>Duration</span>
            </div>

            <p className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-base">
              {service?.duration || 0} min
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 sm:text-sm"
          >
            <FaEdit />

            <span>Edit</span>
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={onDeactivate}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100 sm:text-sm"
            >
              <FaTrash />

              <span>Deactivate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onActivate}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-600 transition hover:bg-emerald-100 sm:text-sm"
            >
              <FaCheckCircle />

              <span>Activate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesManagement;