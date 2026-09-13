import customerInstance from "./CustomerInstance";

export const registerCustomer = async (customerData) => {
  const response = await customerInstance.post(
    "/auth/register",
    {
      name: customerData.name,
      email: customerData.email,
      password: customerData.password,
      phone: customerData.phone,
    }
  );

  return response.data;
};

export const loginCustomer = async (credentials) => {
  const response = await customerInstance.post(
    "/auth/login",
    {
      email: credentials.email,
      password: credentials.password,
    }
  );

  return response.data;
};

export const saveCustomerSession = (data) => {
  if (!data?.token || !data?.user) {
    throw new Error("Invalid authentication response");
  }

  sessionStorage.setItem("token", data.token);
  sessionStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );
  sessionStorage.setItem(
    "role",
    data.user.role
  );
  sessionStorage.setItem(
    "userId",
    data.user.id
  );
  sessionStorage.setItem(
    "userName",
    data.user.name
  );
  sessionStorage.setItem(
    "userEmail",
    data.user.email
  );
};
export const logoutCustomer = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("userEmail");
};