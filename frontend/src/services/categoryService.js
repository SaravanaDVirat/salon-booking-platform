import api from "./api";

export const getAllCategoriesForAdmin = async () => {
  const response = await api.get("/categories/admin/all");
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};
export const updateCategory = async (id, categoryData) => {
  const response = await api.put(
    `/categories/${id}`,
    categoryData
  );

  return response.data;
};
export const deactivateCategory = async (id) => {
  const response = await api.delete(
    `/categories/${id}`
  );

  return response.data;
};

export const activateCategory = async (id) => {
  const response = await api.patch(
    `/categories/${id}/activate`
  );

  return response.data;
};