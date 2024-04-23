import "module-alias/register";
import express from "express";
import "dotenv/config";

import company from "@routes/company";
import { connectToDatabase } from "@services/databaseService";

const app = express();
const PORT: String = process.env.PORT || "3000";

// Middleware
app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.send("Server Running on PORT " + PORT);
});
app.use("/company", company);

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
