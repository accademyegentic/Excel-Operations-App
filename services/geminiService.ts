import { GoogleGenAI } from "@google/genai";
import { ExcelRow } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to format data context for the model to avoid token limits
const getContext = (data: ExcelRow[], columns: string[]): string => {
  const sample = data.slice(0, 20); // First 20 rows
  return `
    Dataset Columns: ${columns.join(', ')}
    Sample Data (JSON): ${JSON.stringify(sample)}
    Total Rows: ${data.length}
  `;
};

export const analyzeData = async (query: string, data: ExcelRow[], columns: string[]) => {
  const context = getContext(data, columns);
  const prompt = `
    You are an expert data analyst.
    Context:
    ${context}

    User Question: ${query}

    Provide a concise, insightful answer based on the data structure and sample provided.
    If the answer requires calculating specific metrics on the full dataset which you don't have, explain how to calculate it or provide general trends visible in the sample.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze data. Please check your API key or try again.";
  }
};

export const generateExcelFormula = async (description: string, columns: string[]) => {
  const prompt = `
    You are an Excel expert.
    Available Columns: ${columns.join(', ')}

    User Request: ${description}

    Output ONLY the raw Excel formula (e.g., =SUM(A1:A10)). Do not include markdown formatting or explanations.
    Assume data starts at row 2.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Could not generate formula.";
  } catch (error) {
    console.error("Gemini Formula Error:", error);
    return "Error generating formula.";
  }
};

export const suggestCleaning = async (data: ExcelRow[], columns: string[]) => {
  const context = getContext(data, columns);
  const prompt = `
    Analyze this sample data and suggest 3 data cleaning operations that might be needed.
    Context: ${context}
    Return the response as a simple bulleted list of suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Could not generate suggestions.";
  }
};
