import React from "react";
import CustomerProtectedRoute from "../../../components/customers/CustomerProtectedRoute";

export default function ProtectedCustomerLayout() {
  return (
    <CustomerProtectedRoute allowedRoles={["CUSTOMER"]} />
  );
}