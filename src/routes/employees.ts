import express from "express";
import { employeesController } from "../controllers/employees.js";

const router = express.Router();

router.get("/", employeesController.getEmployees);

export default router;
