import axios from "axios";
import { baseurl } from "../helpers/url";

/* =========================
   AXIOS INSTANCE
========================= */
const axiosInstance = axios.create({
  baseURL: baseurl,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ❗ DO NOT attach token for auth routes
    const isAuthRoute =
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/register");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("userdetails");

//       if (!window.location.pathname.includes("/login")) {
//         window.location.href = "/login";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
