import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("adminToken");
  const adminData = sessionStorage.getItem("adminData");

  if (!token || !adminData) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);

    if (admin.role !== "ADMIN") {
      sessionStorage.clear();
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    sessionStorage.clear();
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;