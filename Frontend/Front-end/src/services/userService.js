// src/services/userService.js

import { apiGET, apiPOST, apiDELETE } from "./backendService";

// ----------------------------------------------
// USER PROFILE
// ----------------------------------------------
export async function getUserProfile(userId) {
  if (!userId) throw new Error("User ID is required");
  return apiGET(`/users/profile?id=${userId}`);
}

// ----------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------
export async function getNotifications(userId) {
  if (!userId) throw new Error("User ID is required");
  return apiGET(`/notifications/all?id=${userId}`);
}

export async function addNotification(userId, message) {
  if (!userId) throw new Error("User ID is required");
  if (!message) throw new Error("Notification message is required");

  return apiPOST(`/notifications/add`, { userId, message });
}

export async function clearNotifications(userId) {
  if (!userId) throw new Error("User ID is required");
  return apiDELETE(`/notifications/clearAll?id=${userId}`);
}

export async function deleteNotification(notifId) {
  if (!notifId) throw new Error("Notification ID is required");
  return apiDELETE(`/notifications/delete?id=${notifId}`);
}

export default {
  getUserProfile,
  getNotifications,
  addNotification,
  clearNotifications,
  deleteNotification,
};
