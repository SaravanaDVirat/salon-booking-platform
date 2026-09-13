import React, { useEffect, useState } from "react";

import {
  FaStar,
  FaXmark,
  FaRegStar,
  FaCommentDots,
  FaCheck,
  FaSpinner,
  FaScissors,
  FaUser,
} from "react-icons/fa6";

import { createCustomerReview } from "../../services/customerReviewService";

const CustomerReviewModal = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) {
    return null;
  }

  const salon = appointment.salon || {};
  const service = appointment.service || {};
  const staff = appointment.staff || {};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await createCustomerReview({
        appointmentId: appointment._id || appointment.id,
        rating,
        comment: comment.trim(),
      });

      if (onSuccess) {
        onSuccess(response);
      }

      onClose();
    } catch (err) {
      console.error("Create review error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  const ratingText = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  return (
    <div
      className="
        fixed inset-0 z-[3000]
        flex items-center justify-center
        bg-slate-950/60
        p-2
        backdrop-blur-sm

        sm:p-4
        md:p-6
      "
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      {/* =========================================================
          MODAL
      ========================================================= */}

      <div
        className="
          flex
          w-full
          max-w-[600px]

          max-h-[calc(100dvh-16px)]

          flex-col
          overflow-hidden

          rounded-2xl
          border
          border-slate-200
          bg-white

          shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)]

          sm:max-h-[calc(100dvh-32px)]
          sm:rounded-3xl

          md:max-h-[calc(100dvh-48px)]
        "
      >
        {/* =======================================================
            HEADER
        ======================================================= */}

        <header
          className="
            relative
            shrink-0

            border-b
            border-violet-500/20

            bg-violet-700

            px-4
            py-4

            sm:px-6
            sm:py-5

            md:px-7
            md:py-6
          "
        >
          {/* CLOSE BUTTON */}

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close review modal"
            className="
              absolute
              right-3
              top-3

              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-lg
              border
              border-white/20
              bg-white/10

              text-white

              transition-all
              duration-200

              hover:bg-white/20
              active:scale-95

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:right-4
              sm:top-4
              sm:h-9
              sm:w-9

              md:h-10
              md:w-10
            "
          >
            <FaXmark className="text-sm sm:text-base" />
          </button>

          {/* HEADER CONTENT */}

          <div
            className="
              min-w-0
              pr-10

              sm:pr-12
            "
          >
            {/* ICON */}

            <div
              className="
                mb-3

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-xl
                bg-white/15

                text-white

                sm:mb-4
                sm:h-11
                sm:w-11

                md:h-12
                md:w-12
              "
            >
              <FaCommentDots className="text-base sm:text-lg" />
            </div>

            {/* TITLE */}

            <h2
              className="
                break-words

                text-lg
                font-bold
                leading-tight
                text-white

                sm:text-xl

                md:text-2xl
              "
            >
              Share Your Experience
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                mt-1.5
                max-w-[500px]

                break-words

                text-[11px]
                leading-5
                text-violet-100

                sm:text-xs
                sm:leading-5

                md:text-sm
              "
            >
              Your feedback helps other customers choose better.
            </p>
          </div>
        </header>

        {/* =======================================================
            FORM
        ======================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
            bg-white
          "
        >
          {/* =====================================================
              SCROLLABLE CONTENT
          ===================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain

              px-4
              py-5

              sm:px-6
              sm:py-6

              md:px-7
              md:py-7

              [scrollbar-width:thin]
              [scrollbar-color:rgba(148,163,184,0.5)_transparent]
            "
          >
            {/* =================================================
                APPOINTMENT
            ================================================= */}

            <section
              className="
                mb-6

                rounded-xl
                border
                border-slate-200
                bg-slate-50

                p-4

                sm:mb-7
                sm:p-5
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-start
                  gap-3

                  sm:gap-4
                "
              >
                {/* ICON */}

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl
                    bg-violet-100

                    text-violet-600

                    sm:h-11
                    sm:w-11
                  "
                >
                  <FaScissors className="text-sm sm:text-base" />
                </div>

                {/* DETAILS */}

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      mb-1

                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-violet-600

                      sm:text-[10px]
                    "
                  >
                    Your Appointment
                  </p>

                  <h3
                    className="
                      break-words
                      [overflow-wrap:anywhere]

                      text-sm
                      font-bold
                      leading-5
                      text-slate-900

                      sm:text-base
                      sm:leading-6
                    "
                  >
                    {salon.name || "Salon"}
                  </h3>

                  <p
                    className="
                      mt-1

                      break-words
                      [overflow-wrap:anywhere]

                      text-xs
                      font-medium
                      leading-5
                      text-slate-600

                      sm:text-sm
                    "
                  >
                    {service.name || "Service"}
                  </p>

                  {staff.name && (
                    <div
                      className="
                        mt-2.5

                        inline-flex
                        max-w-full
                        items-center
                        gap-1.5

                        rounded-lg
                        border
                        border-slate-200
                        bg-white

                        px-2.5
                        py-1.5

                        sm:gap-2
                      "
                    >
                      <FaUser
                        className="
                          shrink-0
                          text-[9px]
                          text-slate-400
                        "
                      />

                      <span
                        className="
                          min-w-0
                          break-words
                          [overflow-wrap:anywhere]

                          text-[10px]
                          font-semibold
                          leading-4
                          text-slate-600

                          sm:text-xs
                        "
                      >
                        {staff.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                RATING
            ================================================= */}

            <section className="mb-7">
              <div className="mb-4 text-center sm:mb-5">
                <div
                  className="
                    mx-auto
                    mb-2.5

                    flex
                    h-9
                    w-9
                    items-center
                    justify-center

                    rounded-full
                    bg-amber-50

                    text-amber-500
                  "
                >
                  <FaStar className="text-sm" />
                </div>

                <h3
                  className="
                    break-words

                    text-sm
                    font-bold
                    leading-6
                    text-slate-900

                    sm:text-base

                    md:text-lg
                  "
                >
                  How was your experience?
                </h3>

                <p
                  className="
                    mt-1

                    break-words

                    text-[10px]
                    leading-5
                    text-slate-400

                    sm:text-xs
                  "
                >
                  Tap a star to rate your appointment
                </p>
              </div>

              {/* STARS */}

              <div
                className="
                  flex
                  w-full
                  items-center
                  justify-center

                  gap-1.5

                  sm:gap-2

                  md:gap-2.5
                "
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= displayRating;

                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`Rate ${star} star${
                        star > 1 ? "s" : ""
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center

                        rounded-xl
                        border

                        transition-all
                        duration-150

                        active:scale-95

                        sm:h-12
                        sm:w-12

                        md:h-13
                        md:w-13

                        ${
                          active
                            ? `
                              border-amber-300
                              bg-amber-50
                              text-amber-500
                            `
                            : `
                              border-slate-200
                              bg-white
                              text-slate-300

                              hover:border-amber-200
                              hover:bg-amber-50
                            `
                        }
                      `}
                    >
                      {active ? (
                        <FaStar
                          className="
                            text-lg
                            text-amber-400

                            sm:text-xl
                          "
                        />
                      ) : (
                        <FaRegStar
                          className="
                            text-lg
                            text-slate-300

                            sm:text-xl
                          "
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* RATING TEXT */}

              <div className="mt-3 text-center sm:mt-4">
                {displayRating ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5

                      rounded-full
                      bg-amber-50

                      px-3
                      py-1.5

                      text-xs
                      font-bold
                      text-amber-600

                      sm:text-sm
                    "
                  >
                    <FaStar className="text-[9px]" />

                    {ratingText[displayRating]}
                  </span>
                ) : (
                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-slate-400

                      sm:text-xs
                    "
                  >
                    No rating selected
                  </span>
                )}
              </div>
            </section>

            {/* =================================================
                COMMENT
            ================================================= */}

            <section className="mb-6">
              <div
                className="
                  mb-2.5

                  flex
                  flex-wrap
                  items-center
                  justify-between

                  gap-2
                "
              >
                <label
                  className="
                    break-words

                    text-xs
                    font-bold
                    leading-5
                    text-slate-800

                    sm:text-sm
                  "
                >
                  Tell us more

                  <span
                    className="
                      ml-1
                      font-medium
                      text-slate-400
                    "
                  >
                    (Optional)
                  </span>
                </label>

                <span
                  className="
                    shrink-0

                    rounded-md
                    bg-slate-100

                    px-2
                    py-1

                    text-[9px]
                    font-semibold
                    text-slate-400

                    sm:text-[10px]
                  "
                >
                  {comment.length}/500
                </span>
              </div>

              {/* TEXTAREA */}

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="What did you like about the salon, service or staff?"
                disabled={submitting}
                className="
                  block
                  min-h-[115px]
                  w-full
                  resize-none

                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50

                  px-3.5
                  py-3

                  text-xs
                  font-medium
                  leading-6
                  text-slate-800

                  outline-none

                  placeholder:text-slate-400

                  transition-all
                  duration-150

                  focus:border-violet-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-violet-500/10

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:min-h-[125px]
                  sm:px-4
                  sm:py-3.5
                  sm:text-sm
                "
              />
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  mb-2

                  flex
                  min-w-0
                  items-start
                  gap-2.5

                  rounded-xl
                  border
                  border-red-200
                  bg-red-50

                  px-3
                  py-3

                  sm:gap-3
                  sm:px-4
                "
              >
                <span
                  className="
                    flex
                    h-5
                    w-5
                    shrink-0
                    items-center
                    justify-center

                    rounded-full
                    bg-red-100

                    text-[10px]
                    font-bold
                    text-red-600

                    sm:h-6
                    sm:w-6
                  "
                >
                  !
                </span>

                <span
                  className="
                    min-w-0

                    break-words
                    [overflow-wrap:anywhere]

                    pt-0.5

                    text-[10px]
                    font-semibold
                    leading-5
                    text-red-600

                    sm:text-xs
                  "
                >
                  {error}
                </span>
              </div>
            )}
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer
            className="
              shrink-0

              border-t
              border-slate-200
              bg-white

              px-4
              py-3

              sm:px-6
              sm:py-4

              md:px-7
            "
          >
            <div
              className="
                flex
                flex-col-reverse
                gap-2.5

                sm:flex-row
                sm:items-center
                sm:justify-end
                sm:gap-3
              "
            >
              {/* MAYBE LATER */}

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="
                  flex
                  min-h-10
                  w-full
                  items-center
                  justify-center

                  rounded-xl
                  border
                  border-slate-200
                  bg-white

                  px-5
                  py-2.5

                  text-xs
                  font-bold
                  text-slate-600

                  transition-all
                  duration-150

                  hover:border-slate-300
                  hover:bg-slate-50

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:min-h-11
                  sm:w-auto
                  sm:min-w-[120px]
                  sm:text-sm
                "
              >
                Maybe Later
              </button>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting || !rating}
                className="
                  flex
                  min-h-10
                  w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  bg-violet-600

                  px-5
                  py-2.5

                  text-xs
                  font-bold
                  text-white

                  transition-all
                  duration-150

                  hover:bg-violet-700

                  active:scale-[0.98]

                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:min-h-11
                  sm:w-auto
                  sm:min-w-[155px]
                  sm:text-sm
                "
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-[10px]" />

                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="text-[10px]" />

                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default CustomerReviewModal;