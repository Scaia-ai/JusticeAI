import express from "express";
import { createCase, deleteCase, getAllCasesByUserId, updateCase } from "../controllers/case.controller.js";
import { verifyToken } from "../utils/verifyToken.js";


const router = express.Router();

router.post('/create', verifyToken, createCase);

router.put('/update/:id', verifyToken, updateCase );

router.get('/getAll', verifyToken, getAllCasesByUserId );

router.delete('/delete/:id', verifyToken, deleteCase );

export default router;