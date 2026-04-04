import express from "express";
import notificationRoutes from "./routes/notification.routes.js";
import logger from "./config/logger.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  // logger.info("Health check hit");
  res.json({ service: "notification-api running" });
});

app.use("/", notificationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`notification-api running on port ${PORT}`);
});