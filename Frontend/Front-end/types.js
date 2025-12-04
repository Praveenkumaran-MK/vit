// -------------------- ENUMS --------------------
export const SlotStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  UNAVAILABLE: "unavailable",
  RESERVED: "reserved",
};

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// -------------------- PRISMA-BASED TYPES --------------------

/**
 * @typedef {Object} ParkingSlot
 * @property {number} id
 * @property {number} slotNumber
 * @property {number} parkingId   - FK -> parkingArea.id
 * @property {SlotStatus} status
 */

/**
 * @typedef {Object} ParkingArea
 * @property {number} id
 * @property {string} name
 * @property {string} city
 * @property {string} address
 * @property {number} lat
 * @property {number} long
 * @property {number} pricePerHour
 * @property {ParkingSlot[]} slots
 */

/**
 * @typedef {Object} Booking
 * @property {number} id
 * @property {number} userId
 * @property {number} slotId
 * @property {Date} startTime
 * @property {Date} endTime
 * @property {string} vehicle_number
 * @property {number} amount
 * @property {string} paymentId
 * @property {string} paymentStatus     - pending / paid / failed
 * @property {BookingStatus} status
 */

/**
 * @typedef {Object} SecurityEvent
 * @property {number} id
 * @property {Date} timestamp
 * @property {'ENTRY'|'EXIT_OK'|'ALERT_WRONG_SPOT'|'ALERT_MISMATCH'} type
 * @property {string} message
 * @property {'info'|'warning'|'critical'} level
 */
