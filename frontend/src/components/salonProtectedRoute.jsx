import { Navigate, Outlet, useLocation } from "react-router-dom";

const SalonOwnerProtectedRoute = () => {
  const location = useLocation();

  const token = sessionStorage.getItem("token");
  const userData = sessionStorage.getItem("user");

  if (!token) {
    return (
      <Navigate
        to="/salon-owner/login"
        replace
        state={{ from: location }}
      />
    );
  }

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Invalid user session");
  }

  if (!user || user.role !== "SALON_OWNER") {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return (
      <Navigate
        to="/salon-owner/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default SalonOwnerProtectedRoute;