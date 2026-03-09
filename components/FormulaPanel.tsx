import React, { useState, useEffect } from 'react';
import { UploadedFile } from '../types';
import { generateExcelFormula } from '../services/geminiService';
import { Button } from './Button';
import { Copy, Check, Calculator, ChevronDown, ArrowRightCircle } from 'lucide-react';

interface FormulaPanelProps {
  files: UploadedFile[];
  onAddToPipeline?: (fileId: string, formula: string, targetColumn: string) => void;
}

export const FormulaPanel: React.FC<FormulaPanelProps> = ({ files, onAddToPipeline }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [description, setDescription] = useState('');
  const [formula, setFormula] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [targetColumnName, setTargetColumnName] = useState('New_Formula_Col');

  useEffect(() => {
    if (!files.find(f => f.id === selectedFileId) && files.length > 0) {
        setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const activeFile = files.find(f => f.id === selectedFileId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !activeFile) return;

    setLoading(true);
    const result = await generateExcelFormula(description, activeFile.columns);
    setFormula(result);
    setLoading(false);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (formula) {
      navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendToPipeline = () => {
    if (onAddToPipeline && formula && activeFile) {
        onAddToPipeline(activeFile.id, formula, targetColumnName);
    }
  };

  if (!activeFile) return <div className="text-center py-10">No files available.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
           <div className="flex items-center">
             <Calculator className="h-5 w-5 text-indigo-600 mr-2" />
             <h3 className="font-bold text-gray-900">Formula Generator</h3>
           </div>
           <div className="text-xs text-gray-500">
             Powered by Gemini
           </div>
        </div>
        
        <div className="p-6 space-y-6">
            <div>
                <p className="text-sm text-gray-600 mb-4">
                    Describe what you want to calculate for <strong>{activeFile.name}</strong>, and we'll generate the Excel formula for you.
                    <br />
                    <span className="text-xs text-gray-400">Available columns: {activeFile.columns.join(', ')}</span>
                </p>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Sum the 'Sales' column if 'Region' is 'West' and 'Date' is in 2023"
                        className="block w-full rounded-lg border-gray-300 border p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={loading} disabled={!description.trim()}>
                            Generate Formula
                        </Button>
                    </div>
                </form>
            </div>

            {formula && (
                <div className="mt-6 space-y-4 animate-fade-in">
                    <div className="bg-gray-900 rounded-lg p-4 relative group">
                        <div className="text-gray-400 text-xs mb-1 uppercase tracking-wider font-semibold">Result</div>
                        <code className="text-green-400 font-mono text-lg block overflow-x-auto pb-2">
                            {formula}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-4 right-4 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-indigo-800 mb-1">Target Column Name</label>
                            <input 
                                type="text"
                                value={targetColumnName}
                                onChange={(e) => setTargetColumnName(e.target.value)}
                                className="block w-full rounded-md border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-sm"
                            />
                        </div>
                        <Button 
                            onClick={handleSendToPipeline} 
                            variant="primary" 
                            className="whitespace-nowrap mt-4 sm:mt-0"
                        >
                            <ArrowRightCircle className="h-4 w-4 mr-2" />
                            Add to Operations
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
