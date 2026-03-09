import React, { useState, useEffect } from 'react';
import { UploadedFile } from '../types';
import { analyzeData } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, MessageSquare, ChevronDown } from 'lucide-react';

interface AnalysisPanelProps {
  files: UploadedFile[];
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ files }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!files.find(f => f.id === selectedFileId) && files.length > 0) {
        setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const activeFile = files.find(f => f.id === selectedFileId);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !activeFile) return;

    setLoading(true);
    const result = await analyzeData(query, activeFile.data, activeFile.columns);
    setResponse(result);
    setLoading(false);
  };

  if (!activeFile) return <div className="text-center py-10">No files available.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* File Selector */}
      <div className="flex justify-end">
         <div className="relative w-64">
            <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="appearance-none w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {files.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">Smart Insights for {activeFile.name}</h2>
                <p className="text-indigo-100 max-w-2xl">
                Ask questions about your data in plain English. Our AI analyzes the structure and content to provide summaries, trends, and answers.
                </p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to know?
            </label>
            <div className="relative">
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What is the average sales price? Are there any outliers in the age column?"
                className="block w-full rounded-lg border-gray-300 border p-4 pr-12 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                 <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={loading} disabled={!query.trim()}>
              Analyze Data
            </Button>
          </div>
        </form>
      </div>

      {response && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-indigo-500 mr-2" />
            AI Analysis Result
          </h3>
          <div className="prose prose-indigo max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      )}
    </div>
  );
};
