import React, { createContext, useContext, useState, useEffect } from "react";
import useAuth from "./useAuth";
import {
  getNotifications,
  clearNotifications,
  deleteNotification,
  addNotification,
} from "../services/userService";

// Create context
const AppContext = createContext(null);

// -----------------------------
// PROVIDER
// -----------------------------
export const AppProvider = ({ children }) => {
  const { user, loading, setUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [booking, setBooking] = useState(null);

  // Load notifications only when user exists
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUserProfile(null);
      return;
    }

    (async () => {
      try {
        const res = await getNotifications(user.id);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err.message);
      }
    })();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        setUser,
        notifications,
        setNotifications,
        userProfile,
        setUserProfile,
        booking,
        setBooking,
        addNotification,
        clearNotifications,
        deleteNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// -----------------------------
// HOOK
// -----------------------------
export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used inside <AppProvider>");
  }
  return ctx;
};

// Export default for flexibility
export default AppProvider;
