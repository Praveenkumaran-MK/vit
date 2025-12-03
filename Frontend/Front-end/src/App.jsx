import React, { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
// import AuthModal from "./components/AuthModal"; 
import { AppProvider } from "./context/AppContext";

import HomePage from "./pages/HomePage";
import FindParkingPage from "./pages/FindParkingPage";
import BookingPage from "./pages/BookingPage";
import TicketPage from "./pages/TicketPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPage from "./pages/PaymentPage";
import NotFoundPage from "./pages/NotFoundPage";

/* import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";*/

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// ----------------------------
//     Protected Route Wrapper
// ----------------------------
const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" replace />;
};


const App = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");
  const user = null; // ← replace with useAuthState or global context


  // Handle when user tries to visit a protected page
  const requireAuth = (path) => {
    if (!user) {
      setRedirectPath(path);
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };


  // After successful login
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    if (user) {
      window.location.hash = `#${redirectPath}`;
    }
  };


  return (
    <HashRouter>
      <AppProvider>
        <ToastContainer />

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />

        <div className="flex flex-col min-h-screen font-sans text-gray-900">
          <Header
            user={user}
            onLoginClick={() => setAuthModalOpen(true)}
            onProtectedNav={requireAuth}
          />

          <main className="flex-grow container mx-auto px-4 py-8">

            <Routes>
              {/* ---------------------
                    Public Routes
                --------------------- */}
              <Route path="/" element={<HomePage user={user} onProtectedNav={requireAuth} />} />
            {/*   <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} /> */}

              {/* ---------------------
                 Protected Routes
              ---------------------- */}
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

              {/* Not found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
          <Chatbot />
        </div>
      </AppProvider>
    </HashRouter>
  );
};

export default App;
