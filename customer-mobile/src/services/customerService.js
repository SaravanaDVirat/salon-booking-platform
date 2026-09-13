import adminInstance from "./AdminInstance";

/* ============================================================
   GET ALL CUSTOMERS
============================================================ */

export const getCustomers = async () => {
  const response = await adminInstance.get(
    "/admin/users/role/CUSTOMER"
  );

  return response.data;
};

/* ============================================================
   CREATE CUSTOMER
============================================================ */

export const createCustomer = async (customerData) => {
  const response = await adminInstance.post(
    "/admin/users",
    customerData
  );

  return response.data;
};

/* ============================================================
   UPDATE CUSTOMER
============================================================ */

export const updateCustomer = async (id, customerData) => {
  if (!id) {
    throw new Error("Customer ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}`,
    customerData
  );

  return response.data;
};

/* ============================================================
   DELETE CUSTOMER
============================================================ */

export const deleteCustomer = async (id) => {
  if (!id) {
    throw new Error("Customer ID is required");
  }

  const response = await adminInstance.delete(
    `/admin/users/${id}`
  );

  return response.data;
};

/* ============================================================
   ACTIVATE CUSTOMER
============================================================ */

export const activateCustomer = async (id) => {
  if (!id) {
    throw new Error("Customer ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}/activate`
  );

  return response.data;
};

/* ============================================================
   DEACTIVATE CUSTOMER
============================================================ */

export const deactivateCustomer = async (id) => {
  if (!id) {
    throw new Error("Customer ID is required");
  }

  const response = await adminInstance.put(
    `/admin/users/${id}/deactivate`
  );

  return response.data;
};