import { Request, Response } from "express";
import pool from "../db/pool.js";

type SqlValue = string | number | boolean | string[];

const getEmployees = async (req: Request, res: Response) => {
  try {
    const statusQuery = req.query.status;

    const status = typeof statusQuery === "string" ? statusQuery : undefined;

    const conditions: string[] = [];
    const values: SqlValue[] = [];

    let i = 1;

    if (status) {
      const statuses = (status as string).split(",");
      conditions.push(`status = ANY($${i})`);
      values.push(statuses);
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT id, first_name, last_name, email, status FROM employees ${where} ORDER BY hire_date`;

    const result = await pool.query(sql, values);

    if (result.rows.length == 0) {
      return res.status(404).json({
        success: true,
        message: "No employees found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const employeesController = {
  getEmployees,
};
