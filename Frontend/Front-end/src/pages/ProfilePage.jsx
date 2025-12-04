import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";  
import {
  getUserBookingHistory,
  deleteHistoryEntry,
} from "../services/bookingService";
import Spinner from "../components/Spinner";


const ProfilePage = () => {
  const {
    booking: currentBooking,
    notifications,
    clearNotifications,
    deleteNotification,
    user,
  } = useAppContext();

  const [bookingHistory, setBookingHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setHistoryError("");

      if (!user?.id) {
        setBookingHistory([]);
        setLoadingHistory(false);
        return;
      }

      try {
        const history = await getUserBookingHistory(user.id);

        const sorted = [...history].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.startTime);
          const dateB = new Date(b.createdAt || b.startTime);
          return dateB.getTime() - dateA.getTime();
        });

        setBookingHistory(sorted);
      } catch {
        setHistoryError("Failed to load booking history. Please try again.");
        setBookingHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleDeleteHistoryEntry = async (bookingId) => {
    try {
      if (!user?.id) throw new Error("User not found");
      await deleteHistoryEntry(bookingId);
      setBookingHistory((prev) => prev.filter((b) => b.id !== bookingId));
    } catch {
      alert("Failed to delete booking. Please try again.");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch {}
  };

  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(date.getTime())) return "Just now";

    const diff = Math.floor((new Date() - date) / (1000 * 60));
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
        My Bookings
      </h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Current Booking */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            Current Booking
          </h2>

          {currentBooking && currentBooking.status !== "COMPLETED" ? (
            <div className="space-y-3">
              <p>
                <strong>Lot:</strong> {currentBooking.lotName}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="font-semibold capitalize">
                  {currentBooking.status.toLowerCase()}
                </span>
              </p>
              <p>
                <strong>Booking Time:</strong>{" "}
                {currentBooking.bookingTime
                  ? new Date(currentBooking.bookingTime).toLocaleString()
                  : "N/A"}
              </p>
              <Link
                to="/ticket"
                className="inline-block mt-4 bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-300"
              >
                View My Ticket
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">You have no active bookings.</p>
              <Link
                to="/find"
                className="inline-block mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Find Parking
              </Link>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold">Notifications</h2>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-l-4 p-3 rounded relative ${
                    n.read
                      ? "bg-gray-50 border-gray-300 text-gray-600"
                      : "bg-yellow-100 border-yellow-500 text-yellow-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {formatNotificationTime(n.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(n.id)}
                      className="ml-2 text-gray-400 hover:text-red-500"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You have no new notifications.</p>
          )}
        </div>
      </div>

      {/* Booking History */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
          My Bookings History
        </h2>

        {historyError && (
          <p className="text-red-500 mb-4 text-sm">{historyError}</p>
        )}

        {loadingHistory ? (
          <Spinner />
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {bookingHistory.length > 0 ? (
              bookingHistory.map((b) => {
                const startTime = new Date(b.startTime);
                const endTime = new Date(b.endTime);
                const createdAt = new Date(b.createdAt || b.startTime);

                const status = (b.paymentStatus || b.status || "N/A").toLowerCase();

                return (
                  <div key={b.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {b.area || "Unknown Location"}
                        {b.city ? `, ${b.city}` : ""}
                      </h3>
                      <button
                        onClick={() => handleDeleteHistoryEntry(b.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p>
                          <strong>Slot:</strong> {b.slotNumber ?? "N/A"}
                        </p>
                        <p>
                          <strong>Vehicle:</strong> {b.vehicleNumber || "N/A"}
                        </p>
                        <p>
                          <strong>Status:</strong>
                          <span
                            className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                              status === "paid" || status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "failed" || status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {b.paymentStatus || b.status}
                          </span>
                        </p>
                      </div>

                      <div>
                        <p>
                          <strong>Start:</strong> {startTime.toLocaleString()}
                        </p>
                        <p>
                          <strong>End:</strong> {endTime.toLocaleString()}
                        </p>
                        <p>
                          <strong>Booked:</strong>{" "}
                          {createdAt.toLocaleDateString()}
                        </p>
                        {typeof b.amount === "number" && (
                          <p>
                            <strong>Amount:</strong> ₹{b.amount.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {b.paymentId && (
                      <p className="text-xs text-gray-500 mt-2">
                        Payment ID: {b.paymentId}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">
                  Your booking history will appear here.
                </p>
                <p className="text-sm mt-2">
                  Complete a booking to see it in your history.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
