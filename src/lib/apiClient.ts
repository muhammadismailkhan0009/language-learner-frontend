import axios from "axios";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

function getApiBaseUrl() {
  const isLive: boolean = true;
  if (isLive) {
    // SSR fallback – keep predictable
    console.log("it is fallback")
    return "https://api-langlearn.myriadcode.com";
  }
  else {
    return "http://localhost:8080";
  }


}
