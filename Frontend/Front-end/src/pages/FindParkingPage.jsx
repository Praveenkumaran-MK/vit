import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getNearbyParkingAreas,
  fetchAllParkingAreas,
  searchParkingAreas,
  searchParkingAreasWithAvailability,
} from "../services/parkingService";
import ParkingCard from "../components/ParkingCard";
import Spinner from "../components/Spinner";

const ALL_FEATURES = [
  "EV Charging",
  "Covered",
  "24/7 Security",
  "Mobile Pass",
  "Valet",
  "Affordable",
  "24/7 Access",
];

const FindParkingPage = () => {
  const location = useLocation();
  const [lots, setLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState(100);
  const [featuresFilter, setFeaturesFilter] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [queryMode, setQueryMode] = useState(false);

  const [routeFilter, setRouteFilter] = useState({
    city: "",
    start: null,
    end: null,
  });

  const [error, setError] = useState("");

  // ---------------- FETCH DATA ----------------
  const fetchData = async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);

    try {
      if (showNearbyOnly) {
        const nearbyAreas = await getNearbyParkingAreas(5);
        setLots(nearbyAreas);
        setFilteredLots(nearbyAreas);
      } else if (queryMode && routeFilter.city) {
        if (routeFilter.start && routeFilter.end) {
          let results = await searchParkingAreasWithAvailability(
            routeFilter.city,
            routeFilter.start,
            routeFilter.end
          );
          setLots(results);
          setFilteredLots(results);
        } else {
          const results = await searchParkingAreas(routeFilter.city);
          setLots(results);
          setFilteredLots(results);
        }
      } else {
        const data = await fetchAllParkingAreas();
        setLots(data);
        setFilteredLots(data);
      }

      setError("");
    } catch (err) {
      console.error("❌ Error fetching parking data:", err);
      setError("Failed to fetch parking data. Please try again.");
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  };

  // ---------------- HANDLE URL QUERY ----------------
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    const rawCity = params.get("city");
    const start = params.get("start");
    const end = params.get("end");

    const toTitleCase = (word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "";

    const city = rawCity ? toTitleCase(rawCity) : "";

    if (searchParam) {
      setSearchTerm(decodeURIComponent(searchParam));
      setShowNearbyOnly(false);
      setQueryMode(false);
    }

    if (city) {
      setQueryMode(true);
      setShowNearbyOnly(false);
      setSearchTerm(city);
      setRouteFilter({ city, start, end });

      const run = async () => {
        setLoading(true);
        try {
          if (start && end) {
            let results = await searchParkingAreasWithAvailability(city, start, end);
            setLots(results);
            setFilteredLots(results);
          } else {
            const results = await searchParkingAreas(city);
            setLots(results);
            setFilteredLots(results);
          }
          setError("");
        } catch (err) {
          setError("Failed to apply route filters.");
        } finally {
          setLoading(false);
        }
      };

      run();
    } else if (!searchParam) {
      setQueryMode(false);
      setRouteFilter({ city: "", start: null, end: null });
      setSearchTerm("");
    }
  }, [location.search]);

  // ------------ Periodic Refresh ------------
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [showNearbyOnly, queryMode, routeFilter.city, routeFilter.start, routeFilter.end]);

  // ---------------- FILTER LOTS ----------------
  useEffect(() => {
    let results = lots.filter(
      (lot) =>
        (lot.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lot.address || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (lot.amount || 0) <= priceFilter
    );

    if (featuresFilter.length > 0) {
      results = results.filter((lot) =>
        featuresFilter.every((feature) => (lot.features || []).includes(feature))
      );
    }

    setFilteredLots(results);
  }, [searchTerm, lots, priceFilter, featuresFilter]);

  // ---------------- HANDLERS ----------------
  const handleFeatureToggle = (feature) => {
    setFeaturesFilter((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleNearbyParking = async () => {
    try {
      setNearbyLoading(true);
      setShowNearbyOnly(true);
      const nearbyAreas = await getNearbyParkingAreas(5);
      setLots(nearbyAreas);
      setFilteredLots(nearbyAreas);
      setError("");
    } catch (err) {
      setError("Could not fetch nearby parking.");
      alert("Please check your location permissions.");
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleShowAllParking = () => {
    setShowNearbyOnly(false);
    fetchData(true);
  };

  const handleSearchParking = async () => {
    if (!searchTerm.trim()) return;
    try {
      setSearchLoading(true);
      setShowNearbyOnly(false);
      setQueryMode(false);

      const allAreas = await fetchAllParkingAreas();
      const matching = allAreas.filter(
        (area) =>
          area.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (area.address || "").toLowerCase().includes(searchTerm.toLowerCase())
      );

      setLots(matching);
      setFilteredLots(matching);
      setError("");
    } catch (err) {
      setError("Could not search parking areas.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setShowNearbyOnly(false);
      setQueryMode(false);
      fetchData(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) handleSearchParking();
  };

  // ---------------- UI ----------------
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
        Find Your Perfect Spot
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Real-time availability and dynamic pricing at your fingertips.
      </p>

      {error && (
        <div className="mb-4 max-w-3xl mx-auto p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-center text-sm">
          {error}
        </div>
      )}

      {/* FILTER BUTTONS */}
      <div className="mb-6 flex justify-center lg:justify-start gap-4">
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2"
        >
          {isFilterVisible ? "Hide" : "Show"} Filters
        </button>

        <button
          onClick={handleNearbyParking}
          disabled={nearbyLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
        >
          {nearbyLoading ? "Finding..." : "Nearby Parking"}
        </button>

        {showNearbyOnly && (
          <button
            onClick={handleShowAllParking}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            Show All Parking
          </button>
        )}
      </div>

      {/* Nearby Message */}
      {showNearbyOnly && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            📍 Showing nearby parking areas within 5km of your location
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* FILTER SIDEBAR */}
        {isFilterVisible && (
          <aside className="lg:w-1/4">
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">
                Filter Options
              </h3>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name or address..."
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      type="submit"
                      disabled={searchLoading || !searchTerm.trim()}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      {searchLoading ? "..." : "Search"}
                    </button>
                  </form>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Price:{" "}
                    <span className="font-bold text-green-600">
                      ₹{priceFilter.toFixed(2)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_FEATURES.map((feature) => (
                      <button
                        key={feature}
                        onClick={() => handleFeatureToggle(feature)}
                        className={`px-3 py-1 text-sm rounded-full border-2 ${
                          featuresFilter.includes(feature)
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-green-600"
                        }`}
                      >
                        {feature}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className={isFilterVisible ? "lg:w-3/4" : "w-full"}>
          {loading || nearbyLoading || searchLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
              {filteredLots.length > 0 ? (
                filteredLots.map((lot) => <ParkingCard key={lot.id} lot={lot} />)
              ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-lg">
                  <p className="text-xl text-gray-500">
                    {showNearbyOnly
                      ? "No nearby parking areas found within 5km."
                      : searchTerm.trim()
                      ? `No parking areas found for "${searchTerm}".`
                      : "No parking lots found."}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {showNearbyOnly
                      ? "Try expanding your search radius."
                      : searchTerm.trim()
                      ? "Try a different search term."
                      : "Try adjusting your filters."}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FindParkingPage;
