import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js";

import plansRouter from "./routes/plans.js";
import membersRouter from "./routes/members.js";
import paymentsRouter from "./routes/payments.js";
import reportsRouter from "./routes/reports.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/plans", plansRouter);
app.use("/api/members", membersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
