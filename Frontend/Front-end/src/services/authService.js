// src/services/authService.js
import { apiPOST } from "./backendService";
import backendAuth from "./backendService";

/* -----------------------------------------------------------
   LOGIN  →  POST /login
----------------------------------------------------------- */
export async function signInWithEmailAndPassword(email, password) {
  const res = await apiPOST("/login", { email, password });

  // Save JWT (or session token)
  const token = res.accessToken ?? res.data?.accessToken;
  if (token) localStorage.setItem("accessToken", token);

  return res;
}

/* -----------------------------------------------------------
   SIGNUP  →  POST /signup
----------------------------------------------------------- */
export async function createUserWithEmailAndPassword(
  email,
  password,
  phone,
  name
) {
  const res = await apiPOST("/signup", {
    name,
    email,
    phone,
    password,
  });

  // Automatically log in after sign-up
  await signInWithEmailAndPassword(email, password);

  return res;
}

/* -----------------------------------------------------------
   LOGOUT (Local token clear)
----------------------------------------------------------- */
export function logoutUser() {
  localStorage.removeItem("accessToken");
  backendAuth.logout?.(); // safe call (if backend supports)
}

/* -----------------------------------------------------------
   CURRENT USER
   GET /auth/me  (already provided by backendService.js)
----------------------------------------------------------- */
export async function getCurrentUser() {
  try {
    return backendAuth.getCurrentUser();
  } catch (err) {
    return null;
  }
}
