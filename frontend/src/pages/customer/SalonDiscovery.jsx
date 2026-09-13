import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaCalendarCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
  FaClock,
  FaEnvelope,
  FaFilter,
  FaLocationDot,
  FaMagnifyingGlass,
  FaPhone,
  FaRotate,
  FaStore,
  FaXmark,
} from "react-icons/fa6";

import { getCustomerSalons } from "../../services/customerSalonService";

// =====================================================
// IMAGE URL HELPER
// =====================================================
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  const serverUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}${
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }`;
};

// =====================================================
// FALLBACK SALON IMAGE
// =====================================================
const SalonImagePlaceholder = () => (
  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,#9b5b87_0%,#54205b_42%,#241028_100%)]">
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:h-20 sm:w-20">
        <FaStore className="text-2xl sm:text-3xl" />
      </div>

      <p className="text-[10px] font-black tracking-[0.28em] text-white/70 sm:text-xs">
        LUMORA
      </p>
    </div>
  </div>
);

// =====================================================
// SALON CARD
// =====================================================
const SalonCard = ({ salon, onView, onBook }) => {
  const image = salon?.images?.[0]
    ? getImageUrl(salon.images[0])
    : null;

  return (
    <article
      className="
        group relative flex h-full min-w-0 flex-col
        overflow-hidden rounded-[24px]
        border border-[#eaddea]
        bg-white
        shadow-[0_12px_35px_rgba(56,22,59,0.055)]
        transition-all duration-500 ease-out
        hover:-translate-y-1
        hover:border-[#d9c1d8]
        hover:shadow-[0_28px_70px_rgba(56,22,59,0.14)]
        sm:rounded-[28px]
        lg:rounded-[30px]
      "
    >
      {/* =====================================================
          IMAGE
      ===================================================== */}
      <div
        className="
          relative h-[205px] shrink-0 overflow-hidden
          sm:h-[230px]
          md:h-[225px]
          lg:h-[245px]
          xl:h-[255px]
        "
      >
        {image ? (
          <img
            src={image}
            alt={salon.name}
            className="
              h-full w-full object-cover
              transition-transform duration-700 ease-out
              group-hover:scale-[1.055]
            "
            onError={(e) => {
              e.currentTarget.style.display = "none";

              e.currentTarget.parentElement
                ?.querySelector(".salon-placeholder")
                ?.classList.remove("hidden");
            }}
          />
        ) : null}

        <div
          className={`salon-placeholder absolute inset-0 ${
            image ? "hidden" : ""
          }`}
        >
          <SalonImagePlaceholder />
        </div>

        {/* Image overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/5" />

        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/15 to-transparent" />

        {/* ===================================================
            AVAILABLE BADGE
        =================================================== */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <span
            className="
              inline-flex max-w-full items-center gap-1.5
              rounded-full border border-white/30
              bg-white/90
              px-2.5 py-1.5
              text-[8px] font-black tracking-[0.08em]
              text-[#54205b]
              shadow-[0_8px_25px_rgba(0,0,0,0.14)]
              backdrop-blur-xl
              sm:px-3 sm:text-[10px]
            "
          >
            <FaCircleCheck className="shrink-0 text-[8px] sm:text-[9px]" />
            <span className="whitespace-nowrap">AVAILABLE</span>
          </span>
        </div>

        {/* ===================================================
            CITY
        =================================================== */}
        <div
          className="
            absolute bottom-3 left-3
            max-w-[68%]
            sm:bottom-4 sm:left-4
            sm:max-w-[70%]
          "
        >
          <div className="flex min-w-0 items-center gap-1.5 text-white">
            <FaLocationDot className="shrink-0 text-[11px] sm:text-sm" />

            <span
              title={salon.city || "Location unavailable"}
              className="
                min-w-0 truncate
                text-[10px] font-bold tracking-wide
                sm:text-xs
              "
            >
              {salon.city || "Location unavailable"}
            </span>
          </div>
        </div>

        {/* ===================================================
            IMAGE COUNT
        =================================================== */}
        {salon.images?.length > 1 && (
          <div
            className="
              absolute bottom-3 right-3
              max-w-[35%] truncate
              rounded-full border border-white/15
              bg-black/35
              px-2.5 py-1.5
              text-[8px] font-bold text-white
              shadow-lg backdrop-blur-xl
              sm:bottom-4 sm:right-4 sm:px-3 sm:text-[10px]
            "
          >
            +{salon.images.length - 1} photos
          </div>
        )}
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div
        className="
          flex min-w-0 flex-1 flex-col
          p-4
          sm:p-5
          lg:p-6
        "
      >
        {/* ===================================================
            NAME + ADDRESS
        =================================================== */}
        <div className="mb-4 min-w-0">
          <h3
            title={salon.name}
            className="
              min-w-0 max-w-full break-words
              text-[16px] font-black
              leading-[1.25]
              tracking-[-0.025em]
              text-[#29162c]
              sm:text-[18px]
              lg:text-xl
            "
          >
            {salon.name}
          </h3>

          <div
            className="
              mt-2.5 flex min-w-0 items-start gap-2
              text-[11px] leading-5 text-[#7c6b7e]
              sm:text-xs
              lg:text-sm
            "
          >
            <FaLocationDot className="mt-1 shrink-0 text-[#92548c]" />

            <span
              title={salon.address}
              className="
                min-w-0 flex-1
                break-words
                leading-5
              "
            >
              {salon.address || "Address unavailable"}
            </span>
          </div>
        </div>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}
        <p
          title={salon.description}
          className="
            mb-5
            min-w-0
            min-h-[60px]
            break-words
            text-[11px]
            leading-[1.65]
            text-[#817582]
            sm:min-h-[64px]
            sm:text-[13px]
            lg:text-sm
            lg:leading-6
          "
        >
          {salon.description ||
            "Discover premium beauty services and personalized salon experiences."}
        </p>

      {/* ===================================================
    CONTACT
=================================================== */}

<div
  className="
    mb-5
    grid min-w-0
    grid-cols-1
    gap-2.5
    sm:grid-cols-2
  "
>
  {/* PHONE */}

  {salon.phone && (
    <div
      className="
        flex min-w-0
        items-center gap-2
        rounded-xl
        border border-transparent
        bg-[#faf6fa]
        px-3 py-2.5
        transition-all duration-200
        hover:border-[#eaddea]
        hover:bg-white
        hover:shadow-sm
      "
    >
      <FaPhone
        className="
          shrink-0
          text-[10px]
          text-[#8f4e89]
        "
      />

      <span
        title={salon.phone}
        className="
          min-w-0 flex-1
          whitespace-nowrap
          text-[10px]
          font-semibold
          leading-5
          tracking-tight
          text-[#756778]
          sm:text-xs
        "
      >
        {salon.phone}
      </span>
    </div>
  )}

  {/* EMAIL */}

  {salon.email && (
    <div
      className="
        flex min-w-0
        items-center gap-2
        rounded-xl
        border border-transparent
        bg-[#faf6fa]
        px-3 py-2.5
        transition-all duration-200
        hover:border-[#eaddea]
        hover:bg-white
        hover:shadow-sm
      "
    >
      <FaEnvelope
        className="
          shrink-0
          text-[10px]
          text-[#8f4e89]
        "
      />

      <span
        title={salon.email}
        className="
          min-w-0 flex-1
          whitespace-nowrap
          text-[9px]
          font-semibold
          leading-5
          tracking-tight
          text-[#756778]
          sm:text-[10px]
          md:text-xs
        "
      >
        {salon.email}
      </span>
    </div>
  )}
</div>
        {/* ===================================================
            ACTIONS
        =================================================== */}
        <div
          className="
            mt-auto grid grid-cols-1 gap-2
            min-[430px]:grid-cols-2
            sm:gap-2.5
          "
        >
          <button
            type="button"
            onClick={() => onView(salon._id)}
            className="
              group/view inline-flex min-h-[44px] min-w-0
              items-center justify-center gap-2
              rounded-xl
              border border-[#e4d5e4]
              bg-white
              px-3
              text-[11px] font-black
              text-[#54205b]
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:border-[#a65c9e]
              hover:bg-[#fcf7fc]
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-[#a65c9e]/20
              sm:min-h-[46px]
              sm:text-sm
            "
          >
            <span className="min-w-0 truncate">View Salon</span>

            <FaArrowRight
              className="
                shrink-0 text-[9px]
                transition-transform duration-200
                group-hover/view:translate-x-0.5
              "
            />
          </button>

          <button
            type="button"
            onClick={() => onBook(salon._id)}
            className="
              group/book inline-flex min-h-[44px] min-w-0
              items-center justify-center gap-2
              rounded-xl
              bg-gradient-to-r from-[#54205b] to-[#71366f]
              px-3
              text-[11px] font-black
              text-white
              shadow-[0_10px_24px_rgba(84,32,91,0.20)]
              transition-all duration-200
              hover:-translate-y-0.5
              hover:from-[#421747]
              hover:to-[#5c285d]
              hover:shadow-[0_15px_30px_rgba(84,32,91,0.27)]
              active:translate-y-0
              focus:outline-none
              focus:ring-2
              focus:ring-[#71366f]/30
              sm:min-h-[46px]
              sm:text-sm
            "
          >
            <FaCalendarCheck className="shrink-0 text-[9px]" />

            <span className="min-w-0 truncate">Book Now</span>
          </button>
        </div>
      </div>
    </article>
  );
};

// =====================================================
// EMPTY STATE
// =====================================================
const EmptyState = ({ onReset }) => (
  <div
    className="
      relative overflow-hidden
      rounded-[24px]
      border border-[#eadde9]
      bg-white
      px-5 py-12
      text-center
      shadow-[0_18px_50px_rgba(56,22,59,0.05)]
      sm:rounded-[30px]
      sm:px-10 sm:py-16
    "
  >
    <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-[#f3e4f3] blur-3xl" />

    <div className="pointer-events-none absolute -bottom-24 -left-24 h-44 w-44 rounded-full bg-[#f7e8f2] blur-3xl" />

    <div className="relative">
      <div
        className="
          mx-auto mb-5
          flex h-20 w-20
          items-center justify-center
          rounded-[26px]
          bg-gradient-to-br from-[#f7eef7] to-[#eee2ef]
          text-[#754078]
          shadow-sm
          ring-1 ring-[#e5d4e5]
        "
      >
        <FaStore className="text-3xl" />
      </div>

      <h3
        className="
          break-words
          text-[21px]
          font-black
          leading-tight
          tracking-tight
          text-[#29162c]
          sm:text-2xl
        "
      >
        No salons found
      </h3>

      <p
        className="
          mx-auto mt-2
          max-w-md
          break-words
          text-[13px]
          leading-6
          text-[#817582]
          sm:text-sm
        "
      >
        We couldn't find any active salons matching your search. Try another
        salon name or city.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="
          mt-6
          inline-flex min-h-[46px]
          items-center justify-center gap-2
          rounded-xl
          bg-gradient-to-r from-[#54205b] to-[#71366f]
          px-5
          text-sm font-black
          text-white
          shadow-[0_10px_25px_rgba(84,32,91,0.18)]
          transition
          hover:-translate-y-0.5
          hover:shadow-lg
          focus:outline-none
          focus:ring-2
          focus:ring-[#71366f]/25
        "
      >
        <FaRotate className="text-xs" />
        Reset Search
      </button>
    </div>
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
const SalonDiscovery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchInput, setSearchInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const [salons, setSalons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ===================================================
  // AUTH CHECK
  // ===================================================
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const user = sessionStorage.getItem("user");

    if (!token || role !== "CUSTOMER" || !user) {
      navigate("/customer/login", {
        replace: true,
        state: {
          from: location.pathname + location.search,
        },
      });
    }
  }, [navigate, location.pathname, location.search]);

  // ===================================================
  // FETCH SALONS
  // ===================================================
  const loadSalons = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await getCustomerSalons({
          search,
          city,
          page,
          limit,
        });

        setSalons(response?.salons || []);
        setTotal(Number(response?.total || 0));
        setTotalPages(Number(response?.totalPages || 0));
      } catch (err) {
        console.error("Customer salons error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load salons right now. Please try again."
        );

        setSalons([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, city, page, limit]
  );

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (token && role === "CUSTOMER") {
      loadSalons();
    }
  }, [loadSalons]);

  // ===================================================
  // SEARCH
  // ===================================================
  const handleSearch = (e) => {
    e?.preventDefault();

    setSearch(searchInput.trim());
    setCity(cityInput.trim());
    setPage(1);
    setShowMobileFilters(false);
  };

  // ===================================================
  // CLEAR SEARCH
  // ===================================================
  const handleReset = () => {
    setSearchInput("");
    setCityInput("");
    setSearch("");
    setCity("");
    setPage(1);
    setShowMobileFilters(false);
  };

  // ===================================================
  // VIEW SALON
  // ===================================================
  const handleViewSalon = (salonId) => {
    navigate(`/salons/${salonId}`);
  };

  // ===================================================
  // BOOK
  // ===================================================
  const handleBook = (salonId) => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const user = sessionStorage.getItem("user");

    if (!token || role !== "CUSTOMER" || !user) {
      navigate("/customer/login", {
        state: {
          from: `/salons/${salonId}`,
        },
      });

      return;
    }

    navigate(`/salons/${salonId}`);
  };

  // ===================================================
  // PAGINATION
  // ===================================================
  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];

    const pages = [];

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      start = 1;
      end = Math.min(totalPages, 5);
    }

    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  const activeFiltersCount = [search, city].filter(Boolean).length;

  // ===================================================
  // UI
  // ===================================================
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fcf9fc] text-[#29162c]">
      {/* =================================================
          HERO
      ================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#241028] via-[#54205b] to-[#754078]">
        {/* Glow */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[300px] w-[300px] rounded-full bg-white/10 blur-3xl sm:h-[460px] sm:w-[460px]" />

        <div className="pointer-events-none absolute -bottom-52 -right-24 h-[380px] w-[380px] rounded-full bg-[#e7a8c6]/10 blur-3xl sm:h-[560px] sm:w-[560px]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2c5dc]/5 blur-3xl sm:h-72 sm:w-72" />

        {/* Rings */}
        <div className="pointer-events-none absolute right-[7%] top-16 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />

        <div className="pointer-events-none absolute right-[8%] top-24 hidden h-48 w-48 rounded-full border border-white/5 lg:block" />

        <div className="pointer-events-none absolute bottom-10 left-[7%] hidden h-20 w-20 rounded-full border border-white/10 lg:block" />

        {/* =================================================
            HERO CONTAINER
        ================================================= */}
        <div
          className="
            relative mx-auto w-full max-w-[1500px]
            px-4
            pb-8 pt-8
            sm:px-6 sm:pb-11 sm:pt-11
            md:px-8 md:pb-14 md:pt-14
            lg:pb-16 lg:pt-16
            xl:px-10
          "
        >
          {/* =================================================
              LABEL
          ================================================= */}
          <div
            className="
              mb-5
              inline-flex max-w-full
              items-center gap-2
              rounded-full
              border border-white/15
              bg-white/10
              px-3 py-2
              text-[8px] font-black
              tracking-[0.15em]
              text-white/85
              shadow-lg
              backdrop-blur-xl
              sm:px-4 sm:text-[10px]
            "
          >
            <FaStore className="shrink-0 text-[#f3c3d8]" />

            <span className="max-w-full truncate">
              DISCOVER LUMORA
            </span>
          </div>

          {/* =================================================
              HERO HEADING
          ================================================= */}
          <div className="w-full max-w-5xl min-w-0">
            <h1
              className="
                max-w-full
                break-words
                text-[clamp(2rem,9vw,4.75rem)]
                font-black
                leading-[1.04]
                tracking-[-0.045em]
                text-white
              "
            >
              Find your perfect
              <span
                className="
                  block
                  max-w-full
                  break-words
                  bg-gradient-to-r
                  from-white
                  via-[#f7d8e7]
                  to-[#e7b8da]
                  bg-clip-text
                  pb-1
                  text-transparent
                "
              >
                beauty destination.
              </span>
            </h1>

            <p
              className="
                mt-4
                max-w-2xl
                break-words
                text-[12px]
                leading-6
                text-white/70
                sm:mt-5
                sm:text-sm
                sm:leading-7
                md:text-base
                lg:text-lg
              "
            >
              Discover active salons, explore their services and find a beauty
              experience that fits your time, style and place.
            </p>
          </div>

          {/* =================================================
              PREMIUM SEARCH PANEL
          ================================================= */}
          <form
            onSubmit={handleSearch}
            className="
              mt-7
              w-full min-w-0
              rounded-[22px]
              border border-white/15
              bg-white/[0.09]
              p-2
              shadow-[0_25px_70px_rgba(0,0,0,0.20)]
              backdrop-blur-2xl
              sm:mt-9
              sm:rounded-[28px]
              sm:p-3
            "
          >
            <div
              className="
                grid min-w-0 grid-cols-1 gap-2
                md:grid-cols-2
                xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.8fr)_auto]
              "
            >
              {/* SEARCH */}
              <div
                className="
                  flex min-w-0 w-full
                  items-center gap-3
                  rounded-[16px]
                  border border-transparent
                  bg-white
                  px-3.5 py-3.5
                  shadow-sm
                  transition
                  focus-within:border-[#e4cfe3]
                  focus-within:shadow-[0_8px_25px_rgba(84,32,91,0.10)]
                  sm:px-4
                "
              >
                <FaMagnifyingGlass className="shrink-0 text-[#855080]" />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search salon by name..."
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    text-[12px]
                    font-semibold
                    text-[#29162c]
                    outline-none
                    placeholder:text-[#a293a5]
                    sm:text-sm
                  "
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="
                      flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-lg
                      text-[#9b899c]
                      transition
                      hover:bg-[#f6eff6]
                      hover:text-[#54205b]
                      focus:outline-none
                    "
                    aria-label="Clear salon search"
                  >
                    <FaXmark />
                  </button>
                )}
              </div>

              {/* CITY */}
              <div
                className="
                  flex min-w-0 w-full
                  items-center gap-3
                  rounded-[16px]
                  border border-transparent
                  bg-white
                  px-3.5 py-3.5
                  shadow-sm
                  transition
                  focus-within:border-[#e4cfe3]
                  focus-within:shadow-[0_8px_25px_rgba(84,32,91,0.10)]
                  sm:px-4
                "
              >
                <FaLocationDot className="shrink-0 text-[#855080]" />

                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Search by city..."
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    text-[12px]
                    font-semibold
                    text-[#29162c]
                    outline-none
                    placeholder:text-[#a293a5]
                    sm:text-sm
                  "
                />
              </div>

              {/* SEARCH BUTTON */}
              <button
                type="submit"
                className="
                  group
                  inline-flex min-h-[50px]
                  w-full
                  items-center justify-center gap-2
                  rounded-[16px]
                  bg-gradient-to-r from-[#29162c] to-[#3d1c43]
                  px-5
                  text-[12px]
                  font-black
                  text-white
                  shadow-lg
                  transition duration-300
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  active:translate-y-0
                  focus:outline-none
                  focus:ring-2
                  focus:ring-white/20
                  md:col-span-2
                  xl:col-span-1
                  xl:min-w-[180px]
                  sm:min-h-[56px]
                  sm:text-sm
                "
              >
                <FaMagnifyingGlass className="shrink-0 text-[10px]" />

                <span className="whitespace-nowrap">
                  Search Salons
                </span>

                <FaArrowRight
                  className="
                    hidden text-[10px]
                    transition-transform duration-200
                    group-hover:translate-x-0.5
                    min-[420px]:block
                  "
                />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main
        className="
          mx-auto w-full max-w-[1500px]
          px-4
          py-7
          sm:px-6 sm:py-9
          md:px-8 md:py-10
          lg:py-12
          xl:px-10
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}
        <div
          className="
            mb-6
            flex min-w-0
            flex-col gap-5
            sm:mb-7
            lg:mb-8
            xl:flex-row
            xl:items-end
            xl:justify-between
          "
        >
          <div className="min-w-0 flex-1">
            <div
              className="
                mb-2 flex items-center gap-2
                text-[9px]
                font-black uppercase
                tracking-[0.18em]
                text-[#92548c]
                sm:text-xs
              "
            >
              <span className="h-px w-5 shrink-0 bg-[#92548c] sm:w-7" />

              <span>Salon Collection</span>
            </div>

            <h2
              className="
                max-w-full
                break-words
                text-[clamp(1.65rem,6vw,2.6rem)]
                font-black
                leading-[1.12]
                tracking-[-0.035em]
                text-[#29162c]
              "
            >
              Discover salons near your style
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                break-words
                text-[12px]
                leading-6
                text-[#817582]
                sm:text-sm
                md:text-base
              "
            >
              Explore LUMORA salons and choose a place that feels right for
              your next beauty experience.
            </p>
          </div>

          {/* DESKTOP RESULT */}
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <div
              className="
                rounded-2xl
                border border-[#eadde9]
                bg-white
                px-5 py-3
                shadow-sm
              "
            >
              <p
                className="
                  text-[9px]
                  font-black uppercase
                  tracking-[0.16em]
                  text-[#9a8a9b]
                "
              >
                Available salons
              </p>

              <p className="mt-0.5 text-xl font-black text-[#54205b]">
                {loading ? "—" : total}
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadSalons(true)}
              disabled={refreshing}
              className="
                inline-flex h-[52px] w-[52px]
                items-center justify-center
                rounded-2xl
                border border-[#eadde9]
                bg-white
                text-[#54205b]
                shadow-sm
                transition
                hover:border-[#dbc5da]
                hover:bg-[#faf5fa]
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus:outline-none
                focus:ring-2
                focus:ring-[#92548c]/20
              "
              title="Refresh salons"
            >
              <FaRotate className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* =================================================
            MOBILE / TABLET TOOLBAR
        ================================================= */}
        <div
          className="
            mb-6
            flex min-w-0
            items-center gap-2
            xl:hidden
          "
        >
          <button
            type="button"
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="
              inline-flex min-h-[44px]
              min-w-0 flex-1
              items-center justify-center gap-2
              rounded-xl
              border border-[#eadde9]
              bg-white
              px-3
              text-[11px]
              font-black
              text-[#54205b]
              shadow-sm
              transition
              hover:border-[#dbc5da]
              hover:bg-[#faf5fa]
              focus:outline-none
              focus:ring-2
              focus:ring-[#92548c]/20
              sm:text-sm
            "
          >
            <FaFilter className="shrink-0 text-[9px]" />

            <span>Filters</span>

            {activeFiltersCount > 0 && (
              <span
                className="
                  flex h-5 min-w-5 shrink-0
                  items-center justify-center
                  rounded-full
                  bg-[#54205b]
                  px-1.5
                  text-[9px]
                  text-white
                "
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => loadSalons(true)}
            disabled={refreshing}
            className="
              inline-flex h-[44px] w-[44px]
              shrink-0
              items-center justify-center
              rounded-xl
              border border-[#eadde9]
              bg-white
              text-[#54205b]
              shadow-sm
              transition
              hover:bg-[#faf5fa]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            title="Refresh salons"
          >
            <FaRotate className={refreshing ? "animate-spin" : ""} />
          </button>

          <div
            className="
              flex h-[44px]
              min-w-[48px]
              shrink-0
              items-center justify-center
              rounded-xl
              border border-[#eadde9]
              bg-white
              px-3
              text-[10px]
              font-black
              text-[#756778]
              shadow-sm
              sm:px-4 sm:text-xs
            "
          >
            {loading ? "..." : total}
          </div>
        </div>

        {/* =================================================
            MOBILE FILTERS
        ================================================= */}
        {showMobileFilters && (
          <div
            className="
              mb-6
              rounded-[22px]
              border border-[#eadde9]
              bg-white
              p-3
              shadow-[0_12px_35px_rgba(56,22,59,0.07)]
              sm:rounded-2xl
              sm:p-4
              xl:hidden
            "
          >
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Salon */}
              <div
                className="
                  flex min-w-0
                  items-center gap-3
                  rounded-xl
                  border border-[#eee4ee]
                  bg-[#fcf9fc]
                  px-3.5 py-3
                  transition
                  focus-within:border-[#d9c1d8]
                  focus-within:bg-white
                "
              >
                <FaMagnifyingGlass className="shrink-0 text-[#92548c]" />

                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Salon name"
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    text-[12px]
                    font-medium
                    outline-none
                    placeholder:text-[#a293a5]
                    sm:text-sm
                  "
                />
              </div>

              {/* City */}
              <div
                className="
                  flex min-w-0
                  items-center gap-3
                  rounded-xl
                  border border-[#eee4ee]
                  bg-[#fcf9fc]
                  px-3.5 py-3
                  transition
                  focus-within:border-[#d9c1d8]
                  focus-within:bg-white
                "
              >
                <FaLocationDot className="shrink-0 text-[#92548c]" />

                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="City"
                  className="
                    min-w-0 flex-1
                    bg-transparent
                    text-[12px]
                    font-medium
                    outline-none
                    placeholder:text-[#a293a5]
                    sm:text-sm
                  "
                />
              </div>
            </div>

            <div
              className="
                mt-3
                grid grid-cols-1 gap-2
                min-[430px]:grid-cols-2
              "
            >
              <button
                type="button"
                onClick={handleSearch}
                className="
                  min-h-[44px]
                  rounded-xl
                  bg-gradient-to-r from-[#54205b] to-[#71366f]
                  px-4 py-3
                  text-[11px]
                  font-black
                  text-white
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                  sm:text-sm
                "
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="
                  min-h-[44px]
                  rounded-xl
                  border border-[#e7dbe7]
                  bg-white
                  px-4 py-3
                  text-[11px]
                  font-black
                  text-[#54205b]
                  transition
                  hover:bg-[#faf5fa]
                  sm:text-sm
                "
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            ACTIVE FILTERS
        ================================================= */}
        {(search || city) && (
          <div className="mb-6 flex min-w-0 flex-wrap items-center gap-2">
            <span
              className="
                mr-1 shrink-0
                text-[9px]
                font-black uppercase
                tracking-wider
                text-[#8a7a8b]
                sm:text-xs
              "
            >
              Active:
            </span>

            {search && (
              <span
                className="
                  inline-flex max-w-full min-w-0
                  items-center gap-2
                  rounded-full
                  bg-[#f1e7f2]
                  px-3 py-1.5
                  text-[9px]
                  font-black
                  text-[#54205b]
                  sm:text-xs
                "
              >
                <span
                  className="
                    min-w-0 max-w-[55vw]
                    break-words
                    sm:max-w-[300px]
                  "
                >
                  Search: {search}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="
                    flex h-5 w-5 shrink-0
                    items-center justify-center
                    rounded-full
                    transition
                    hover:bg-[#e4d4e5]
                  "
                  aria-label="Remove search filter"
                >
                  <FaXmark className="text-[9px]" />
                </button>
              </span>
            )}

            {city && (
              <span
                className="
                  inline-flex max-w-full min-w-0
                  items-center gap-2
                  rounded-full
                  bg-[#f1e7f2]
                  px-3 py-1.5
                  text-[9px]
                  font-black
                  text-[#54205b]
                  sm:text-xs
                "
              >
                <span
                  className="
                    min-w-0 max-w-[45vw]
                    break-words
                    sm:max-w-[250px]
                  "
                >
                  City: {city}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setCityInput("");
                    setCity("");
                    setPage(1);
                  }}
                  className="
                    flex h-5 w-5 shrink-0
                    items-center justify-center
                    rounded-full
                    transition
                    hover:bg-[#e4d4e5]
                  "
                  aria-label="Remove city filter"
                >
                  <FaXmark className="text-[9px]" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="
                shrink-0
                text-[9px]
                font-black
                text-[#92548c]
                underline
                underline-offset-2
                sm:text-xs
              "
            >
              Clear all
            </button>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}
        {error && !loading && (
          <div
            className="
              mb-6
              flex min-w-0
              flex-col gap-3
              rounded-2xl
              border border-red-100
              bg-gradient-to-r from-red-50 to-white
              p-4
              text-sm
              text-red-700
              shadow-sm
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="min-w-0 break-words leading-5">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadSalons(true)}
              className="
                inline-flex min-h-[40px]
                shrink-0
                items-center justify-center gap-2
                rounded-xl
                bg-white
                px-4
                text-xs
                font-black
                text-red-700
                shadow-sm
                transition
                hover:shadow-md
              "
            >
              <FaRotate />
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}
        {loading ? (
          <div
            className="
              grid min-w-0
              grid-cols-1 gap-5
              sm:gap-6
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="
                  min-w-0
                  overflow-hidden
                  rounded-[24px]
                  border border-[#eadde9]
                  bg-white
                  shadow-sm
                  sm:rounded-[30px]
                "
              >
                <div
                  className="
                    h-[205px]
                    animate-pulse
                    bg-gradient-to-br
                    from-[#eee5ef]
                    to-[#f5eff5]
                    sm:h-[245px]
                  "
                />

                <div className="space-y-4 p-4 sm:p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded-lg bg-[#eee5ef]" />

                  <div className="h-4 w-full animate-pulse rounded-lg bg-[#f2ebf3]" />

                  <div className="h-4 w-5/6 animate-pulse rounded-lg bg-[#f2ebf3]" />

                  <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2">
                    <div className="h-11 animate-pulse rounded-xl bg-[#f2ebf3]" />

                    <div className="h-11 animate-pulse rounded-xl bg-[#f2ebf3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : salons.length === 0 ? (
          <EmptyState onReset={handleReset} />
        ) : (
          <>
            {/* =================================================
                SALON GRID
            ================================================= */}
            <div
              className="
                grid min-w-0
                grid-cols-1 gap-5
                sm:gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {salons.map((salon) => (
                <SalonCard
                  key={salon._id}
                  salon={salon}
                  onView={handleViewSalon}
                  onBook={handleBook}
                />
              ))}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}
            {totalPages > 1 && (
              <div
                className="
                  mt-9
                  flex min-w-0
                  flex-col
                  items-center
                  justify-between
                  gap-5
                  border-t border-[#eadde9]
                  pt-7
                  sm:mt-10
                  sm:flex-row
                "
              >
                {/* Result */}
                <p
                  className="
                    text-center
                    text-[10px]
                    font-medium
                    text-[#817582]
                    sm:text-left
                    sm:text-xs
                  "
                >
                  Showing{" "}
                  <span className="font-black text-[#54205b]">
                    {(page - 1) * limit + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-black text-[#54205b]">
                    {Math.min(page * limit, total)}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-[#54205b]">
                    {total}
                  </span>{" "}
                  salons
                </p>

                {/* Pagination */}
                <div className="flex min-w-0 max-w-full items-center gap-1.5">
                  {/* Previous */}
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((prev) => Math.max(1, prev - 1));

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="
                      flex h-10 w-10
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-[#eadde9]
                      bg-white
                      text-[#54205b]
                      shadow-sm
                      transition
                      hover:border-[#dbc5da]
                      hover:bg-[#faf5fa]
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    "
                    aria-label="Previous page"
                  >
                    <FaChevronLeft className="text-[10px]" />
                  </button>

                  {/* Page numbers */}
                  {paginationItems.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => {
                        setPage(pageNumber);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className={`
                        hidden h-10 min-w-10 shrink-0
                        items-center justify-center
                        rounded-xl px-3
                        text-[11px]
                        font-black
                        transition
                        sm:flex
                        ${
                          page === pageNumber
                            ? "bg-gradient-to-r from-[#54205b] to-[#71366f] text-white shadow-lg shadow-[#54205b]/20"
                            : "border border-[#eadde9] bg-white text-[#6f5d70] shadow-sm hover:border-[#dbc5da] hover:bg-[#faf5fa]"
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  {/* Mobile current */}
                  <div
                    className="
                      flex h-10 min-w-10
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-gradient-to-r
                      from-[#54205b] to-[#71366f]
                      px-3
                      text-[11px]
                      font-black
                      text-white
                      shadow-lg
                      shadow-[#54205b]/20
                      sm:hidden
                    "
                  >
                    {page}
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => {
                      setPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      );

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="
                      flex h-10 w-10
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-[#eadde9]
                      bg-white
                      text-[#54205b]
                      shadow-sm
                      transition
                      hover:border-[#dbc5da]
                      hover:bg-[#faf5fa]
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    "
                    aria-label="Next page"
                  >
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* =================================================
          BOTTOM CTA
      ================================================= */}
      <section
        className="
          mx-auto w-full max-w-[1500px]
          px-4 pb-8
          sm:px-6 sm:pb-10
          lg:px-8 lg:pb-14
          xl:px-10
        "
      >
        <div
          className="
            relative overflow-hidden
            rounded-[24px]
            bg-gradient-to-br
            from-[#29122e]
            via-[#54205b]
            to-[#754078]
            px-5 py-8
            shadow-[0_25px_70px_rgba(56,22,59,0.18)]
            sm:rounded-[30px]
            sm:px-8 sm:py-10
            md:px-10
            lg:px-14 lg:py-12
          "
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 -left-20 h-52 w-52 rounded-full bg-[#efb8d3]/10 blur-3xl" />

          <div
            className="
              relative flex min-w-0
              flex-col gap-6
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:gap-10
            "
          >
            <div className="min-w-0 max-w-2xl">
              <div
                className="
                  mb-3
                  flex items-center gap-2
                  text-[9px]
                  font-black uppercase
                  tracking-[0.18em]
                  text-[#efc5d9]
                  sm:text-xs
                "
              >
                <FaClock className="shrink-0" />

                <span>Your beauty. Your time.</span>
              </div>

              <h3
                className="
                  max-w-full
                  break-words
                  text-[clamp(1.45rem,5vw,2.25rem)]
                  font-black
                  leading-[1.18]
                  tracking-[-0.025em]
                  text-white
                "
              >
                Your next beauty experience is closer than you think.
              </h3>

              <p
                className="
                  mt-3
                  max-w-xl
                  break-words
                  text-[12px]
                  leading-6
                  text-white/65
                  sm:text-sm
                  md:text-base
                "
              >
                Explore salons, compare your options and discover the place
                that feels right for you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="
                group
                inline-flex min-h-[48px]
                w-full
                shrink-0
                items-center justify-center gap-2
                rounded-xl
                bg-white
                px-5
                text-xs
                font-black
                text-[#54205b]
                shadow-lg
                transition duration-300
                hover:-translate-y-0.5
                hover:bg-[#fff7fb]
                hover:shadow-xl
                focus:outline-none
                focus:ring-2
                focus:ring-white/30
                sm:w-auto
                sm:text-sm
              "
            >
              Explore again

              <FaArrowRight
                className="
                  text-[10px]
                  transition-transform duration-200
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalonDiscovery;