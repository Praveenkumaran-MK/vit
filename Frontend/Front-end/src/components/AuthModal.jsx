import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "../services/authService";
import { toast } from "react-toastify";

export default function AuthModal({ open, onClose, onSuccess, user }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const [login, setLogin] = useState({ email: "", password: "" });

  // FIXED: phone field correctly included
  const [signup, setSignup] = useState({
    email: "",
    phone: "",
    password: "",
    confirmpassword: "",
    name: "",
  });

  // If modal is opened while user is already logged in
  useEffect(() => {
    if (open && user) {
      toast.info("You are already registered and logged in!");
      onClose();
    }
  }, [open, user, onClose]);

  const handleLoginChange = (e) =>
    setLogin({ ...login, [e.target.name]: e.target.value });

  const handleSignupChange = (e) =>
    setSignup({ ...signup, [e.target.name]: e.target.value });

  // ------------------------------
  // LOGIN USING /login
  // ------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(login.email, login.password);

      toast.success("Login successful!");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // SIGNUP USING /signup
  // ------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    if (signup.password !== signup.confirmpassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signup.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(
        signup.email,
        signup.password,
        signup.phone, // FIXED: correct field
        signup.name
      );

      toast.success("Signup successful!");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Signup failed";

      if (msg.toLowerCase().includes("email") && msg.includes("registered")) {
        toast.error("Email already registered. Please login.");
        setTab("login");
        setLogin({ email: signup.email, password: "" });
      } else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    toast.info("Password reset not implemented.");
  };

  if (!open) return null;

  // If user already logged in → show simple dialog
  if (user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
        <div className="bg-white rounded-xl shadow-2xl p-8 relative w-full max-w-md text-center">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 text-2xl hover:text-gray-700"
          >
            &times;
          </button>

          <h3 className="text-xl font-bold">Already Logged In</h3>
          <p className="text-yellow-600">{user.email}</p>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-yellow-400 py-2 rounded-lg font-bold"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------
  // MAIN AUTH MODAL UI
  // -------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-8 relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 text-2xl hover:text-gray-700"
        >
          &times;
        </button>

        {/* TABS */}
        <div className="flex mb-8">
          <button
            onClick={() => {
              setTab("login");
              setShowReset(false);
            }}
            className={`flex-1 py-2 font-semibold ${
              tab === "login" ? "bg-yellow-400" : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => {
              setTab("signup");
              setShowReset(false);
            }}
            className={`flex-1 py-2 font-semibold ${
              tab === "signup"
                ? "bg-yellow-400"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Signup
          </button>
        </div>

        {/* RESET PASSWORD UI */}
        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="input"
            />
            <button className="btn-yellow" type="submit">
              Send Reset Link
            </button>
            <button
              type="button"
              className="text-yellow-600 underline"
              onClick={() => setShowReset(false)}
            >
              Back to Login
            </button>
          </form>
        ) : tab === "login" ? (
          // ---------------- LOGIN FORM ----------------
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              className="input"
              type="email"
              name="email"
              value={login.email}
              onChange={handleLoginChange}
              placeholder="Email"
              required
            />

            <input
              className="input"
              type="password"
              name="password"
              value={login.password}
              onChange={handleLoginChange}
              placeholder="Password"
              required
            />

            <button className="btn-yellow" type="submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          // ---------------- SIGNUP FORM ----------------
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              className="input"
              type="text"
              name="name"
              placeholder="Full Name"
              value={signup.name}
              onChange={handleSignupChange}
              required
            />

            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email"
              value={signup.email}
              onChange={handleSignupChange}
              required
            />

            {/* FIXED: phone input now matches state */}
            <input
              className="input"
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={signup.phone}
              onChange={handleSignupChange}
              required
            />

            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={signup.password}
              onChange={handleSignupChange}
              required
            />

            <input
              className="input"
              type="password"
              name="confirmpassword"
              placeholder="Confirm Password"
              value={signup.confirmpassword}
              onChange={handleSignupChange}
              required
            />

            <button className="btn-yellow" type="submit">
              {loading ? "Signing up..." : "Signup"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

