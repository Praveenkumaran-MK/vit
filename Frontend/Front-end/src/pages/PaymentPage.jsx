import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../hooks/useAppContext";
import {
  fetchParkingAreaById,
  createBookingAfterPayment,
} from "../services/parkingService";
import { initializePayment } from "../services/razorpayService";
import Spinner from "../components/Spinner";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentPage = () => {
  const { booking, user, setBooking, addNotification } = useAppContext();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const getCurrentUserId = () => user?.id;

  useEffect(() => {
    if (!booking) {
      navigate("/find");
      return;
    }

    (async () => {
      try {
        const data = await fetchParkingAreaById(booking.lotId);
        setLot(data || null);
        if (!data) setError("Could not load parking lot details.");
      } catch {
        setError("Could not load lot details. Please try again.");
      }
    })();
  }, [booking, navigate]);

  const handlePayment = async () => {
    setProcessing(true);
    setError("");

    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error("User not authenticated.");

      if (!booking) throw new Error("No booking data found.");
      if (!lot) throw new Error("Parking lot not loaded.");

      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const hours = (end - start) / (1000 * 60 * 60);

      if (hours <= 0) throw new Error("Invalid booking time.");

      const amount = Math.round((lot?.pricePerHour || 20) * hours * 100);

      const bookingData = {
        lotName: lot?.name,
        lotId: booking.lotId,
        slotId: booking.slotId,
        vehicleNumber: booking.vehicleNumber,
        customerName: user?.name,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        amount,
        uid: userId,
      };

      await initializePayment(
        amount,
        bookingData,
        async (paymentResponse) => {
          try {
            const paymentId = paymentResponse?.razorpay_payment_id;
            if (!paymentId)
              throw new Error("Missing payment ID from Razorpay.");

            const payload = {
              id: userId,
              slotId: booking.slotId || 0,
              startTime: booking.startTime,
              endTime: booking.endTime,
              phone: user?.phone || "",
              paymentId,
              vehicle_number: booking.vehicleNumber,
              amount: Math.round(amount / 100),
              area: lot?.name,
            };

            const backendResult = await createBookingAfterPayment(payload);

            if (backendResult?.reply) {
              const msg = backendResult.reply;
              setError(msg);
              toast.error(msg);
              setProcessing(false);

              setTimeout(() => navigate("/find"), 3000);
              return;
            }

            if (!backendResult?.data) {
              throw new Error(
                backendResult?.message || "Booking could not be created."
              );
            }

            const created = backendResult.data;

            const updated = {
              ...booking,
              lotName: backendResult.area || lot?.name,
              lotLat: lot?.lat,
              lotLng: lot?.long,
              lotAddress: lot?.address,
              paymentId,
              status: "CONFIRMED",
              bookingTime: new Date().toISOString(),
              id: created.id || `${booking.lotId}_${Date.now()}`,
              city: backendResult.city || "",
            };

            setBooking(updated);
            setProcessing(false);
            setPaid(true);
            toast.success("Payment successful! Booking confirmed.");

            addNotification(
              `Booking confirmed for ${updated.lotName} - Booking ID: ${updated.id}`
            );

            setTimeout(() => navigate("/ticket"), 2000);
          } catch (err) {
            setError(
              err?.message ||
                "Payment successful, but booking could not be created."
            );
            setProcessing(false);
            toast.error(
              err?.message ||
                "Payment successful, but booking could not be created."
            );
          }
        },
        (errorMessage) => {
          setError(errorMessage || "Payment failed. Please try again.");
          setProcessing(false);
          toast.error(errorMessage || "Payment failed.");

          if (
            errorMessage?.includes("no longer available") ||
            errorMessage?.includes("availability")
          ) {
            setTimeout(() => navigate("/find"), 3000);
          }
        }
      );
    } catch (err) {
      const msg = err?.message || "Failed to initialize payment.";
      setError(msg);
      setProcessing(false);
      toast.error(msg);
    }
  };

  if (!booking || !lot) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  const isPayAsYouGo = booking.paymentMethod === "PAY_AS_YOU_GO";

  const displayAmount = (() => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const hours = (end - start) / (1000 * 60 * 60);
    return (lot?.pricePerHour || 20) * hours;
  })();

  if (paid) {
    return (
      <div className="max-w-md mx-auto text-center bg-white p-12 rounded-lg shadow-xl">
        <div className="text-green-600 mx-auto mb-4 w-24 h-24 flex items-center justify-center rounded-full bg-green-100 animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-700">
          Your booking is confirmed. Generating your ticket...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-900">
            Order Summary
          </h2>

          <div className="space-y-4 text-gray-700">
            <div className="flex justify-between">
              <span>Parking Lot:</span>
              <span className="font-semibold">{booking.lotName}</span>
            </div>

            <div className="flex justify-between">
              <span>Assigned Spot:</span>
              <span className="font-semibold">
                {booking.slotId ?? "Auto-assigned"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Vehicle Number:</span>
              <span className="font-semibold">{booking.vehicleNumber}</span>
            </div>

            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold capitalize">
                {booking.paymentMethod.replace("_", " ").toLowerCase()}
              </span>
            </div>

            {isPayAsYouGo && (
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
                A refundable deposit is required for Pay-as-you-go bookings.
              </div>
            )}

            <div className="border-t my-4"></div>

            <div className="flex justify-between text-xl font-bold">
              <span>{isPayAsYouGo ? "Deposit Amount:" : "Total Amount:"}</span>
              <span>₹{displayAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-gray-900">
            Confirm Payment
          </h2>

          <div className="space-y-6">
            <p className="text-gray-600">
              You will be redirected to Razorpay to complete your transaction.
            </p>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full py-3 rounded-md text-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {processing
                ? "Processing..."
                : `Proceed to Pay ₹${displayAmount.toFixed(2)}`}
            </button>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default PaymentPage;
