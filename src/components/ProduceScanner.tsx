
import React, { useState } from 'react';

interface GradingResult {
  crop_name: string;
  grade: string;
  quality_score_percent: number;
  defects_observed: string[];
  estimated_mandi_impact: string;
  summary_marathi: string;
}

export const ProduceScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/grade-produce', {
        method: 'POST',
        body: formData,
      });

      const data: GradingResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Grading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-800 mb-2">AGMARK Quality Check</h3>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 mb-4"
      />

      {loading && <p className="text-blue-600 font-medium">तपासणी सुरू आहे (Analyzing)...</p>}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-bold text-green-900">{result.crop_name} - {result.grade}</p>
          <p className="text-sm text-gray-700">Quality Score: {result.quality_score_percent}%</p>
          <p className="text-sm text-gray-700 mt-1">{result.summary_marathi}</p>
        </div>
      )}
    </div>
  );
};