import AsyncStorage from "@react-native-async-storage/async-storage";
import customerInstance from "./CustomerInstance";

export const registerCustomer = async (customerData) => {
  const response = await customerInstance.post("/auth/register", {
    name: customerData.name,
    email: customerData.email,
    password: customerData.password,
    phone: customerData.phone,
  });

  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await customerInstance.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  return response.data;
};


export const saveCustomerSession = async (data) => {
  if (!data?.token || !data?.user) {
    throw new Error("Invalid authentication response");
  }

  const userId = data.user.id || data.user._id || "";
  const role = data.user.role || "";
  const userName = data.user.name || "";
  const userEmail = data.user.email || "";


  await AsyncStorage.setItem("token", data.token);
  await AsyncStorage.setItem("user", JSON.stringify(data.user));
  await AsyncStorage.setItem("role", role);
  await AsyncStorage.setItem("userId", userId);
  await AsyncStorage.setItem("userName", userName);
  await AsyncStorage.setItem("userEmail", userEmail);
};

export const getCustomerToken = async () => {
  return await AsyncStorage.getItem("token");
};
export const getCustomerUser = async () => {
  const user = await AsyncStorage.getItem("user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse customer user:", error);
    return null;
  }
};

export const getCustomerRole = async () => {
  return await AsyncStorage.getItem("role");
};

export const getCustomerId = async () => {
  return await AsyncStorage.getItem("userId");
};

export const isCustomerLoggedIn = async () => {
  const token = await AsyncStorage.getItem("token");
  const role = await AsyncStorage.getItem("role");

  return Boolean(token && role === "CUSTOMER");
};

export const logoutCustomer = async () => {
  await AsyncStorage.removeItem("token");
  await AsyncStorage.removeItem("user");
  await AsyncStorage.removeItem("role");
  await AsyncStorage.removeItem("userId");
  await AsyncStorage.removeItem("userName");
  await AsyncStorage.removeItem("userEmail");
};