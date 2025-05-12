import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";
import FormData from 'form-data';
import { createReadStream } from 'fs'; // For stream (used in OCR)
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';

export const getAnswer = async (req, res, next) => {
    try {
        const { caseId, question, chatHistory } = req.body;

        const questionText = decodeURIComponent(question);

        const case_ids = [caseId];
        const form = new FormData();
        form.append('question', questionText);
        form.append('case_ids', JSON.stringify(case_ids));
        form.append('chat_history', JSON.stringify(chatHistory));

        const response = await axios.post(
            `${process.env.JUSTICE_AI_URL}/question_case/`,
            form,
            { headers: form.getHeaders() }
        );

        return next(createSuccess(200,"Success", response.data));
    } catch (error) {
        console.log(error);
        return next(createError(500, "Error fetching answer."));
    }
};

export const getExtractedData = async (content) => {
    try {
        if (!content || typeof content !== 'string') {
            throw new Error("Bad Request: 'content' must be a string.");
        }

        const response = await axios.post(
            `${process.env.JUSTICE_AI_URL}/extract_data/`,
            content, // plain text
            {
                headers: {
                    'Content-Type': 'text/plain',
                }
            }
        );
        return response.data
    } catch (error) {
        console.error("getExtractedData error:", error.response?.data || error.message);
        throw new Error("Entity extraction failed.");
    }
};

export const cleanIndexByCase = async (req, res, next) => {
    try {
        const { caseId } = req.body;
        const formData = new URLSearchParams();
        formData.append('case_id', caseId);
        console.log(caseId);
        const response = await axios.post(
            `${process.env.JUSTICE_AI_URL}/clean_case_index/`,
            formData
        );

        if (response.status === 201) {
            return next(createSuccess(200, "Index cleaned successfully."));
        } else {
            return next(createError(400, "Failed to clean index."));
        }
    } catch (error) {
        if (error.response) {
            console.error('Error Response Data:', error.response.data);
            console.error('Error Response Status:', error.response.status);
        } else {
            console.error('Error Message:', error.message);
        }
        return next(createError(500, "Error cleaning Index."));
    }
};

export const performOcrRequest = async (filePath) => {
  try {
    const form = new FormData();
    form.append('document', createReadStream(filePath)); // ✅ streaming works

    const response = await axios.post(
      `${process.env.JUSTICE_AI_URL}/ocr/`,
      form,
      {
        headers: form.getHeaders()
      }
    );

    return response.data;
  } catch (error) {
    console.error("OCR request failed:", error.response?.data || error.message);
    throw new Error("OCR extraction failed.");
  }
};

export const removeDocumentFromIndex = async (req, res, next) => {
    try {
        const { caseId, documentId } = req.body;
        const formData = new URLSearchParams();
        formData.append('case_id', caseId);
        formData.append('document_id', documentId);

        const response = await axios.post(
            `${process.env.JUSTICE_AI_URL}/remove_document_case_index/`,
            formData
        );

        if (response.status === 201) {
            return next(createSuccess(200, "Document removed successfully."));
        } else {
            return next(createError(400, "Failed to clean index."));
        }
    } catch (error) {
        console.log(error);
        return next(createError(500, "Internal Server Error."));
    }
};

