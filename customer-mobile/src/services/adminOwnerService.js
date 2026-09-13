import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL SALON OWNERS
============================================================ */

export const getSalonOwners = async () => {
  const response = await adminInstance.get(
    "/admin/users/role/SALON_OWNER"
  );

  return response.data;
};

/* ============================================================
   CREATE SALON OWNER
============================================================ */

export const createSalonOwner = async (data) => {
  const response = await adminInstance.post(
    "/admin/users",
    {
      ...data,
      role: "SALON_OWNER",
    }
  );

  return response.data;
};

/* ============================================================
   UPDATE SALON OWNER
============================================================ */

export const updateSalonOwner = async (id, data) => {
  if (!id) {
    throw new Error("Salon owner ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}`,
    data
  );

  return response.data;
};

/* ============================================================
   DELETE SALON OWNER
============================================================ */

export const deleteSalonOwner = async (id) => {
  if (!id) {
    throw new Error("Salon owner ID is required");
  }

  const response = await adminInstance.delete(
    `/admin/users/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE SALON OWNER
============================================================ */

export const activateSalonOwner = async (id) => {
  if (!id) {
    throw new Error("Salon owner ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}/activate`,
    {}
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE SALON OWNER
============================================================ */

export const deactivateSalonOwner = async (id) => {
  if (!id) {
    throw new Error("Salon owner ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}/deactivate`,
    {}
  );

  return response.data;
};