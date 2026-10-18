import axios from "axios";
import { API_PATHS, BASE_URL } from "./apiPaths.js";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

// ---------------------------------------------------------------------------
// Refresh logic
// ---------------------------------------------------------------------------

// Paths that must never trigger a refresh (it would loop or make no sense).
const NO_REFRESH_PATHS = [
  API_PATHS.AUTH.LOGIN,
  API_PATHS.AUTH.LOGOUT,
  API_PATHS.AUTH.REFRESH_TOKEN,
];

let refreshing = null;

// One refresh at a time, even if several requests fail together.
function refreshSession() {
  refreshing ??= axios
    .post(`${BASE_URL}${API_PATHS.AUTH.REFRESH_TOKEN}`, null, {
      withCredentials: true,
      timeout: 15000,
    })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const canRefresh =
      status === 401 &&
      original &&
      !original._retried &&
      !NO_REFRESH_PATHS.some((path) => original.url?.includes(path));

    if (canRefresh) {
      original._retried = true;

      if (await refreshSession()) {
        return api(original); // repeat the request that failed
      }

      // Refresh failed, so the session is over.
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Show the server's message (e.g. "Program not found.") instead of
    // axios's "Request failed with status code 401".
    const serverMessage = error.response?.data?.message;
    if (serverMessage) error.message = serverMessage;
    error.status = status;

    return Promise.reject(error);
  },
);

export default api;
