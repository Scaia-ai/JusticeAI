import { response } from "express";
import Case from "../models/Case.js";
import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";
import { promises as fs } from 'fs';

export const createCase = async (req, res, next) => {
    try {
        const { name, number } = req.body;
        if (!name?.trim() || !number?.trim()) {
            return next(createError(400, "Bad Request: Name and Number are required."));
        }

        const newCase = new Case({
            name: name.trim(),
            number: number.trim(),
            user: req.user.id
        });

        const savedCase = await newCase.save();
        const folderPath = `files/${savedCase._id}`;
        await createFolder(folderPath);
        return next(createSuccess(200, "Case created successfully.", savedCase._id));
    } catch (error) {
        console.error("Error in createCase:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const updateCase = async (req, res, next) => {
    try {
        const caseId = req.params.id;
        const existingCase = await Case.findOne({ _id: caseId, user: req.user.id });
        if (!existingCase) {
            return next(createError(404, "Case not found."));
        }

        const updatedCase = await Case.findByIdAndUpdate(caseId, { $set: req.body }, { new: true });
        return next(createSuccess(200, "Case updated successfully."));
    } catch (error) {
        console.error("Error in updateCase:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const getAllCasesByUserId = async (req, res, next) => {
    try {
        console.log(req.user.id);
        const excludedFields = '-user';
        const cases = await Case.find({ user: req.user.id }).select(excludedFields);        
        if (!cases.length) {
            return next(createError(404, "No cases found for the user."));
        }
        return next(createSuccess(200, "Success", cases));
    } catch (error) {
        console.error("Error in getAllCasesByUserId:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const deleteCase = async (req, res, next) => {
    try {
        const caseId = req.params.id;
        const caseToDelete = await Case.findOne({ _id: caseId, user: req.user.id });

        if (!caseToDelete) {
            return next(createError(404, "Case not found."));
        }

        await Case.findByIdAndDelete(caseId);
        return next(createSuccess(201, "Case deleted successfully."));
    } catch (error) {
        console.error("Error in deleteCase:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

const createFolder = async (folderPath) => {
    try {
        await fs.access(folderPath);
    } catch {
        try {
            await fs.mkdir(folderPath, { recursive: true });
            console.log("Folder created successfully:", folderPath);
        } catch (mkdirError) {
            console.error("Error creating folder:", mkdirError);
        }
    }
};