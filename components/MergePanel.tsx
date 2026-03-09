import React, { useState, useMemo, useEffect } from 'react';
import { UploadedFile, ExcelRow } from '../types';
import { Button } from './Button';
import { Combine, CheckSquare, Square, FileSpreadsheet, MoreVertical, Layers, ArrowDown, TableProperties } from 'lucide-react';
import { downloadExcelFile } from '../utils/excelUtils';
import { ExportMenu } from './ExportMenu';

interface MergePanelProps {
  files: UploadedFile[];
}

interface ProcessedMerge {
    id: string;
    name: string;
    data: ExcelRow[];
    columns: string[];
    fileCount: number;
    timestamp: Date;
}

export const MergePanel: React.FC<MergePanelProps> = ({ files }) => {
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());
  const [mergedResults, setMergedResults] = useState<ProcessedMerge[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  // Calculate union of headers for the current selection
  const currentSelectionHeaders = useMemo<string[]>(() => {
    const headers = new Set<string>();
    files.filter(f => selectedFileIds.has(f.id)).forEach(f => f.columns.forEach(c => headers.add(c)));
    return Array.from(headers);
  }, [files, selectedFileIds]);

  // Update selectedColumns when file selection changes
  useEffect(() => {
    const headers = new Set<string>();
    files.filter(f => selectedFileIds.has(f.id)).forEach(f => f.columns.forEach(c => headers.add(c)));
    setSelectedColumns(headers);
  }, [files, selectedFileIds]);

  const toggleFile = (id: string) => {
    const next = new Set(selectedFileIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFileIds(next);
  };

  const toggleColumn = (col: string) => {
    const next = new Set(selectedColumns);
    if (next.has(col)) next.delete(col);
    else next.add(col);
    setSelectedColumns(next);
  };

  const handleMerge = () => {
    if (selectedFileIds.size < 2 || selectedColumns.size === 0) return;
    setIsMerging(true);

    // 1. Identify selected files
    const selectedFiles = files.filter(f => selectedFileIds.has(f.id));
    
    // 2. Use selected columns
    const masterHeaders: string[] = Array.from(selectedColumns);

    // 3. Normalize and Combine Data
    let combinedNormalizedData: ExcelRow[] = [];

    selectedFiles.forEach(file => {
        const normalizedFileRows = file.data.map(row => {
            const normalizedRow: ExcelRow = {};
            // Ensure every master header is represented in this row
            masterHeaders.forEach(header => {
                // If the row has the value, use it; otherwise, use empty string to keep cells aligned
                normalizedRow[header] = row[header] !== undefined && row[header] !== null ? row[header] : "";
            });
            return normalizedRow;
        });
        combinedNormalizedData = [...combinedNormalizedData, ...normalizedFileRows];
    });

    // 4. Create Result Object
    const result: ProcessedMerge = {
        id: crypto.randomUUID(),
        name: `Merged_${selectedFiles.length}_Files_${new Date().toLocaleDateString().replace(/\//g, '-')}`,
        data: combinedNormalizedData,
        columns: masterHeaders,
        fileCount: selectedFiles.length,
        timestamp: new Date()
    };

    setMergedResults(prev => [result, ...prev]);
    setIsMerging(false);
    setSelectedFileIds(new Set()); // Reset selection after merge
    setSelectedColumns(new Set());
  };

  if (files.length < 2) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
        <Combine className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Merge Workspace</h3>
        <p className="text-gray-500 mt-2 px-6">
          You need at least two files in the File Manager to use the merge feature.
        </p>
      </div>
    );
  }

  // Calculate union of headers for the current selection to show preview
  // Removed duplicate declaration

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Selection Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Layers className="h-5 w-5 mr-2 text-indigo-600" />
                    Select Files to Merge
                </h3>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {selectedFileIds.size} Selected
                </span>
            </div>

            <div className="space-y-2 max-h-[350px] overflow-y-auto mb-6 pr-2 custom-scrollbar flex-1">
                {files.map(file => {
                    const isSelected = selectedFileIds.has(file.id);
                    return (
                        <div 
                            key={file.id}
                            onClick={() => toggleFile(file.id)}
                            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' 
                                : 'bg-white border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <div className="mr-4">
                                {isSelected ? (
                                    <CheckSquare className="h-5 w-5 text-indigo-600" />
                                ) : (
                                    <Square className="h-5 w-5 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                                    {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {file.data.length} rows • {file.columns.length} headers
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedFileIds.size > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center">
                            <TableProperties className="h-3 w-3 mr-1" />
                            Select Columns to Include ({selectedColumns.size}/{currentSelectionHeaders.length})
                        </h4>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSelectedColumns(new Set(currentSelectionHeaders))}
                                className="text-[10px] text-indigo-600 hover:underline font-medium"
                            >
                                Select All
                            </button>
                            <button 
                                onClick={() => setSelectedColumns(new Set())}
                                className="text-[10px] text-gray-500 hover:underline font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                        {currentSelectionHeaders.map(header => (
                            <button 
                                key={header} 
                                onClick={() => toggleColumn(header)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                    selectedColumns.has(header)
                                    ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                }`}
                            >
                                {header}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <Button 
                onClick={handleMerge} 
                disabled={selectedFileIds.size < 2 || selectedColumns.size === 0 || isMerging}
                className="w-full py-4 rounded-xl shadow-md shadow-indigo-100"
                isLoading={isMerging}
            >
                <Combine className="h-5 w-5 mr-2" />
                Merge {selectedFileIds.size} Files ({selectedColumns.size} Columns)
            </Button>
        </div>

        {/* Results Staging Area */}
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center px-2">
                <ArrowDown className="h-5 w-5 mr-2 text-green-600" />
                Merge History
            </h3>
            
            {mergedResults.length === 0 ? (
                <div className="h-full min-h-[400px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                    <Combine className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Combined files will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {mergedResults.map(result => (
                        <div key={result.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-700">
                                        <FileSpreadsheet className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm truncate max-w-[180px] sm:max-w-[250px]">
                                            {result.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter border border-indigo-100">
                                                {result.fileCount} Files Combined
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {result.data.length} rows • {result.columns.length} cols
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ExportMenu 
                                    trigger={
                                        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    }
                                    onExport={(format) => downloadExcelFile(result.data, result.name, format)}
                                />
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400">Merged at {result.timestamp.toLocaleTimeString()}</span>
                                <div className="flex items-center text-[10px] text-green-600 font-bold uppercase">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                                    Ready to download
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setMergedResults([])}
                        className="w-full text-gray-400 mt-2 hover:text-red-500"
                    >
                        Clear All Merged Files
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};