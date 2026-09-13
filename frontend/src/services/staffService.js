import { AppleIcon } from "lucide-react";
import api from "./api";

export const getAllStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};

export const getStaffById = async (id) => {
  const response = await api.get(
    `staff/${id}`
  );

  return response.data;
};

export const createStaff = async (formData) => {
  const response = await api.post(
    "/staff",
    formData
  );

  return response.data;
};


export const updateStaff = async (
  id,
  formData
) => {
  const response = await api.put(
    `/staff/${id}`,
    formData
  );

  return response.data;
};
export const deleteStaff = async (id) => {
  const response = await api.delete(
    `staff/${id}`
  );

  return response.data;
};

export const activateStaff = async (id) => {
  const response = await api.patch(
    `staff/${id}/activate`,
    {}
  );

  return response.data;
};

export const deactivateStaff = async (id) => {
  const response = await api.patch(
    `staff/${id}/deactivate`,
    {}
  );

  return response.data;
};