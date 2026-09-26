import express from "express";

import companiesRoutes from "./routes/companies.js";
import employeesRoutes from "./routes/employees.js";

export const app = express();

app.use(express.json());

app.use("/api/v1/companies", companiesRoutes);
app.use("/api/v1/employees", employeesRoutes);

app.use("/", (req, res) => {
  res.send("<h1>Hello from index.js of WorkTrack</h1>");
});

