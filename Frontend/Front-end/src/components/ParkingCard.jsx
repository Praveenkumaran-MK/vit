import React from "react";
import { Link } from "react-router-dom";
import { ICONS } from "../constants";

const decision = (lot) => {
  const address = (lot.address || "").trim();

  if (address === "Bengaluru") {
    return "https://content.jdmagicbox.com/comp/def_content/car-parking-management/cars-parked-in-parking-lot-car-parking-management-1-0stjw.jpg";
  }
  if (address === "Chennai") {
    return "https://media.istockphoto.com/id/172385575/photo/parking.jpg?s=612x612&w=0&k=20&c=nJorPk_qIMe46mLqdX1aDMu1alojHK7oKPOaAbOzQLM=";
  }
  if (address === "Hyderabad") {
    return "https://watermark.lovepik.com/photo/20211202/large/lovepik-parking-lot-picture_501404976.jpg";
  }
  if (address === "Delhi") {
    return "https://media.istockphoto.com/id/578832718/photo/public-garage.jpg?s=612x612&w=0&k=20&c=sH5-S64sgWBBU-trmC-LE5IwShx_Xlu1kTRDOczmgzE=";
  }
  if (address === "Mumbai") {
    return "https://cdn.dnaindia.com/sites/default/files/2019/08/14/858787-underground-parking.jpg?im=FitAndFill=(1200,900)";
  }

  return (
    lot.image ||
    "https://via.placeholder.com/400x240?text=Parking+Area"
  );
};

// Feature color helper
const getFeatureStyle = (feature) => {
  const f = feature.toLowerCase();

  if (f.includes("security") || f.includes("cctv") || f.includes("guard")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (f.includes("ev") || f.includes("electric") || f.includes("charging")) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (f.includes("covered") || f.includes("roof") || f.includes("shelter")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (f.includes("wash") || f.includes("clean")) {
    return "bg-cyan-100 text-cyan-700 border-cyan-200";
  }
  if (f.includes("valet") || f.includes("service")) {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }
  if (f.includes("24") || f.includes("hour")) {
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
};

const ParkingCard = ({ lot }) => {
  const totalSlots = Number(lot.totalSlots) || 0;
  const amount = Number(lot.amount) || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition duration-300 overflow-hidden flex flex-col">
      <img
        src={decision(lot)}
        alt={lot.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {lot.name || "Parking Area"}
          </h3>
        </div>

        {/* Address */}
        <p className="text-gray-600 mb-4 flex items-center gap-1">
          {ICONS.LOCATION}
          {lot.address || "Address not available"}
        </p>

        {/* Features */}
        {Array.isArray(lot.features) && lot.features.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {lot.features.map((feature, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${getFeatureStyle(
                  feature
                )}`}
              >
                {feature}
              </span>
            ))}
          </div>
        ) : (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400 text-center font-medium">
              No features available
            </p>
          </div>
        )}

        {/* Distance (optional) */}
        {lot.distance !== undefined && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center text-blue-700 text-sm">
              {ICONS.LOCATION}
              <span className="font-medium">
                {lot.distance < 1
                  ? `${(lot.distance * 1000).toFixed(0)}m away`
                  : `${lot.distance.toFixed(1)}km away`}
              </span>
            </div>
          </div>
        )}

        {/* Slots + Price */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-700">
          <div className="flex items-center">
            {ICONS.PRICE}
            <span>
              <strong>₹{amount.toFixed(2)}</strong> / hour
            </span>
          </div>

          <div className="flex items-center">
            {ICONS.SLOT}
            <span className="font-medium">
              {totalSlots} slots
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={`/book/${lot.id}`}
            className="block w-full text-center bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            View Details & Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParkingCard;
