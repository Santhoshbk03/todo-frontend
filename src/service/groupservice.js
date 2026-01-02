import axios from "axios";
import { baseurl } from "../helpers/url";

const axiosInstance = axios.create({
  baseURL: baseurl,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No valid token found for request:", config.url);
    }
    
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userdetails");
      
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getGroupsApi = () => axiosInstance.get("/groups");
export const createGroupApi = (data) => axiosInstance.post("/groups", data);
export const updateGroupApi = (id, data) => axiosInstance.put(`/groups/${id}`, data);
export const deleteGroupApi = (id) => axiosInstance.delete(`/groups/${id}`);

export const getTasksByGroupApi = (groupId) => 
  axiosInstance.get(`/tasks/group/${groupId}`);
export const createTaskApi = (data) => axiosInstance.post("/tasks", data);
export const updateTaskApi = (id, data) => axiosInstance.put(`/tasks/${id}`, data);
export const deleteTaskApi = (id) => axiosInstance.delete(`/tasks/${id}`);

export const fetchDashboardservice = () => axiosInstance.get("/dashboard");

export const loginservice = (body) => axios.post(`${baseurl}/auth/login`, body);

export default axiosInstance;