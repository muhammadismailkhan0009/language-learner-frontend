import axios from "axios";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    // SSR fallback – keep predictable
    return "https://api-langlearn.myriadcode.com";
  }

  const host = window.location.hostname;

  if (host === "localhost" || host === "127.0.0.1") {
    return "http://localhost:8080";
  }

  // production (explicit, no parsing)
  return "https://api-langlearn.myriadcode.com";
}
