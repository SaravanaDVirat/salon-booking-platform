import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const CustomerProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const user = sessionStorage.getItem("user");

  const isAuthenticated =
    token && role && user;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/customer/login"
        replace
        state={{
          from: location.pathname + location.search,
        }}
      />
    );
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default CustomerProtectedRoute;