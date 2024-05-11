import "module-alias/register";
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import https from "https";
import fs from "fs";

import auth from "@routes/auth";
import company from "@routes/company";
import wallet from "@routes/wallet";
import transactions from "@routes/transaction";
import account from "@routes/account";
import department from "@routes/department";
import { connectToDatabase } from "@db/init";

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
app.use("/wallet", wallet);
app.use("/transactions", transactions);
app.use("/accounts", account);
app.use("/departments", department);

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "../cert/server.key")),
  cert: fs.readFileSync(path.join(__dirname, "../cert/server.cert")),
};

// Initiate Server and Database
connectToDatabase()
  .then(() => {
    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log("Connected to PORT " + PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });
