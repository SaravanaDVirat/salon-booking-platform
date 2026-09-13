import customerInstance from "./CustomerInstance";

// =====================================================
// GET CUSTOMER SALONS
// =====================================================
export const getCustomerSalons = async ({
  search = "",
  city = "",
  page = 1,
  limit = 9,
} = {}) => {
  const params = {
    page,
    limit,
  };

  if (search?.trim()) {
    params.search = search.trim();
  }

  if (city?.trim()) {
    params.city = city.trim();
  }

  const response = await customerInstance.get("/salons", {
    params,
  });

  return response.data;
};

// =====================================================
// GET CUSTOMER SALON BY ID
// =====================================================
export const getCustomerSalonById = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await customerInstance.get(
    `/salons/${salonId}`
  );

  return response.data;
};

// =====================================================
// GET SERVICES OF A SALON
// =====================================================
export const getCustomerSalonServices = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await customerInstance.get(
    `/services/salon/${salonId}`
  );

  return response.data;
};

// =====================================================
// GET STAFF BY SERVICE
// =====================================================
export const getCustomerStaffByService = async (
  salonId,
  serviceId
) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  if (!serviceId) {
    throw new Error("Service ID is required");
  }

  const response = await customerInstance.get(
    `/staff/salon/${salonId}/service/${serviceId}`
  );

  return response.data;
};

// =====================================================
// GET STAFF AVAILABILITY
// =====================================================
export const getCustomerStaffAvailability = async (
  staffId,
  date
) => {
  if (!staffId) {
    throw new Error("Staff ID is required");
  }

  if (!date) {
    throw new Error("Date is required");
  }

  const response = await customerInstance.get(
    `/staff/${staffId}/availability`,
    {
      params: {
        date,
      },
    }
  );

  return response.data;
};

// =====================================================
// GET AVAILABLE APPOINTMENT SLOTS
// =====================================================
export const getCustomerAvailableSlots = async ({
  salonId,
  serviceId,
  staffId,
  date,
}) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  if (!serviceId) {
    throw new Error("Service ID is required");
  }

  if (!staffId) {
    throw new Error("Staff ID is required");
  }

  if (!date) {
    throw new Error("Date is required");
  }

  const response = await customerInstance.get(
    "/appointments/available-slots",
    {
      params: {
        salonId,
        serviceId,
        staffId,
        date,
      },
    }
  );

  return response.data;
};