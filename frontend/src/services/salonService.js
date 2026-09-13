import api from "./api";

export const getAdminSalons = async () => {
  const response = await api.get(
    "/admin/salons"
  );

  return response.data;
};

export const getSalonByAdmin = async (id) => {
  const response = await api.get(
    `/admin/salons/${id}`
  );

  return response.data;
};
export const updateSalon = async (id, data) => {
  const response = await api.put(
    `/salons/${id}`,
    data
  );

  return response.data;
};
export const deleteSalon = async (id) => {
  const response = await api.delete(
    `/salons/${id}`
  );

  return response.data;
};

export const activateSalon = async (id) => {
  const response = await api.put(
    `/admin/salons/${id}/activate`,
    {}
  );

  return response.data;
};

export const deactivateSalon = async (id) => {
  const response = await api.put(
    `/admin/salons/${id}/deactivate`,
    {}
  );

  return response.data;
};