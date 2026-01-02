import axios from "axios";
import { baseurl } from "../helpers/url";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Group APIs
export const getGroupsApi = () =>
  axios.get(`${baseurl}/groups`, getAuthHeader());

export const createGroupApi = (data) =>
  axios.post(`${baseurl}/groups`, data, getAuthHeader());

export const updateGroupApi = (id, data) =>
  axios.put(`${baseurl}/groups/${id}`, data, getAuthHeader());

export const deleteGroupApi = (id) =>
  axios.delete(`${baseurl}/groups/${id}`, getAuthHeader());

// Task APIs
export const getTasksByGroupApi = (groupId) =>
  axios.get(`${baseurl}/tasks/group/${groupId}`, getAuthHeader());

export const createTaskApi = (data) =>
  axios.post(`${baseurl}/tasks`, data, getAuthHeader());

export const updateTaskApi = (id, data) =>
  axios.put(`${baseurl}/tasks/${id}`, data, getAuthHeader());

export const deleteTaskApi = (id) =>
  axios.delete(`${baseurl}/tasks/${id}`, getAuthHeader());