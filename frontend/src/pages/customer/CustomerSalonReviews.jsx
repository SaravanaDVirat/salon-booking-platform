import React, { useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaCommentDots,
  FaSpinner,
  FaMessage,
} from "react-icons/fa6";

import {
  getCustomerSalonReviews,
  getCustomerSalonRating,
} from "../../services/customerReviewService";

const CustomerSalonReviews = ({ salonId: propSalonId }) => {
  const { salonId: routeSalonId } = useParams();

  const salonId = propSalonId || routeSalonId;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("CustomerSalonReviews salonId:", salonId);

    if (!salonId) {
      setLoading(false);
      setError("Salon ID is missing.");
      return;
    }

    const loadReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const [reviewsData, ratingData] = await Promise.all([
          getCustomerSalonReviews(salonId),
          getCustomerSalonRating(salonId),
        ]);

        console.log("Reviews response:", reviewsData);
        console.log("Rating response:", ratingData);

        setReviews(
          Array.isArray(reviewsData?.reviews)
            ? reviewsData.reviews
            : []
        );

        setRating({
          averageRating: Number(ratingData?.averageRating) || 0,
          totalReviews: Number(ratingData?.totalReviews) || 0,
        });
      } catch (err) {
        console.error("Salon reviews error:", err);

        setError(
          err?.response?.data?.message || "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [salonId]);

  const ratingStars = useMemo(() => {
    return [1, 2, 3, 4, 5];
  }, []);

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <section className="mt-6 w-full sm:mt-8">
        <div
          className="
            flex min-h-[220px] w-full
            items-center justify-center
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            px-4 py-10
            shadow-[0_8px_30px_rgba(15,23,42,0.05)]
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div className="w-full max-w-xs text-center">
            <div
              className="
                mx-auto mb-4
                flex h-12 w-12
                items-center justify-center
                rounded-2xl
                border border-violet-100
                bg-violet-50
                dark:border-violet-500/20
                dark:bg-violet-500/10
              "
            >
              <FaSpinner
                className="
                  animate-spin
                  text-lg
                  text-violet-600
                  dark:text-violet-400
                "
              />
            </div>

            <p
              className="
                text-sm font-bold
                text-slate-600
                dark:text-slate-300
              "
            >
              Loading customer reviews...
            </p>

            <p
              className="
                mt-1 text-xs
                text-slate-400
                dark:text-slate-500
              "
            >
              Please wait a moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 w-full min-w-0 sm:mt-8 lg:mt-10">
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <div
        className="
          relative mb-5
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          p-4
          shadow-[0_8px_30px_rgba(15,23,42,0.05)]
          sm:mb-6
          sm:rounded-3xl
          sm:p-5
          md:p-6
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* Small decorative line */}

        <div
          className="
            absolute left-0 top-0
            h-full w-1
            bg-violet-600
          "
        />

        <div
          className="
            flex min-w-0
            flex-col gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* =================================================
              TITLE
          ================================================= */}

          <div className="min-w-0 flex-1 pl-2 sm:pl-3">
            <div
              className="
                mb-2.5
                flex flex-wrap
                items-center gap-2
                text-[10px] font-extrabold
                uppercase
                tracking-[0.18em]
                text-violet-600
                dark:text-violet-400
                sm:text-xs
              "
            >
              <span
                className="
                  flex h-6 w-6
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-violet-50
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-400
                "
              >
                <FaCommentDots />
              </span>

              <span>Customer Feedback</span>
            </div>

           <h2
  className="
    !text-slate-900
    text-xl font-black
    leading-tight
    tracking-tight
    sm:text-2xl
    md:text-3xl
  "
>
  What customers say
</h2>

            <p
              className="
                mt-1.5
                max-w-2xl
                break-words
                text-xs
                leading-5
                text-slate-500
                dark:text-slate-400
                sm:text-sm
                sm:leading-6
              "
            >
              Real experiences from customers who visited this salon.
            </p>
          </div>

        {/* =================================================
    PREMIUM ULTRA-PRO RATING SUMMARY
================================================= */}

