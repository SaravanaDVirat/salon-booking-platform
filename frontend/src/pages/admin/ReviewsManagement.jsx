import { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaSyncAlt,
  FaStar,
  FaUser,
  FaStore,
  FaCalendarAlt,
  FaEye,
  FaTimes,
  FaCommentAlt,
  FaChevronDown,
  FaArrowRight,
  FaExclamationTriangle,
  FaRegStar,
  FaChartBar,
  FaUsers,
  FaThumbsUp,
} from "react-icons/fa";

import { getAllReviewsAdmin } from "../../services/reviewService";

// =====================================================
// HELPERS
// =====================================================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFullDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRatingLabel = (rating) => {
  switch (Number(rating)) {
    case 5:
      return "Excellent";
    case 4:
      return "Very Good";
    case 3:
      return "Good";
    case 2:
      return "Fair";
    case 1:
      return "Poor";
    default:
      return "No Rating";
  }
};

const getRatingClass = (rating) => {
  switch (Number(rating)) {
    case 5:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case 4:
      return "border-blue-200 bg-blue-50 text-blue-700";

    case 3:
      return "border-amber-200 bg-amber-50 text-amber-700";

    case 2:
      return "border-orange-200 bg-orange-50 text-orange-700";

    case 1:
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
};

// =====================================================
// STAR DISPLAY
// =====================================================

const StarRating = ({
  rating = 0,
  size = "text-sm",
  showValue = false,
}) => {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex min-w-0 items-center gap-1">
      <div
        className={`flex shrink-0 items-center gap-0.5 ${size}`}
        aria-label={`${numericRating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) =>
          star <= numericRating ? (
            <FaStar
              key={star}
              className="shrink-0 text-amber-400"
            />
          ) : (
            <FaRegStar
              key={star}
              className="shrink-0 text-slate-300"
            />
          )
        )}
      </div>

      {showValue && (
        <span className="ml-1 shrink-0 text-sm font-black text-slate-900">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("LATEST");

  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD REVIEWS
  // ===================================================

  const loadReviews = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllReviewsAdmin();

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to load reviews"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  // ===================================================
  // STATISTICS
  // ===================================================

  const stats = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) =>
              sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    const fiveStar = reviews.filter(
      (review) => Number(review.rating) === 5
    ).length;

    const fourStar = reviews.filter(
      (review) => Number(review.rating) === 4
    ).length;

    const threeStar = reviews.filter(
      (review) => Number(review.rating) === 3
    ).length;

    const twoStar = reviews.filter(
      (review) => Number(review.rating) === 2
    ).length;

    const oneStar = reviews.filter(
      (review) => Number(review.rating) === 1
    ).length;

    return {
      total,
      average,
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
    };
  }, [reviews]);

  // ===================================================
  // FILTER + SORT
  // ===================================================

  const filteredReviews = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = reviews.filter((review) => {
      const customerName =
        review.customer?.name?.toLowerCase() || "";

      const customerEmail =
        review.customer?.email?.toLowerCase() || "";

      const salonName =
        review.salon?.name?.toLowerCase() || "";

      const comment =
        review.comment?.toLowerCase() || "";

      const rating = String(review.rating || "");

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        salonName.includes(searchValue) ||
        comment.includes(searchValue) ||
        rating.includes(searchValue);

      const matchesRating =
        ratingFilter === "ALL" ||
        Number(review.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      if (sortOrder === "LATEST") {
        return dateB - dateA;
      }

      if (sortOrder === "OLDEST") {
        return dateA - dateB;
      }

      if (sortOrder === "HIGHEST") {
        return (
          Number(b.rating || 0) -
          Number(a.rating || 0)
        );
      }

      if (sortOrder === "LOWEST") {
        return (
          Number(a.rating || 0) -
          Number(b.rating || 0)
        );
      }

      return 0;
    });
  }, [
    reviews,
    search,
    ratingFilter,
    sortOrder,
  ]);

  // ===================================================
  // VIEW DETAILS
  // ===================================================

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  // ===================================================
  // CLOSE DETAILS
  // ===================================================

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedReview(null);
  };

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {
    setSearch("");
    setRatingFilter("ALL");
    setSortOrder("LATEST");
  };

  const hasActiveFilters =
    search.trim() ||
    ratingFilter !== "ALL" ||
    sortOrder !== "LATEST";

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full min-w-0 items-center justify-center overflow-x-hidden bg-slate-50 px-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-2xl shadow-slate-300/30 sm:p-9">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-slate-100 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-50 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 shadow-xl shadow-slate-900/20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-white" />
            </div>

            <h2 className="mt-6 break-words text-lg font-black tracking-tight text-slate-950">
              Loading reviews
            </h2>

            <p className="mx-auto mt-2 max-w-sm break-words text-sm leading-6 text-slate-500">
              Preparing your customer feedback dashboard...
            </p>

            <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f8fb] text-slate-900">
      <div className="mx-auto w-full max-w-[1800px] min-w-0 px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8 lg:py-7 xl:px-10 2xl:px-12">

        {/* ================================================= */}
        {/* PREMIUM HEADER */}
        {/* ================================================= */}

        <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-[35%] h-72 w-72 rounded-full bg-amber-50 blur-3xl" />

          <div className="pointer-events-none absolute right-[20%] top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-blue-50/60 blur-3xl" />

          <div className="relative p-5 sm:p-6 md:p-7 lg:p-8 xl:p-9">
            <div className="flex min-w-0 flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 sm:text-[10px]">
                  <span>Admin</span>

                  <FaArrowRight className="shrink-0 text-[7px] text-slate-300" />

                  <span className="text-slate-700">
                    Reviews
                  </span>
                </div>

                <div className="mt-4 flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/20 sm:flex">
                    <FaCommentAlt className="text-lg" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="break-words text-2xl font-black leading-tight tracking-[-0.03em] text-slate-950 sm:text-3xl md:text-[32px] lg:text-[36px]">
                        Reviews Management
                      </h1>

                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    </div>

                    <p className="mt-2 max-w-3xl break-words text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      Monitor customer feedback, ratings and salon reputation from one centralized dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 xl:w-auto">
                <button
                  type="button"
                  onClick={() => loadReviews(true)}
                  disabled={refreshing}
                  className="group inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:min-w-[190px]"
                >
                  <FaSyncAlt
                    className={`shrink-0 transition ${
                      refreshing
                        ? "animate-spin"
                        : "group-hover:rotate-180"
                    }`}
                  />

                  <span className="break-words">
                    {refreshing
                      ? "Refreshing..."
                      : "Refresh Reviews"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white shadow-sm">
            <div className="flex min-w-0 flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <FaExclamationTriangle />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-red-900">
                    Unable to load reviews
                  </p>

                  <p className="mt-1 break-words text-xs leading-5 text-red-600 sm:text-sm">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadReviews()}
                className="w-full shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100 sm:w-auto"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* STAT CARDS */}
        {/* ================================================= */}

        <div className="mb-6 grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Reviews"
            value={stats.total}
            icon={<FaCommentAlt />}
            iconClass="bg-slate-950 text-white"
            accent="from-slate-950 via-slate-700 to-slate-400"
          />

          <StatCard
            title="Average Rating"
            value={
              stats.total > 0
                ? stats.average.toFixed(1)
                : "0.0"
            }
            icon={<FaStar />}
            iconClass="bg-amber-50 text-amber-500"
            accent="from-amber-500 via-orange-400 to-yellow-300"
          />

          <StatCard
            title="5 Star Reviews"
            value={stats.fiveStar}
            icon={<FaThumbsUp />}
            iconClass="bg-emerald-50 text-emerald-600"
            accent="from-emerald-500 via-teal-400 to-green-300"
          />

          <StatCard
            title="4 Star Reviews"
            value={stats.fourStar}
            icon={<FaStar />}
            iconClass="bg-blue-50 text-blue-600"
            accent="from-blue-500 via-cyan-400 to-sky-300"
          />

          <StatCard
            title="1–3 Star Reviews"
            value={
              stats.oneStar +
              stats.twoStar +
              stats.threeStar
            }
            icon={<FaChartBar />}
            iconClass="bg-red-50 text-red-600"
            accent="from-red-500 via-orange-400 to-amber-300"
          />
        </div>

        {/* ================================================= */}
        {/* RATING INSIGHTS */}
        {/* ================================================= */}

        <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">

          {/* Overall Rating */}

          <div className="relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-50 blur-3xl" />

            <div className="relative p-5 sm:p-6 lg:p-7">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm">
                    <FaStar />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                      Overall Rating
                    </p>

                    <p className="mt-1 break-words text-sm font-bold leading-5 text-slate-700">
                      Customer satisfaction
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-black text-slate-400">
                  LIVE
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-end gap-3">
                <span className="text-5xl font-black leading-none tracking-[-0.05em] text-slate-950 sm:text-6xl">
                  {stats.total > 0
                    ? stats.average.toFixed(1)
                    : "0.0"}
                </span>

                <span className="mb-1.5 text-sm font-semibold text-slate-400">
                  / 5.0
                </span>
              </div>

              <div className="mt-4 flex min-w-0 flex-wrap items-center gap-3">
                <StarRating
                  rating={Math.round(stats.average)}
                  size="text-lg"
                />

                <span
                  className={`rounded-full border px-2.5 py-1 text-[9px] font-black ${getRatingClass(
                    Math.round(stats.average)
                  )}`}
                >
                  {stats.total > 0
                    ? getRatingLabel(
                        Math.round(stats.average)
                      )
                    : "No Rating"}
                </span>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="break-words text-xs leading-5 text-slate-500">
                  Based on{" "}
                  <span className="font-black text-slate-900">
                    {stats.total}
                  </span>{" "}
                  customer reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}

          <div className="min-w-0 rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] xl:col-span-2">
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <FaChartBar />
                    </div>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-black text-slate-950">
                        Rating Distribution
                      </p>

                      <p className="mt-0.5 break-words text-xs leading-5 text-slate-400">
                        Breakdown of customer ratings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 sm:block">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Total
                  </span>

                  <p className="mt-0.5 text-sm font-black text-slate-900">
                    {stats.total}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <RatingBar
                  rating={5}
                  count={stats.fiveStar}
                  total={stats.total}
                />

                <RatingBar
                  rating={4}
                  count={stats.fourStar}
                  total={stats.total}
                />

                <RatingBar
                  rating={3}
                  count={stats.threeStar}
                  total={stats.total}
                />

                <RatingBar
                  rating={2}
                  count={stats.twoStar}
                  total={stats.total}
                />

                <RatingBar
                  rating={1}
                  count={stats.oneStar}
                  total={stats.total}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* FILTER PANEL */}
        {/* ================================================= */}

        <div className="mb-6 min-w-0 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">
                  Review Explorer
                </p>

                <p className="mt-0.5 break-words text-xs leading-5 text-slate-400">
                  Search, filter and organize customer feedback
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 sm:self-auto"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12">

              {/* Search */}

              <div className="relative min-w-0 lg:col-span-6">
                <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search customer, email, salon or review..."
                  className="h-12 w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* Rating */}

              <div className="relative min-w-0 lg:col-span-3">
                <select
                  value={ratingFilter}
                  onChange={(e) =>
                    setRatingFilter(e.target.value)
                  }
                  className="h-12 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="ALL">
                    All Ratings
                  </option>

                  <option value="5">
                    5 Stars
                  </option>

                  <option value="4">
                    4 Stars
                  </option>

                  <option value="3">
                    3 Stars
                  </option>

                  <option value="2">
                    2 Stars
                  </option>

                  <option value="1">
                    1 Star
                  </option>
                </select>

                <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              </div>

              {/* Sort */}

              <div className="relative min-w-0 lg:col-span-3">
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value)
                  }
                  className="h-12 w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                >
                  <option value="LATEST">
                    Latest Reviews
                  </option>

                  <option value="OLDEST">
                    Oldest Reviews
                  </option>

                  <option value="HIGHEST">
                    Highest Rating
                  </option>

                  <option value="LOWEST">
                    Lowest Rating
                  </option>
                </select>

                <FaChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
              </div>
            </div>

            {/* Result Summary */}

            <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
                <span>Showing</span>

                <span className="rounded-lg bg-slate-100 px-2 py-1 font-black text-slate-900">
                  {filteredReviews.length}
                </span>

                <span>of</span>

                <span className="font-black text-slate-900">
                  {reviews.length}
                </span>

                <span>reviews</span>
              </div>

              {hasActiveFilters && (
                <div className="flex shrink-0 items-center gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Filters Active
                </div>
              )}
            </div>
          </div>
        </div>

      {/* ===================== DESKTOP / LAPTOP REVIEWS ===================== */}
<div className="hidden xl:block">

  {/* =====================================================
      SECTION HEADER
  ===================================================== */}
  <div className="mb-6 flex items-end justify-between gap-6">

    <div className="flex min-w-0 items-center gap-3.5">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 shadow-lg shadow-indigo-200/40">
        <FaCommentAlt className="text-sm text-white" />
      </div>

      <div className="min-w-0">

        <h3 className="text-lg font-black tracking-tight text-slate-950">
          Customer Reviews
        </h3>

        <p className="mt-1 text-xs font-medium text-slate-400">
          Detailed customer feedback and ratings
        </p>

      </div>

    </div>

    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.3)]">

      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
        <FaCommentAlt className="text-[10px] text-indigo-600" />
      </div>

      <div>

        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
          Showing
        </p>

        <p className="mt-0.5 text-sm font-black text-slate-900">
          {filteredReviews.length} Reviews
        </p>

      </div>

    </div>

  </div>


  {/* =====================================================
      REVIEWS
  ===================================================== */}
  {filteredReviews.length > 0 ? (

    <div className="space-y-5">

      {filteredReviews.map((review) => {

        const rating = Number(review.rating || 0);

        return (

          <div
            key={review._id}
            className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_22px_65px_-38px_rgba(15,23,42,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200/80 hover:shadow-[0_30px_80px_-38px_rgba(79,70,229,0.3)]"
          >

            {/* =================================================
                TOP ACCENT
            ================================================= */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* =================================================
                DECORATIVE GLOW
            ================================================= */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-500/[0.035] blur-3xl transition-all duration-500 group-hover:bg-indigo-500/[0.07]" />


            <div className="relative p-6 2xl:p-7">


              {/* =================================================
                  TOP INFORMATION
              ================================================= */}
              <div
                className="
                  grid min-w-0 items-center gap-x-6 gap-y-4
                  grid-cols-[minmax(250px,1.7fr)_minmax(220px,1.45fr)_minmax(150px,1fr)_minmax(180px,1.1fr)_auto]
                "
              >


                {/* =================================================
                    CUSTOMER
                ================================================= */}
                <div className="min-w-0">

                  <p className="mb-2.5 ml-7 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Customer
                  </p>

                  <div className="flex min-w-0 items-center gap-3.5">

                    {/* Avatar */}
                    <div className="relative shrink-0">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 ring-1 ring-indigo-100">
                        <FaUser className="text-sm text-indigo-600" />
                      </div>

                      <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500" />

                    </div>


                    {/* Customer details */}
                    <div className="min-w-0 flex-1">

                      <p
                        title={review.customer?.name || "Unknown Customer"}
                        className="truncate text-sm font-black leading-5 text-slate-900"
                      >
                        {review.customer?.name || "Unknown Customer"}
                      </p>

                      <p
                        title={
                          review.customer?.email ||
                          "No email available"
                        }
                        className="mt-1 truncate text-[11px] font-medium leading-4 text-slate-400"
                      >
                        {review.customer?.email ||
                          "No email available"}
                      </p>

                      <div className="mt-2 inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-100">

                        <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Verified Customer
                        </span>

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SALON
                ================================================= */}
                <div className="min-w-0">

                  <p className="mb-2.5 ml-14 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Salon
                  </p>

                  <div className="flex min-w-0 items-center gap-3">

                    {/* Salon Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-100">
                      <FaStore className="text-xs text-amber-600" />
                    </div>


                    {/* Salon Details */}
                    <div className="min-w-0 flex-1">

                      <p
                        title={
                          review.salon?.name ||
                          "Unknown Salon"
                        }
                        className="
                          line-clamp-2
                          text-sm
                          font-black
                          leading-5
                          text-slate-800
                        "
                      >
                        {review.salon?.name ||
                          "Unknown Salon"}
                      </p>

                      {review.salon?.city && (
                        <p
                          title={review.salon.city}
                          className="mt-1 truncate text-[11px] font-medium leading-4 text-slate-400"
                        >
                          {review.salon.city}
                        </p>
                      )}

                    </div>

                  </div>

                </div>


                {/* =================================================
                    RATING
                ================================================= */}
                <div className="min-w-0">

                  <p className="mb-2.5 ml-12 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Rating
                  </p>

                  <div className="flex min-w-0 items-center gap-3">

                    {/* Rating Badge */}
                    <div
                      className={`
                        inline-flex
                        h-10
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-xl
                        px-3
                        ${getRatingClass(rating)}
                      `}
                    >

                      <FaStar className="text-[10px]" />

                      <span className="text-sm font-black">
                        {rating.toFixed(1)}
                      </span>

                    </div>


                    {/* Rating Text */}
                    <div className="min-w-0">

                      <p className="truncate text-xs font-black text-slate-700">
                        {getRatingLabel(rating)}
                      </p>

                      <div className="mt-1.5 flex items-center gap-0.5">

                        {[1, 2, 3, 4, 5].map((star) => (

                          <FaStar
                            key={star}
                            className={`
                              text-[9px]
                              ${
                                star <= rating
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }
                            `}
                          />

                        ))}

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SUBMITTED
                ================================================= */}
                <div className="min-w-0">

                  <p className="mb-2.5 ml-12 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Submitted
                  </p>

                  <div className="flex min-w-0 items-center gap-2.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100">
                      <FaCalendarAlt className="text-[11px] text-slate-500" />
                    </div>

                    <div className="min-w-0">

                      <p
                        title={formatDate(review.createdAt)}
                        className="truncate text-xs font-black leading-5 text-slate-700"
                      >
                        {formatDate(review.createdAt)}
                      </p>

                      <p
                        title={formatDateTime(review.createdAt)}
                        className="mt-0.5 truncate text-[10px] font-medium leading-4 text-slate-400"
                      >
                        {formatDateTime(review.createdAt)}
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ACTION
                ================================================= */}
                <div className="flex shrink-0 items-center justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      handleViewDetails(review)
                    }
                    className="
                      group/view
                      inline-flex
                      h-11
                      shrink-0
                      items-center
                      gap-2
                      whitespace-nowrap
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-xs
                      font-black
                      text-slate-700
                      shadow-sm
                      transition-all
                      duration-200
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      hover:text-indigo-700
                      hover:shadow-md
                      active:scale-95
                    "
                  >

                    <FaEye className="text-[11px] transition-transform duration-200 group-hover/view:scale-110" />

                    <span>
                      View Details
                    </span>

                    <FaArrowRight className="text-[9px] transition-transform duration-200 group-hover/view:translate-x-0.5" />

                  </button>

                </div>

              </div>


              {/* =================================================
                  DIVIDER
              ================================================= */}
              <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />


              {/* =================================================
                  REVIEW CONTENT
              ================================================= */}
              <div
                className="
                  grid
                  min-w-0
                  items-stretch
                  gap-5
                  grid-cols-[190px_minmax(0,1fr)_240px]
                "
              >


                {/* =================================================
                    REVIEW LABEL
                ================================================= */}
                <div className="min-w-0">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100">
                      <FaCommentAlt className="text-[11px] text-violet-600" />
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                        Customer Feedback
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-400">
                        Written review
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    REVIEW TEXT
                ================================================= */}
                <div className="min-w-0">

                  <div className="relative flex min-h-[78px] items-center rounded-2xl border border-slate-100 bg-slate-50/70 px-6 py-4 transition-all duration-300 group-hover:border-indigo-100 group-hover:bg-indigo-50/25">

                    {/* Accent */}
                    <div className="absolute bottom-4 left-0 top-4 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 via-violet-500 to-fuchsia-500" />

                    <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-slate-700">
                      {review.comment ||
                        "No written feedback provided."}
                    </p>

                  </div>

                </div>


                {/* =================================================
                    EXPERIENCE SUMMARY
                ================================================= */}
                <div className="min-w-0">

                  <div className="h-full rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white p-4">

                    <div className="flex items-center gap-2.5">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-amber-100">
                        <FaThumbsUp className="text-[10px] text-amber-500" />
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-700">
                        Experience
                      </span>

                    </div>

                    <p className="mt-3 text-xs font-black leading-5 text-slate-700">

                      {rating >= 4
                        ? "Positive customer experience"
                        : rating >= 3
                        ? "Average customer experience"
                        : "Needs attention"}

                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}
              <div className="mt-6 flex items-center justify-between gap-5 border-t border-slate-100 pt-4">


                {/* Footer Badges */}
                <div className="flex min-w-0 items-center gap-2.5">

                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-100">

                    <FaRegStar className="text-[9px] text-amber-400" />

                    {rating}/5 Rating

                  </span>


                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-100">

                    <FaThumbsUp className="text-[9px]" />

                    Customer Feedback

                  </span>

                </div>


                {/* Open Review */}
                <button
                  type="button"
                  onClick={() =>
                    handleViewDetails(review)
                  }
                  className="group/open inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] font-black text-indigo-600 transition-colors hover:text-indigo-800"
                >

                  <span>
                    Open full review
                  </span>

                  <FaArrowRight className="text-[9px] transition-transform duration-200 group-hover/open:translate-x-1" />

                </button>

              </div>

            </div>

          </div>

        );

      })}

    </div>

  ) : (

    <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_22px_65px_-38px_rgba(15,23,42,0.35)]">
      <EmptyState />
    </div>

  )}

</div>


        {/* ================================================= */}
        {/* MOBILE / TABLET CARDS */}
        {/* ================================================= */}

        <div className="space-y-4 xl:hidden">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onView={handleViewDetails}
            />
          ))}

          {filteredReviews.length === 0 && (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <EmptyState />
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* DETAILS MODAL */}
      {/* ================================================= */}

      {showDetailsModal && selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  title,
  value,
  icon,
  iconClass,
  accent,
}) => {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white p-4 shadow-[0_15px_40px_-30px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 sm:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
      />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-[9px] font-black uppercase leading-4 tracking-[0.11em] text-slate-400 sm:text-[10px]">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>

          <div className="mt-3 h-1 w-8 rounded-full bg-slate-100 transition-all duration-300 group-hover:w-12" />
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 sm:h-11 sm:w-11 ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// RATING BAR
// =====================================================

const RatingBar = ({
  rating,
  count,
  total,
}) => {
  const percentage =
    total > 0
      ? (count / total) * 100
      : 0;

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex w-11 shrink-0 items-center gap-1">
        <span className="text-xs font-black text-slate-700">
          {rating}
        </span>

        <FaStar className="text-[10px] text-amber-400" />
      </div>

      <div className="relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <span className="w-8 shrink-0 text-right text-xs font-black text-slate-500 sm:w-10">
        {count}
      </span>
    </div>
  );
};

// =====================================================
// REVIEW ROW
// =====================================================

const ReviewRow = ({
  review,
  onView,
}) => {
  return (
    <tr className="group transition-colors duration-200 hover:bg-slate-50/80">

      {/* Customer */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white">
            <FaUser />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words [overflow-wrap:anywhere] text-sm font-black leading-5 text-slate-900">
              {review.customer?.name ||
                "Unknown Customer"}
            </p>

            <p className="mt-1 break-words [overflow-wrap:anywhere] text-xs leading-5 text-slate-400">
              {review.customer?.email ||
                "-"}
            </p>
          </div>
        </div>
      </td>

      {/* Salon */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            <FaStore />
          </div>

          <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-sm font-bold leading-5 text-slate-700">
            {review.salon?.name || "-"}
          </span>
        </div>
      </td>

      {/* Rating */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <StarRating rating={review.rating} />

          <span
            className={`rounded-full border px-2 py-1 text-[9px] font-black ${getRatingClass(
              review.rating
            )}`}
          >
            {getRatingLabel(review.rating)}
          </span>
        </div>
      </td>

      {/* Review */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        {review.comment ? (
          <p className="break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-600">
            {review.comment}
          </p>
        ) : (
          <span className="break-words text-xs italic leading-5 text-slate-400">
            No comment provided
          </span>
        )}
      </td>

      {/* Date */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        <div className="flex min-w-0 items-start gap-2 text-sm font-medium text-slate-600">
          <FaCalendarAlt className="mt-1 shrink-0 text-xs text-slate-400" />

          <span className="break-words leading-5">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </td>

      {/* Action */}

      <td className="px-5 py-5 align-top 2xl:px-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onView(review)}
            className="group/button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-950 hover:bg-slate-950 hover:text-white hover:shadow-lg"
            title="View review"
            aria-label="View review"
          >
            <FaEye className="transition group-hover/button:scale-110" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// =====================================================
// MOBILE REVIEW CARD
// =====================================================

const ReviewCard = ({
  review,
  onView,
}) => {
  return (
    <article className="group min-w-0 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_15px_45px_-32px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="h-1 w-full bg-gradient-to-r from-slate-950 via-slate-700 to-slate-300" />

      <div className="min-w-0 p-4 sm:p-5 md:p-6">

        {/* Header */}

        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white">
              <FaUser />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words [overflow-wrap:anywhere] text-sm font-black leading-5 text-slate-900">
                {review.customer?.name ||
                  "Unknown Customer"}
              </p>

              <p className="mt-1 break-words [overflow-wrap:anywhere] text-xs leading-5 text-slate-400">
                {review.customer?.email ||
                  "-"}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-black ${getRatingClass(
              review.rating
            )}`}
          >
            {review.rating || 0}/5
          </span>
        </div>

        {/* Rating */}

        <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <StarRating rating={review.rating} />

          <span className="break-words text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
            {getRatingLabel(review.rating)}
          </span>
        </div>

        {/* Salon */}

        <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
            <FaStore />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              Salon
            </p>

            <p className="mt-1 break-words [overflow-wrap:anywhere] text-sm font-black leading-5 text-slate-800">
              {review.salon?.name || "-"}
            </p>
          </div>
        </div>

        {/* Comment */}

        <div className="mt-3 min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 sm:p-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
              <FaCommentAlt className="text-[10px]" />
            </div>

            <span className="break-words text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
              Customer Review
            </span>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6 text-slate-600">
            {review.comment ||
              "No comment provided"}
          </p>
        </div>

        {/* Footer */}

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 min-[430px]:grid-cols-[minmax(0,1fr)_auto] min-[430px]:items-center">
          <div className="flex min-w-0 items-start gap-2 text-xs font-medium text-slate-400">
            <FaCalendarAlt className="mt-0.5 shrink-0" />

            <span className="break-words leading-5">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onView(review)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-xl min-[430px]:w-auto"
          >
            <FaEye className="shrink-0" />

            <span>View Review</span>
          </button>
        </div>
      </div>
    </article>
  );
};

