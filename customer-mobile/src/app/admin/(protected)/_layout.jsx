import React from "react";
import { Slot } from "expo-router";
import AdminProtectedRoute from "../../../components/admin/AdminProtectedRoute";
import AdminLayout from "../../../components/admin/AdminLayout";

export default function AdminProtectedLayout() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <Slot />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}