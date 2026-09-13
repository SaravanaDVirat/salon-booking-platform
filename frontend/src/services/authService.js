import axios from "axios";

import axiosInstance from "./axiosInstance";

export const registerSalonOwner = async (userData) => {
  const response = await axiosInstance.post(
    "/auth/register/salon-owner",
    userData
  );

  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axiosInstance.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

export const registerCustomer = async (userData) => {
  const response = await axiosInstance.post(
    "/api/auth/register",
    userData
  );

  return response.data;
};

export const logoutUser = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};