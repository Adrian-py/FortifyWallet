import "module-alias/register";
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";

import auth from "@routes/auth";
import { connectToDatabase } from "@db/init";
import company from "@routes/company";
import { initializeWallet } from "@services/walletService";

const app = express();
const PORT: String = process.env.PORT || "5000";

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public/")));

// Routes
app.use("/company", company);
app.use("/auth", auth);

// Initiate Server and Database
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Connected to PORT " + PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });
