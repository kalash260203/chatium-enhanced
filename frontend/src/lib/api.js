import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  console.log("Making signup request...");
  const response = await axiosInstance.post("/auth/signup", signupData);
  console.log("Signup response:", response);
  console.log("Signup response headers:", response.headers);
  console.log("Cookies after signup:", document.cookie);
  return response.data;
};

export const login = async (loginData) => {
  console.log("Making login request...");
  const response = await axiosInstance.post("/auth/login", loginData);
  console.log("Login response:", response);
  console.log("Login response headers:", response.headers);
  console.log("Cookies after login:", document.cookie);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    console.log("Attempting to get auth user...");
    console.log("Cookies before request:", document.cookie);
    const res = await axiosInstance.get("/auth/me");
    console.log("Auth user response:", res.data);
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    console.log("Error response:", error.response?.data);
    console.log("Error status:", error.response?.status);
    console.log("Current cookies:", document.cookie);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboard", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users/recommended");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/send-friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.post(`/users/accept-friend-request/${requestId}`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}
