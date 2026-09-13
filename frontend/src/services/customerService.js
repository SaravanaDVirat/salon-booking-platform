import api from "./api";

export const getCustomers = async () => {
  const response = await api.get("/admin/users/role/CUSTOMER");
  return response.data;
};
export const createCustomer = async (customerData) => {
  const response = await api.post("/admin/users", customerData);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await api.put(
    `/admin/users/${id}`,
    customerData
  );

  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(
    `/admin/users/${id}`
  );

  return response.data;
};
export const activateCustomer = async (id) => {
  const response = await api.put(
    `/admin/users/${id}/activate`
  );

  return response.data;
};
export const deactivateCustomer = async (id) => {
  const response = await api.put(
    `/admin/users/${id}/deactivate`
  );

  return response.data;
};