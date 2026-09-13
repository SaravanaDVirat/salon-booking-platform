import customerInstance from "./CustomerInstance";

export const createCustomerReview = async ({
  appointmentId,
  rating,
  comment,
}) => {
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


export const getCustomerSalonReviews = async (salonId) => {
  const response = await customerInstance.get(
    `/reviews/salon/${salonId}`
  );

  return response.data;
};


export const getCustomerSalonRating = async (salonId) => {
  const response = await customerInstance.get(
    `/reviews/salon/${salonId}/rating`
  );

  return response.data;
};