import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://realtime-fullstack-chat-app-backend.onrender.com/api",
  withCredentials: true,
});
