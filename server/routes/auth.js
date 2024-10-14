import express from "express";
import { login, register, waitlist } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/waitlist", waitlist);

export default router;