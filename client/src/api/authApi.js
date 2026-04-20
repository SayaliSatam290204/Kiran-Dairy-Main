import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`
});

export const authApi = {
  login: (payload) => API.post("/auth/login", payload),
  register: (payload) => API.post("/auth/register", payload),
  registerAdmin: (payload) => API.post("/auth/admin/register", payload),
  adminExists: () => API.get("/auth/admin/exists")
};