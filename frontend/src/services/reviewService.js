import axios from "axios";

import api from "./api";

export const getAllReviewsAdmin = async () => {
  const response = await api.get(
    `/admin/reviews`
  );

  return response.data;
};


export const getSalonReviews = async (salonId) => {
  const response = await api.get(
    `/reviews/salon/${salonId}`
  );

  return response.data;
};


export const getSalonRating = async (salonId) => {
  const response = await api.get(
    `/reviews/salon/${salonId}/rating`
  );

  return response.data;
};