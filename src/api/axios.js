import axios from "axios";
import getMockResponse from "../data/mockApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Otomatis sisipkan token di setiap request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // UNTUK DEMO: Jika kita tidak punya backend nyata, kita bisa langsung return Mock di sini
  // agar console log browser tetap bersih dari ERR_CONNECTION_REFUSED
  if (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost:3000')) {
    const mock = getMockResponse(config);
    if (mock) {
      // Kita "batalkan" request asli dan lempar ke catch block interceptor response
      // dengan tanda khusus bahwa ini adalah data mock
      return Promise.reject({ isMock: true, config, data: mock });
    }
  }

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

// Interceptor response untuk menangani data mock dan error nyata
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Jika request "dibatalkan" oleh interceptor request kita di atas
    if (err.isMock) {
      return Promise.resolve(makeMockResponse(err.config, err.data));
    }

    // Fallback jika request gagal (network error)
    const mock = getMockResponse(err.config || {});
    if (mock) {
      return Promise.resolve(makeMockResponse(err.config || {}, mock));
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
