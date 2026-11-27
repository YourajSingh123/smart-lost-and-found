export const API_BASE = "http://localhost:8081/api";

// Fetch with the logged-in user's JWT attached
export function authFetch(path, user, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${user.token}`,
    },
  });
}