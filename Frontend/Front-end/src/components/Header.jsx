import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = ({ user, onLoginClick, onProtectedNav, isAdmin }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [animateMenu, setAnimateMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // -------------------------------
  // Logout Handler
  // -------------------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  // -------------------------------
  // Navigation Handler
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
  // Mobile Menu Controls
  // -------------------------------
  const openMobileMenu = () => {
    setMobileOpen(true);
    setTimeout(() => setAnimateMenu(true), 50);
  };

  const closeMobileMenu = () => {
    setAnimateMenu(false);
    setTimeout(() => setMobileOpen(false), 300);
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
  // Disable body scroll when mobile menu is open
  // -------------------------------
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileOpen]);

  // -------------------------------
  // Render Component
  // -------------------------------
  return (
    <header className="bg-yellow-400 shadow-md py-5 px-6 sticky top-0 z-50">
      <div className="flex items-center justify-between">

        {/* Logo + Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-900 hover:text-white transition-all"
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-10 text-lg ml-8">
          <NavLink className="nav-item" to="/">Home</NavLink>

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

        {/* User / Login */}
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition"
              >
                {user.email.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <p className="small-heading">Signed in as</p>
                    <p className="email">{user.email}</p>
                  </div>

                  <button onClick={handleLogout} className="logout-btn">
                    🔓 Logout
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
          Mobile Sidebar Navigation
      --------------------------- */}
      {mobileOpen && (
        <>
          {/* Background overlay */}
          <div
            className={`mobile-overlay ${animateMenu ? "show" : ""}`}
            onClick={closeMobileMenu}
          />

          {/* Sidebar */}
          <div
            className={`mobile-sidebar ${animateMenu ? "open" : ""}`}
          >
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
