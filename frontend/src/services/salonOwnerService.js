import api from "./api";
import axiosInstance from "./axiosInstance";

export const getSalonOwners = async () => {
  const response = await api.get(
    "/admin/users/role/SALON_OWNER"
  );

  return response.data;
};

export const createSalonOwner = async (data) => {
  const response = await api.post(
    "/admin/users",
    {
      ...data,
      role: "SALON_OWNER",
    }
  );

  return response.data;
};

export const updateSalonOwner = async (id, data) => {
  const response = await api.put(
    `/admin/users/${id}`,
    data
  );

  return response.data;
};

export const deleteSalonOwner = async (id) => {
  const response = await api.delete(
    `/admin/users/${id}`
  );

  return response.data;
};

export const activateSalonOwner = async (id) => {
  const response = await api.put(
    `/admin/users/${id}/activate`,
    {}
  );

  return response.data;
};

export const deactivateSalonOwner = async (id) => {
  const response = await api.put(
    `/admin/users/${id}/deactivate`,
    {}
  );

  return response.data;
};

export const getOwnerDashboard = async () => {
  const response = await axiosInstance.get(
    "/salons/owner/dashboard"
  );

  return response.data;
};


export const getMySalons = async () => {
  const response = await axiosInstance.get(
    "/salons/owner/my-salons"
  );

  return response.data;
};

export const createSalon = async (salonData) => {
  const response = await axiosInstance.post(
    "/salons",
    salonData
  );

  return response.data;
};


export const updateSalon = async (id, salonData) => {
  const response = await axiosInstance.put(
    `/salons/${id}`,
    salonData
  );

  return response.data;
};
export const deleteSalon = async (id) => {
  const response = await axiosInstance.delete(
    `/salons/${id}`
  );

  return response.data;
};
export const updateSalonStatus = async (id, isActive) => {
  const response = await axiosInstance.patch(
    `/salons/${id}/status`,
    {
      isActive
    }
  );

  return response.data;
};