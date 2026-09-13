import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "./axiosInstance";

/* =========================================================
   SALON OWNER REGISTER
========================================================= */

export const registerSalonOwner = async (userData) => {
  const response = await axiosInstance.post(
    "/auth/register/salon-owner",
    userData
  );

  return response.data;
};

/* =========================================================
   LOGIN
========================================================= */

export const loginUser = async (loginData) => {
  const response = await axiosInstance.post(
    "/auth/login",
    loginData
  );

  return response.data;
};

/* =========================================================
   CUSTOMER REGISTER
   Kept because it exists in your existing web service.
========================================================= */

export const registerCustomer = async (userData) => {
  const response = await axiosInstance.post(
    "/api/auth/register",
    userData
  );

  return response.data;
};

/* =========================================================
   SAVE SALON OWNER SESSION
========================================================= */

export const saveSalonOwnerSession = async (data) => {
  if (!data?.token || !data?.user) {
    throw new Error("Invalid authentication response");
  }

  const user = data.user;

  await Promise.all([
    AsyncStorage.setItem("token", data.token),
    AsyncStorage.setItem("user", JSON.stringify(user)),
    AsyncStorage.setItem(
      "role",
      user.role || ""
    ),
    AsyncStorage.setItem(
      "userId",
      user.id || user._id || ""
    ),
    AsyncStorage.setItem(
      "userName",
      user.name || ""
    ),
    AsyncStorage.setItem(
      "userEmail",
      user.email || ""
    ),
  ]);
};

/* =========================================================
   GET TOKEN
========================================================= */

export const getSalonOwnerToken = async () => {
  return await AsyncStorage.getItem("token");
};

/* =========================================================
   GET USER
========================================================= */

export const getSalonOwnerUser = async () => {
  const user = await AsyncStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error(
      "Unable to parse salon owner user:",
      error
    );

    return null;
  }
};

/* =========================================================
   GET ROLE
========================================================= */

export const getSalonOwnerRole = async () => {
  return await AsyncStorage.getItem("role");
};

/* =========================================================
   GET USER ID
========================================================= */

export const getSalonOwnerId = async () => {
  return await AsyncStorage.getItem("userId");
};

/* =========================================================
   LOGIN STATUS
========================================================= */

export const isSalonOwnerLoggedIn = async () => {
  const token = await AsyncStorage.getItem("token");
  const role = await AsyncStorage.getItem("role");

  return Boolean(
    token && role === "SALON_OWNER"
  );
};

/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser = async () => {
  await Promise.all([
    AsyncStorage.removeItem("token"),
    AsyncStorage.removeItem("user"),
    AsyncStorage.removeItem("role"),
    AsyncStorage.removeItem("userId"),
    AsyncStorage.removeItem("userName"),
    AsyncStorage.removeItem("userEmail"),
  ]);
};

/* =========================================================
   CLEAR AUTH DATA
========================================================= */

export const clearSalonOwnerSession = async () => {
  await logoutUser();
};