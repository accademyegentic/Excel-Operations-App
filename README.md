# ExcelAI Master

A powerful Excel manipulation tool powered by Google Gemini. Upload, analyze, clean, and visualize your spreadsheets with AI assistance.

## Features

- **File Manager**: Upload and manage multiple .xlsx, .xls, .csv, or .txt files.
- **Operations & Cleaning**: 
  - Remove duplicates and empty rows.
  - Batch transformations: Uppercase, Lowercase, Trim, Add/Remove Prefix.
  - **Rename Columns**: Easily modify headers.
  - **Extract Columns**: Export specific columns as new files.
- **VLOOKUP AI**: Perform intelligent lookups between two datasets with a guided interface.
- **Merge Files**: Combine multiple datasets into one, with selective column merging.
- **Smart Insights**: Get AI-powered analysis and suggestions for your data using Google Gemini.
- **Formula AI**: Generate complex Excel/Sheets formulas using natural language.
- **Visualizations**: Create charts (Bar, Line, Scatter, Pie) to visualize trends.
- **Compare Files**: Identify differences between two datasets.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Excel Processing**: SheetJS (xlsx)
- **AI**: Google Gemini API (@google/genai)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd excelfile-operations
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Exporting to GitHub

This project was built using **Google AI Studio Build**. To export it to your own GitHub repository:

1. Open the **Settings** menu (gear icon) in the Google AI Studio interface.
2. Select **Export to GitHub**.
3. Follow the prompts to connect your account and create a new repository.

## License

MIT
