import express from "express";
import Payment from "../models/Payment.js";

const router = express.Router();

// ✅ Get all payments
router.get("/", async (req, res) => {
  const payments = await Payment.find().populate("memberId planId");
  res.json(payments);
});

// ✅ Create or toggle payment
router.post("/", async (req, res) => {
  const { memberId, planId, period, amount, paymentMode, transactionNo } = req.body;

  // Check if record exists
  let payment = await Payment.findOne({ memberId, period });

  if (payment) {
    // Toggle between Paid ↔ Pending
    payment.status = payment.status === "Paid" ? "Pending" : "Paid";
    payment.amount = amount;
    if (payment.status === "Paid") payment.paymentMode = paymentMode || "Cash";
    await payment.save();
    return res.json({ message: "Payment toggled", payment });
  } else {
    // Create new Paid record
    payment = new Payment({
      memberId,
      planId,
      period,
      amount,
      paymentMode: paymentMode || "Cash",
      status: "Paid",
      transactionNo: transactionNo || null,
      paymentDate: new Date(),
    });
    await payment.save();
    return res.status(201).json({ message: "Payment created", payment });
  }
});

// ✅ Update (if needed)
router.put("/:id", async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(payment);
});

// ✅ Delete payment
router.delete("/:id", async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
