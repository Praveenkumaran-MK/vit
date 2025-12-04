import axios from "axios";

// Reuse same backend base config
const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

// ------------------------------
// Helper wrappers
// ------------------------------
export async function apiGET(url) {
  return API.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
}

export async function apiDELETE(url) {
  return API.delete(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
    },
  });
}

// ------------------------------
// GET: Booking history (PostgreSQL)
// ------------------------------
export async function getUserBookingHistory(userId) {
  try {
    const res = await apiGET(`/api/history?id=${userId}`);

    const list = res.data || [];

    // Normalize backend response
    return list.map((b) => ({
      id: b.bookingId,
      area: b.area,
      city: b.city,
      slotNumber: b.slotNumber,
      startTime: b.startTime,
      endTime: b.endTime,
      vehicleNumber: b.vehicle_number,
      amount: b.amount,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt || b.startTime,
      paymentId: b.paymentId ?? null,
    }));
  } catch (err) {
    console.error("Error in getUserBookingHistory:", err);
    throw err;
  }
}

// ------------------------------
// DELETE: Remove booking history
// ------------------------------
export async function deleteHistoryEntry(bookingId) {
  try {
    await apiDELETE(`/api/book/del?id=${bookingId}`);
  } catch (err) {
    console.error("Error in deleteHistoryEntry:", err);
    throw err;
  }
}

export default {
  getUserBookingHistory,
  deleteHistoryEntry,
};
