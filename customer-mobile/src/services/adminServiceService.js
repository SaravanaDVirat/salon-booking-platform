import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL SERVICES - ADMIN
============================================================ */

export const getAllServicesAdmin = async (params = {}) => {
  const response = await adminInstance.get(
    "/admin/services",
    {
      params,
    }
  );

  return response.data;
};

/* ============================================================
   GET SERVICE BY ID
============================================================ */

export const getServiceById = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await adminInstance.get(
    `/services/${id}`
  );

  return response.data;
};

/* ============================================================
   CREATE SERVICE
============================================================ */

export const createService = async (serviceData) => {
  const response = await adminInstance.post(
    "/services",
    serviceData
  );

  return response.data;
};

/* ============================================================
   UPDATE SERVICE
============================================================ */

export const updateService = async (id, serviceData) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await adminInstance.put(
    `/services/${id}`,
    serviceData
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE SERVICE
============================================================ */

export const deactivateService = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await adminInstance.delete(
    `/services/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE SERVICE
============================================================ */

export const activateService = async (id) => {
  if (!id) {
    throw new Error("Service ID is required");
  }

  const response = await adminInstance.patch(
    `/services/${id}/activate`
  );

  return response.data;
};