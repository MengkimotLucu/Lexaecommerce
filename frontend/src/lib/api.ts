const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  bodyData?: any;
  isFormData?: boolean;
}

export async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  let body = options.body;
  
  if (options.bodyData !== undefined) {
    if (options.isFormData) {
      body = options.bodyData;
      // Jangan set Content-Type secara manual untuk form data agar boundary diset otomatis oleh browser
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.bodyData);
    }
  }
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
    body
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Terjadi kesalahan pada server.");
  }
  
  // Jika response tidak ada content (misalnya DELETE returns 200/204), handle gracefully
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}
