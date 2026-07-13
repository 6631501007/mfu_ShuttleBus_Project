// Development keeps the existing direct API URL. Production defaults to the
// same origin so the container's Nginx proxy can route API and Socket.IO calls.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')
).replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(apiUrl(path), {
    ...options,
    headers
  });
};
