import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import helmet  from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth.middleware.ts";
import tenantRoutes from "./routes/routes.tenant.ts";
import managerRoutes from "./routes/routes.manager.ts";
import propertyRoutes from "./routes/routes.property.ts";
import leaseRoutes from "./routes/routes.lease.ts";
import applicationRoutes from "./routes/routes.application.ts";



// Configurations
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());


// Routes
app.get("/", (req, res) => {
    res.send("Hello from server");12
});

app.use("/properties",propertyRoutes);
app.use("/tenants", authMiddleware(["tenant"]),tenantRoutes);
app.use("/managers", authMiddleware(["manager"]),managerRoutes);
app.use("/leases",leaseRoutes);
app.use("/applications",applicationRoutes);

// Server
const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server runing Port: ${PORT}`));



