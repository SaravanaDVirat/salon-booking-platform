import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL SALONS
============================================================ */

export const getAdminSalons = async () => {
  const response = await adminInstance.get(
    "/admin/salons"
  );

  return response.data;
};

/* ============================================================
   GET SINGLE SALON
============================================================ */

export const getSalonByAdmin = async (id) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.get(
    `/admin/salons/${id}`
  );

  return response.data;
};

/* ============================================================
   UPDATE SALON
============================================================ */

export const updateSalon = async (id, data) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.put(
    `/salons/${id}`,
    data
  );

  return response.data;
};

/* ============================================================
   DELETE SALON
============================================================ */

export const deleteSalon = async (id) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.delete(
    `/salons/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE SALON
============================================================ */

export const activateSalon = async (id) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.put(
    `/admin/salons/${id}/activate`,
    {}
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE SALON
============================================================ */

export const deactivateSalon = async (id) => {
  if (!id) {
    throw new Error("Salon ID is required");
  }

  const response = await adminInstance.put(
    `/admin/salons/${id}/deactivate`,
    {}
  );

  return response.data;
};