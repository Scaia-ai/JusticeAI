import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { createFile, deleteFile, getAllFilesByCaseIdAndUserId, getFileById, getFilePdfById } from "../controllers/file.controller.js";


const router = express.Router();

router.post('/create', verifyToken, createFile);

router.get('/getAll', verifyToken, getAllFilesByCaseIdAndUserId );

router.delete('/delete/:id', verifyToken, deleteFile );

router.get('/:id/', verifyToken, getFileById );

router.get('/:id/pdf', verifyToken, getFilePdfById );


export default router;