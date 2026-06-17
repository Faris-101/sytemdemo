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

// Interceptor untuk memaksa penggunaan Mock API jika backend tidak tersedia (ERR_CONNECTION_REFUSED)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Tangani network error atau kegagalan koneksi ke localhost
    const isNetworkError = !err.response && (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.status);
    
    if (isNetworkError || err.response?.status === 404) {
      const mock = getMockResponse(err.config || {});
      if (mock) {
        console.log(`[Mock API] Intercepting: ${err.config?.method?.toUpperCase()} ${err.config?.url}`);
        return Promise.resolve(makeMockResponse(err.config || {}, mock));
      }
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

export default api;
