import express from "express";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ service: "notification-api running" });
});

app.use("/", notificationRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`notification-api running on port ${PORT}`);
});