import axiosInstance from "./axiosInstance";

export const getSalonServices = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await axiosInstance.get(
    `/services/salon/${salonId}/manage`
  );

  return response.data;
};

export const getServiceById = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await axiosInstance.get(`/services/${id}`);

  return response.data;
};

export const createService = async (serviceData) => {
  const response = await axiosInstance.post(
    "/services",
    serviceData
  );

  return response.data;
};

export const updateService = async (id, serviceData) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await axiosInstance.put(
    `/services/${id}`,
    serviceData
  );

  return response.data;
};

export const deleteService = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await axiosInstance.delete(
    `/services/${id}`
  );

  return response.data;
};

export const activateService = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await axiosInstance.patch(
    `/services/${id}/activate`
  );

  return response.data;
};