import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import cors from "cors";
import morgan from "morgan";
import routers from "./routes/index.routes.js";
import connectDB from "./config/database.js"; // MongoDB connection
import dotenv from "dotenv";
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CORS middleware */
app.use(cors('*'));
app.use(morgan("dev"));


/* Static files */
app.use("/public", express.static(path.join(__dirname, "../public")));

/* Body parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Disable ETag */
app.set("etag", false);

// Set Global Variable
import config from './config/flle-paths.js';
global.config = config;

/* Routes */
app.use("/api", routers);

/* 404 Handler */
app.get("/*", (req, res) => {
  res.status(404).send({
    status: "error",
    message: "Route not found",
  })
});

/* Global Error Handler */
app.use((err, req, res, next) => {
  if (err === "AccessDenied") {
    return res.status(403).send({
      status: "error",
      message: "Access Denied!",
    });
  }

  res.status(500).send({
    status: "error",
    message: err.message || err.MongoServerError || "Something went wrong!",
  });
});

/* Start Server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
  await connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
