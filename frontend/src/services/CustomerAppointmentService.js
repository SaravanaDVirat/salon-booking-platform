import customerInstance from "./CustomerInstance";

export const createCustomerAppointment = async (appointmentData) => {
  const response = await customerInstance.post(
    "/appointments",
    appointmentData
  );

  return response.data;
};

export const getCustomerAppointments = async () => {
  const response = await customerInstance.get(
    "/appointments/my"
  );

  return response.data;
};


export const getCustomerAppointmentById = async (appointmentId) => {
  const response = await customerInstance.get(
    `/appointments/${appointmentId}`
  );

  return response.data;
};


export const cancelCustomerAppointment = async (appointmentId) => {
  const response = await customerInstance.patch(
    `/appointments/${appointmentId}/cancel`,
    {}
  );

  return response.data;
};