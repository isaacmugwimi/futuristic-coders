import axios from "axios";
import { BASE_URL } from "./apiPaths.js";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

export default api;