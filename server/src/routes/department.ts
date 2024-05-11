import express from "express";

import roleMiddleware from "@middleware/roleMiddleware";
import tokenMiddleware from "@middleware/tokenMiddleware";
import {
  createDepartment,
  retrieveAllDepartments,
} from "@services/departmentService";

const app = express.Router();

app.use(tokenMiddleware);
app.use(roleMiddleware);

app.post("/create", async (req, res) => {
  try {
    const { department_name, department_desc } = req.body;
    await createDepartment(department_name, department_desc);

    return res
      .status(200)
      .json({ message: "Successfully created department!" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message:
        "Error: Something wen't wrong when trying to create a department",
      error: err.message,
    });
  }
});

app.get("/retrieve", async (_req, res) => {
  try {
    const departments = await retrieveAllDepartments();

    return res.status(200).json({
      message: "Sucessfully retreved departments!",
      departments: departments,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      message:
        "Error: Something wen't wrong when trying to retrieve departments",
      error: err.message,
    });
  }
});

export default app;
