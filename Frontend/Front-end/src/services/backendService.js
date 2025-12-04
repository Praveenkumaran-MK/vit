// src/services/backendService.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

/* --------------------------------------
   AUTO-ATTACH JWT
-------------------------------------- */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* --------------------------------------
    GENERIC METHODS
-------------------------------------- */
export async function apiGET(url) {
  const res = await API.get(url);
  return res.data;
}

export async function apiPOST(url, body = {}) {
  const res = await API.post(url, body);
  return res.data;
}

export async function apiDELETE(url) {
  const res = await API.delete(url);
  return res.data;
}

/* --------------------------------------
    RAZORPAY ORDER
-------------------------------------- */
export async function createOrder(amount) {
  return await apiPOST("/payment/order", { amount });
}

export async function verifyPayment(data) {
  return await apiPOST("/payment/verify", data);
}

/* --------------------------------------
   FIXED AUTH GET USER
-------------------------------------- */
export async function getCurrentUser() {
  try {
    const res = await apiGET("/auth/me");

    // Fix: Normalize structure for App.jsx
    if (res?.user) return { user: res.user };
    else return { user: res }; // backend returns raw user object
  } catch {
    return { user: null };
  }
}

export async function logoutUser() {
  localStorage.removeItem("accessToken");
  try {
    await API.post("/auth/logout");
  } catch {}
}

/* --------------------------------------
   EXPORT DEFAULT
-------------------------------------- */
export default {
  apiGET,
  apiPOST,
  apiDELETE,
  createOrder,
  verifyPayment,
  getCurrentUser,
  logoutUser,
};
