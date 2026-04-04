import express from "express";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "analytics-service",
  });
});

app.use("/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`analytics-service running on port ${PORT}`);
});