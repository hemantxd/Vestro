const isProd = process.env.NODE_ENV === "production";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isProd
    ? "https://vestro-3xjh.onrender.com/api/v1"
    : "http://localhost:5000/api/v1");