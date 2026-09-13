import React from "react";
import { Outlet } from "react-router-dom";

import CustomerHeader from "./CustomerHeader";
import CustomerFooter from "./CustomerFooter";

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">

      <CustomerHeader />

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>

      <CustomerFooter />

    </div>
  );
};

export default CustomerLayout;