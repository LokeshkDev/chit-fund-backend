import express from "express";
import Plan from "../models/Plan.js";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const plans = await Plan.find();
    const members = await Member.find().populate("planId");
    const payments = await Payment.find({ status: "Paid" }).populate("planId memberId");

    const totalPlans = plans.length;
    const totalMembers = members.length;
    const totalCollection = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Group payments by plan
    const planWise = plans.map((plan) => {
      const planPayments = payments.filter(
        (p) => p.planId?._id.toString() === plan._id.toString()
      );
      const planMembers = members.filter(
        (m) => m.planId?._id.toString() === plan._id.toString()
      );
      const collected = planPayments.reduce((s, p) => s + (p.amount || 0), 0);
      const totalExpected = planMembers.length * plan.monthly * plan.months;
      const pending = totalExpected - collected;

      return {
        planName: plan.name,
        totalMembers: planMembers.length,
        collected,
        pending,
      };
    });

    const pendingMembers = members.filter((m) => {
      const plan = plans.find((p) => p._id.toString() === m.planId?._id.toString());
      const paidMonths = payments.filter(
        (p) => p.memberId?._id.toString() === m._id.toString()
      ).length;
      return paidMonths < (plan?.months || 0);
    }).length;

    res.json({
      totalPlans,
      totalMembers,
      totalCollection,
      pendingMembers,
      planWise,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const plans = await Plan.find();
    const members = await Member.find().populate("planId").sort({ _id: -1 }).limit(5);
    const payments = await Payment.find()
      .populate("memberId planId")
      .sort({ paymentDate: -1 })
      .limit(5);

    const paymentsPaid = await Payment.find({ status: "Paid" });
    const totalCollection = paymentsPaid.reduce((s, p) => s + (p.amount || 0), 0);
    const totalPlans = plans.length;
    const totalMembers = await Member.countDocuments();

    res.json({
      totalPlans,
      totalMembers,
      totalCollection,
      latestMembers: members,
      recentPayments: payments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
