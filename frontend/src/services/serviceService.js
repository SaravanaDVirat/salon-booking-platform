import api from "./api";

export const getAllServicesAdmin = async (params = {}) => {
  const response = await api.get("/admin/services", {
    params,
  });

  return response.data;
};


export const getServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};


export const createService = async (serviceData) => {
  const response = await api.post("/services", serviceData);
  return response.data;
};

export const updateService = async (id, serviceData) => {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data;
};

export const deactivateService = async (id) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};
export const activateService = async (id) => {
  const response = await api.patch(`/services/${id}/activate`);
  return response.data;

};

