// src/services/parkingService.js
import { apiGET, apiPOST } from "./backendService";

// --------------------------------------------------
// 1) GET ALL PARKING AREAS (PostgreSQL)
// Backend: GET /v1/display_areas
// --------------------------------------------------
export async function fetchAllParkingAreas() {
  const res = await apiGET("/v1/display_areas");
  return res.data || []; 
}

// --------------------------------------------------
// 2) NEARBY PARKING (Frontend-only distance calculation)
// --------------------------------------------------
export async function getNearbyParkingAreas(radiusKm = 5) {
  const all = await fetchAllParkingAreas();

  if (!navigator.geolocation) return all;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const R = 6371;
        const toRad = (deg) => (deg * Math.PI) / 180;

        const filtered = all
          .map((lot) => {
            if (!lot.lat || !lot.long) return null;

            const dLat = toRad(lot.lat - latitude);
            const dLon = toRad(lot.long - longitude);

            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(latitude)) *
                Math.cos(toRad(lot.lat)) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dist = R * c;

            return { ...lot, distance: dist };
          })
          .filter(Boolean)
          .filter((lot) => lot.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance);

        resolve(filtered);
      },
      () => resolve(all)
    );
  });
}

// --------------------------------------------------
// 3) SEARCH BY NAME / ADDRESS / CITY
// --------------------------------------------------
export async function searchParkingAreas(searchTerm) {
  const all = await fetchAllParkingAreas();
  const term = searchTerm.toLowerCase();

  return all.filter(
    (lot) =>
      lot.name?.toLowerCase().includes(term) ||
      lot.address?.toLowerCase().includes(term) ||
      lot.city?.toLowerCase().includes(term)
  );
}

// --------------------------------------------------
// 4) SEARCH WITH AVAILABILITY  ❌ pending backend route
// --------------------------------------------------
export async function searchParkingAreasWithAvailability() {
  throw new Error(
    "Backend route for availability search is not implemented. Tell me if you want it built."
  );
}

// --------------------------------------------------
// 5) GET A PARKING AREA BY ID
// --------------------------------------------------
export async function fetchParkingAreaById(id) {
  const all = await fetchAllParkingAreas();
  return all.find((a) => String(a.id) === String(id)) || null;
}

// --------------------------------------------------
// 6) CREATE BOOKING (after successful Razorpay payment)
// Backend: POST /api/book
// --------------------------------------------------
export async function createBookingAfterPayment(payload) {
  const res = await apiPOST("/api/book", payload);
  return res;
}

// --------------------------------------------------
// 7) GET BOOKING HISTORY
// Backend: GET /api/history?id=USER_ID
// --------------------------------------------------
export async function fetchBookingHistory(userId) {
  const res = await apiGET(`/api/history?id=${userId}`);
  return res.data || [];
}

// --------------------------------------------------
// 8) GET LATEST BOOKING (for TicketPage auto-load)
// Backend: GET /api/latest_booking?id=USER_ID
// --------------------------------------------------
export async function fetchLatestBooking(userId) {
  const res = await apiGET(`/api/latest_booking?id=${userId}`);
  return res.booking || null;
}

// ----------------------------------------------
// 9) UPDATE BOOKING STATUS
// Backend: PATCH /api/book/status
// ----------------------------------------------
export async function updateBookingStatus(bookingId, newStatus) {
  try {
    const res = await apiPOST(`/api/book/status`, {
      id: bookingId,
      status: newStatus,
    });

    return {
      success: res.success ?? true,
      message: res.message ?? "Status updated",
    };
  } catch (err) {
    console.error("Error updating booking status:", err);
    return { success: false, message: "Failed to update status" };
  }
}
