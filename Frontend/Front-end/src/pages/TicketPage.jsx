import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import { BookingStatus } from "../../types";
import QRCode from "../components/QRCode";
import Spinner from "../components/Spinner";
import Mapguider from "../components/Mapguider";
import { updateBookingStatus } from "../services/parkingService";

const TicketPage = () => {
  const { booking, setBooking } = useAppContext();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!booking) {
      navigate("/find");
      return;
    }
    if (booking.status === BookingStatus.CONFIRMED) {
      setStatusMessage("You'll be verified at the entry gate.");
    }
  }, [booking, navigate]);

  const updateStatus = async (newStatus) => {
    try {
      if (!booking) return;

      const result = await updateBookingStatus(booking.id, newStatus);
      if (!result.success) throw new Error("Failed to update booking status");

      const updated = { ...booking, status: newStatus };
      setBooking(updated);

      if (newStatus === BookingStatus.ACTIVE) {
        setStatusMessage("Welcome! Your parking session has started.");
      } else if (newStatus === BookingStatus.COMPLETED) {
        setStatusMessage("Your session is complete. Thank you for parking with us!");
      }
    } catch {
      setStatusMessage("Error updating session status.");
    }
  };

  const handleSimulateEntry = async () => {
    await updateStatus(BookingStatus.ACTIVE);
  };

  const handleSimulateExit = async () => {
    await updateStatus(BookingStatus.COMPLETED);
  };

  const getStatusUI = () => {
    if (!booking) return null;

    switch (booking.status) {
      case BookingStatus.CONFIRMED:
        return (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4">
            <p className="font-bold">Status: Awaiting Arrival</p>
            <p>{statusMessage}</p>
          </div>
        );

      case BookingStatus.ACTIVE:
        return (
          <div className="bg-green-100 border-l-4 border-green-600 text-green-600 p-4">
            <p className="font-bold">Status: Active</p>
            <p>Welcome! Your parking session has started.</p>
          </div>
        );

      case BookingStatus.COMPLETED:
        return (
          <div className="bg-blue-100 border-l-4 border-blue-600 text-blue-800 p-4">
            <p className="font-bold">Status: Completed</p>
            <p>Thank you for using UrbPark!</p>
          </div>
        );

      case BookingStatus.CANCELLED:
        return (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Status: Cancelled</p>
            <p>This booking has been cancelled.</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!booking) return <Spinner />;

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-2xl text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Your Parking Ticket</h1>

      <div className="mb-6">{getStatusUI()}</div>

      {booking.status !== BookingStatus.CANCELLED && (
        <>
          <p className="text-gray-600 mb-2">E-Ticket for your parking session.</p>

          <QRCode data={JSON.stringify({ bookingId: booking.id })} />

          <div className="mt-8 border-t pt-6 space-y-3 text-left">
            <p><strong>Lot:</strong> {booking.lotName}</p>
            <p><strong>Booking ID:</strong> {booking.id}</p>
            <p><strong>Slot:</strong> {booking.slotId}</p>
            <p><strong>Vehicle No:</strong> {booking.vehicleNumber}</p>
            <p><strong>Payment:</strong> {(booking.paymentMethod || "PREPAID").replace("_", "-")}</p>
            <p><strong>Time:</strong> {new Date(booking.bookingTime).toLocaleString()}</p>
          </div>
        </>
      )}

      {booking.status === BookingStatus.CONFIRMED && (
        <button
          onClick={handleSimulateEntry}
          className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700"
        >
          Simulate Entry Scan
        </button>
      )}

      {booking.status === BookingStatus.ACTIVE && (
        <button
          onClick={handleSimulateExit}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700"
        >
          Simulate Exit Scan
        </button>
      )}

      {booking.status === BookingStatus.CONFIRMED && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Directions to Parking</h2>
          <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <Mapguider destination={[booking.lotLat, booking.lotLng]} />
          </div>
        </div>
      )}

      {(booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED) && (
        <button
          onClick={() => navigate("/find")}
          className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
        >
          Find New Parking
        </button>
      )}
    </div>
  );
};

export default TicketPage;
