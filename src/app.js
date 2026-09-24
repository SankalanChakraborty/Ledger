import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import {
  authenticateToken,
  errorHandler,
} from "./middlewares/auth.middleware.js";
const app = express();

console.log("Loaded src/app.js");

const BASE_URI = "/api/user";

app.use(express.json());
app.use(cookieParser());
app.use(`${BASE_URI}/auth`, userRouter);
app.use(errorHandler);

export default app;
