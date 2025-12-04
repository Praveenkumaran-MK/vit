const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

// Razorpay instance
const razorInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE ORDER
router.post("/order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount required" });
    }

    const order = await razorInstance.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    return res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

module.exports = router;
