"use client";

import axios from "axios";

const isDevelopment = process.env.NODE_ENV === "development";

const baseurl = isDevelopment
  ? process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL
  : process.env.NEXT_PUBLIC_API_BASE_URL_PROD;


//Extract CSRF token from cookies
const csrfToken = typeof document !== 'undefined'
  ? document.cookie.match(/csrftoken=([\w-]+)/)?.[1]
  : null;


const AxiosInstance = axios.create({
  baseURL: baseurl,
  headers: {
    accept: "application/json",
    "X-CSRFToken": csrfToken, 
  },
});

// Interceptor to add 'multipart/form-data' if needed
AxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default AxiosInstance;