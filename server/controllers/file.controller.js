import { response } from "express";
import File from "../models/File.js";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";
import { v4 as uuidv4 } from 'uuid';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);

const pdfParse = require('pdf-parse');

export const createFile = async (req, res, next) => {
    try {
        if (!req.body.name || req.body.name.trim() === '' || !req.files || !req.files.pdfFile) {
            return next(createError(400, "Bad Request: Missing required fields."));
        }
        const pdfFile = req.files.pdfFile;
        const result = await pdfParse(pdfFile);
        
        const newFile = new File({
            name: req.body.name.trim(),  
            guid: uuidv4(), 
            user: req.user.id, 
            case: req.body.case, 
            extractedText: result.text 
        });
        const savedFile = await newFile.save();
        return next(createSuccess(201, "File created successfully.", savedFile._id));
    } catch (error) {
        console.error("Error in createFile:", error);
        if (error instanceof pdfParse.ParseError) {
            return next(createError(400, "Invalid PDF file."));
        }
        return next(createError(500, "Internal Server Error."));
    }
};

export const getAllFilesByCaseIdAndUserId = async (req, res, next) => {
    try {
        const files = await File.find({ user: req.user.id, case: req.body.case });
        if (!files.length) return next(createError(404, "No files found for the specified case and user."));
        return next(createSuccess(200, "Success", files));
    } catch (error) {
        console.error("Error in getAllFilesByCaseIdAndUserId:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const deleteFile = async (req, res, next) => {
    try {
        const file = await File.findOne({ _id: req.params.id, user: req.user.id });
        if (!file) return next(createError(404, "File not found."));
        await file.deleteOne();
        return next(createSuccess(200, "File deleted successfully.", file._id));
    } catch (error) {
        console.error("Error in deleteFile:", error);
        return next(createError(500, "Internal Server Error."));
    }
};