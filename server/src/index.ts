import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import helmet  from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth.middleware.ts";
import tenantRoutes from "./routes/routes.tenant.ts";
import managerRoutes from "./routes/routes.manager.ts";

// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();


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


app.use("/tenants", authMiddleware(["tenant"]),tenantRoutes);
app.use("/managers", authMiddleware(["manager"]),managerRoutes);

// Server
const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server runing Port: ${PORT}`));


// async function getAllTenants(cognitoId: string) {
//   try {
//     const managers = await prisma.manager.findUnique({
//       where: { cognitoId },
//     });
//     console.log(managers);
//   } catch (error) {
//     console.error("Error fetching tenants:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// getAllTenants("us-east-2:90123456-90ab-cdef-1234-567890abcdef");
