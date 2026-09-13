import axios from "axios";
import api from "./api";


export const getAllAppointmentsAdmin = async () => {
  const response = await api.get(
    "/admin/appointments"
  );

  return response.data;
};
export const getAppointmentById = async (id) => {
  const response = await api.get(
    `/appointments/${id}`
  );

  return response.data;
};
export const updateAppointmentStatus = async (id, status) => {
  const response = await api.patch(
    `/appointments/${id}/status`,
    { status }
  );

  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.patch(`/appointments/${id}/cancel`);

  return response.data;
};