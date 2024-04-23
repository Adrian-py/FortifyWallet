import express from "express";
import { companyInfo } from "@interfaces/companyInterface";
import {
  saveCompanyInfo,
  verifyCompanyInfo,
} from "@services/onboardingService";

const app = express.Router();

app.post("/onboarding", async (req, res) => {
  const companyInfo: companyInfo = {
    company_id: 1,
    company_name: req.body.company_name,
    company_email: req.body.company_email,
    company_desc: req.body.company_desc,
  };

  try {
    await saveCompanyInfo(companyInfo);
    console.log("Successfully Saved Company Details!");
    res.status(200).json({
      code: 200,
      message: "Successfully Saved Company Details",
    });
  } catch (err: any) {
    console.error("Error: " + err.sqlMessage);
    res.status(500).json({
      code: 500,
      message: "Error: Failed to Save Company Details",
      error: err.sqlMessage,
    });
  }
});

app.get("/verify", async (req, res) => {
  try {
    const company_info = await verifyCompanyInfo();
    if (!company_info) {
      return res.status(404).json({
        code: 404,
        message: "Error: Company Detail not Found!",
      });
    }
    res.status(200).json({
      code: 200,
      message: "Successfully Verified Company Detail",
    });
  } catch (err: any) {
    console.error("Error: " + err.sqlMessage);
    res.status(500).json({
      code: 500,
      message: "Error: Failed to Retrieve Company Details",
      error: err.sqlMessage,
    });
  }
});

export default app;
