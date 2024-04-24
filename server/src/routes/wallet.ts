import express from "express";
import tokenMiddleware from "middleware/tokenMiddleware";

const app = express.Router();

app.use(tokenMiddleware);

app.get("/wallets", (req, res) => res.send("wallets"));

export default app;
