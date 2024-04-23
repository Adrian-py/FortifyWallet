import "module-alias/register";
import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectToDatabase } from "@services/databaseService";
import company from "@routes/company";
import user from "@routes/user";
import path from "path";

const app = express();
const PORT: String = process.env.PORT || "3000";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public/")));

// Routes
app.get("/", (_req, res) => {
  res.send("Server Running on PORT " + PORT);
});
app.use("/company", company);
app.use("/user", user);

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
