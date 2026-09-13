import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';
import AdminLayout from "./components/AdminLayout";
import Customers from "./pages/admin/Customers";
import Salons from "./pages/admin/Salons";
import SalonOwners from "./pages/admin/SalonOwners";
import StaffManagement from "./pages/admin/StaffManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import AppointmentManagement from "./pages/admin/AppointmentManagement";
import ReviewsManagement from "./pages/admin/ReviewsManagement";
import SalonOwnerLogin from "./pages/salon/SalonOwnerLogin";
import SalonOwnerRegister from "./pages/salon/SalonOwnerRegister";

import SalonOwnerLayout from "./layouts/SalonOwnerLayout";
import SalonOwnerDashboard from "./pages/salon/SalonOwnerDashboard";
import SalonProtectedRoute from "./components/salonProtectedRoute";
import MySalons from "./pages/salon/MySalons";
import ServiceManagement from "./pages/salon/ServiceManagement";
import StaffsManagement from "./pages/salon/StaffsManagement";
import AppointmentsManagement from "./pages/salon/AppointmentsManagement";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerProtectedRoute from "./routes/CustomerProtectedRoute";
import CustomerLayout from "./components/customer/CustomerLayout";
import SalonDiscovery from "./pages/customer/SalonDiscovery";
import SalonDetails from "./pages/customer/SalonDetails";
import SalonServices from "./pages/customer/SalonServices";
import CustomerStaffSelection from "./pages/customer/CustomerStaffSelection";
import CustomerStaffDateSlots from "./pages/customer/CustomerStaffDateSlots";
import CustomerAppointmentConfirm from "./pages/customer/CustomerAppointmentConfirm";
import CustomerMyAppointments from "./pages/customer/CustomerAppointments";
import CustomerAppointmentDetails from "./pages/customer/CustomerAppointmentDetails";
import CustomerSalonReviews from "./pages/customer/CustomerSalonReviews";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
     <ScrollToTop />
      <Routes>

       <Route
          path="/"
          element={<CustomerHome />}
        />

        <Route
          path="/customer/login"
          element={<CustomerLogin />}
        />

        <Route
          path="/customer/register"
          element={<CustomerRegister />}
        />

        <Route element={<CustomerProtectedRoute />}>

          <Route element={<CustomerLayout />}>

            <Route
              path="/salons"
              element={<SalonDiscovery />}
            />

            <Route
              path="/salons/:id"
              element={<SalonDetails />}
            />

             <Route
    path="/salons/:salonId/services"
    element={<SalonServices />}
  />

  <Route
  path="/salons/:salonId/services/:serviceId/staff"
  element={<CustomerStaffSelection />}
/>

<Route
  path="/salons/:salonId/services/:serviceId/staff/:staffId/date"
  element={<CustomerStaffDateSlots />}
/>

<Route
  path="/salons/:salonId/services/:serviceId/staff/:staffId/confirm"
  element={
    <CustomerAppointmentConfirm />
  }
/>

<Route
  path="/customer/appointments"
  element={
    <CustomerMyAppointments />
  }
/>

<Route
  path="/customer/appointments/:id"
  element={
    <CustomerAppointmentDetails />
  }
/>

<Route
  path="/customer/salons/:salonId/reviews"
  element={<CustomerSalonReviews />}
/>

          </Route>

        </Route>


        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

 
      <Route element={<ProtectedRoute/>}>
        <Route
            path="/admin"
            element={<AdminLayout />}>
             <Route
          path="dashboard"
          element={<AdminDashboard />}/>

           <Route path="customers" element={<Customers />} />
           <Route
    path="salons"
    element={<Salons />}/>

    <Route path="owners" element={<SalonOwners/>}/>

    <Route
  path="staff"
  element={<StaffManagement />}/>

  <Route
  path="services"
  element={<ServicesManagement />}/>

<Route
  path="categories"
  element={<CategoriesManagement />}/>

  <Route
    path="appointments"
    element={<AppointmentManagement />}
  />

<Route
  path="reviews"
  element={<ReviewsManagement />}
/>
        </Route>
      </Route>
<Route
  path="/salon-owner/login"
  element={<SalonOwnerLogin />}
/>

<Route
  path="/salon-owner/register"
  element={<SalonOwnerRegister />}/>

     <Route element={
          <SalonProtectedRoute
          />
        }>

          <Route
            path="/salon-owner"
            element={<SalonOwnerLayout />}
          >

            <Route
              index
              element={
                <Navigate
                  to="/salon-owner/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={
                <SalonOwnerDashboard />
              }
            />

            <Route
              path="salon"
              element={
                <MySalons />
              }
            />

             <Route
              path="services"
              element={
                <ServiceManagement />
              }
            />

            <Route
              path="staff"
              element={
                <StaffsManagement />
              }
            />

            <Route
              path="appointments"
              element={
                <AppointmentsManagement />
              }
            />

          </Route>

        </Route>

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;