import axios from "axios";
import { baseurl } from "../helpers/url";

export const loginService = (data) =>
  axios.post(`${baseurl}/auth/login`, data);

export const registerService = (data) =>
  axios.post(`${baseurl}/auth/register`, data);
