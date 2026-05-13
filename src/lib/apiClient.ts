import axios from "axios";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
});

// FIXME: added in ignored file. removed from gitignore if any changes made in here in future
function getApiBaseUrl() {
  const isLive: boolean = false;
  if (isLive) {
    // SSR fallback – keep predictable
    console.log("it is fallback")
    return "https://api-langlearn.myriadcode.com";
  }
  else {
    return "http://localhost:8080";
  }


}
