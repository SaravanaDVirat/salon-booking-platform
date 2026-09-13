import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error.response?.status === 401) {
      const requestUrl =
        error.config?.url || "";

      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes(
          "/auth/register"
        ) ||
        requestUrl.includes(
          "/auth/register/salon-owner"
        );

      if (!isAuthRequest) {
        await Promise.all([
          AsyncStorage.removeItem("token"),
          AsyncStorage.removeItem("user"),
          AsyncStorage.removeItem("role"),
          AsyncStorage.removeItem("userId"),
          AsyncStorage.removeItem("userName"),
          AsyncStorage.removeItem("userEmail"),
        ]);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;