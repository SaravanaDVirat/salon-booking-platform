import axiosInstance from "./axiosInstance";

/* =========================================================
   SALON OWNER DASHBOARD
========================================================= */

export const getOwnerDashboard = async () => {
  const response = await axiosInstance.get(
    "/salons/owner/dashboard"
  );

  return response.data;
};

/* =========================================================
   GET MY SALONS
========================================================= */

export const getMySalons = async () => {
  const response = await axiosInstance.get(
    "/salons/owner/my-salons"
  );

  return response.data;
};

/* =========================================================
   CREATE SALON
========================================================= */

export const createSalon = async (salonData) => {
  const response = await axiosInstance.post(
    "/salons",
    salonData
  );

  return response.data;
};

/* =========================================================
   UPDATE SALON
========================================================= */

export const updateSalon = async (id, salonData) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await axiosInstance.put(
    `/salons/${id}`,
    salonData
  );

  return response.data;
};

/* =========================================================
   DELETE SALON
========================================================= */

export const deleteSalon = async (id) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await axiosInstance.delete(
    `/salons/${id}`
  );

  return response.data;
};

/* =========================================================
   UPDATE SALON STATUS
========================================================= */

export const updateSalonStatus = async (id, isActive) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await axiosInstance.patch(
    `/salons/${id}/status`,
    {
      isActive,
    }
  );

  return response.data;
};