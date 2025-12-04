import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useAppContext}from "../hooks/useAppContext";
import Spinner from "../components/Spinner";
import DatePicker from "react-datepicker";
import { ICONS } from "../constants";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { fetchParkingAreaById } from "../services/parkingService";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBooking, user, addNotification } = useAppContext();

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const [paymentMethod] = useState("PREPAID");  
  const [vehicleNumber, setVehicleNumber] = useState("");

  // ---------------- INITIAL TIME ----------------
  const getInitialStartTime = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
  };

  const initialStart = getInitialStartTime();
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(
    new Date(initialStart.getTime() + 60 * 60 * 1000)
  );

  // ---------------- LOAD LOT ----------------
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchParkingAreaById(id);
        if (!data) setError("Parking area not found");
        else setLot(data);
      } catch (err) {
        setError("Failed to fetch parking details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ---------------- VALIDATION ----------------
  const isVehicleValid = () =>
    /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(vehicleNumber);

  const isBookingValid = () =>
    lot &&
    vehicleNumber.trim() &&
    isVehicleValid() &&
    startTime < endTime &&
    !isBooking;

  // ---------------- HANDLE BOOKING ----------------
  // Here we ONLY prepare booking and go to PaymentPage.
  const handleBooking = () => {
    if (!user || !user.id) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    if (!isVehicleValid()) {
      toast.error("Invalid vehicle number format");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    setIsBooking(true);

    const payload = {
      userId: user.id,
      area: lot.name,
      city: lot.city,
      amount: lot.amount,         // FIXED PRICE
      vehicle_number: vehicleNumber.toUpperCase(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      paymentMethod: "PREPAID",
    };

    setBooking(payload);

    toast.success("Redirecting to payment...");
    addNotification(`Preparing payment for ${lot.name}`);
    navigate("/payment");

    setIsBooking(false);
  };

  if (loading) return <Spinner />;

  if (!lot)
    return <p className="text-center text-red-500">{error}</p>;

  // ---------------- BUTTON TEXT ----------------
  let btnText = "Proceed to Payment";
  if (isBooking) btnText = "Preparing Payment...";
  else if (!vehicleNumber.trim()) btnText = "Enter Vehicle Number";
  else if (!isVehicleValid()) btnText = "Invalid Vehicle Number";
  else if (startTime >= endTime) btnText = "Invalid Time Range";

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-8 md:p-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{lot.name}</h1>

        <div className="text-gray-600 mb-4 flex items-center">
          {ICONS.LOCATION} {lot.address}
        </div>

        {/* FIXED PRICE */}
        <div className="mt-8 space-y-4 border-t pt-6">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold text-gray-600">Parking Amount:</span>
            <span className="text-green-600 font-bold text-2xl">
              ₹{lot.amount?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-3">Features:</h3>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(lot.features) && lot.features.length > 0 ? (
              lot.features.map((f, idx) => (
                <span
                  key={idx}
                  className="bg-green-100 text-green-600 text-sm font-medium px-3 py-1 rounded-full"
                >
                  {f}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No features available</span>
            )}
          </div>
        </div>

        {/* DATE & TIME */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Select Date & Time</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* start */}
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <DatePicker
                selected={startTime}
                onChange={(date) => {
                  if (!date) return;
                  setStartTime(date);
                  if (date >= endTime) {
                    setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
                  }
                }}
                showTimeSelect
                timeIntervals={60}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* end */}
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <DatePicker
                selected={endTime}
                onChange={(date) => {
                  if (!date) return;
                  const minEnd = new Date(startTime.getTime() + 60 * 60 * 1000);
                  if (date < minEnd) setEndTime(minEnd);
                  else setEndTime(date);
                }}
                showTimeSelect
                timeIntervals={60}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date(startTime.getTime() + 60 * 60 * 1000)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* VEHICLE */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold text-lg mb-3">Vehicle Information</h3>

          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="MH12AB1234"
            maxLength={10}
            required
          />

          {vehicleNumber && !isVehicleValid() && (
            <p className="text-red-500 text-sm mt-2">
              Format must be: MH12AB1234
            </p>
          )}
        </div>

        {/* PAYMENT */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-semibold text-lg mb-3">Payment</h3>

          <div className="p-4 border rounded-lg bg-green-50 text-center">
            <p className="text-green-600 font-semibold">
              💳 Payment First — Slot will be auto-allocated after payment.
            </p>
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleBooking}
          disabled={!isBookingValid()}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-lg mt-8 disabled:bg-gray-400"
        >
          {btnText}
        </button>

        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}
      </div>

      {/* LOCATION */}
      <div className="bg-gray-50 p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Location Info</h2>

        <div className="w-full h-60 rounded-lg shadow bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 font-medium">
            📍 {lot.address}
            <br />
            Directions available after payment
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
