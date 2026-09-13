import { useEffect, useMemo, useState } from "react";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  activateCustomer,
  deactivateCustomer,
} from "../../services/customerService";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();

      setCustomers(data.users || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(keyword)
        )
    );
  }, [customers, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      password: "",
      phone: customer.phone || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setFormData(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required");
        return;
      }

      if (!editingCustomer && !formData.password) {
        setError("Password is required");
        return;
      }

      if (
        !editingCustomer &&
        formData.password.length < 8
      ) {
        setError(
          "Password must be at least 8 characters"
        );
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: "CUSTOMER",
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingCustomer) {
        await updateCustomer(
          editingCustomer._id,
          payload
        );

        setSuccess("Customer updated successfully");
      } else {
        await createCustomer({
          ...payload,
          password: formData.password,
        });

        setSuccess("Customer created successfully");
      }

      setShowModal(false);
      setFormData(initialForm);

      await fetchCustomers();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      await deleteCustomer(customer._id);

      setSuccess("Customer deleted successfully");

      await fetchCustomers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete customer"
      );
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      if (customer.isActive) {
        await deactivateCustomer(customer._id);

        setSuccess(
          "Customer deactivated successfully"
        );
      } else {
        await activateCustomer(customer._id);

        setSuccess(
          "Customer activated successfully"
        );
      }

      await fetchCustomers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update customer status"
      );
    }
  };

  const activeCustomers = customers.filter(
    (customer) => customer.isActive
  ).length;

  const inactiveCustomers = customers.filter(
    (customer) => !customer.isActive
  ).length;

  return (
    <div
      className="
        relative min-h-screen w-full min-w-0
        overflow-x-hidden
        bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_25%),#f6f7fb]
        px-2.5 py-3
        text-[#171a2b]
        min-[400px]:px-3.5
        sm:px-4 sm:py-5
        md:px-5 md:py-6
        lg:px-7 lg:py-7
        xl:px-8
      "
    >
      {/* =========================================================
          PREMIUM PAGE HEADER
      ========================================================== */}

      <section
        className="
          relative mb-5
          overflow-hidden
          rounded-[24px]
          border border-white/90
          bg-white/80
          shadow-[0_20px_60px_rgba(30,35,60,0.07)]
          backdrop-blur-2xl
          sm:mb-6
          sm:rounded-[28px]
          md:mb-7
        "
      >
        {/* Decorative Background */}

        <div
          className="
            pointer-events-none
            absolute -right-16 -top-20
            h-48 w-48
            rounded-full
            bg-violet-200/35
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-20 -left-16
            h-40 w-40
            rounded-full
            bg-indigo-200/25
            blur-3xl
          "
        />

        <div
          className="
            relative
            flex min-w-0
            flex-col
            gap-5
            p-4
            min-[400px]:p-5
            sm:p-6
            md:p-7
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:gap-8
          "
        >
          <div className="min-w-0 flex-1">
            <div
              className="
                mb-2
                flex min-w-0
                items-center
                gap-2
              "
            >
              <span
                className="
                  h-1.5 w-1.5
                  shrink-0
                  rounded-full
                  bg-violet-500
                  shadow-[0_0_12px_rgba(139,92,246,0.8)]
                "
              />

              <span
                className="
                  min-w-0
                  whitespace-normal
                  text-[8px]
                  font-black
                  uppercase
                  leading-4
                  tracking-[0.18em]
                  text-violet-500
                  min-[400px]:text-[9px]
                  sm:text-[10px]
                "
              >
                Admin / Customers
              </span>
            </div>

            <h1
              className="
                m-0
                max-w-full
                whitespace-normal
                break-normal
                text-[23px]
                font-black
                leading-[1.15]
                tracking-[-0.045em]
                text-slate-950
                min-[360px]:text-[25px]
                min-[400px]:text-[27px]
                sm:text-3xl
                md:text-4xl
              "
            >
              Customer Management
            </h1>

            <p
              className="
                mt-2
                m-0
                max-w-2xl
                whitespace-normal
                text-[11px]
                leading-5
                text-slate-500
                min-[400px]:text-xs
                sm:text-sm
                sm:leading-6
              "
            >
              Manage registered customers, account
              status and customer information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="
              inline-flex
              min-h-11
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-[15px]
              border border-slate-900/10
              bg-gradient-to-r
              from-slate-950
              via-slate-900
              to-violet-950
              px-4
              py-3
              text-[11px]
              font-black
              text-white
              shadow-[0_14px_30px_rgba(15,23,42,0.20)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_18px_38px_rgba(91,33,182,0.25)]
              active:translate-y-0
              sm:min-h-12
              sm:w-auto
              sm:min-w-[170px]
              sm:rounded-2xl
              sm:px-5
              sm:text-xs
              md:text-sm
            "
          >
            <i className="bi bi-person-plus-fill shrink-0 text-[13px]" />
            <span className="whitespace-nowrap">
              Add Customer
            </span>
          </button>
        </div>
      </section>

      {/* =========================================================
          SUCCESS MESSAGE
      ========================================================== */}

      {success && (
        <div
          role="alert"
          className="
            mb-4
            flex min-w-0
            items-start
            gap-2.5
            rounded-[15px]
            border border-emerald-200
            bg-emerald-50/90
            px-3
            py-3
            text-[11px]
            text-emerald-700
            shadow-sm
            sm:mb-5
            sm:gap-3
            sm:px-4
            sm:text-sm
          "
        >
          <i className="bi bi-check-circle-fill mt-0.5 shrink-0" />

          <span
            className="
              min-w-0
              flex-1
              whitespace-normal
              break-normal
              leading-5
              font-medium
            "
          >
            {success}
          </span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="
              shrink-0
              border-0
              bg-transparent
              p-1
              text-emerald-600
              transition
              hover:text-emerald-900
            "
            aria-label="Close"
          >
            <i className="bi bi-x-lg text-[10px]" />
          </button>
        </div>
      )}

      {/* =========================================================
          ERROR MESSAGE
      ========================================================== */}

      {error && !showModal && (
        <div
          role="alert"
          className="
            mb-4
            flex min-w-0
            items-start
            gap-2.5
            rounded-[15px]
            border border-red-200
            bg-red-50/90
            px-3
            py-3
            text-[11px]
            text-red-700
            shadow-sm
            sm:mb-5
            sm:gap-3
            sm:px-4
            sm:text-sm
          "
        >
          <i className="bi bi-exclamation-triangle-fill mt-0.5 shrink-0" />

          <span
            className="
              min-w-0
              flex-1
              whitespace-normal
              break-normal
              leading-5
              font-medium
            "
          >
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
            className="
              shrink-0
              border-0
              bg-transparent
              p-1
              text-red-600
              transition
              hover:text-red-900
            "
            aria-label="Close"
          >
            <i className="bi bi-x-lg text-[10px]" />
          </button>
        </div>
      )}

      {/* =========================================================
          STATISTICS
      ========================================================== */}

      <section
        className="
          mb-5
          grid
          grid-cols-1
          gap-3
          min-[420px]:grid-cols-2
          sm:gap-4
          lg:grid-cols-4
          lg:gap-4
          xl:mb-6
        "
      >
        {/* Total */}

        <div
          className="
            group relative
            flex min-w-0
            min-h-[104px]
            items-center
            gap-3
            overflow-hidden
            rounded-[20px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            backdrop-blur-xl
            transition-all duration-300
            hover:-translate-y-1
            hover:border-violet-100
            hover:shadow-[0_22px_45px_rgba(91,33,182,0.12)]
            sm:gap-4
            sm:p-5
          "
        >
          <div
            className="
              pointer-events-none
              absolute -right-7 -top-7
              h-20 w-20
              rounded-full
              bg-violet-100/70
              blur-2xl
            "
          />

          <div
            className="
              relative
              flex
              h-11 w-11
              min-h-11 min-w-11
              shrink-0
              items-center justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-violet-500
              to-indigo-600
              text-lg
              text-white
              shadow-lg
              shadow-violet-500/25
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-14 sm:w-14
              sm:min-h-14 sm:min-w-14
              sm:rounded-2xl
              sm:text-xl
            "
          >
            <i className="bi bi-people-fill" />
          </div>

          <div className="relative min-w-0 flex-1">
            <span
              className="
                block
                whitespace-normal
                text-[9px]
                font-bold
                leading-4
                text-[#9297a9]
                sm:text-xs
              "
            >
              Total Customers
            </span>

            <strong
              className="
                mt-1
                block
                text-xl
                font-black
                leading-none
                text-[#171a2b]
                sm:text-2xl
              "
            >
              {customers.length}
            </strong>
          </div>
        </div>

        {/* Active */}

        <div
          className="
            group relative
            flex min-w-0
            min-h-[104px]
            items-center
            gap-3
            overflow-hidden
            rounded-[20px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            backdrop-blur-xl
            transition-all duration-300
            hover:-translate-y-1
            hover:border-emerald-100
            hover:shadow-[0_22px_45px_rgba(16,185,129,0.12)]
            sm:gap-4
            sm:p-5
          "
        >
          <div
            className="
              pointer-events-none
              absolute -right-7 -top-7
              h-20 w-20
              rounded-full
              bg-emerald-100/70
              blur-2xl
            "
          />

          <div
            className="
              relative
              flex
              h-11 w-11
              min-h-11 min-w-11
              shrink-0
              items-center justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-emerald-400
              to-teal-600
              text-lg
              text-white
              shadow-lg
              shadow-emerald-500/25
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-14 sm:w-14
              sm:min-h-14 sm:min-w-14
              sm:rounded-2xl
              sm:text-xl
            "
          >
            <i className="bi bi-person-check-fill" />
          </div>

          <div className="relative min-w-0 flex-1">
            <span
              className="
                block
                whitespace-normal
                text-[9px]
                font-bold
                leading-4
                text-[#9297a9]
                sm:text-xs
              "
            >
              Active
            </span>

            <strong
              className="
                mt-1
                block
                text-xl
                font-black
                leading-none
                text-[#171a2b]
                sm:text-2xl
              "
            >
              {activeCustomers}
            </strong>
          </div>
        </div>

        {/* Inactive */}

        <div
          className="
            group relative
            flex min-w-0
            min-h-[104px]
            items-center
            gap-3
            overflow-hidden
            rounded-[20px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            backdrop-blur-xl
            transition-all duration-300
            hover:-translate-y-1
            hover:border-rose-100
            hover:shadow-[0_22px_45px_rgba(244,63,94,0.12)]
            sm:gap-4
            sm:p-5
          "
        >
          <div
            className="
              pointer-events-none
              absolute -right-7 -top-7
              h-20 w-20
              rounded-full
              bg-rose-100/70
              blur-2xl
            "
          />

          <div
            className="
              relative
              flex
              h-11 w-11
              min-h-11 min-w-11
              shrink-0
              items-center justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-rose-400
              to-red-600
              text-lg
              text-white
              shadow-lg
              shadow-rose-500/25
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-14 sm:w-14
              sm:min-h-14 sm:min-w-14
              sm:rounded-2xl
              sm:text-xl
            "
          >
            <i className="bi bi-person-x-fill" />
          </div>

          <div className="relative min-w-0 flex-1">
            <span
              className="
                block
                whitespace-normal
                text-[9px]
                font-bold
                leading-4
                text-[#9297a9]
                sm:text-xs
              "
            >
              Inactive
            </span>

            <strong
              className="
                mt-1
                block
                text-xl
                font-black
                leading-none
                text-[#171a2b]
                sm:text-2xl
              "
            >
              {inactiveCustomers}
            </strong>
          </div>
        </div>

        {/* Search Results */}

        <div
          className="
            group relative
            flex min-w-0
            min-h-[104px]
            items-center
            gap-3
            overflow-hidden
            rounded-[20px]
            border border-white/90
            bg-white/90
            p-4
            shadow-[0_14px_35px_rgba(30,35,60,0.06)]
            backdrop-blur-xl
            transition-all duration-300
            hover:-translate-y-1
            hover:border-cyan-100
            hover:shadow-[0_22px_45px_rgba(6,182,212,0.12)]
            sm:gap-4
            sm:p-5
          "
        >
          <div
            className="
              pointer-events-none
              absolute -right-7 -top-7
              h-20 w-20
              rounded-full
              bg-cyan-100/70
              blur-2xl
            "
          />

          <div
            className="
              relative
              flex
              h-11 w-11
              min-h-11 min-w-11
              shrink-0
              items-center justify-center
              rounded-[14px]
              bg-gradient-to-br
              from-cyan-400
              to-blue-600
              text-lg
              text-white
              shadow-lg
              shadow-cyan-500/25
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-14 sm:w-14
              sm:min-h-14 sm:min-w-14
              sm:rounded-2xl
              sm:text-xl
            "
          >
            <i className="bi bi-person-heart" />
          </div>

          <div className="relative min-w-0 flex-1">
            <span
              className="
                block
                whitespace-normal
                text-[9px]
                font-bold
                leading-4
                text-[#9297a9]
                sm:text-xs
              "
            >
              Search Results
            </span>

            <strong
              className="
                mt-1
                block
                text-xl
                font-black
                leading-none
                text-[#171a2b]
                sm:text-2xl
              "
            >
              {filteredCustomers.length}
            </strong>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CUSTOMER PANEL
      ========================================================== */}

      <section
        className="
          min-w-0
          overflow-hidden
          rounded-[22px]
          border border-white/90
          bg-white/95
          shadow-[0_20px_55px_rgba(30,35,60,0.07)]
          backdrop-blur-xl
          sm:rounded-[26px]
          lg:rounded-[28px]
        "
      >
        {/* =======================================================
            TOOLBAR
        ======================================================== */}

        <div
          className="
            flex min-w-0
            flex-col
            gap-4
            border-b border-slate-100
            px-3.5
            py-4
            min-[400px]:px-4
            sm:px-5 sm:py-5
            md:px-6
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:gap-6
          "
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="
                  flex
                  h-8 w-8
                  min-h-8 min-w-8
                  shrink-0
                  items-center justify-center
                  rounded-[10px]
                  bg-violet-50
                  text-violet-600
                "
              >
                <i className="bi bi-people text-xs" />
              </div>

              <h5
                className="
                  m-0
                  min-w-0
                  whitespace-normal
                  text-sm
                  font-black
                  leading-5
                  text-[#171a2b]
                  sm:text-base
                "
              >
                Customers
              </h5>
            </div>

            <span
              className="
                mt-1.5
                block
                whitespace-normal
                text-[10px]
                leading-4
                text-[#969bad]
                sm:text-xs
              "
            >
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1
                ? "customer"
                : "customers"}{" "}
              found
            </span>
          </div>

          {/* Search */}

          <div
            className="
              relative
              h-11
              w-full
              min-w-0
              lg:w-[320px]
              lg:shrink-0
              xl:w-[350px]
            "
          >
            <i
              className="
                bi bi-search
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-sm
                text-[#a0a5b5]
              "
            />

            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                h-full
                w-full
                min-w-0
                rounded-[13px]
                border
                border-[#e3e6ee]
                bg-[#fafbfc]
                pl-10
                pr-10
                text-[12px]
                text-[#272b3b]
                outline-none
                transition-all
                duration-200
                placeholder:text-[#a0a5b5]
                focus:border-[#8b8ff5]
                focus:bg-white
                focus:ring-4
                focus:ring-[#5b5ff0]/10
                sm:text-[13px]
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-2
                  top-1/2
                  flex
                  h-7 w-7
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-lg
                  border-0
                  bg-transparent
                  text-[#8e93a5]
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
        </div>

        {/* =======================================================
            LOADING
        ======================================================== */}

        {loading ? (
          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              gap-3
              px-5
              py-10
              text-[#777d90]
              sm:min-h-[360px]
            "
          >
            <div
              className="
                h-9 w-9
                animate-spin
                rounded-full
                border-[3px]
                border-slate-200
                border-t-[#5b5ff0]
              "
            />

            <span className="text-xs sm:text-sm">
              Loading customers...
            </span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          /* =======================================================
             EMPTY STATE
          ======================================================== */

          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              px-4
              py-10
              text-center
              sm:min-h-[360px]
              sm:px-5
            "
          >
            <div
              className="
                mb-4
                flex
                h-14 w-14
                items-center justify-center
                rounded-[17px]
                bg-gradient-to-br
                from-violet-50
                to-indigo-50
                text-2xl
                text-[#6569df]
                shadow-inner
                sm:h-16 sm:w-16
                sm:text-[26px]
              "
            >
              <i className="bi bi-people" />
            </div>

            <h5
              className="
                m-0
                max-w-full
                whitespace-normal
                text-base
                font-black
                leading-5
                text-[#171a2b]
                sm:text-lg
              "
            >
              No customers found
            </h5>

            <p
              className="
                mb-4
                mt-2
                max-w-sm
                whitespace-normal
                text-[11px]
                leading-5
                text-[#999eae]
                sm:text-xs
                md:text-[13px]
              "
            >
              Try changing your search or add a new
              customer.
            </p>

            <button
              type="button"
              onClick={handleAdd}
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#111827]
                px-4
                py-2.5
                text-[11px]
                font-black
                text-white
                shadow-md
                transition
                hover:bg-[#202938]
                sm:px-5
                sm:text-[13px]
              "
            >
              <i className="bi bi-person-plus-fill" />
              <span className="whitespace-nowrap">
                Add Customer
              </span>
            </button>
          </div>
        ) : (
          <>
            {/* =====================================================
                DESKTOP / LAPTOP PREMIUM TABLE
                xl = 1280+
            ====================================================== */}

            <div className="hidden xl:block">
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#fafbfc] via-white to-[#fafbfc]">
                      <th
                        className="
                          w-[6%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        #
                      </th>

                      <th
                        className="
                          w-[22%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Customer
                      </th>

                      <th
                        className="
                          w-[23%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Email
                      </th>

                      <th
                        className="
                          w-[15%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Phone
                      </th>

                      <th
                        className="
                          w-[12%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          w-[13%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Joined
                      </th>

                      <th
                        className="
                          w-[12%]
                          border-b border-[#edf0f5]
                          px-3 py-4
                          text-right
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.6px]
                          text-[#9297a8]
                          2xl:px-4
                        "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map(
                      (customer, index) => (
                        <tr
                          key={customer._id}
                          className="
                            group
                            transition-colors
                            duration-150
                            hover:bg-[#fbfcff]
                          "
                        >
                          {/* Number */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              text-xs
                              text-[#53586b]
                              2xl:px-4
                            "
                          >
                            <span className="font-black text-[#a2a7b6]">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          </td>

                          {/* Customer */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-2.5
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-10 w-10
                                  min-h-10 min-w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[12px]
                                  bg-gradient-to-br
                                  from-violet-50
                                  to-indigo-100
                                  text-sm
                                  font-black
                                  text-[#5559dd]
                                  ring-1
                                  ring-violet-100
                                "
                              >
                                {customer.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>

                              <div className="min-w-0 flex-1">
                                <strong
                                  className="
                                    block
                                    max-w-full
                                    whitespace-normal
                                    break-normal
                                    text-[12px]
                                    font-black
                                    leading-5
                                    text-[#272b3a]
                                    2xl:text-[13px]
                                  "
                                >
                                  {customer.name ||
                                    "Unnamed Customer"}
                                </strong>

                                <small
                                  className="
                                    mt-0.5
                                    block
                                    whitespace-normal
                                    text-[9px]
                                    leading-4
                                    text-[#a0a5b5]
                                    2xl:text-[11px]
                                  "
                                >
                                  Customer
                                </small>
                              </div>
                            </div>
                          </td>

                          {/* Email */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <div
                              className="
                                max-w-full
                                whitespace-normal
                                break-normal
                                [overflow-wrap:break-word]
                                text-[11px]
                                font-medium
                                leading-5
                                text-[#555b6e]
                                2xl:text-[12px]
                              "
                            >
                              {customer.email}
                            </div>
                          </td>

                          {/* Phone */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <div
                              className="
                                max-w-full
                                whitespace-normal
                                break-normal
                                text-[11px]
                                leading-5
                                text-[#53586b]
                                2xl:text-[12px]
                              "
                            >
                              {customer.phone || (
                                <span className="text-[10px] text-[#b0b4c0]">
                                  Not provided
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <span
                              className={`
                                inline-flex
                                max-w-full
                                items-center
                                gap-1.5
                                rounded-full
                                px-2.5
                                py-1.5
                                text-[9px]
                                font-black
                                leading-none
                                ${
                                  customer.isActive
                                    ? "bg-[#eaf9f0] text-[#1d995d]"
                                    : "bg-[#fff0f0] text-[#d34e4e]"
                                }
                              `}
                            >
                              <span
                                className={`
                                  h-1.5
                                  w-1.5
                                  shrink-0
                                  rounded-full
                                  ${
                                    customer.isActive
                                      ? "bg-[#25ae69]"
                                      : "bg-[#e25252]"
                                  }
                                `}
                              />

                              <span className="whitespace-nowrap">
                                {customer.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </span>
                          </td>

                          {/* Joined */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <span
                              className="
                                whitespace-normal
                                text-[10px]
                                leading-5
                                text-[#74798a]
                                2xl:text-[12px]
                              "
                            >
                              {customer.createdAt
                                ? new Date(
                                    customer.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "-"}
                            </span>
                          </td>

                          {/* Actions */}

                          <td
                            className="
                              border-b
                              border-[#f0f1f5]
                              px-3
                              py-4
                              align-middle
                              2xl:px-4
                            "
                          >
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                title="Edit customer"
                                onClick={() =>
                                  handleEdit(customer)
                                }
                                className="
                                  flex
                                  h-8 w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[9px]
                                  border
                                  border-[#e9ebf1]
                                  bg-white
                                  text-[12px]
                                  text-[#565bdc]
                                  shadow-sm
                                  transition-all
                                  hover:border-[#dcdfff]
                                  hover:bg-[#eff0ff]
                                  2xl:h-[34px]
                                  2xl:w-[34px]
                                  2xl:text-sm
                                "
                              >
                                <i className="bi bi-pencil-square" />
                              </button>

                              <button
                                type="button"
                                title={
                                  customer.isActive
                                    ? "Deactivate"
                                    : "Activate"
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    customer
                                  )
                                }
                                className={`
                                  flex
                                  h-8 w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[9px]
                                  border
                                  border-[#e9ebf1]
                                  bg-white
                                  text-[12px]
                                  shadow-sm
                                  transition-all
                                  2xl:h-[34px]
                                  2xl:w-[34px]
                                  2xl:text-sm
                                  ${
                                    customer.isActive
                                      ? "text-[#d58a28] hover:bg-[#fff6e7]"
                                      : "text-[#1d9d5d] hover:bg-[#eaf9f0]"
                                  }
                                `}
                              >
                                <i
                                  className={`bi ${
                                    customer.isActive
                                      ? "bi-person-dash"
                                      : "bi-person-check"
                                  }`}
                                />
                              </button>

                              <button
                                type="button"
                                title="Delete customer"
                                onClick={() =>
                                  handleDelete(customer)
                                }
                                className="
                                  flex
                                  h-8 w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[9px]
                                  border
                                  border-[#e9ebf1]
                                  bg-white
                                  text-[12px]
                                  text-[#dc5353]
                                  shadow-sm
                                  transition-all
                                  hover:bg-[#fff0f0]
                                  2xl:h-[34px]
                                  2xl:w-[34px]
                                  2xl:text-sm
                                "
                              >
                                <i className="bi bi-trash3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =====================================================
                MOBILE + TABLET PREMIUM CARDS
                < 1280px
            ====================================================== */}

            <div
              className="
                grid
                grid-cols-1
                gap-3
                bg-slate-50/55
                p-2.5
                min-[420px]:gap-3.5
                min-[420px]:p-3
                sm:grid-cols-2
                sm:gap-4
                sm:p-4
                lg:gap-5
                lg:p-5
                xl:hidden
              "
            >
              {filteredCustomers.map(
                (customer, index) => (
                  <article
                    key={customer._id}
                    className="
                      group relative
                      flex min-w-0
                      w-full
                      max-w-full
                      flex-col
                      overflow-hidden
                      rounded-[20px]
                      border border-slate-200/80
                      bg-white
                      shadow-[0_10px_30px_rgba(30,35,60,0.055)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-violet-200
                      hover:shadow-[0_20px_45px_rgba(91,33,182,0.11)]
                      sm:rounded-[22px]
                    "
                  >
                    {/* Decorative Glow */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        -right-10
                        -top-10
                        h-28
                        w-28
                        rounded-full
                        bg-violet-100/60
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
                      <div
                        className="
                          flex min-w-0
                          w-full
                          flex-col
                          gap-3
                          min-[440px]:flex-row
                          min-[440px]:items-start
                          min-[440px]:justify-between
                        "
                      >
                        {/* Identity */}

                        <div
                          className="
                            flex min-w-0
                            w-full
                            items-center
                            gap-3
                            min-[440px]:flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              h-11 w-11
                              min-h-11 min-w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-[13px]
                              bg-gradient-to-br
                              from-violet-50
                              to-indigo-100
                              text-sm
                              font-black
                              text-[#5559dd]
                              ring-1
                              ring-violet-100
                              shadow-sm
                              transition-transform
                              duration-300
                              group-hover:scale-105
                              sm:h-12
                              sm:w-12
                              sm:min-h-12
                              sm:min-w-12
                            "
                          >
                            {customer.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3
                              className="
                                m-0
                                max-w-full
                                whitespace-normal
                                break-normal
                                text-[13px]
                                font-black
                                leading-[1.4]
                                text-[#272b3a]
                                min-[400px]:text-sm
                                sm:text-[15px]
                              "
                            >
                              {customer.name ||
                                "Unnamed Customer"}
                            </h3>

                            <p
                              className="
                                mt-0.5
                                m-0
                                whitespace-normal
                                text-[9px]
                                leading-4
                                text-[#a0a5b5]
                                min-[400px]:text-[10px]
                                sm:text-[11px]
                              "
                            >
                              Customer #
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Status */}

                        <span
                          className={`
                            inline-flex
                            min-h-[29px]
                            w-fit
                            max-w-full
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-black
                            leading-none
                            min-[440px]:mt-0.5
                            ${
                              customer.isActive
                                ? "bg-[#eaf9f0] text-[#1d995d]"
                                : "bg-[#fff0f0] text-[#d34e4e]"
                            }
                          `}
                        >
                          <span
                            className={`
                              h-1.5
                              w-1.5
                              shrink-0
                              rounded-full
                              ${
                                customer.isActive
                                  ? "bg-[#25ae69]"
                                  : "bg-[#e25252]"
                              }
                            `}
                          />

                          <span className="whitespace-nowrap">
                            {customer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* =================================================
                        CARD INFORMATION
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
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-2.5
                          min-[560px]:grid-cols-2
                        "
                      >
                        {/* Email */}

                        <div
                          className="
                            min-w-0
                            rounded-[14px]
                            border border-slate-100
                            bg-slate-50/70
                            px-3
                            py-2.5
                            transition
                            hover:border-violet-100
                            hover:bg-violet-50/30
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >
                            <i
                              className="
                                bi bi-envelope
                                shrink-0
                                text-[10px]
                                text-violet-500
                              "
                            />

                            <span
                              className="
                                whitespace-normal
                                text-[8px]
                                font-black
                                uppercase
                                leading-4
                                tracking-[0.08em]
                                text-[#a0a5b5]
                              "
                            >
                              Email
                            </span>
                          </div>

                          <p
                            className="
                              mt-1.5
                              m-0
                              max-w-full
                              whitespace-normal
                              break-normal
                              [overflow-wrap:break-word]
                              text-[10px]
                              font-bold
                              leading-[1.55]
                              text-[#555b6e]
                              min-[400px]:text-[11px]
                            "
                          >
                            {customer.email ||
                              "No email address"}
                          </p>
                        </div>

                        {/* Phone */}

                        <div
                          className="
                            min-w-0
                            rounded-[14px]
                            border border-slate-100
                            bg-slate-50/70
                            px-3
                            py-2.5
                            transition
                            hover:border-violet-100
                            hover:bg-violet-50/30
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >
                            <i
                              className="
                                bi bi-telephone
                                shrink-0
                                text-[10px]
                                text-violet-500
                              "
                            />

                            <span
                              className="
                                whitespace-normal
                                text-[8px]
                                font-black
                                uppercase
                                leading-4
                                tracking-[0.08em]
                                text-[#a0a5b5]
                              "
                            >
                              Phone
                            </span>
                          </div>

                          <p
                            className="
                              mt-1.5
                              m-0
                              max-w-full
                              whitespace-normal
                              break-normal
                              [overflow-wrap:break-word]
                              text-[10px]
                              font-bold
                              leading-[1.55]
                              text-[#555b6e]
                              min-[400px]:text-[11px]
                            "
                          >
                            {customer.phone || (
                              <span className="text-[#b0b4c0]">
                                Not provided
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Joined */}

                        <div
                          className="
                            min-w-0
                            rounded-[14px]
                            border border-slate-100
                            bg-slate-50/70
                            px-3
                            py-2.5
                            min-[560px]:col-span-2
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >
                            <i
                              className="
                                bi bi-calendar3
                                shrink-0
                                text-[10px]
                                text-violet-500
                              "
                            />

                            <span
                              className="
                                whitespace-normal
                                text-[8px]
                                font-black
                                uppercase
                                leading-4
                                tracking-[0.08em]
                                text-[#a0a5b5]
                              "
                            >
                              Joined
                            </span>
                          </div>

                          <p
                            className="
                              mt-1.5
                              m-0
                              whitespace-normal
                              text-[10px]
                              font-bold
                              leading-5
                              text-[#74798a]
                              min-[400px]:text-[11px]
                            "
                          >
                            {customer.createdAt
                              ? new Date(
                                  customer.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </p>
                        </div>
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
                          border-[#f0f1f5]
                          pt-4
                          min-[380px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]
                        "
                      >
                        {/* Edit */}

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(customer)
                          }
                          className="
                            inline-flex
                            min-h-10
                            min-w-0
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border border-[#e9ebf1]
                            bg-white
                            px-3
                            text-[10px]
                            font-black
                            leading-none
                            text-[#565bdc]
                            shadow-sm
                            transition-all
                            hover:border-[#dcdfff]
                            hover:bg-[#eff0ff]
                            active:scale-[0.98]
                            min-[380px]:text-[11px]
                          "
                        >
                          <i className="bi bi-pencil-square shrink-0" />

                          <span className="whitespace-nowrap">
                            Edit
                          </span>
                        </button>

                        {/* Status */}

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              customer
                            )
                          }
                          className={`
                            inline-flex
                            min-h-10
                            min-w-0
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-[#e9ebf1]
                            bg-white
                            px-3
                            text-[10px]
                            font-black
                            leading-none
                            shadow-sm
                            transition-all
                            active:scale-[0.98]
                            min-[380px]:text-[11px]
                            ${
                              customer.isActive
                                ? "text-[#d58a28] hover:bg-[#fff6e7]"
                                : "text-[#1d9d5d] hover:bg-[#eaf9f0]"
                            }
                          `}
                        >
                          <i
                            className={`bi ${
                              customer.isActive
                                ? "bi-person-dash"
                                : "bi-person-check"
                            } shrink-0`}
                          />

                          <span className="whitespace-nowrap">
                            {customer.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </span>
                        </button>

                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(customer)
                          }
                          className="
                            inline-flex
                            min-h-10
                            min-w-0
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border border-[#e9ebf1]
                            bg-white
                            px-3
                            text-[#dc5353]
                            shadow-sm
                            transition-all
                            hover:bg-[#fff0f0]
                            active:scale-[0.98]
                            min-[380px]:w-10
                            min-[380px]:px-0
                          "
                          title="Delete"
                        >
                          <i className="bi bi-trash3 shrink-0 text-xs" />

                          <span className="whitespace-nowrap text-[10px] font-black min-[380px]:hidden">
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* =============================================================
    PREMIUM CUSTOMER MODAL
============================================================= */}

{showModal && (
  <div
    className="
      fixed
      inset-0
      z-[2000]
      flex
      items-center
      justify-center
      overflow-y-auto
      bg-[rgba(15,18,30,0.58)]
      p-2
      backdrop-blur-[8px]
      sm:p-4
      md:p-6
    "
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !saving) {
        closeModal();
      }
    }}
  >
    <div
      className="
        my-auto
        flex
        max-h-[calc(100vh-16px)]
        max-h-[calc(100dvh-16px)]
        w-full
        max-w-[640px]
        min-w-0
        flex-col
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white
        shadow-[0_30px_90px_rgba(15,23,42,0.26)]
        sm:max-h-[calc(100vh-32px)]
        sm:max-h-[calc(100dvh-32px)]
        sm:rounded-[28px]
      "
    >

      {/* =========================================================
          MODAL HEADER
      ========================================================= */}

      <div
        className="
          flex
          min-w-0
          shrink-0
          items-center
          gap-3
          border-b
          border-slate-100
          bg-gradient-to-r
          from-white
          via-white
          to-violet-50/50
          px-4
          py-4
          sm:px-6
          sm:py-5
          md:px-7
        "
      >
        {/* Icon */}

        <div
          className="
            flex
            h-10
            w-10
            min-h-10
            min-w-10
            shrink-0
            items-center
            justify-center
            rounded-[13px]
            bg-gradient-to-br
            from-violet-50
            to-indigo-100
            text-base
            text-[#5a5ee0]
            shadow-sm
            sm:h-12
            sm:w-12
            sm:min-h-12
            sm:min-w-12
            sm:rounded-[14px]
            sm:text-xl
          "
        >
          <i
            className={`bi ${
              editingCustomer
                ? "bi-person-gear"
                : "bi-person-plus-fill"
            }`}
          />
        </div>

        {/* Title */}

        <div className="min-w-0 flex-1">
          <h4
            className="
              m-0
              max-w-full
              whitespace-normal
              break-words
              text-sm
              font-black
              leading-5
              text-[#171a2b]
              sm:text-lg
              sm:leading-6
            "
          >
            {editingCustomer
              ? "Edit Customer"
              : "Add New Customer"}
          </h4>

          <p
            className="
              m-0
              mt-1
              max-w-full
              whitespace-normal
              break-words
              text-[9px]
              leading-4
              text-[#969bad]
              sm:text-xs
              sm:leading-5
            "
          >
            {editingCustomer
              ? "Update customer account information."
              : "Create a new customer account."}
          </p>
        </div>

        {/* Close */}

        <button
          type="button"
          onClick={closeModal}
          disabled={saving}
          className="
            flex
            h-8
            w-8
            min-h-8
            min-w-8
            shrink-0
            items-center
            justify-center
            rounded-[10px]
            border-0
            bg-[#f5f6f8]
            text-[#777c8c]
            transition
            duration-200
            hover:bg-[#eceef2]
            hover:text-[#4e5261]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:h-9
            sm:w-9
          "
        >
          <i className="bi bi-x-lg text-[10px]" />
        </button>
      </div>

      {/* =========================================================
          MODAL BODY
      ========================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          px-4
          py-4
          sm:px-6
          sm:py-5
          md:px-7
        "
      >

        {/* Error */}

        {error && (
          <div
            className="
              mb-4
              flex
              min-w-0
              items-start
              gap-2.5
              rounded-xl
              border
              border-red-100
              bg-[#fff0f0]
              px-3
              py-2.5
              text-[10px]
              font-bold
              leading-5
              text-[#d84d4d]
              sm:px-4
              sm:py-3
              sm:text-xs
            "
          >
            <i
              className="
                bi
                bi-exclamation-circle-fill
                mt-0.5
                shrink-0
              "
            />

            <span
              className="
                min-w-0
                flex-1
                whitespace-normal
                break-words
                [overflow-wrap:anywhere]
              "
            >
              {error}
            </span>
          </div>
        )}

        {/* =======================================================
            IMPORTANT:
            Form has an ID.
            Footer submit button uses form="customer-form".
        ======================================================== */}

        <form
          id="customer-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:gap-5
              md:grid-cols-2
            "
          >

            {/* ===================================================
                FULL NAME
            =================================================== */}

            <div className="min-w-0 md:col-span-2">
              <label
                className="
                  mb-1.5
                  block
                  whitespace-normal
                  text-[11px]
                  font-black
                  leading-4
                  text-[#343849]
                  sm:text-xs
                "
              >
                Full Name
              </label>

              <div className="relative min-w-0">
                <i
                  className="
                    bi
                    bi-person
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-[#9ba0b0]
                  "
                />

                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    min-w-0
                    rounded-[12px]
                    border
                    border-[#e2e5ec]
                    bg-white
                    pl-10
                    pr-3.5
                    text-[12px]
                    text-[#303445]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#b7bbc6]
                    focus:border-[#777be8]
                    focus:ring-4
                    focus:ring-[#5b5ff0]/10
                    sm:h-12
                    sm:text-[13px]
                  "
                />
              </div>
            </div>

            {/* ===================================================
                EMAIL
            =================================================== */}

            <div className="min-w-0">
              <label
                className="
                  mb-1.5
                  block
                  whitespace-normal
                  text-[11px]
                  font-black
                  leading-4
                  text-[#343849]
                  sm:text-xs
                "
              >
                Email Address
              </label>

              <div className="relative min-w-0">
                <i
                  className="
                    bi
                    bi-envelope
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-[#9ba0b0]
                  "
                />

                <input
                  type="email"
                  name="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    min-w-0
                    rounded-[12px]
                    border
                    border-[#e2e5ec]
                    bg-white
                    pl-10
                    pr-3.5
                    text-[12px]
                    text-[#303445]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#b7bbc6]
                    focus:border-[#777be8]
                    focus:ring-4
                    focus:ring-[#5b5ff0]/10
                    sm:h-12
                    sm:text-[13px]
                  "
                />
              </div>
            </div>

            {/* ===================================================
                PHONE
            =================================================== */}

            <div className="min-w-0">
              <label
                className="
                  mb-1.5
                  block
                  whitespace-normal
                  text-[11px]
                  font-black
                  leading-4
                  text-[#343849]
                  sm:text-xs
                "
              >
                Phone Number
              </label>

              <div className="relative min-w-0">
                <i
                  className="
                    bi
                    bi-telephone
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-[#9ba0b0]
                  "
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    min-w-0
                    rounded-[12px]
                    border
                    border-[#e2e5ec]
                    bg-white
                    pl-10
                    pr-3.5
                    text-[12px]
                    text-[#303445]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#b7bbc6]
                    focus:border-[#777be8]
                    focus:ring-4
                    focus:ring-[#5b5ff0]/10
                    sm:h-12
                    sm:text-[13px]
                  "
                />
              </div>
            </div>

            {/* ===================================================
                PASSWORD
            =================================================== */}

            <div className="min-w-0 md:col-span-2">
              <label
                className="
                  mb-1.5
                  block
                  whitespace-normal
                  text-[11px]
                  font-black
                  leading-4
                  text-[#343849]
                  sm:text-xs
                "
              >
                Password

                {editingCustomer && (
                  <span
                    className="
                      ml-2
                      font-medium
                      text-[#999ead]
                    "
                  >
                    Optional
                  </span>
                )}
              </label>

              <div className="relative min-w-0">
                <i
                  className="
                    bi
                    bi-lock
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    text-[#9ba0b0]
                  "
                />

                <input
                  type="password"
                  name="password"
                  placeholder={
                    editingCustomer
                      ? "Leave blank to keep current password"
                      : "Minimum 8 characters"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  className="
                    h-11
                    w-full
                    min-w-0
                    rounded-[12px]
                    border
                    border-[#e2e5ec]
                    bg-white
                    pl-10
                    pr-3.5
                    text-[12px]
                    text-[#303445]
                    outline-none
                    transition
                    duration-200
                    placeholder:text-[#b7bbc6]
                    focus:border-[#777be8]
                    focus:ring-4
                    focus:ring-[#5b5ff0]/10
                    sm:h-12
                    sm:text-[13px]
                  "
                />
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* =========================================================
          MODAL FOOTER
      ========================================================= */}

      <div
        className="
          flex
          shrink-0
          flex-col-reverse
          gap-2.5
          border-t
          border-[#edf0f4]
          bg-white
          px-4
          py-3.5
          sm:flex-row
          sm:justify-end
          sm:px-6
          sm:py-4
          md:px-7
        "
      >

        {/* =======================================================
            CANCEL BUTTON
        ======================================================== */}

        <button
          type="button"
          onClick={closeModal}
          disabled={saving}
          className="
            min-h-10
            w-full
            rounded-xl
            border
            border-[#e2e5eb]
            bg-white
            px-4
            text-[11px]
            font-black
            text-[#686d7d]
            transition
            duration-200
            hover:bg-[#f7f8fa]
            hover:text-[#454958]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
            sm:min-w-[100px]
            sm:text-[13px]
          "
        >
          Cancel
        </button>

        {/* =======================================================
            CREATE / UPDATE BUTTON

            IMPORTANT FIX:
            type="submit"
            form="customer-form"

            No closest()
            No querySelector()
            No requestSubmit()
        ======================================================== */}

        <button
          type="submit"
          form="customer-form"
          disabled={saving}
          className="
            inline-flex
            min-h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border-0
            bg-gradient-to-r
            from-slate-950
            to-violet-950
            px-5
            text-[11px]
            font-black
            text-white
            shadow-[0_10px_25px_rgba(15,23,42,0.16)]
            transition
            duration-200
            hover:-translate-y-0.5
            hover:shadow-[0_14px_30px_rgba(91,33,182,0.20)]
            active:translate-y-0
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
            sm:min-w-[150px]
            sm:text-[13px]
          "
        >
          {saving ? (
            <>
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />

              <span className="whitespace-nowrap">
                Saving...
              </span>
            </>
          ) : (
            <>
              <i
                className={`bi ${
                  editingCustomer
                    ? "bi-check-lg"
                    : "bi-person-plus-fill"
                }`}
              />

              <span className="whitespace-nowrap">
                {editingCustomer
                  ? "Update Customer"
                  : "Create Customer"}
              </span>
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

export default Customers;