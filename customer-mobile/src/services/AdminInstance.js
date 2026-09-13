import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const adminInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================
adminInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("adminToken");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData → let Axios/React Native set Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================
adminInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      await Promise.all([
        AsyncStorage.removeItem("adminToken"),
        AsyncStorage.removeItem("adminData"),
      ]);
    }

    return Promise.reject(error);
  }
);

export default adminInstance;