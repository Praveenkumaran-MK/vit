import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import backendAuth from "../services/backendService";


const Header = ({ user, onLoginClick, onProtectedNav, isAdmin }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [animateMenu, setAnimateMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // -------------------------------
  // Logout (PostgreSQL)
  // -------------------------------
  const handleLogout = async () => {
    try {
      await backendAuth.logout();
 // clears cookie/JWT on frontend
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Unable to logout. Please try again.");
    }
  };

  // -------------------------------
  // Protected navigation
  // -------------------------------
  const handleNavClick = (path) => {
    if (!user) {
      onProtectedNav?.(path);
    } else {
      navigate(path);
    }
    closeMobileMenu();
  };

  // -------------------------------
  // Mobile menu controls
  // -------------------------------
  const openMobileMenu = () => {
    setMobileOpen(true);
    setTimeout(() => setAnimateMenu(true), 60);
  };

  const closeMobileMenu = () => {
    setAnimateMenu(false);
    setTimeout(() => setMobileOpen(false), 250);
  };

  const toggleMobileMenu = () => {
    mobileOpen ? closeMobileMenu() : openMobileMenu();
  };

  // -------------------------------
  // Close dropdown when clicking outside
  // -------------------------------
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -------------------------------
  // Disable body scroll when menu open
  // -------------------------------
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileOpen]);

  // -------------------------------
  // Render UI
  // -------------------------------
  return (
    <header className="bg-yellow-400 shadow-md py-5 px-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">

        {/* LEFT: Logo / Mobile toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-900 hover:text-white transition"
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor">
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  mobileOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>

          <NavLink to="/" className="text-3xl font-extrabold flex items-center">
            <span>Urb</span>
            <span className="text-white">Park</span>
          </NavLink>
        </div>

        {/* CENTER: Desktop nav */}
        <nav className="hidden md:flex space-x-10 text-lg ml-8">
          <NavLink className="nav-item" to="/">
            Home
          </NavLink>

          <button className="nav-item" onClick={() => handleNavClick("/find")}>
            Find Parking
          </button>

          <button
            className="nav-item"
            onClick={() => handleNavClick(isAdmin ? "/admin" : "/profile")}
          >
            My Bookings
          </button>
        </nav>

        {/* RIGHT: User dropdown / login */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition"
              >
                {user.email?.charAt(0).toUpperCase() || "U"}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg">
                  <div className="px-4 py-3 border-b">
                    <p className="text-xs text-gray-600">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button onClick={onLoginClick} className="login-btn">
              Login
            </button>
          )}
        </div>
      </div>

      {/* --------------------------
          MOBILE NAVIGATION SIDEBAR
      --------------------------- */}
      {mobileOpen && (
        <>
          <div
            className={`mobile-overlay ${animateMenu ? "show" : ""}`}
            onClick={closeMobileMenu}
          />

          <div className={`mobile-sidebar ${animateMenu ? "open" : ""}`}>
            <button onClick={closeMobileMenu} className="mobile-close-btn">
              ✕
            </button>

            <NavLink to="/" onClick={closeMobileMenu} className="mobile-item">
              Home
            </NavLink>

            <button
              onClick={() => handleNavClick("/find")}
              className="mobile-item"
            >
              Find Parking
            </button>

            <button
              onClick={() => handleNavClick(isAdmin ? "/admin" : "/profile")}
              className="mobile-item"
            >
              My Bookings
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
