import axios from "axios";
import { baseurl } from "../helpers/url";

/**
 * Axios instance
 */
const axiosInstance = axios.create({
  baseURL: baseurl,
  withCredentials: false,
});

/**
 * REQUEST INTERCEPTOR
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const isAuthRoute =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register");

    // ✅ Attach token ONLY for protected routes
    if (token && token !== "null" && token !== "undefined" && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Always enforce JSON
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthRoute =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    /**
     * ✅ Handle 401 SAFELY
     * - Ignore for login/register
     * - Redirect ONLY once
     */
    if (status === 401 && !isAuthRoute) {
      console.warn("401 detected → logging out");

      localStorage.removeItem("token");
      localStorage.removeItem("userdetails");

      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

/* =======================
   AUTH APIs
======================= */

export const loginService = (body) =>
  axiosInstance.post("/auth/login", body);

export const registerService = (body) =>
  axiosInstance.post("/auth/register", body);

/* =======================
   GROUP APIs
======================= */

export const getGroupsApi = () => axiosInstance.get("/groups");
export const createGroupApi = (data) =>
  axiosInstance.post("/groups", data);
export const updateGroupApi = (id, data) =>
  axiosInstance.put(`/groups/${id}`, data);
export const deleteGroupApi = (id) =>
  axiosInstance.delete(`/groups/${id}`);

/* =======================
   TASK APIs
======================= */

export const getTasksByGroupApi = (groupId) =>
  axiosInstance.get(`/tasks/group/${groupId}`);
export const createTaskApi = (data) =>
  axiosInstance.post("/tasks", data);
export const updateTaskApi = (id, data) =>
  axiosInstance.put(`/tasks/${id}`, data);
export const deleteTaskApi = (id) =>
  axiosInstance.delete(`/tasks/${id}`);

/* =======================
   DASHBOARD
======================= */

export const fetchDashboardService = () =>
  axiosInstance.get("/dashboard");

export default axiosInstance;
