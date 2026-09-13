import axios from "axios";

const customerInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

customerInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

customerInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";

      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register");

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userEmail");

      const role = sessionStorage.getItem("role");

      if (role === "CUSTOMER") {
        window.location.href = "/customer/login";
      }
    }

    return Promise.reject(error);
  }
);

export default customerInstance;