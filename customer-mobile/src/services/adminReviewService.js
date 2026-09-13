import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL REVIEWS - ADMIN
============================================================ */

export const getAllReviewsAdmin = async () => {
  const response = await adminInstance.get(
    "/admin/reviews"
  );

  return response.data;
};

/* ============================================================
   GET ALL REVIEWS FOR A SALON
============================================================ */

export const getSalonReviews = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.get(
    `/reviews/salon/${salonId}`
  );

  return response.data;
};

/* ============================================================
   GET SALON RATING
============================================================ */

export const getSalonRating = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.get(
    `/reviews/salon/${salonId}/rating`
  );

  return response.data;
};