// =====================================================
// DETAILS MODAL
// =====================================================

const ReviewDetailsModal = ({
  review,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-2 backdrop-blur-md sm:p-4 md:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-white/20 bg-white shadow-[0_30px_100px_-30px_rgba(0,0,0,0.5)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem] lg:max-h-[calc(100dvh-3rem)]">

        {/* ================================================= */}
        {/* MODAL HEADER */}
        {/* ================================================= */}

        <div className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-50 blur-3xl" />

          <div className="relative flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/20 sm:flex">
                <FaCommentAlt />
              </div>

              <div className="min-w-0">
                <p className="break-words text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                  Customer Feedback
                </p>

                <h2 className="mt-1 break-words text-lg font-black leading-tight tracking-tight text-slate-950 sm:text-xl">
                  Review Details
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-slate-950 hover:text-white"
              aria-label="Close review details"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* MODAL BODY */}
        {/* ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-6">

          {/* Rating Hero */}

          <div className="relative min-w-0 overflow-hidden rounded-2xl bg-slate-950 p-4 text-white shadow-xl sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

            <div className="relative flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                  Customer Rating
                </p>

                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3">
                  <span className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
                    {review.rating || 0}
                  </span>

                  <div className="min-w-0">
                    <StarRating
                      rating={review.rating}
                      size="text-base"
                    />

                    <p className="mt-1 break-words text-xs font-bold text-slate-400">
                      {getRatingLabel(review.rating)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`self-start rounded-xl border px-3 py-2 text-[10px] font-black sm:text-xs ${getRatingClass(
                  review.rating
                )}`}
              >
                {review.rating || 0}/5 Stars
              </div>
            </div>
          </div>

          {/* Customer */}

          <DetailSection
            title="Customer"
            icon={<FaUser />}
          >
            <DetailGrid>
              <DetailValue
                icon={<FaUser />}
                label="Name"
                value={
                  review.customer?.name ||
                  "-"
                }
              />

              <DetailValue
                icon={<FaUsers />}
                label="Email"
                value={
                  review.customer?.email ||
                  "-"
                }
              />
            </DetailGrid>
          </DetailSection>

          {/* Salon */}

          <DetailSection
            title="Salon"
            icon={<FaStore />}
          >
            <DetailGrid>
              <DetailValue
                icon={<FaStore />}
                label="Salon Name"
                value={
                  review.salon?.name ||
                  "-"
                }
              />

              <DetailValue
                icon={<FaCalendarAlt />}
                label="Review Date"
                value={formatFullDate(
                  review.createdAt
                )}
              />
            </DetailGrid>
          </DetailSection>

          {/* Comment */}

          <DetailSection
            title="Customer Comment"
            icon={<FaCommentAlt />}
          >
            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
              <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-slate-100 blur-2xl" />

              <p className="relative whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-7 text-slate-700">
                {review.comment ||
                  "No comment was provided by the customer."}
              </p>
            </div>
          </DetailSection>

          {/* Appointment */}

          {review.appointment && (
            <DetailSection
              title="Appointment"
              icon={<FaCalendarAlt />}
            >
              <DetailGrid>
                <DetailValue
                  icon={<FaCalendarAlt />}
                  label="Appointment Date"
                  value={
                    review.appointment
                      ?.appointmentDate
                      ? formatFullDate(
                          review.appointment
                            .appointmentDate
                        )
                      : "-"
                  }
                />

                <DetailValue
                  icon={<FaCalendarAlt />}
                  label="Appointment ID"
                  value={
                    review.appointment?._id ||
                    "-"
                  }
                />
              </DetailGrid>
            </DetailSection>
          )}

          {/* Submitted */}

          <div className="mt-6 min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex min-w-0 items-center gap-2 text-slate-400">
              <FaCalendarAlt className="shrink-0" />

              <span className="break-words text-[9px] font-black uppercase tracking-[0.15em]">
                Submitted On
              </span>
            </div>

            <p className="mt-2 break-words [overflow-wrap:anywhere] text-sm font-black leading-6 text-slate-800">
              {formatDateTime(review.createdAt)}
            </p>
          </div>

          {/* Footer */}

          <div className="mt-6 flex w-full justify-stretch sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all duration-200 hover:bg-slate-800 sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// DETAIL SECTION
// =====================================================

const DetailSection = ({
  title,
  icon,
  children,
}) => {
  return (
    <section className="mt-6 min-w-0">
      <div className="mb-3 flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-600">
          {icon}
        </span>

        <h3 className="break-words text-sm font-black text-slate-950">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
};

// =====================================================
// DETAIL GRID
// =====================================================

const DetailGrid = ({
  children,
}) => {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
      {children}
    </div>
  );
};

// =====================================================
// DETAIL VALUE
// =====================================================

const DetailValue = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white p-3.5 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-2 text-slate-400">
        <span className="shrink-0">
          {icon}
        </span>

        <span className="break-words text-[9px] font-black uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>

      <p className="mt-2 break-words [overflow-wrap:anywhere] text-sm font-bold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
};

// =====================================================
// EMPTY STATE
// =====================================================

const EmptyState = () => {
  return (
    <div className="px-5 py-16 text-center sm:py-20">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
        <FaCommentAlt className="text-2xl" />
      </div>

      <h3 className="mt-5 break-words text-base font-black tracking-tight text-slate-950 sm:text-lg">
        No reviews found
      </h3>

      <p className="mx-auto mt-2 max-w-md break-words text-sm leading-6 text-slate-500">
        Try changing your search or rating filter to find the reviews you are looking for.
      </p>
    </div>
  );
};

export default ReviewsManagement;