import express from "express";
import * as userController from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", userController.createUser);
router.post("/login", userController.login);

export default router;
