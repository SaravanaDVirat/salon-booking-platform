import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL CATEGORIES - ADMIN
============================================================ */

export const getAllCategoriesForAdmin = async () => {
  const response = await adminInstance.get(
    "/categories/admin/all"
  );

  return response.data;
};

/* ============================================================
   CREATE CATEGORY
============================================================ */

export const createCategory = async (categoryData) => {
  const response = await adminInstance.post(
    "/categories",
    categoryData
  );

  return response.data;
};

/* ============================================================
   UPDATE CATEGORY
============================================================ */

export const updateCategory = async (id, categoryData) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const response = await adminInstance.put(
    `/categories/${id}`,
    categoryData
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE CATEGORY
============================================================ */

export const deactivateCategory = async (id) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const response = await adminInstance.delete(
    `/categories/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE CATEGORY
============================================================ */

export const activateCategory = async (id) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const response = await adminInstance.patch(
    `/categories/${id}/activate`
  );

  return response.data;
};