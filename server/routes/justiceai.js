import express from "express";
import { removeDocumentFromIndex, getAnswer, cleanIndexByCase } from "../controllers/justiceai.controller.js";


const router = express.Router();

router.post('/getAnswer', getAnswer);
router.post('/removeDocumentFromIndex', removeDocumentFromIndex );
router.post('/cleanIndexByCase', cleanIndexByCase );

export default router;