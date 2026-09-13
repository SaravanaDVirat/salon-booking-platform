import customerInstance from "./CustomerInstance";

// =====================================================
// CREATE APPOINTMENT
// =====================================================

export const createCustomerAppointment = async (appointmentData) => {
  try {
    const response = await customerInstance.post(
      "/appointments",
      appointmentData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create appointment error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// =====================================================
// GET MY APPOINTMENTS
// =====================================================

export const getCustomerAppointments = async () => {
  try {
    const response = await customerInstance.get(
      "/appointments/my"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get customer appointments error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// =====================================================
// GET APPOINTMENT BY ID
// =====================================================

export const getCustomerAppointmentById = async (appointmentId) => {
  try {
    const response = await customerInstance.get(
      `/appointments/${appointmentId}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get appointment by ID error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};

// =====================================================
// CANCEL APPOINTMENT
// =====================================================

export const cancelCustomerAppointment = async (appointmentId) => {
  try {
    const response = await customerInstance.patch(
      `/appointments/${appointmentId}/cancel`,
      {}
    );

    return response.data;
  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error?.response?.data || error.message
    );

    throw error;
  }
};