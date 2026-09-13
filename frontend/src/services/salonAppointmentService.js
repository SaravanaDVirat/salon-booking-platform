import axiosInstance from "./axiosInstance";

export const getAllAppointments = async () => {
  const response = await axiosInstance.get(
    "/appointments"
  );

  return response.data;
};

export const getAppointmentById = async (id) => {
  const response = await axiosInstance.get(
    `/appointments/${id}`
  );

  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await axiosInstance.patch(
    `appointments/${id}/cancel`,
    {}
  );

  return response.data;
};

export const updateAppointmentStatus = async (
  id,
  status
) => {
  const response = await axiosInstance.patch(
    `appointments/${id}/status`,
    { status }
  );

  return response.data;
};