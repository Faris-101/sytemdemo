import axios from "axios";
import getMockResponse from "../data/mockApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Otomatis sisipkan token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function makeMockResponse(config, data) {
  return {
    status: 200,
    statusText: "OK",
    headers: {},
    config,
    data,
    request: {},
  };
}

// Kalau token expired → paksa logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(err);
    }

    const mock = getMockResponse(err.config || {});
    if (mock) {
      return Promise.resolve(makeMockResponse(err.config || {}, mock));
    }

    return Promise.reject(err);
  },
);

export default api;
