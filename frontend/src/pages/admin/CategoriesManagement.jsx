import { useEffect, useMemo, useState } from "react";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaTags,
  FaLayerGroup,
  FaPowerOff,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChartPie,
} from "react-icons/fa";

import {
  getAllCategoriesForAdmin,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from "../../services/categoryService";

// ======================================================
// INITIAL FORM
// ======================================================

const initialForm = {
  name: "",
  description: "",
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const CategoriesManagement = () => {
  // -----------------------------------------
  // STATES
  // -----------------------------------------

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [form, setForm] = useState(initialForm);

  // -----------------------------------------
  // TOAST STATE
  // -----------------------------------------

  const [toast, setToast] = useState(null);

  // ======================================================
  // SHOW TOAST
  // ======================================================

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  // ======================================================
  // AUTO HIDE TOAST
  // ======================================================

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  const loadCategories = async () => {
    try {
      setLoading(true);

      const data = await getAllCategoriesForAdmin();

      setCategories(
        Array.isArray(data?.categories)
          ? data.categories
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to load categories",
        "error"
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadCategories();
  }, []);

  // ======================================================
  // FILTERED CATEGORIES
  // ======================================================

  const filteredCategories = useMemo(() => {
    const value = search.toLowerCase().trim();

    return categories.filter((category) => {
      const matchesSearch =
        !value ||
        category.name
          ?.toLowerCase()
          .includes(value) ||
        category.description
          ?.toLowerCase()
          .includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          category.isActive === true) ||
        (statusFilter === "INACTIVE" &&
          category.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  // ======================================================
  // STATS
  // ======================================================

  const totalCategories = categories.length;

  const activeCategories = categories.filter(
    (category) => category.isActive
  ).length;

  const inactiveCategories =
    categories.filter(
      (category) => !category.isActive
    ).length;

  const activePercentage =
    totalCategories > 0
      ? Math.round(
          (activeCategories / totalCategories) * 100
        )
      : 0;

  // ======================================================
  // OPEN CREATE MODAL
  // ======================================================

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setShowModal(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
    });

    setShowModal(true);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    setForm(initialForm);
  };

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!name) {
      showToast(
        "Category name is required",
        "error"
      );
      return;
    }

    if (name.length < 2) {
      showToast(
        "Category name must contain at least 2 characters",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        description,
      };

      // -----------------------------------------
      // UPDATE
      // -----------------------------------------

      if (editingCategory) {
        await updateCategory(
          editingCategory._id,
          payload
        );

        // Close modal directly.
        // Do NOT call closeModal() here because
        // saving is still true at this point.
        setShowModal(false);
        setEditingCategory(null);
        setForm(initialForm);

        showToast(
          "Category updated successfully",
          "success"
        );
      }

      // -----------------------------------------
      // CREATE
      // -----------------------------------------

      else {
        await createCategory(payload);

        // Close modal directly.
        setShowModal(false);
        setEditingCategory(null);
        setForm(initialForm);

        showToast(
          "Category created successfully",
          "success"
        );
      }

      await loadCategories();
    } catch (error) {
      console.error(
        "Category save error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Something went wrong",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // OPEN DEACTIVATE MODAL
  // ======================================================

  const openDeactivateModal = (category) => {
    setSelectedCategory(category);
    setShowDeactivateModal(true);
  };

  // ======================================================
  // CLOSE DEACTIVATE MODAL
  // ======================================================

  const closeDeactivateModal = () => {
    if (saving) return;

    setShowDeactivateModal(false);
    setSelectedCategory(null);
  };

  // ======================================================
  // DEACTIVATE
  // ======================================================

  const handleDeactivate = async () => {
    if (!selectedCategory) return;

    try {
      setSaving(true);

      await deactivateCategory(
        selectedCategory._id
      );

      // Close confirmation modal immediately
      setShowDeactivateModal(false);
      setSelectedCategory(null);

      showToast(
        "Category deactivated successfully",
        "success"
      );

      await loadCategories();
    } catch (error) {
      console.error(
        "Deactivate category error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to deactivate category",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // ACTIVATE
  // ======================================================

  const handleActivate = async (category) => {
    try {
      setSaving(true);

      await activateCategory(category._id);

      showToast(
        "Category activated successfully",
        "success"
      );

      await loadCategories();
    } catch (error) {
      console.error(
        "Activate category error:",
        error
      );

      showToast(
        error.response?.data?.message ||
          "Failed to activate category",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // CLEAR FILTERS
  // ======================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 px-2 pb-4 pt-16 max-[359px]:pt-14 sm:px-5 sm:pb-5 sm:pt-20 lg:px-8 lg:pb-7 lg:pt-24">

      {/* ================================================= */}
      {/* TOAST NOTIFICATION */}
      {/* ================================================= */}

      {toast && (
        <div className="fixed inset-x-3 top-4 z-[200] flex justify-center sm:inset-x-auto sm:right-5 sm:left-auto sm:top-5">

          <div
            role="status"
            aria-live="polite"
            className={`flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:min-w-[340px] ${
              toast.type === "error"
                ? "border-red-200 bg-white/95 text-red-700 shadow-red-100"
                : "border-emerald-200 bg-white/95 text-emerald-700 shadow-emerald-100"
            }`}
          >

            {/* ICON */}

            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <FaExclamationTriangle />
              ) : (
                <FaCheckCircle />
              )}
            </div>

            {/* MESSAGE */}

            <div className="min-w-0 flex-1">

              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                {toast.type === "error"
                  ? "Something went wrong"
                  : "Success"}
              </p>

              <p className="mt-0.5 break-words text-sm font-bold leading-5">
                {toast.message}
              </p>

            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Close notification"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FaTimes />
            </button>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================================= */}

      <div className="mx-auto w-full max-w-[1600px] min-w-0">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="relative mb-5 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/80 p-3 shadow-sm max-[359px]:rounded-xl sm:mb-7 sm:rounded-3xl sm:p-6 lg:p-7">

          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="relative">

            <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* TITLE */}

              <div className="min-w-0">

                <div className="mb-2 flex min-w-0 items-center gap-2 text-xs font-bold text-indigo-600 sm:text-sm">

                  <FaTags className="shrink-0" />

                  <span className="truncate">
                    Category Management
                  </span>

                </div>

                <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Service Categories
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 sm:text-base sm:leading-6">
                  Create and manage service categories
                  used across all salons in your platform.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">

                <button
                  type="button"
                  onClick={loadCategories}
                  disabled={loading}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <FaSyncAlt
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl sm:w-auto"
                >
                  <FaPlus />

                  Add Category
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* STAT CARDS */}
        {/* ================================================= */}

        <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:mb-7 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

          <StatCard
            icon={<FaLayerGroup />}
            title="Total Categories"
            value={totalCategories}
            subtitle="All categories"
          />

          <StatCard
            icon={<FaCheckCircle />}
            title="Active"
            value={activeCategories}
            subtitle="Currently available"
          />

          <StatCard
            icon={<FaPowerOff />}
            title="Inactive"
            value={inactiveCategories}
            subtitle="Currently disabled"
          />

          <StatCard
            icon={<FaChartPie />}
            title="Active Rate"
            value={`${activePercentage}%`}
            subtitle="Platform availability"
          />

        </div>

        {/* ================================================= */}
        {/* FILTER BAR */}
        {/* ================================================= */}

        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm shadow-slate-200/60 max-[359px]:rounded-xl max-[359px]:p-2 sm:mb-7 sm:rounded-3xl sm:p-5">

          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">

            {/* SEARCH */}

            <div className="relative min-w-0">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search category name or description..."
                className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-0 pl-10 pr-4 text-sm font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />

            </div>

            {/* STATUS FILTER */}

            <div className="relative min-w-0">

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="block h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-0 pr-10 text-sm font-bold leading-5 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >

                <option value="ALL">
                  All Categories
                </option>

                <option value="ACTIVE">
                  Active Only
                </option>

                <option value="INACTIVE">
                  Inactive Only
                </option>

              </select>

              <span className="pointer-events-none absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-xs font-bold text-slate-400">
                ▼
              </span>

            </div>

          </div>

          {/* RESULT INFO */}

          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <span>
              Showing{" "}
              <strong className="text-slate-700">
                {filteredCategories.length}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-700">
                {categories.length}
              </strong>{" "}
              categories
            </span>

            {(search ||
              statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 self-start font-bold text-indigo-600 transition hover:text-indigo-700 sm:self-auto"
              >
                <FaTimes />

                Clear filters
              </button>
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:rounded-3xl sm:p-10">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
              <FaSyncAlt className="animate-spin" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Loading categories
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we fetch the latest data.
            </p>

          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY STATE */}
        {/* ================================================= */}

        {!loading &&
          filteredCategories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center shadow-sm sm:rounded-3xl sm:px-5 sm:py-16">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-3xl text-slate-400">
                <FaTags />
              </div>

              <h2 className="text-xl font-black text-slate-900">
                No categories found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search ||
                statusFilter !== "ALL"
                  ? "Try changing your search or filter."
                  : "No categories have been created yet."}
              </p>

              {!search &&
                statusFilter === "ALL" && (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    <FaPlus />

                    Create First Category
                  </button>
                )}

            </div>
          )}

        {/* ================================================= */}
        {/* CATEGORY GRID */}
        {/* ================================================= */}

        {!loading &&
          filteredCategories.length > 0 && (
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {filteredCategories.map(
                (category) => (
                  <CategoryCard
                    key={category._id}
                    category={category}
                    onEdit={openEditModal}
                    onDeactivate={
                      openDeactivateModal
                    }
                    onActivate={
                      handleActivate
                    }
                    disabled={saving}
                  />
                )
              )}

            </div>
          )}

      </div>

      {/* ================================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-2 py-2 backdrop-blur-sm sm:p-5">

          <div className="my-auto flex max-h-[calc(100dvh-16px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/20 max-[359px]:rounded-xl sm:max-h-[calc(100dvh-40px)] sm:rounded-3xl">

            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-3 py-3 sm:px-7 sm:py-5">

              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base text-indigo-600 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-lg">

                  {editingCategory ? (
                    <FaEdit />
                  ) : (
                    <FaPlus />
                  )}

                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 sm:text-xs">
                    {editingCategory
                      ? "Edit Category"
                      : "New Category"}
                  </p>

                  <h2 className="mt-1 truncate text-base font-black text-slate-900 sm:text-xl">
                    {editingCategory
                      ? "Update category"
                      : "Create category"}
                  </h2>

                </div>

              </div>

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-3 sm:space-y-6 sm:p-7"
            >

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Category Name

                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <div className="relative">

                  <FaTags className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Eg: Hair, Skin, Nails, Spa"
                    maxLength={80}
                    autoFocus
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use a short and clear category name.
                </p>

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  maxLength={500}
                  placeholder="Describe the services that belong to this category..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />

                <div className="mt-2 text-right text-xs text-slate-400">
                  {form.description.length}/500
                </div>

              </div>

              {/* INFO */}

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">

                <div className="flex gap-3">

                  <div className="mt-0.5 shrink-0 text-indigo-600">
                    <FaLayerGroup />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-indigo-900">
                      Category availability
                    </p>

                    <p className="mt-1 text-xs leading-5 text-indigo-700">
                      Newly created categories are
                      active by default and can be
                      deactivated later.
                    </p>

                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <>
                      <FaSyncAlt className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingCategory ? (
                        <FaEdit />
                      ) : (
                        <FaPlus />
                      )}

                      {editingCategory
                        ? "Update Category"
                        : "Create Category"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================================================= */}
      {/* DEACTIVATE MODAL */}
      {/* ================================================= */}

      {showDeactivateModal &&
        selectedCategory && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">

            <div className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500">
                <FaExclamationTriangle />
              </div>

              <div className="text-center">

                <h2 className="text-xl font-black text-slate-900">
                  Deactivate Category?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">

                  Are you sure you want to deactivate{" "}

                  <span className="font-bold text-slate-800">
                    {selectedCategory.name}
                  </span>

                  ?

                </p>

                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-700">
                  This category will no longer be
                  available as an active category.
                </p>

              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={closeDeactivateModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <FaSyncAlt className="animate-spin" />
                      Deactivating...
                    </span>
                  ) : (
                    "Deactivate"
                  )}

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

// ======================================================
// STAT CARD
// ======================================================

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
}) => {
  return (
    <div className="group min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex min-w-0 items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="truncate text-xs font-black uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-3xl font-black tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-xs font-medium text-slate-400">
            {subtitle}
          </p>

        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg text-indigo-600 transition group-hover:scale-110">
          {icon}
        </div>

      </div>

    </div>
  );
};

// ======================================================
// CATEGORY CARD
// ======================================================

const CategoryCard = ({
  category,
  onEdit,
  onDeactivate,
  onActivate,
  disabled,
}) => {
  const isActive = category.isActive === true;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/60">

      {/* TOP ACCENT */}

      <div
        className={`h-1.5 ${
          isActive
            ? "bg-indigo-600"
            : "bg-slate-300"
        }`}
      />

      <div className="min-w-0 p-4 sm:p-6">

        {/* HEADER */}

        <div className="flex min-w-0 flex-col gap-3 min-[360px]:flex-row min-[360px]:items-start min-[360px]:justify-between">

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <FaTags />
            </div>

            <div className="min-w-0">

              <h3 className="truncate text-lg font-black text-slate-900">
                {category.name}
              </h3>

              <p className="mt-0.5 text-xs font-medium text-slate-400">
                Service Category
              </p>

            </div>

          </div>

          {/* STATUS */}

          <span
            className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-black ${
              isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >

            {isActive ? (
              <FaCheckCircle />
            ) : (
              <FaPowerOff />
            )}

            {isActive
              ? "ACTIVE"
              : "INACTIVE"}

          </span>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-4 min-h-[72px] sm:mt-5">

          <p className="line-clamp-3 break-words text-sm leading-6 text-slate-500">
            {category.description ||
              "No description available for this category."}
          </p>

        </div>

        {/* ACTIONS */}

        <div className="mt-5 grid grid-cols-1 gap-2 min-[360px]:grid-cols-[1fr_auto]">

          <button
            type="button"
            onClick={() => onEdit(category)}
            disabled={disabled}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaEdit />

            Edit
          </button>

          {isActive ? (
            <button
              type="button"
              onClick={() =>
                onDeactivate(category)
              }
              disabled={disabled}
              title="Deactivate category"
              aria-label="Deactivate category"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 min-[360px]:w-11"
            >
              <FaTrash />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onActivate(category)
              }
              disabled={disabled}
              title="Activate category"
              aria-label="Activate category"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 min-[360px]:w-11"
            >
              <FaCheckCircle />
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default CategoriesManagement;