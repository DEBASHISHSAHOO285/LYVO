const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("lyvo-token");

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong. Please try again."
    );
  }

  return data;
}

const api = {
  // =========================================
  // GET
  // =========================================

  get: (endpoint) =>
    apiRequest(endpoint, {
      method: "GET",
    }),

  // =========================================
  // POST JSON
  // =========================================

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // =========================================
  // PUT JSON
  // =========================================

  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // =========================================
  // DELETE
  // =========================================

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),

  // =========================================
  // FILE UPLOAD / FORMDATA
  // =========================================

  upload: (endpoint, formData) =>
    apiRequest(endpoint, {
      method: "POST",
      body: formData,
    }),
};

export default api;