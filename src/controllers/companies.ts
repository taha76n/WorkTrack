import { Request, Response } from "express";
import pool from "../db/pool.js";

const getCompanies = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, industry, created_at FROM companies ORDER BY created_at"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: true, message: "No Companies found" });
    }

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getCompaniesById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await pool.query(
      `SELECT id, name, industry, created_at FROM companies WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Company fetched successfully",
        data: result.rows[0],
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const companiesController = {
  getCompanies,
  getCompaniesById,
};
