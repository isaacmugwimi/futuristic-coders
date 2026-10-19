// src/utils/api/axiosInstance.js  (public website: no login, so no credentials)

import axios from "axios";
import { BASE_URL } from "./apiPaths";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

export default api;