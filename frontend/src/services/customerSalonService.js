import customerInstance from "./CustomerInstance";

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

export const getCustomerSalonById = async (salonId) => {
  const response = await customerInstance.get(`/salons/${salonId}`);

  return response.data;
};

export const getCustomerSalonServices = async (salonId) => {
  if (!salonId) {
    throw new Error("Salon ID is required");
  }

  const response = await customerInstance.get(
    `/services/salon/${salonId}`
  );

  return response.data;
};

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