import express from "express";
import { employeesController } from "../controllers/employees.js";

const router = express.Router();

router.get("/", employeesController.getEmployees);
router.get("/:id", employeesController.getEmployeeById);

export default router;
