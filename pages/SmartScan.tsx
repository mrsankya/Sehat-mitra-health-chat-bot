import React, { useState, useRef } from 'react';
import { Camera, Video, Upload, X, Loader2, ScanLine } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeMedia } from '../services/geminiService';

export default function SmartScan() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (activeTab === 'image' && !file.type.startsWith('image/')) return;
      if (activeTab === 'video' && !file.type.startsWith('video/')) return;
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult('');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setResult('');
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1];
        
        const defaultPrompt = activeTab === 'image' 
            ? "Analyze this medical image or report. Identify key features or text. DISCLAIMER: Not a diagnosis."
            : "Analyze this video. Describe movement, form, or key events observed.";

        const analysis = await analyzeMedia(
            base64Data, 
            selectedFile.type, 
            prompt || defaultPrompt
        );
        setResult(analysis || "No analysis generated.");
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (e) {
      console.error(e);
      setResult("Error analyzing media.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <ScanLine className="text-brand-500" />
            Smart Scan Diagnostics
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
            Upload images of symptoms/reports or videos of physical movement for AI analysis.
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
            onClick={() => { setActiveTab('image'); clearFile(); }}
            className={`flex items-center px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'image' ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
            <Camera className="w-4 h-4 mr-2" /> Image
        </button>
        <button
             onClick={() => { setActiveTab('video'); clearFile(); }}
             className={`flex items-center px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'video' ? 'bg-brand-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
            <Video className="w-4 h-4 mr-2" /> Video
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        {!selectedFile ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">Click to upload {activeTab}</p>
                <p className="text-xs text-gray-500 mt-2">Supports {activeTab === 'image' ? 'JPG, PNG' : 'MP4, WEBM'}</p>
            </div>
        ) : (
            <div className="relative rounded-xl overflow-hidden bg-black mb-6">
                <button 
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 z-10"
                >
                    <X size={20} />
                </button>
                {activeTab === 'image' ? (
                    <img src={previewUrl!} alt="Preview" className="max-h-[400px] mx-auto" />
                ) : (
                    <video src={previewUrl!} controls className="max-h-[400px] mx-auto" />
                )}
            </div>
        )}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={activeTab === 'image' ? "image/*" : "video/*"}
            onChange={handleFileSelect}
        />

        <div className="mt-6 flex gap-2">
            <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'image' ? "Ask about this image..." : "What should the AI look for in this video?"}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-gray-900"
            />
            <button 
                onClick={handleAnalyze}
                disabled={!selectedFile || loading}
                className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
            </button>
        </div>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 prose dark:prose-invert max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}