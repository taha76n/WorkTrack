import { Request, Response } from "express";
import pool from "../db/pool.js";

type SqlValue = string | number | boolean | string[];

const getEmployees = async (req: Request, res: Response) => {
  try {
    const statusQuery = req.query.status;
    const limitQuery = req.query.limit;
    const sortQuery = req.query.sort;
    const orderQuery = req.query.order;
    const offsetQuery = req.query.offset;

    const status = typeof statusQuery === "string" ? statusQuery : undefined;

    const limit =
      typeof limitQuery === "string" ? parseInt(limitQuery, 10) : undefined;

    const SORTABLE = [
      "hire_date",
      "salary",
      "first_name",
      "last_name",
      "created_at",
    ];

    const sortBy =
      typeof sortQuery === "string" && SORTABLE.includes(sortQuery)
        ? sortQuery
        : "hire_date";

    const order = orderQuery === "desc" ? "DESC" : "ASC";

    const offset =
      typeof offsetQuery === "string" ? parseInt(offsetQuery, 10) : undefined;

    const conditions: string[] = [];
    const values: SqlValue[] = [];
    let limitClause = "";
    let offsetClause = "";

    let i = 1;

    if (status) {
      const statuses = status.split(",");
      conditions.push(`status = ANY($${i})`);
      values.push(statuses);
      i++;
    }

    if (limit !== undefined && Number.isInteger(limit) && limit > 0) {
      const finalLimit = Math.min(limit, 100);
      values.push(finalLimit);
      limitClause = `LIMIT $${i}`;
      i++;
    }

    if (offset !== undefined && Number.isInteger(offset) && offset >= 0) {
      values.push(offset);
      offsetClause = `OFFSET $${i}`;
      i++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
     SELECT id, first_name, last_name, email, status
     FROM employees
     ${where}
     ORDER BY ${sortBy} ${order}
     ${limitClause} 
     ${offsetClause}
     `;

    const result = await pool.query(sql, values);

    if (result.rows.length == 0) {
      return res.status(200).json({
        success: true,
        message: "Employees fetched successfully",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const employeeId = req.params.id;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee id is missing  the params",
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email, status, hire_date FROM employees WHERE id=$1`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    return res
      .status(400)
      .json({ success: false, message: "Internal server error", error });
  }
};

export const employeesController = {
  getEmployees,
  getEmployeeById,
};
