import axios from "axios";
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (
    token &&
    !config.url.includes("/users/login") &&
    !config.url.includes("/users/register")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});