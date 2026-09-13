import axiosInstance from "./axiosInstance";

// ============================================================
// GET ALL APPOINTMENTS
// ============================================================

export const getAllAppointments = async () => {
  const response = await axiosInstance.get("/appointments");

  return response.data;
};

// ============================================================
// GET APPOINTMENT BY ID
// ============================================================

export const getAppointmentById = async (id) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  const response = await axiosInstance.get(
    `/appointments/${id}`
  );

  return response.data;
};

// ============================================================
// CANCEL APPOINTMENT
// ============================================================

export const cancelAppointment = async (id) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  const response = await axiosInstance.patch(
    `/appointments/${id}/cancel`,
    {}
  );

  return response.data;
};

// ============================================================
// UPDATE APPOINTMENT STATUS
// ============================================================

export const updateAppointmentStatus = async (
  id,
  status
) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  if (!status) {
    throw new Error("Appointment status is required");
  }

  const response = await axiosInstance.patch(
    `/appointments/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};