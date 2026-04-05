import express from "express";
import templateRoutes from "./routes/template.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "template-service",
  });
});

app.use("/", templateRoutes);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`template-service running on port ${PORT}`);
});