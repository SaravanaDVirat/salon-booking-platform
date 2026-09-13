import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarCheck,
  FaCircleCheck,
  FaClock,
  FaEnvelope,
  FaLocationDot,
  FaPhone,
  FaStar,
  FaStore,
} from "react-icons/fa6";

import { getCustomerSalonById } from "../../services/customerSalonService";

// =====================================================
// IMAGE URL
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

  const serverUrl = apiUrl.replace("api", "");

  return `${serverUrl}${
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }`;
};

// =====================================================
// DAYS
// =====================================================
const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const formatDay = (day) => {
  return day?.charAt(0) + day?.slice(1).toLowerCase();
};

// =====================================================
// COMPONENT
// =====================================================
const SalonDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);

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
          from: location.pathname,
        },
      });
    }
  }, [navigate, location.pathname]);

  // ===================================================
  // LOAD SALON
  // ===================================================
  useEffect(() => {
    const loadSalon = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCustomerSalonById(id);

        setSalon(response?.salon || null);
      } catch (err) {
        console.error("Salon details error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load this salon."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSalon();
    }
  }, [id]);

  // ===================================================
  // WORKING HOURS
  // ===================================================
  const workingHours = useMemo(() => {
    if (!salon?.workingHours?.length) {
      return DAYS.map((day) => ({
        day,
        isOpen: false,
        openTime: "",
        closeTime: "",
      }));
    }

    return DAYS.map((day) => {
      const found = salon.workingHours.find(
        (item) => item.day === day
      );

      return (
        found || {
          day,
          isOpen: false,
          openTime: "",
          closeTime: "",
        }
      );
    });
  }, [salon]);

  // ===================================================
  // BOOK
  // ===================================================
  const handleBook = () => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const user = sessionStorage.getItem("user");

    if (!token || role !== "CUSTOMER" || !user) {
      navigate("/customer/login", {
        state: {
          from: location.pathname,
        },
      });

      return;
    }

    navigate(`/salons/${id}/services`);
  };

  // ===================================================
  // LOADING
  // ===================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9fc] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="h-8 w-32 animate-pulse rounded bg-[#eee5ef]" />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="h-[420px] animate-pulse rounded-[30px] bg-[#eee5ef] lg:h-[600px]" />

            <div className="space-y-4">
              <div className="h-10 w-3/4 animate-pulse rounded bg-[#eee5ef]" />
              <div className="h-5 w-full animate-pulse rounded bg-[#f0e8f1]" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-[#f0e8f1]" />
              <div className="mt-8 h-20 animate-pulse rounded-2xl bg-[#eee5ef]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================
  if (error || !salon) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcf9fc] px-5">
        <div className="w-full max-w-md rounded-[28px] border border-[#eadde9] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5edf6] text-[#54205b]">
            <FaStore />
          </div>

          <h2 className="text-2xl font-black text-[#29162c]">
            Salon unavailable
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-[#817582] [overflow-wrap:anywhere]">
            {error || "This salon could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/salons")}
            className="mt-6 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#54205b] px-5 text-sm font-bold text-white"
          >
            <FaArrowLeft className="text-xs" />
            Back to salons
          </button>
        </div>
      </div>
    );
  }

  const images = salon.images || [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcf9fc] text-[#29162c]">
      {/* =================================================
          TOP
      ================================================= */}
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* BACK */}
        <button
          type="button"
          onClick={() => navigate("/salons")}
          className="mb-6 inline-flex max-w-full items-center gap-2 rounded-xl border border-[#eadde9] bg-white px-4 py-2.5 text-sm font-bold text-[#54205b] shadow-sm transition hover:bg-[#faf5fa]"
        >
          <FaArrowLeft className="shrink-0 text-xs" />
          <span>Back to salons</span>
        </button>

        {/* =================================================
            HERO GRID
        ================================================= */}
        <section className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* IMAGE AREA */}
          <div className="min-w-0">
            <div className="relative h-[330px] overflow-hidden rounded-[30px] bg-[#eee5ef] sm:h-[480px] lg:h-[600px]">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[activeImage])}
                  alt={salon.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#2b102f] via-[#54205b] to-[#9a587f]">
                  <FaStore className="text-6xl text-white/80" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/65 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black tracking-wide text-[#54205b]">
                    <FaCircleCheck className="shrink-0" />
                    <span>ACTIVE SALON</span>
                  </div>

                  <p className="flex min-w-0 items-start gap-2 break-words text-sm font-semibold leading-5 text-white [overflow-wrap:anywhere]">
                    <FaLocationDot className="mt-1 shrink-0" />

                    <span className="min-w-0">
                      {salon.city}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`aspect-[1.25/1] overflow-hidden rounded-xl border-2 transition sm:aspect-auto sm:h-24 ${
                      activeImage === index
                        ? "border-[#54205b]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${salon.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex min-w-0 flex-col rounded-[30px] border border-[#eadde9] bg-white p-6 shadow-[0_18px_50px_rgba(56,22,59,0.06)] sm:p-8 lg:p-10">
            <div className="mb-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-[#f5edf6] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#754078]">
              <FaStore className="shrink-0" />
              <span className="break-words">
                LUMORA SALON
              </span>
            </div>

            <h1 className="break-words text-3xl font-black leading-tight tracking-tight text-[#29162c] [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
              {salon.name}
            </h1>

            <div className="mt-4 flex min-w-0 items-start gap-3 text-sm leading-6 text-[#817582]">
              <FaLocationDot className="mt-1 shrink-0 text-[#92548c]" />

              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {salon.address}
                {salon.city ? `, ${salon.city}` : ""}
              </span>
            </div>

            <div className="my-7 h-px bg-[#eee4ee]" />

            <p className="break-words text-sm leading-7 text-[#756778] [overflow-wrap:anywhere] sm:text-base">
              {salon.description ||
                "Experience personalized beauty services in a modern and welcoming salon environment."}
            </p>

           {/* CONTACT */}
<div className="mt-7 space-y-3">
  {salon.phone && (
    <a
      href={`tel:${salon.phone}`}
      className="
        group
        flex min-w-0 items-center
        gap-2.5
        rounded-2xl
        bg-[#faf6fa]
        p-3
        text-sm font-semibold
        text-[#5f4d61]
        transition-all duration-200
        hover:bg-white
        hover:shadow-sm
        sm:gap-3 sm:p-4
      "
    >
      <span
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl
          bg-white
          text-[#92548c]
          shadow-sm
          sm:h-10 sm:w-10
        "
      >
        <FaPhone className="text-xs sm:text-sm" />
      </span>

      <span
        className="
          min-w-0 flex-1
          whitespace-nowrap
          text-[11px] font-semibold
          leading-5
          text-[#5f4d61]
          sm:text-sm
        "
      >
        {salon.phone}
      </span>
    </a>
  )}

  {salon.email && (
    <a
      href={`mailto:${salon.email}`}
      className="
        group
        flex min-w-0 items-center
        gap-2.5
        rounded-2xl
        bg-[#faf6fa]
        p-3
        text-[#5f4d61]
        transition-all duration-200
        hover:bg-white
        hover:shadow-sm
        sm:gap-3 sm:p-4
      "
    >
      <span
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl
          bg-white
          text-[#92548c]
          shadow-sm
          sm:h-10 sm:w-10
        "
      >
        <FaEnvelope className="text-xs sm:text-sm" />
      </span>

      <span
        className="
          min-w-0 flex-1
          whitespace-nowrap
          overflow-hidden
          text-ellipsis
          text-[10px] font-semibold
          leading-5
          tracking-[-0.01em]
          text-[#5f4d61]
          sm:text-sm
        "
        title={salon.email}
      >
        {salon.email}
      </span>
    </a>
  )}
</div>

            {/* =================================================
                REVIEWS
            ================================================= */}
            <div className="mt-7 rounded-2xl border border-[#eadde9] bg-[#fcf9fc] p-4">
              {/* FIXED: STACK ON SMALL MOBILE */}
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7df] text-[#d79b18]">
                    <FaStar />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-black leading-5 text-[#29162c]">
                      Salon Reviews
                    </p>

                    <p className="break-words text-xs leading-5 text-[#8a7a8b] [overflow-wrap:anywhere]">
                      See what customers are saying
                    </p>
                  </div>
                </div>

                {/* FIXED: FULL WIDTH ON MOBILE */}
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/customer/salons/${id}/reviews`)
                  }
                  className="w-full shrink-0 rounded-xl bg-[#54205b] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#421747] sm:w-auto"
                >
                  View Reviews
                </button>
              </div>
            </div>

            {/* BOOK */}
            <button
              type="button"
              onClick={handleBook}
              className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-[#54205b] px-6 text-center text-sm font-black text-white shadow-[0_15px_30px_rgba(84,32,91,0.22)] transition hover:bg-[#421747] hover:shadow-[0_18px_36px_rgba(84,32,91,0.3)]"
            >
              <FaCalendarCheck className="shrink-0" />

              <span className="break-words">
                Book an Appointment
              </span>

              <FaArrowRight className="ml-1 shrink-0 text-xs" />
            </button>
          </div>
        </section>

        {/* =================================================
            WORKING HOURS
        ================================================= */}
        <section className="mt-8 rounded-[30px] border border-[#eadde9] bg-white p-5 shadow-[0_18px_50px_rgba(56,22,59,0.05)] sm:p-7 lg:p-8">
          <div className="mb-6 flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5edf6] text-[#754078]">
              <FaClock />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-black text-[#29162c]">
                Working Hours
              </h2>

              <p className="break-words text-xs leading-5 text-[#8a7a8b]">
                Salon availability throughout the week
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {workingHours.map((item) => (
              <div
                key={item.day}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#eee5ef] bg-[#fcf9fc] px-4 py-3.5"
              >
                <span className="min-w-0 break-words text-sm font-bold text-[#4f3c51] [overflow-wrap:anywhere]">
                  {formatDay(item.day)}
                </span>

                {item.isOpen ? (
                  <span className="min-w-0 break-words text-right text-xs font-semibold leading-5 text-[#6f5d70] [overflow-wrap:anywhere]">
                    {item.openTime || "--"} -{" "}
                    {item.closeTime || "--"}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-bold text-[#b06776]">
                    Closed
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SalonDetails;