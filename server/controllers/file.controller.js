import { response } from "express";
import File from "../models/File.js";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";
import { v4 as uuidv4 } from 'uuid';
import {createRequire} from 'module';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import { Readable } from 'stream';

const require = createRequire(import.meta.url);

const pdfParse = require('pdf-parse');

export const createFile = async (req, res, next) => {
    try {
        if (!req.body.name || req.body.name.trim() === '' || !req.files || !req.files.pdfFile) {
            return next(createError(400, "Bad Request: Missing required fields."));
        }
        const pdfFile = req.files.pdfFile;
        const result = await pdfParse(pdfFile);
        const folderPath = `files/${req.body.case}`;
        const fileuuid = uuidv4();
        const uniqueFileName = `${fileuuid}${path.extname(pdfFile.name)}`; // Append the original file extension

        const filePath = path.join(folderPath, uniqueFileName);

         // Create the folder if it doesn't exist
         if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        pdfFile.mv(filePath, (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return next(createError(500, 'Error saving file.'));
            }
        });


        const newFile = new File({
            name: req.body.name.trim(),  
            guid: fileuuid, 
            user: req.user.id, 
            case: req.body.case, 
            extractedText: result.text 
        });
        const savedFile = await newFile.save();

        const buffer = Buffer.from(result.text, 'utf-8');
        await addDocumentToCaseIndexAsync(newFile.case, savedFile._id, newFile.name, buffer);

        return next(createSuccess(201, "File created successfully.", savedFile._id));
    } catch (error) {
        console.error("Error in createFile:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const getAllFilesByCaseIdAndUserId = async (req, res, next) => {
    try {
        const files = await File.find({ user: req.user.id, case: req.query.case });
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

const addDocumentToCaseIndexAsync = async (caseId, fileId, fileName, buffer) => {
    try {
        const form = new FormData();
        form.append('case_id', String(caseId));
        form.append('document_id', String(fileId));
        form.append('document', buffer, { filename: `${fileName}.txt`, contentType: 'text/plain' });
        const response = await axios.post(
            `${process.env.JUSTICE_AI_URL}/store_document/`,
            form,
            { headers: form.getHeaders() }
        );
        return response.status === 201;
    } catch (error) {
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
        } else {
            console.error('Error Message:', error.message);
        }
        throw new Error('Failed to upload document.');
    }
};