// src/services/razorpayService.js
import { createOrder, verifyPayment } from "./backendService";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// ---------------------------------------
// Load Razorpay script dynamically
// ---------------------------------------
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
};

// ---------------------------------------
// Initialize Razorpay Payment
// ---------------------------------------
export const initializePayment = async (
  amount,
  bookingData,
  onSuccess,
  onFailure
) => {
  try {
    await loadRazorpayScript();

    // Backend: create order (amount already in paisa)
    const order = await createOrder(amount);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Urb-Park",
      description: `Parking booking at ${bookingData.lotName}`,
      order_id: order.id,

      handler: async (response) => {
        try {
          const verification = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verification.success) {
            onSuccess(response, bookingData);
          } else {
            onFailure("Payment verification failed");
          }
        } catch (err) {
          onFailure("Payment verification failed: " + err.message);
        }
      },

      prefill: {
        name: bookingData.customerName || "Customer",
        email: bookingData.customerEmail || "customer@example.com",
        contact: bookingData.customerPhone || "",
      },

      notes: {
        booking_id: `${bookingData.lotId}_${bookingData.slotId}`,
        customer_id: bookingData.uid,
      },

      theme: { color: "#10B981" },

      modal: {
        ondismiss: () => onFailure("Payment cancelled by user"),
      },

      config: {
        display: {
          blocks: {
            banks: {
              name: "Pay using UPI",
              instruments: [{ method: "upi" }],
            },
            other: {
              name: "Other Payment Methods",
              instruments: [{ method: "card" }, { method: "netbanking" }],
            },
          },
          sequence: ["block.banks", "block.other"],
          preferences: { show_default_blocks: false },
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (response) => {
      onFailure(`Payment failed: ${response.error.description}`);
    });

    rzp.open();
  } catch (error) {
    onFailure("Failed to initialize payment: " + error.message);
  }
};

export const getRazorpayKey = () => RAZORPAY_KEY_ID;
