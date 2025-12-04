import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import { AppProvider } from "./hooks/useAppContext.jsx";

// Pages
import HomePage from "./pages/HomePage";
import FindParkingPage from "./pages/FindParkingPage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import NotFoundPage from "./pages/NotFoundPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Backend authentication (PostgreSQL + JWT)
import backendAuth from "./services/backendService.js";

/* ---------------------------------------------
   Protected Route Wrapper
--------------------------------------------- */
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");
  const [user, setUser] = useState(null);

  /* ---------------------------------------------
     Load logged-in user (JWT → /auth/me)
  --------------------------------------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await backendAuth.getCurrentUser();
        setUser(res?.user || null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    
  }, []);

  /* ---------------------------------------------
     Asking auth before entering a protected route
  --------------------------------------------- */
  const requireAuth = (path) => {
    if (!user) {
      setRedirectPath(path);
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  /* ---------------------------------------------
     After login
  --------------------------------------------- */
  const handleAuthSuccess = async () => {
  const u = await backendAuth.getCurrentUser();
  setUser(u);
  setAuthModalOpen(false);
  const dest = redirectPath || "/";
  window.location.hash = `#${dest}`;
};


  return (
    <HashRouter>
      <AppProvider>
        <ToastContainer />

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          user={user}
        />

        <div className="flex flex-col min-h-screen text-gray-900">
          <Header
            user={user}
            onLoginClick={() => setAuthModalOpen(true)}
            onProtectedNav={requireAuth}
          />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              {/* Public */}
              <Route
                path="/"
                element={<HomePage user={user} onProtectedNav={requireAuth} />}
              />

              {/* Protected */}
              <Route
                path="/find"
                element={
                  <ProtectedRoute user={user}>
                    <FindParkingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/book/:id"
                element={
                  <ProtectedRoute user={user}>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment"
                element={
                  <ProtectedRoute user={user}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ticket"
                element={
                  <ProtectedRoute user={user}>
                    <TicketPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute user={user}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AppProvider>
    </HashRouter>
  );
};

export default App;
