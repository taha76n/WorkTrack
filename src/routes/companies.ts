import express from "express";
import { companiesController } from "../controllers/companies.js";

const router = express.Router();

router.get("/", companiesController.getCompanies);
router.get("/:id", companiesController.getCompaniesById);


export default router;