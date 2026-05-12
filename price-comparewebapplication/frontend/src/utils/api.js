import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ─── Products API ──────────────────────────────────────────────
export const searchProducts = (query, filters = {}) => {
  const params = { q: query, ...filters };
  return api.get("/products/search", { params });
};

export const getAllProducts = () => api.get("/products");
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ─── Upload API ────────────────────────────────────────────────
export const getPresignedUrl = (filename, contentType) =>
  api.post("/upload/presigned-url", { filename, contentType });

export default api;
