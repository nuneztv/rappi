const API_URL = "http://localhost:4000/api";

// Funcion para hacer las peticiones al backend
export async function request(path, method, body, token) {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const res = await fetch(API_URL + path, {
    method: method || "GET",
    headers: headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error");
  }

  return data;
}
