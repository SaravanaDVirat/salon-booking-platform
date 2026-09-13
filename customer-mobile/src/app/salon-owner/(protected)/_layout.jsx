import React from "react";
import { Slot } from "expo-router";
import SalonOwnerProtectedRoute from "../../../components/salon-owner/SalonOwnerProtectedRoute";
import SalonOwnerLayout from "../../../components/salon-owner/SalonOwnerLayout";

export default function ProtectedLayout() {
  return (
    <SalonOwnerProtectedRoute>
      <SalonOwnerLayout/>
    </SalonOwnerProtectedRoute>
  );
}