<div
  className="
    group
    relative
    flex
    w-full
    min-w-0
    items-center
    gap-3.5
    overflow-hidden
    rounded-[22px]
    border
    border-[#ddd0ff]
    bg-gradient-to-br
    from-white
    via-[#faf8ff]
    to-[#f3eeff]
    px-4
    py-4
    shadow-[0_10px_30px_rgba(111,76,255,0.08)]
    transition-all
    duration-500
    hover:border-[#c9b4ff]
    hover:shadow-[0_16px_38px_rgba(111,76,255,0.13)]

    sm:gap-4
    sm:rounded-[24px]
    sm:px-5
    sm:py-4.5

    lg:w-auto
    lg:min-w-[235px]
  "
>
  {/* =================================================
      SOFT BACKGROUND GLOW
  ================================================= */}

  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-10
      h-24
      w-24
      rounded-full
      bg-[#8b5cf6]/10
      blur-2xl
      transition-all
      duration-700
      group-hover:scale-125
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -bottom-10
      left-1/3
      h-20
      w-20
      rounded-full
      bg-[#d946ef]/[0.07]
      blur-2xl
    "
  />

  {/* =================================================
      RATING NUMBER
  ================================================= */}

  <div
    className="
      relative
      z-10
      flex
      h-[58px]
      w-[58px]
      shrink-0
      items-center
      justify-center
      rounded-[18px]
      border
      border-[#ddd0ff]
      bg-gradient-to-br
      from-[#ffffff]
      via-[#f8f4ff]
      to-[#eee7ff]
      shadow-[0_7px_20px_rgba(111,76,255,0.10)]
      transition-all
      duration-500
      group-hover:scale-[1.03]
      group-hover:border-[#c9b4ff]

      sm:h-[64px]
      sm:w-[64px]
      sm:rounded-[20px]
    "
  >
    <div className="text-center">
      <div
        className="
          text-[25px]
          font-black
          leading-none
          tracking-tight
          !text-[#38256f]
          sm:text-[28px]
        "
      >
        {rating.averageRating.toFixed(1)}
      </div>

      <div
        className="
          mt-1
          text-[7px]
          font-black
          uppercase
          tracking-[0.16em]
          !text-[#9a82c7]
          sm:text-[8px]
        "
      >
        Rating
      </div>
    </div>
  </div>

  {/* =================================================
      RATING DETAILS
  ================================================= */}

  <div
    className="
      relative
      z-10
      min-w-0
      flex-1
    "
  >
    {/* =================================================
        STARS
    ================================================= */}

    <div
      className="
        flex
        min-w-0
        items-center
        gap-[3px]
      "
    >
      {ratingStars.map((star) =>
        star <= Math.round(rating.averageRating) ? (
          <FaStar
            key={star}
            className="
              h-4
              w-4
              shrink-0
              text-[#8b5cf6]
              drop-shadow-[0_2px_5px_rgba(139,92,246,0.22)]
              transition-transform
              duration-300
              group-hover:scale-105

              sm:h-[17px]
              sm:w-[17px]
            "
          />
        ) : (
          <FaRegStar
            key={star}
            className="
              h-4
              w-4
              shrink-0
              !text-[#d9cff0]

              sm:h-[17px]
              sm:w-[17px]
            "
          />
        )
      )}
    </div>

    {/* =================================================
        REVIEW COUNT
    ================================================= */}

    <div
      className="
        mt-2
        flex
        min-w-0
        items-center
        gap-2
      "
    >
      <span
        className="
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          bg-gradient-to-r
          from-[#7c3aed]
          to-[#d946ef]
          shadow-[0_0_0_3px_rgba(139,92,246,0.10)]
        "
      />

      <p
        className="
          min-w-0
          truncate
          text-[9px]
          font-black
          uppercase
          tracking-[0.14em]
          !text-[#75618f]

          sm:text-[10px]
          sm:tracking-[0.16em]
        "
      >
        {rating.totalReviews}{" "}
        {rating.totalReviews === 1 ? "review" : "reviews"}
      </p>
    </div>
  </div>

  {/* =================================================
      PREMIUM SIDE DETAIL
  ================================================= */}

  <div
    className="
      relative
      z-10
      hidden
      shrink-0
      flex-col
      items-end
      justify-center
      gap-1
      min-[430px]:flex
    "
  >
    <span
      className="
        text-[7px]
        font-black
        uppercase
        tracking-[0.16em]
        !text-[#a18bbf]
      "
    >
      Customer
    </span>

    <span
      className="
        text-[8px]
        font-black
        uppercase
        tracking-[0.12em]
        !text-[#7652c4]
      "
    >
      Feedback
    </span>

    <div
      className="
        mt-1
        h-[2px]
        w-7
        rounded-full
        bg-gradient-to-r
        from-[#7c3aed]
        to-[#d946ef]
      "
    />
  </div>

  {/* =================================================
      TOP SHINE
  ================================================= */}

  <div
    className="
      pointer-events-none
      absolute
      inset-x-5
      top-0
      h-px
      bg-gradient-to-r
      from-transparent
      via-[#b794ff]
      to-transparent
      opacity-70
    "
  />
</div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            mb-5
            flex min-w-0
            items-start gap-3
            rounded-2xl
            border border-red-200
            bg-red-50
            p-4
            text-sm
            dark:border-red-500/20
            dark:bg-red-500/10
          "
        >
          <div
            className="
              mt-0.5
              h-2 w-2
              shrink-0
              rounded-full
              bg-red-500
            "
          />

          <p
            className="
              min-w-0
              break-words
              font-semibold
              leading-5
              text-red-600
              [overflow-wrap:anywhere]
              dark:text-red-300
            "
          >
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!error && reviews.length === 0 && (
        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border border-dashed
            border-slate-300
            bg-slate-50
            px-4 py-12
            text-center
            sm:rounded-3xl
            sm:px-6 sm:py-16
            dark:border-slate-700
            dark:bg-slate-900/60
          "
        >
          <div
            className="
              mx-auto mb-5
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              border border-violet-100
              bg-violet-50
              text-lg
              text-violet-600
              dark:border-violet-500/20
              dark:bg-violet-500/10
              dark:text-violet-400
              sm:h-16 sm:w-16
              sm:text-xl
            "
          >
            <FaMessage />
          </div>

          <h3
            className="
              break-words
              text-base font-black
              text-slate-800
              dark:text-white
              sm:text-lg
            "
          >
            No reviews yet
          </h3>

          <p
            className="
              mx-auto mt-1.5
              max-w-md
              break-words
              text-xs
              leading-5
              text-slate-500
              dark:text-slate-400
              sm:text-sm
              sm:leading-6
            "
          >
            Be the first customer to share your experience.
          </p>
        </div>
      )}

      {/* =====================================================
          REVIEWS GRID
      ===================================================== */}

      {!error && reviews.length > 0 && (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:gap-5
            lg:grid-cols-2
          "
        >
          {reviews.map((review) => (
            <article
              key={review._id}
              className="
                group
                relative
                min-w-0
                overflow-hidden
                rounded-2xl
                border border-slate-200
                bg-white
                p-4
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-violet-200
                hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]
                sm:rounded-3xl
                sm:p-5
                md:p-6
                dark:border-slate-800
                dark:bg-slate-900
                dark:hover:border-violet-500/30
                dark:hover:shadow-[0_14px_35px_rgba(0,0,0,0.22)]
              "
            >
              {/* =================================================
                  TOP ACCENT
              ================================================= */}

              <div
                className="
                  absolute left-0 right-0 top-0
                  h-px
                  bg-violet-500
                  opacity-0
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                "
              />

              {/* =================================================
                  REVIEW HEADER
              ================================================= */}

              <div
                className="
                  flex min-w-0
                  items-start
                  justify-between
                  gap-3
                  sm:gap-4
                "
              >
                {/* Customer */}

                <div
                  className="
                    flex min-w-0
                    flex-1
                    items-center gap-3
                  "
                >
                  <div
                    className="
                      flex h-10 w-10
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      border border-violet-100
                      bg-violet-50
                      text-sm
                      text-violet-600
                      transition-transform
                      duration-300
                      group-hover:scale-105
                      sm:h-11 sm:w-11
                      sm:rounded-2xl
                      dark:border-violet-500/20
                      dark:bg-violet-500/10
                      dark:text-violet-400
                    "
                  >
                    <FaUser />
                  </div>

                  <div className="min-w-0 flex-1">
                   <h3
  className="
    min-w-0
    break-words
    !text-slate-900
    text-sm font-extrabold
    leading-5
    [overflow-wrap:anywhere]
    sm:text-[15px]
  "
>
  {review.customer?.name || "Customer"}
</h3>

                    <p
  className="
    mt-0.5
    !text-slate-400
    text-[10px]
    font-semibold
    uppercase
    tracking-wide
    sm:text-[11px]
  "
>
  Verified customer
</p>
                  </div>
                </div>

                {/* =================================================
                    REVIEW STARS
                ================================================= */}

                <div
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-0.5
                    rounded-lg
                    border border-amber-100
                    bg-amber-50
                    px-2 py-1.5
                    dark:border-amber-500/10
                    dark:bg-amber-500/10
                  "
                >
                  {ratingStars.map((star) =>
                    star <= review.rating ? (
                      <FaStar
                        key={star}
                        className="
                          h-3 w-3
                          shrink-0
                          text-amber-400
                          sm:h-3.5 sm:w-3.5
                        "
                      />
                    ) : (
                      <FaRegStar
                        key={star}
                        className="
                          h-3 w-3
                          shrink-0
                          text-slate-300
                          dark:text-slate-600
                          sm:h-3.5 sm:w-3.5
                        "
                      />
                    )
                  )}
                </div>
              </div>

           {/* =================================================
    PREMIUM PURPLE COMMENT
================================================= */}

{review.comment && (
  <div
    className="
      group
      relative
      mt-5
      min-w-0
      overflow-hidden
      rounded-[24px]
      border
      border-[#d8c5ff]
      bg-gradient-to-br
      from-white
      via-[#faf8ff]
      to-[#f4efff]
      px-4
      py-5
      shadow-[0_12px_35px_rgba(111,76,255,0.08)]
      transition-all
      duration-500
      hover:border-[#c7adff]
      hover:shadow-[0_18px_45px_rgba(111,76,255,0.14)]

      sm:rounded-[28px]
      sm:px-5
      sm:py-6

      md:px-6
      md:py-7
    "
  >
    {/* =================================================
        SOFT BACKGROUND GLOW
    ================================================= */}

    <div
      className="
        pointer-events-none
        absolute
        -right-10
        -bottom-16
        h-40
        w-40
        rounded-full
        bg-gradient-to-br
        from-[#8b5cf6]/10
        to-[#ec4899]/10
        blur-2xl
        transition-all
        duration-700
        group-hover:scale-125
        group-hover:opacity-80
      "
    />

    <div
      className="
        pointer-events-none
        absolute
        -left-12
        -top-12
        h-28
        w-28
        rounded-full
        bg-[#8b5cf6]/[0.06]
        blur-2xl
      "
    />

    {/* =================================================
        HEADER
    ================================================= */}

    <div
      className="
        relative
        z-10
        mb-5
        flex
        min-w-0
        items-center
        gap-3
        sm:mb-6
      "
    >
      {/* PREMIUM COMMENT ICON */}

      <div
        className="
          relative
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[13px]
          bg-gradient-to-br
          from-[#7c3aed]
          via-[#8b5cf6]
          to-[#d946ef]
          text-[14px]
          !text-white
          shadow-[0_8px_22px_rgba(124,58,237,0.28)]
          transition-all
          duration-500
          group-hover:scale-105
          group-hover:shadow-[0_10px_28px_rgba(124,58,237,0.36)]
          sm:h-11
          sm:w-11
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            inset-[3px]
            rounded-[10px]
            border
            border-white/25
          "
        />

        <FaCommentDots className="relative z-10" />
      </div>

      {/* COMMENT TITLE */}

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.28em]
              !text-[#6d3df5]
              sm:text-xs
              sm:tracking-[0.30em]
            "
          >
            Comment
          </span>

          <span
            className="
              h-1
              w-1
              shrink-0
              rounded-full
              bg-[#a855f7]
            "
          />
        </div>

        {/* PREMIUM LINE */}

        <div
          className="
            mt-2
            h-[2px]
            w-20
            rounded-full
            bg-gradient-to-r
            from-[#7c3aed]
            via-[#a855f7]
            to-[#e879f9]
            sm:w-28
          "
        />
      </div>
    </div>

    {/* =================================================
        COMMENT CARD
    ================================================= */}

    <div
      className="
        relative
        z-10
        min-w-0
        overflow-hidden
        rounded-[20px]
        border
        border-[#d9c8ff]
        bg-gradient-to-br
        from-[#ffffff]
        via-[#faf9ff]
        to-[#f5f0ff]
        px-4
        py-5
        shadow-[0_8px_25px_rgba(105,72,180,0.06)]
        transition-all
        duration-500
        group-hover:border-[#c9b1ff]

        sm:rounded-[24px]
        sm:px-6
        sm:py-6
      "
    >
      {/* =================================================
          LARGE QUOTE
      ================================================= */}

      <span
        className="
          pointer-events-none
          absolute
          right-2
          top-[-10px]
          select-none
          font-serif
          text-[82px]
          font-bold
          leading-none
          !text-[#e8ddff]
          sm:right-4
          sm:text-[96px]
        "
      >
        ”
      </span>

      {/* =================================================
          QUOTE ICON
      ================================================= */}

      <div
        className="
          relative
          z-10
          mb-4
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-gradient-to-br
          from-[#7c3aed]
          via-[#8b5cf6]
          to-[#d946ef]
          font-serif
          text-[28px]
          font-bold
          !text-white
          shadow-[0_8px_22px_rgba(124,58,237,0.30)]
          transition-all
          duration-500
          group-hover:scale-105
          sm:h-12
          sm:w-12
        "
      >
        <span className="-mt-1">“</span>
      </div>

      {/* =================================================
          COMMENT TEXT + GRADIENT LINE
      ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          min-w-0
          items-stretch
          gap-4
          sm:gap-5
        "
      >
        {/* VERTICAL PREMIUM LINE */}

        <div
          className="
            w-[4px]
            shrink-0
            rounded-full
            bg-gradient-to-b
            from-[#7c3aed]
            via-[#a855f7]
            to-[#d946ef]
            shadow-[0_0_14px_rgba(168,85,247,0.25)]
            transition-all
            duration-500
            group-hover:shadow-[0_0_20px_rgba(168,85,247,0.40)]
          "
        />

        {/* TEXT */}

        <p
          className="
            min-w-0
            flex-1
            break-words
            pr-3
            text-[13px]
            font-medium
            leading-6
            !text-[#263153]
            [overflow-wrap:anywhere]

            sm:pr-6
            sm:text-[14px]
            sm:leading-7

            md:text-[15px]
            md:leading-7
          "
        >
          {review.comment}
        </p>
      </div>

      {/* =================================================
          BOTTOM GRADIENT DETAIL
      ================================================= */}

      <div
        className="
          relative
          z-10
          mt-5
          ml-[19px]
          flex
          items-center
          gap-2
        "
      >
        <span
          className="
            h-[3px]
            w-8
            rounded-full
            bg-gradient-to-r
            from-[#7c3aed]
            to-[#c084fc]
          "
        />

        <span
          className="
            h-1
            w-1
            rounded-full
            bg-[#a855f7]
          "
        />

        <span
          className="
            h-[2px]
            w-12
            rounded-full
            bg-[#e3d7ff]
          "
        />
      </div>
    </div>

    {/* =================================================
        PREMIUM FOOTER
    ================================================= */}

    <div
      className="
        relative
        z-10
        mt-4
        flex
        min-w-0
        items-center
        justify-between
        gap-3
        px-1
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-2
        "
      >
        <span
          className="
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            bg-gradient-to-r
            from-[#7c3aed]
            to-[#d946ef]
            shadow-[0_0_0_3px_rgba(139,92,246,0.10)]
          "
        />

        <span
          className="
            truncate
            text-[8px]
            font-bold
            uppercase
            tracking-[0.16em]
            !text-[#81729d]
            sm:text-[9px]
            md:text-[10px]
          "
        >
          Customer Experience
        </span>
      </div>

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-1.5
          min-[420px]:flex
        "
      >
        <span className="h-px w-6 bg-[#ded2f7]" />
        <span className="h-1 w-1 rounded-full bg-[#a855f7]" />
        <span className="h-px w-3 bg-[#ded2f7]" />
      </div>
    </div>
  </div>
)}
              {/* =================================================
                  FOOTER / DATE
              ================================================= */}

              <div
                className="
                  mt-4
                  flex
                  min-w-0
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-slate-100
                  pt-3.5
                  dark:border-slate-800
                  sm:mt-5
                  sm:pt-4
                "
              >
                <span
                  className="
                    min-w-0
                    break-words
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                    [overflow-wrap:anywhere]
                    sm:text-[11px]
                  "
                >
                  {review.createdAt
                    ? new Date(
                        review.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    font-semibold
                    text-slate-300
                    dark:text-slate-600
                  "
                >
                  Customer Review
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CustomerSalonReviews;