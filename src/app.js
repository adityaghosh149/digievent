import cors from "cors";
import express from "express";

import superAdminRoutes from "./routes/superadmin.routes.js";

const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));


// routes
app.use("/api/v1/superadmin", superAdminRoutes);
app.use("/api/v1/admin", adminRoutes);

export default app;