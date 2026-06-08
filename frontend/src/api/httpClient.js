import { tokenStorage } from "./tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const buildUrl = (path, params) => {
  const url = new URL(`${API_BASE_URL}${path}`);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return payload;
};

export const apiClient = async (path, options = {}) => {
  const { params, body, headers, ...requestOptions } = options;
  const token = tokenStorage.get();

  const response = await fetch(buildUrl(path, params), {
    ...requestOptions,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body instanceof FormData || typeof body === "string" ? body : body ? JSON.stringify(body) : undefined,
  });

  return parseResponse(response);
};

export const http = {
  get: (path, params) => apiClient(path, { method: "GET", params }),
  post: (path, body) => apiClient(path, { method: "POST", body }),
  put: (path, body) => apiClient(path, { method: "PUT", body }),
  patch: (path, body) => apiClient(path, { method: "PATCH", body }),
  delete: (path) => apiClient(path, { method: "DELETE" }),
};
