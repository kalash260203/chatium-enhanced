import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5001/api" 
  : "/api"; // Netlify will handle routing to functions

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
