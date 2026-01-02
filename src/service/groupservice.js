import axiosInstance from "./api.js";

/* GROUPS */
export const getGroupsApi = () => axiosInstance.get("/groups");
export const createGroupApi = (data) => axiosInstance.post("/groups", data);
export const updateGroupApi = (id, data) =>
  axiosInstance.put(`/groups/${id}`, data);
export const deleteGroupApi = (id) =>
  axiosInstance.delete(`/groups/${id}`);

/* TASKS */
export const getTasksByGroupApi = (groupId) =>
  axiosInstance.get(`/tasks/group/${groupId}`);

export const createTaskApi = (data) =>
  axiosInstance.post("/tasks", data);

export const updateTaskApi = (id, data) =>
  axiosInstance.put(`/tasks/${id}`, data);

export const deleteTaskApi = (id) =>
  axiosInstance.delete(`/tasks/${id}`);

/* DASHBOARD */
export const fetchDashboardservice = () =>
  axiosInstance.get("/dashboard");
