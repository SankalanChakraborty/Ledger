import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", userController.createUser);
router.post("/login", userController.login);
router.post("/logout", authenticateToken, userController.logout);

export default router;
