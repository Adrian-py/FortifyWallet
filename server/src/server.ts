import express from "express";
import "dotenv/config";

import onboarding from "../routes/onboarding";
import { connectToDatabase } from "../db/connect";

const app = express();
const PORT: String = process.env.PORT || "3000";

// Middleware
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.send("Server Running on PORT " + PORT);
});
app.use("/onboarding", onboarding);

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
