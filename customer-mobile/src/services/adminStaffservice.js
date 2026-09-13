import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL STAFF
============================================================ */

export const getAllStaff = async () => {
  const response = await adminInstance.get("/staff");

  return response.data;
};

/* ============================================================
   GET STAFF BY ID
============================================================ */

export const getStaffById = async (id) => {
  if (!id) {
    throw new Error("Staff ID is required");
  }

  const response = await adminInstance.get(
    `/staff/${id}`
  );

  return response.data;
};

/* ============================================================
   CREATE STAFF
============================================================ */

export const createStaff = async (formData) => {
  const response = await adminInstance.post(
    "/staff",
    formData
  );

  return response.data;
};

/* ============================================================
   UPDATE STAFF
============================================================ */

export const updateStaff = async (id, formData) => {
  if (!id) {
    throw new Error("Staff ID is required");
  }

  const response = await adminInstance.put(
    `/staff/${id}`,
    formData
  );

  return response.data;
};

/* ============================================================
   DELETE STAFF
============================================================ */

export const deleteStaff = async (id) => {
  if (!id) {
    throw new Error("Staff ID is required");
  }

  const response = await adminInstance.delete(
    `/staff/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE STAFF
============================================================ */

export const activateStaff = async (id) => {
  if (!id) {
    throw new Error("Staff ID is required");
  }

  const response = await adminInstance.patch(
    `/staff/${id}/activate`,
    {}
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE STAFF
============================================================ */

export const deactivateStaff = async (id) => {
  if (!id) {
    throw new Error("Staff ID is required");
  }

  const response = await adminInstance.patch(
    `/staff/${id}/deactivate`,
    {}
  );

  return response.data;
};