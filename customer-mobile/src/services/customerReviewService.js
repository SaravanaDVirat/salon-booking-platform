import customerInstance from "./CustomerInstance";

// =====================================================
// CREATE CUSTOMER REVIEW
// =====================================================

export const createCustomerReview = async ({
  appointmentId,
  rating,
  comment,
}) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }

  if (!rating) {
    throw new Error("Rating is required");
  }

  const response = await customerInstance.post(
    "/reviews/",
    {
      appointmentId,
      rating,
      comment,
    }
  );

  return response.data;
};

// =====================================================
// GET SALON REVIEWS
// =====================================================

export const getCustomerSalonReviews = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await customerInstance.get(
    `/reviews/salon/${salonId}`
  );

  return response.data;
};

// =====================================================
// GET SALON RATING
// =====================================================

export const getCustomerSalonRating = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await customerInstance.get(
    `/reviews/salon/${salonId}/rating`
  );

  return response.data;
};