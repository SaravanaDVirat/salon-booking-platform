import { useEffect, useMemo, useState } from "react";

import {
  getSalonOwners,
  createSalonOwner,
  updateSalonOwner,
  deleteSalonOwner,
  activateSalonOwner,
  deactivateSalonOwner,
} from "../../services/salonOwnerService";

const SalonOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);

  const fetchSalonOwners = async () => {
    try {
      setLoading(true);

      const data = await getSalonOwners();

      setOwners(data.users || []);
    } catch (error) {
      console.error("Failed to fetch salon owners:", error);

      alert(
        error.response?.data?.message ||
          "Failed to fetch salon owners"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalonOwners();
  }, []);

  const filteredOwners = useMemo(() => {
    return owners.filter((owner) => {
      const searchText = search.toLowerCase().trim();

      const salonNames =
        owner.salons
          ?.map((salon) => salon?.name)
          .filter(Boolean)
          .join(" ") || "";

      const matchesSearch =
        owner.name?.toLowerCase().includes(searchText) ||
        owner.email?.toLowerCase().includes(searchText) ||
        owner.phone?.toLowerCase().includes(searchText) ||
        salonNames.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && owner.isActive) ||
        (statusFilter === "INACTIVE" && !owner.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [owners, search, statusFilter]);

  const totalOwners = owners.length;

  const activeOwners = owners.filter(
    (owner) => owner.isActive
  ).length;

  const inactiveOwners = owners.filter(
    (owner) => !owner.isActive
  ).length;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingOwner(null);

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

    setShowModal(true);
  };

  const openEditModal = (owner) => {
    setEditingOwner(owner);

    setFormData({
      name: owner.name || "",
      email: owner.email || "",
      phone: owner.phone || "",
      password: "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingOwner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingOwner) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await updateSalonOwner(
          editingOwner._id,
          updateData
        );
      } else {
        await createSalonOwner({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      }

      setShowModal(false);

      await fetchSalonOwners();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Operation failed"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (owner) => {
    try {
      if (owner.isActive) {
        await deactivateSalonOwner(owner._id);
      } else {
        await activateSalonOwner(owner._id);
      }

      await fetchSalonOwners();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  };

  const handleDelete = async (owner) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${owner.name}?`
    );

    if (!confirmed) return;

    try {
      await deleteSalonOwner(owner._id);

      setOwners((prev) =>
        prev.filter(
          (item) => item._id !== owner._id
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete salon owner"
      );
    }
  };

  return (
    <div
      className="
        min-h-screen w-full overflow-x-hidden
        bg-[radial-gradient(circle_at_10%_0%,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_90%_5%,rgba(217,70,239,0.09),transparent_25%),#f6f7fb]
        px-3 py-4 text-slate-900
        sm:px-5 sm:py-6
        md:px-6
        lg:px-7 lg:py-7
        xl:px-8
        2xl:px-10
      "
    >
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        className="
          relative mb-5 overflow-hidden
          rounded-[26px]
          border border-white/80
          bg-white/90
          shadow-[0_20px_60px_rgba(30,35,60,0.07)]
          backdrop-blur-xl
          sm:mb-6
          lg:mb-7
        "
      >
        {/* Decorative background */}

        <div
          className="
            pointer-events-none absolute
            -right-16 -top-20
            h-56 w-56 rounded-full
            bg-violet-200/30 blur-3xl
          "
        />

        <div
          className="
            pointer-events-none absolute
            -bottom-24 left-1/3
            h-48 w-48 rounded-full
            bg-fuchsia-200/20 blur-3xl
          "
        />

        <div
          className="
            relative flex flex-col gap-5
            p-5
            sm:p-6
            md:flex-row md:items-center md:justify-between
            lg:p-7
          "
        >
          {/* Heading */}

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center
                  rounded-[16px]
                  bg-gradient-to-br
                  from-violet-500 via-purple-600 to-fuchsia-600
                  text-white
                  shadow-lg shadow-violet-500/25
                  sm:h-14 sm:w-14
                "
              >
                <i className="bi bi-shop fs-5"></i>
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    m-0 break-words
                    text-[22px] font-black
                    leading-tight tracking-[-0.055em]
                    text-slate-950
                    sm:text-2xl
                    md:text-[27px]
                    lg:text-3xl
                  "
                >
                  Salon Owners
                </h1>

                <p
                  className="
                    mt-1.5
                    break-words
                    text-[11px] font-medium
                    leading-5 text-slate-500
                    sm:text-xs
                    lg:text-sm
                  "
                >
                  Manage salon owners and their account access
                </p>
              </div>
            </div>
          </div>

          {/* Add button */}

          <button
            type="button"
            onClick={openCreateModal}
            className="
              relative inline-flex
              min-h-11 w-full shrink-0
              items-center justify-center gap-2
              rounded-[15px]
              border-0
              bg-gradient-to-r
              from-slate-950 via-slate-900 to-violet-950
              px-5 py-3
              text-xs font-extrabold
              text-white
              shadow-[0_14px_30px_rgba(15,23,42,0.20)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_38px_rgba(91,33,182,0.25)]
              active:translate-y-0
              sm:w-auto
              sm:px-6
            "
          >
            <i className="bi bi-plus-lg"></i>

            <span>Add Salon Owner</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div
        className="
          mb-5 grid grid-cols-1 gap-3
          sm:grid-cols-2
          xl:grid-cols-3
          sm:gap-4
          lg:mb-6
        "
      >
        {/* Total */}

        <div
          className="
            group relative overflow-hidden
            rounded-[22px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-[0_22px_45px_rgba(91,33,182,0.12)]
            sm:p-5
          "
        >
          <div
            className="
              absolute -right-8 -top-8
              h-24 w-24 rounded-full
              bg-violet-100/70 blur-2xl
            "
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className="
                  mb-2
                  text-[9px] font-black
                  uppercase tracking-[0.16em]
                  text-slate-400
                  sm:text-[10px]
                "
              >
                Total Owners
              </p>

              <h3
                className="
                  m-0
                  text-[28px] font-black
                  leading-none tracking-[-0.06em]
                  text-slate-950
                  sm:text-3xl
                "
              >
                {totalOwners}
              </h3>

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Registered accounts
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-[15px]
                bg-gradient-to-br
                from-slate-800 to-violet-900
                text-white
                shadow-lg shadow-violet-500/20
                sm:h-12 sm:w-12
              "
            >
              <i className="bi bi-people-fill fs-5"></i>
            </div>
          </div>
        </div>

        {/* Active */}

        <div
          className="
            group relative overflow-hidden
            rounded-[22px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-[0_22px_45px_rgba(16,185,129,0.12)]
            sm:p-5
          "
        >
          <div
            className="
              absolute -right-8 -top-8
              h-24 w-24 rounded-full
              bg-emerald-100/70 blur-2xl
            "
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className="
                  mb-2 text-[9px] font-black
                  uppercase tracking-[0.16em]
                  text-slate-400 sm:text-[10px]
                "
              >
                Active
              </p>

              <h3
                className="
                  m-0 text-[28px] font-black
                  leading-none tracking-[-0.06em]
                  text-emerald-600 sm:text-3xl
                "
              >
                {activeOwners}
              </h3>

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Active accounts
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-[15px]
                bg-gradient-to-br
                from-emerald-400 to-teal-600
                text-white
                shadow-lg shadow-emerald-500/20
                sm:h-12 sm:w-12
              "
            >
              <i className="bi bi-check-circle-fill fs-5"></i>
            </div>
          </div>
        </div>

        {/* Inactive */}

        <div
          className="
            group relative overflow-hidden
            rounded-[22px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-[0_22px_45px_rgba(244,63,94,0.12)]
            sm:p-5
          "
        >
          <div
            className="
              absolute -right-8 -top-8
              h-24 w-24 rounded-full
              bg-rose-100/70 blur-2xl
            "
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p
                className="
                  mb-2 text-[9px] font-black
                  uppercase tracking-[0.16em]
                  text-slate-400 sm:text-[10px]
                "
              >
                Inactive
              </p>

              <h3
                className="
                  m-0 text-[28px] font-black
                  leading-none tracking-[-0.06em]
                  text-rose-600 sm:text-3xl
                "
              >
                {inactiveOwners}
              </h3>

              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Disabled accounts
              </p>
            </div>

            <div
              className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-[15px]
                bg-gradient-to-br
                from-rose-400 to-red-600
                text-white
                shadow-lg shadow-rose-500/20
                sm:h-12 sm:w-12
              "
            >
              <i className="bi bi-slash-circle-fill fs-5"></i>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH / FILTER
      ====================================================== */}

      <div
        className="
          mb-5 rounded-[22px]
          border border-white/90
          bg-white/90
          p-3
          shadow-[0_14px_35px_rgba(30,35,60,0.06)]
          backdrop-blur-xl
          sm:p-4
          lg:mb-6
        "
      >
        <div
          className="
            grid grid-cols-1 gap-3
            lg:grid-cols-[minmax(0,1fr)_220px]
          "
        >
          {/* Search */}

          <div className="relative min-w-0">
            <i
              className="
                bi bi-search
                pointer-events-none
                absolute left-4 top-1/2
                -translate-y-1/2
                text-sm text-slate-400
              "
            ></i>

            <input
              type="text"
              className="
                h-12 w-full
                rounded-[15px]
                border border-slate-200
                bg-slate-50/80
                pl-11 pr-4
                text-xs font-medium
                text-slate-800
                outline-none
                transition-all duration-200
                placeholder:text-slate-400
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10
              "
              placeholder="Search by name, email, phone or salon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}

          <div className="relative min-w-0">
            <i
              className="
                bi bi-funnel
                pointer-events-none
                absolute left-4 top-1/2
                z-10 -translate-y-1/2
                text-sm text-slate-400
              "
            ></i>

            <select
              className="
                h-12 w-full
                appearance-none
                rounded-[15px]
                border border-slate-200
                bg-slate-50/80
                pl-11 pr-10
                text-xs font-bold
                text-slate-700
                outline-none
                transition-all duration-200
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/10
              "
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <i
              className="
                bi bi-chevron-down
                pointer-events-none
                absolute right-4 top-1/2
                -translate-y-1/2
                text-[10px] text-slate-400
              "
            ></i>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          overflow-hidden
          rounded-[24px]
          border border-white/90
          bg-white/95
          shadow-[0_20px_55px_rgba(30,35,60,0.07)]
          backdrop-blur-xl
        "
      >
        {/* Section Header */}

        <div
          className="
            flex flex-col gap-4
            border-b border-slate-100
            px-4 py-4
            sm:flex-row sm:items-center
            sm:justify-between
            sm:px-5 sm:py-5
            lg:px-6
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-[10px]
                  bg-violet-50
                  text-violet-600
                "
              >
                <i className="bi bi-shop-window"></i>
              </div>

              <h2
                className="
                  m-0 break-words
                  text-base font-black
                  tracking-[-0.04em]
                  text-slate-950
                  sm:text-lg
                "
              >
                Salon Owner Accounts
              </h2>
            </div>

            <p className="mt-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">
              Showing {filteredOwners.length} of {totalOwners} owners
            </p>
          </div>

          <button
            type="button"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              self-end
              rounded-[12px]
              border border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              transition-all duration-200
              hover:border-violet-300
              hover:bg-violet-50
              hover:text-violet-600
              sm:self-auto
            "
            onClick={fetchSalonOwners}
            title="Refresh"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>

        {/* ===================================================
            LOADING
        ==================================================== */}

        {loading ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-10">
            <div
              className="
                flex h-16 w-16
                items-center justify-center
                rounded-[20px]
                bg-violet-50
                text-violet-600
              "
            >
              <span
                className="
                  h-7 w-7
                  animate-spin
                  rounded-full
                  border-[3px]
                  border-violet-200
                  border-t-violet-600
                "
              ></span>
            </div>

            <p className="mt-4 text-sm font-bold text-slate-700">
              Loading salon owners...
            </p>

            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Please wait while we fetch the accounts
            </p>
          </div>
        ) : filteredOwners.length === 0 ? (
          /* =================================================
             EMPTY STATE
          ================================================== */

          <div className="flex min-h-[340px] items-center justify-center px-5 py-10">
            <div className="w-full max-w-md text-center">
              <div
                className="
                  mx-auto flex h-20 w-20
                  items-center justify-center
                  rounded-[24px]
                  bg-gradient-to-br
                  from-violet-50 to-fuchsia-50
                  text-violet-500
                  shadow-inner
                "
              >
                <i className="bi bi-shop-window text-3xl"></i>
              </div>

              <h3
                className="
                  mt-5
                  text-lg font-black
                  tracking-[-0.04em]
                  text-slate-800
                "
              >
                No salon owners found
              </h3>

              <p
                className="
                  mx-auto mt-2
                  max-w-sm
                  text-xs font-medium
                  leading-5 text-slate-400
                "
              >
                Try changing your search or status filter,
                or add a new salon owner account.
              </p>

              {!search && statusFilter === "ALL" && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="
                    mt-5
                    inline-flex min-h-10
                    items-center justify-center gap-2
                    rounded-xl
                    bg-slate-950
                    px-5
                    text-xs font-bold
                    text-white
                    transition
                    hover:bg-violet-900
                  "
                >
                  <i className="bi bi-plus-lg"></i>
                  Add Salon Owner
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden xl:block">
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Owner
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Salon
                      </th>

                      <th className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOwners.map((owner) => (
                      <tr
                        key={owner._id}
                        className="
                          group
                          border-b border-slate-100/80
                          transition-colors
                          hover:bg-violet-50/30
                        "
                      >
                        {/* Owner */}

                        <td className="max-w-[260px] px-6 py-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className="
                                flex h-11 w-11 shrink-0
                                items-center justify-center
                                rounded-[14px]
                                bg-gradient-to-br
                                from-slate-800 to-violet-900
                                text-sm font-black
                                text-white
                                shadow-md
                                transition-transform
                                group-hover:scale-105
                              "
                            >
                              {owner.name
                                ?.charAt(0)
                                ?.toUpperCase() || "S"}
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  m-0 break-words
                                  text-sm font-black
                                  leading-5 text-slate-800
                                "
                              >
                                {owner.name || "Unnamed"}
                              </p>

                              <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                Salon Owner
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="max-w-[260px] px-5 py-5">
                          <div className="flex min-w-0 flex-col gap-1.5">
                            <div className="flex min-w-0 items-start gap-2">
                              <i className="bi bi-envelope mt-0.5 shrink-0 text-xs text-slate-400"></i>

                              <span
                                className="
                                  min-w-0
                                  break-words
                                  [overflow-wrap:anywhere]
                                  text-xs font-semibold
                                  leading-5 text-slate-600
                                "
                              >
                                {owner.email || "No email"}
                              </span>
                            </div>

                            {owner.phone && (
                              <div className="flex min-w-0 items-start gap-2">
                                <i className="bi bi-telephone mt-0.5 shrink-0 text-xs text-slate-400"></i>

                                <span className="break-words text-xs font-semibold leading-5 text-slate-600">
                                  {owner.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Salon */}

                        <td className="max-w-[280px] px-5 py-5">
                          {owner.salons?.length > 0 ? (
                            <div className="flex min-w-0 flex-col gap-2">
                              {owner.salons.map((salon) => (
                                <div
                                  key={salon._id}
                                  className="flex min-w-0 items-start gap-2"
                                >
                                  <i className="bi bi-shop mt-0.5 shrink-0 text-xs text-violet-500"></i>

                                  <span
                                    className="
                                      min-w-0 break-words
                                      text-xs font-bold
                                      leading-5 text-slate-700
                                    "
                                  >
                                    {salon.name || "Unnamed Salon"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              Not assigned
                            </span>
                          )}
                        </td>

                        {/* Status */}

                        <td className="px-5 py-5">
                          {owner.isActive ? (
                            <span
                              className="
                                inline-flex items-center gap-1.5
                                rounded-full
                                border border-emerald-200
                                bg-emerald-50
                                px-3 py-1.5
                                text-[9px] font-black
                                text-emerald-700
                              "
                            >
                              <i className="bi bi-check-circle"></i>
                              Active
                            </span>
                          ) : (
                            <span
                              className="
                                inline-flex items-center gap-1.5
                                rounded-full
                                border border-rose-200
                                bg-rose-50
                                px-3 py-1.5
                                text-[9px] font-black
                                text-rose-600
                              "
                            >
                              <i className="bi bi-x-circle"></i>
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEditModal(owner)
                              }
                              className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-[11px]
                                border border-slate-200
                                bg-white
                                text-slate-500
                                shadow-sm
                                transition
                                hover:border-violet-300
                                hover:bg-violet-50
                                hover:text-violet-600
                              "
                            >
                              <i className="bi bi-pencil text-xs"></i>
                            </button>

                            <button
                              type="button"
                              title={
                                owner.isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() =>
                                handleToggleStatus(owner)
                              }
                              className={`
                                flex h-9 w-9
                                items-center justify-center
                                rounded-[11px]
                                border
                                shadow-sm
                                transition
                                ${
                                  owner.isActive
                                    ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                    : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                }
                              `}
                            >
                              <i
                                className={`bi ${
                                  owner.isActive
                                    ? "bi-pause-circle"
                                    : "bi-play-circle"
                                } text-xs`}
                              ></i>
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                handleDelete(owner)
                              }
                              className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-[11px]
                                border border-rose-200
                                bg-rose-50
                                text-rose-600
                                shadow-sm
                                transition
                                hover:bg-rose-100
                              "
                            >
                              <i className="bi bi-trash3 text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          {/* =================================================
    TABLET + MOBILE PREMIUM RESPONSIVE CARDS
================================================== */}

<div
  className="
    grid grid-cols-1
    gap-3
    bg-slate-50/50
    p-2.5
    sm:grid-cols-2
    sm:gap-4
    sm:p-4
    xl:hidden
    lg:gap-5
    lg:p-5
  "
>
  {filteredOwners.map((owner) => (
    <article
      key={owner._id}
      className="
        group relative flex min-w-0 w-full max-w-full
        flex-col overflow-hidden
        rounded-[20px]
        border border-slate-200/80
        bg-white
        shadow-[0_10px_30px_rgba(30,35,60,0.055)]
        transition-all duration-300
        hover:-translate-y-1
        hover:border-violet-200
        hover:shadow-[0_20px_45px_rgba(91,33,182,0.11)]
      "
    >
      {/* Decorative Glow */}

      <div
        className="
          pointer-events-none
          absolute -right-12 -top-12
          h-32 w-32
          rounded-full
          bg-violet-100/70
          blur-3xl
        "
      />

      {/* =================================================
          CARD HEADER
      ================================================== */}

      <div
        className="
          relative
          min-w-0
          border-b border-slate-100
          p-3.5
          min-[400px]:p-4
          sm:p-5
        "
      >
        {/* 
          IMPORTANT:
          On very small devices status gets its own row.
          This prevents owner name + status collision.
        */}

        <div
          className="
            flex min-w-0 w-full
            flex-col
            gap-3
            min-[430px]:flex-row
            min-[430px]:items-start
            min-[430px]:justify-between
          "
        >
          {/* Owner Identity */}

          <div
            className="
              flex min-w-0
              w-full
              items-center
              gap-3
              min-[430px]:w-auto
              min-[430px]:flex-1
            "
          >
            {/* Avatar */}

            <div
              className="
                flex h-11 w-11
                min-h-11 min-w-11
                shrink-0
                items-center justify-center
                rounded-[14px]
                bg-gradient-to-br
                from-slate-800
                via-slate-900
                to-violet-900
                text-sm
                font-black
                text-white
                shadow-lg
                shadow-violet-500/15
                ring-4
                ring-slate-50
                transition-transform
                duration-300
                group-hover:scale-105
                min-[400px]:h-12
                min-[400px]:w-12
                min-[400px]:min-h-12
                min-[400px]:min-w-12
              "
            >
              {owner.name
                ?.charAt(0)
                ?.toUpperCase() || "S"}
            </div>

            {/* Owner Name */}

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <h3
                className="
                  m-0
                  max-w-full
                  whitespace-normal
                  break-normal
                  text-[13px]
                  font-black
                  leading-[1.35]
                  text-slate-900
                  min-[400px]:text-sm
                  sm:text-base
                "
              >
                {owner.name || "Unnamed"}
              </h3>

              <p
                className="
                  mt-1
                  m-0
                  whitespace-normal
                  text-[8px]
                  font-bold
                  uppercase
                  leading-4
                  tracking-[0.12em]
                  text-slate-400
                  min-[400px]:text-[9px]
                "
              >
                Salon Owner
              </p>
            </div>
          </div>

          {/* Status */}

          <div
            className="
              flex
              w-full
              shrink-0
              min-[430px]:w-auto
            "
          >
            {owner.isActive ? (
              <span
                className="
                  inline-flex
                  min-h-[30px]
                  w-fit
                  max-w-full
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-2.5
                  py-1.5
                  text-[8px]
                  font-black
                  leading-none
                  text-emerald-700
                  min-[430px]:px-3
                  sm:text-[9px]
                "
              >
                <i className="bi bi-check-circle shrink-0"></i>
                <span className="whitespace-nowrap">
                  Active
                </span>
              </span>
            ) : (
              <span
                className="
                  inline-flex
                  min-h-[30px]
                  w-fit
                  max-w-full
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-rose-200
                  bg-rose-50
                  px-2.5
                  py-1.5
                  text-[8px]
                  font-black
                  leading-none
                  text-rose-600
                  min-[430px]:px-3
                  sm:text-[9px]
                "
              >
                <i className="bi bi-x-circle shrink-0"></i>
                <span className="whitespace-nowrap">
                  Inactive
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          CARD BODY
      ================================================== */}

      <div
        className="
          relative
          flex min-w-0
          flex-1
          flex-col
          p-3.5
          min-[400px]:p-4
          sm:p-5
        "
      >
        {/* =================================================
            EMAIL
        ================================================== */}

        <div
          className="
            flex min-w-0
            w-full
            items-start
            gap-2.5
            rounded-[15px]
            border border-slate-100
            bg-slate-50/70
            p-2.5
            min-[400px]:gap-3
            min-[400px]:p-3
          "
        >
          {/* Email Icon */}

          <div
            className="
              flex
              h-8 w-8
              min-h-8 min-w-8
              shrink-0
              items-center justify-center
              rounded-[10px]
              bg-white
              text-violet-500
              shadow-sm
            "
          >
            <i className="bi bi-envelope text-xs"></i>
          </div>

          {/* Email Content */}

          <div
            className="
              min-w-0
              flex-1
              overflow-hidden
            "
          >
            <p
              className="
                m-0
                whitespace-normal
                text-[8px]
                font-black
                uppercase
                leading-4
                tracking-[0.13em]
                text-slate-400
              "
            >
              Email Address
            </p>

            <p
              className="
                mt-1
                m-0
                max-w-full
                whitespace-normal
                break-normal
                [overflow-wrap:break-word]
                text-[10px]
                font-bold
                leading-[1.45]
                text-slate-700
                min-[400px]:text-[11px]
              "
            >
              {owner.email || "No email address"}
            </p>
          </div>
        </div>

        {/* =================================================
            PHONE
        ================================================== */}

        <div
          className="
            mt-2
            flex min-w-0
            w-full
            items-start
            gap-2.5
            rounded-[15px]
            border border-slate-100
            bg-white
            p-2.5
            min-[400px]:gap-3
            min-[400px]:p-3
          "
        >
          {/* Phone Icon */}

          <div
            className="
              flex
              h-8 w-8
              min-h-8 min-w-8
              shrink-0
              items-center justify-center
              rounded-[10px]
              bg-slate-50
              text-slate-500
            "
          >
            <i className="bi bi-telephone text-xs"></i>
          </div>

          {/* Phone Content */}

          <div
            className="
              min-w-0
              flex-1
              overflow-hidden
            "
          >
            <p
              className="
                m-0
                whitespace-normal
                text-[8px]
                font-black
                uppercase
                leading-4
                tracking-[0.13em]
                text-slate-400
              "
            >
              Phone Number
            </p>

            <p
              className="
                mt-1
                m-0
                max-w-full
                whitespace-normal
                break-normal
                [overflow-wrap:break-word]
                text-[10px]
                font-bold
                leading-[1.45]
                text-slate-700
                min-[400px]:text-[11px]
              "
            >
              {owner.phone || "No phone number"}
            </p>
          </div>
        </div>

        {/* =================================================
            ASSIGNED SALONS
        ================================================== */}

        <div
          className="
            mt-3
            min-w-0
            w-full
            rounded-[17px]
            border border-violet-100
            bg-gradient-to-br
            from-violet-50/80
            via-white
            to-fuchsia-50/50
            p-3
            min-[400px]:p-3.5
            sm:p-4
          "
        >
          {/* Salon Heading */}

          <div
            className="
              mb-3
              flex min-w-0
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-8 w-8
                min-h-8 min-w-8
                shrink-0
                items-center justify-center
                rounded-[10px]
                bg-white
                text-violet-600
                shadow-sm
              "
            >
              <i className="bi bi-shop text-xs"></i>
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  m-0
                  whitespace-normal
                  text-[8px]
                  font-black
                  uppercase
                  leading-4
                  tracking-[0.13em]
                  text-slate-400
                "
              >
                Assigned Salons
              </p>

              <p
                className="
                  mt-0.5
                  m-0
                  whitespace-normal
                  text-[10px]
                  font-bold
                  leading-4
                  text-slate-600
                "
              >
                {owner.salons?.length || 0} salon
                {owner.salons?.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </div>

          {/* Salon List */}

          {owner.salons?.length > 0 ? (
            <div
              className="
                flex
                min-w-0
                w-full
                flex-col
                gap-2
              "
            >
              {owner.salons.map((salon) => (
                <div
                  key={salon._id}
                  className="
                    flex min-w-0
                    w-full
                    items-start
                    gap-2
                    rounded-xl
                    border border-white
                    bg-white/80
                    px-2.5
                    py-2
                    min-[400px]:px-3
                  "
                >
                  <i
                    className="
                      bi bi-shop
                      mt-0.5
                      shrink-0
                      text-[11px]
                      text-violet-500
                    "
                  ></i>

                  <span
                    className="
                      min-w-0
                      flex-1
                      whitespace-normal
                      break-normal
                      [overflow-wrap:break-word]
                      text-[10px]
                      font-bold
                      leading-[1.5]
                      text-slate-700
                      min-[400px]:text-[11px]
                    "
                  >
                    {salon.name || "Unnamed Salon"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="
                rounded-xl
                border border-dashed
                border-slate-200
                bg-white/70
                px-3
                py-3
                text-center
              "
            >
              <p
                className="
                  m-0
                  whitespace-normal
                  text-[10px]
                  font-semibold
                  leading-4
                  text-slate-400
                "
              >
                No salon assigned
              </p>
            </div>
          )}
        </div>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-1
            gap-2
            border-t
            border-slate-100
            pt-4
            min-[380px]:grid-cols-[minmax(0,1fr)_auto_auto]
            min-[430px]:gap-2.5
          "
        >
          {/* Edit */}

          <button
            type="button"
            onClick={() =>
              openEditModal(owner)
            }
            className="
              inline-flex
              min-h-10
              min-w-0
              w-full
              items-center
              justify-center
              gap-2
              rounded-[12px]
              border border-slate-200
              bg-white
              px-3
              text-[10px]
              font-black
              leading-none
              text-slate-700
              shadow-sm
              transition
              hover:border-violet-300
              hover:bg-violet-50
              hover:text-violet-600
              active:scale-[0.98]
            "
          >
            <i className="bi bi-pencil shrink-0"></i>

            <span className="whitespace-nowrap">
              Edit
            </span>
          </button>

          {/* Activate / Deactivate */}

          <button
            type="button"
            title={
              owner.isActive
                ? "Deactivate"
                : "Activate"
            }
            onClick={() =>
              handleToggleStatus(owner)
            }
            className={`
              inline-flex
              min-h-10
              min-w-0
              w-full
              items-center
              justify-center
              gap-2
              rounded-[12px]
              border
              px-3
              text-[10px]
              font-black
              leading-none
              shadow-sm
              transition
              active:scale-[0.98]
              min-[380px]:w-10
              min-[380px]:px-0
              ${
                owner.isActive
                  ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                  : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }
            `}
          >
            <i
              className={`bi ${
                owner.isActive
                  ? "bi-pause-circle"
                  : "bi-play-circle"
              } shrink-0`}
            ></i>

            <span className="whitespace-nowrap min-[380px]:hidden">
              {owner.isActive
                ? "Pause"
                : "Activate"}
            </span>
          </button>

          {/* Delete */}

          <button
            type="button"
            title="Delete"
            onClick={() =>
              handleDelete(owner)
            }
            className="
              inline-flex
              min-h-10
              min-w-0
              w-full
              items-center
              justify-center
              gap-2
              rounded-[12px]
              border border-rose-200
              bg-rose-50
              px-3
              text-rose-600
              transition
              hover:bg-rose-100
              active:scale-[0.98]
              min-[380px]:w-10
              min-[380px]:px-0
            "
          >
            <i className="bi bi-trash3 shrink-0 text-xs"></i>

            <span className="whitespace-nowrap text-[10px] font-black min-[380px]:hidden">
              Delete
            </span>
          </button>
        </div>
      </div>
    </article>
  ))}
</div>
          </>
        )}
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showModal && (
        <div
          className="
            fixed inset-0 z-[2000]
            flex items-start justify-center
            overflow-y-auto
            bg-slate-950/65
            p-3
            backdrop-blur-md
            sm:items-center
            sm:p-5
          "
        >
          <div
            className="
              my-2 flex w-full
              max-w-xl
              sm:my-5
            "
          >
            <div
              className="
                flex max-h-[calc(100vh-24px)]
                w-full flex-col
                overflow-hidden
                rounded-[24px]
                border border-white/80
                bg-white
                shadow-[0_30px_100px_rgba(15,23,42,0.30)]
                sm:max-h-[calc(100vh-40px)]
                sm:rounded-[28px]
              "
            >
              {/* Modal Header */}

              <div
                className="
                  relative
                  flex shrink-0
                  items-start justify-between
                  gap-4
                  overflow-hidden
                  border-b border-slate-100
                  bg-gradient-to-br
                  from-white via-white to-violet-50/40
                  px-5 py-5
                  sm:px-7 sm:py-6
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute -right-8 -top-12
                    h-32 w-32 rounded-full
                    bg-violet-100/70 blur-3xl
                  "
                />

                <div className="relative flex min-w-0 items-center gap-3">
                  <div
                    className="
                      flex h-11 w-11 shrink-0
                      items-center justify-center
                      rounded-[14px]
                      bg-gradient-to-br
                      from-violet-500 to-fuchsia-600
                      text-white
                      shadow-lg shadow-violet-500/20
                    "
                  >
                    <i
                      className={
                        editingOwner
                          ? "bi bi-pencil-square"
                          : "bi bi-person-plus"
                      }
                    ></i>
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="
                        m-0 break-words
                        text-lg font-black
                        leading-6 tracking-[-0.04em]
                        text-slate-950
                        sm:text-xl
                      "
                    >
                      {editingOwner
                        ? "Edit Salon Owner"
                        : "Add Salon Owner"}
                    </h2>

                    <p className="mt-1 break-words text-[10px] font-medium leading-5 text-slate-400 sm:text-xs">
                      {editingOwner
                        ? "Update owner account details"
                        : "Create a new salon owner account"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="
                    relative flex h-9 w-9
                    shrink-0
                    items-center justify-center
                    rounded-[11px]
                    border border-slate-200
                    bg-white
                    text-slate-500
                    shadow-sm
                    transition
                    hover:border-rose-200
                    hover:bg-rose-50
                    hover:text-rose-600
                  "
                  onClick={closeModal}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg text-xs"></i>
                </button>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  className="
                    min-h-0 flex-1
                    overflow-y-auto
                    px-5 py-5
                    sm:px-7 sm:py-6
                  "
                >
                  <div className="space-y-4">
                    {/* Full Name */}

                    <div>
                      <label
                        className="
                          mb-1.5 block
                          text-[10px] font-black
                          uppercase tracking-[0.08em]
                          text-slate-600
                        "
                      >
                        Full Name
                      </label>

                      <div className="relative">
                        <span
                          className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        >
                          <i className="bi bi-person text-sm"></i>
                        </span>

                        <input
                          type="text"
                          name="name"
                          className="
                            h-12 w-full
                            rounded-[14px]
                            border border-slate-200
                            bg-slate-50/80
                            pl-10 pr-3
                            text-xs font-semibold
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}

                    <div>
                      <label
                        className="
                          mb-1.5 block
                          text-[10px] font-black
                          uppercase tracking-[0.08em]
                          text-slate-600
                        "
                      >
                        Email Address
                      </label>

                      <div className="relative">
                        <span
                          className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        >
                          <i className="bi bi-envelope text-sm"></i>
                        </span>

                        <input
                          type="email"
                          name="email"
                          className="
                            h-12 w-full
                            rounded-[14px]
                            border border-slate-200
                            bg-slate-50/80
                            pl-10 pr-3
                            text-xs font-semibold
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                          placeholder="owner@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone */}

                    <div>
                      <label
                        className="
                          mb-1.5 block
                          text-[10px] font-black
                          uppercase tracking-[0.08em]
                          text-slate-600
                        "
                      >
                        Phone Number
                      </label>

                      <div className="relative">
                        <span
                          className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        >
                          <i className="bi bi-telephone text-sm"></i>
                        </span>

                        <input
                          type="text"
                          name="phone"
                          className="
                            h-12 w-full
                            rounded-[14px]
                            border border-slate-200
                            bg-slate-50/80
                            pl-10 pr-3
                            text-xs font-semibold
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Password */}

                    <div>
                      <label
                        className="
                          mb-1.5 block
                          text-[10px] font-black
                          uppercase tracking-[0.08em]
                          text-slate-600
                        "
                      >
                        Password
                      </label>

                      <div className="relative">
                        <span
                          className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                          "
                        >
                          <i className="bi bi-lock text-sm"></i>
                        </span>

                        <input
                          type="password"
                          name="password"
                          className="
                            h-12 w-full
                            rounded-[14px]
                            border border-slate-200
                            bg-slate-50/80
                            pl-10 pr-3
                            text-xs font-semibold
                            text-slate-800
                            outline-none
                            transition
                            placeholder:text-slate-400
                            focus:border-violet-400
                            focus:bg-white
                            focus:ring-4
                            focus:ring-violet-500/10
                          "
                          placeholder={
                            editingOwner
                              ? "Leave empty to keep current password"
                              : "Enter password"
                          }
                          value={formData.password}
                          onChange={handleChange}
                          required={!editingOwner}
                        />
                      </div>

                      {editingOwner && (
                        <p className="mt-1.5 text-[9px] font-medium text-slate-400">
                          Leave this field empty if you don't want
                          to change the current password.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}

                <div
                  className="
                    flex shrink-0
                    flex-col-reverse gap-2
                    border-t border-slate-100
                    bg-slate-50/60
                    px-5 py-4
                    sm:flex-row
                    sm:justify-end
                    sm:px-7 sm:py-5
                  "
                >
                  <button
                    type="button"
                    className="
                      min-h-11 w-full
                      rounded-[13px]
                      border border-slate-200
                      bg-white
                      px-5
                      text-xs font-bold
                      text-slate-600
                      transition
                      hover:bg-slate-50
                      sm:w-auto
                    "
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="
                      inline-flex min-h-11
                      w-full
                      items-center justify-center
                      rounded-[13px]
                      border-0
                      bg-gradient-to-r
                      from-slate-950 to-violet-950
                      px-5
                      text-xs font-extrabold
                      text-white
                      shadow-lg
                      shadow-violet-900/10
                      transition-all
                      hover:-translate-y-0.5
                      hover:shadow-violet-900/20
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      sm:w-auto
                    "
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span
                          className="
                            mr-2 h-4 w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                        ></span>

                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2 me-2"></i>

                        {editingOwner
                          ? "Update Owner"
                          : "Create Owner"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonOwners;