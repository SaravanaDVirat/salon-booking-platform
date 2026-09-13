import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL APPOINTMENTS - ADMIN
============================================================ */

export const getAllAppointmentsAdmin = async () => {
  const response = await adminInstance.get(
    "/admin/appointments"
  );

  return response.data;
};

/* ============================================================
   GET APPOINTMENT BY ID
============================================================ */

export const getAppointmentById = async (id) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  const response = await adminInstance.get(
    `/appointments/${id}`
  );

  return response.data;
};

/* ============================================================
   UPDATE APPOINTMENT STATUS
============================================================ */

export const updateAppointmentStatus = async (id, status) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  const response = await adminInstance.patch(
    `/appointments/${id}/status`,
    { status }
  );

  return response.data;
};

/* ============================================================
   CANCEL APPOINTMENT
============================================================ */

export const cancelAppointment = async (id) => {
  if (!id) {
    throw new Error("Appointment ID is required");
  }

  const response = await adminInstance.patch(
    `/appointments/${id}/cancel`
  );

  return response.data;
};