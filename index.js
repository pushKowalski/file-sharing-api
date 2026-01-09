import "dotenv/config";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import {
  notFoundError,
  globalErrorHandler,
} from "./middlewares/error.middleware.js";

const app = express();
const PORT = process.env.PORT ?? 7000;

app.use(express.json());

app.get("/health", (req, res) => {
  return res.json({
    success: true,
    status: "Server is up and running...",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/file", fileRoutes);

app.use(notFoundError);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`💻💻 Server is up and running on port: ${PORT}`);
});
