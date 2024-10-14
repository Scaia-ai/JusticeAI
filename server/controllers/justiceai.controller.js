import { createError } from "../utils/error.js";
import { createSuccess } from "../utils/success.js";
import FormData from 'form-data';
import axios from 'axios';

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
        throw new Error('Failed to upload document.');
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

