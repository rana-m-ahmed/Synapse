/**
 * Utility client for fetching from the FastAPI backend.
 */
export async function fetchApi(
  endpoint: string,
  options: RequestInit = {},
  token?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `API error: ${response.status}`);
  }

  return response.json();
}
