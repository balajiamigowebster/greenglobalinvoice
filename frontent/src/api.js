import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "http://localhost:4000"
      : "https://backend-bice-seven-54.vercel.app"),
  withCredentials: true,
});

export default API;
