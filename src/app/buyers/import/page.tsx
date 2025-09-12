'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileText } from 'lucide-react';

interface ImportError {
  row: number;
  message: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
}

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/buyers/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.imported > 0) {
          // Clear the file input
          setFile(null);
          const fileInput = document.getElementById('file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        }
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status',
      'John Doe,john@example.com,9876543210,Chandigarh,Apartment,2,Buy,5000000,8000000,3-6m,Website,Interested in 2BHK apartment,premium,New',
      'Jane Smith,,9876543211,Mohali,Villa,3,Buy,10000000,15000000,>6m,Referral,Looking for villa with garden,premium,New'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buyers-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Buyers</h1>
        <p className="text-gray-600">Import buyer leads from a CSV file</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file">CSV File</Label>
              <input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum 200 rows allowed. Download template for correct format.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={!file || isLoading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Importing...' : 'Import Buyers'}
              </Button>
            </div>
          </form>
        </div>

        {/* Instructions and Template */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Instructions</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900">Required Fields:</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>fullName (2-80 characters)</li>
                  <li>phone (10-15 digits)</li>
                  <li>city (Chandigarh, Mohali, Zirakpur, Panchkula, Other)</li>
                  <li>propertyType (Apartment, Villa, Plot, Office, Retail)</li>
                  <li>purpose (Buy, Rent)</li>
                  <li>timeline (0-3m, 3-6m, &gt;6m, Exploring)</li>
                  <li>source (Website, Referral, Walk-in, Call, Other)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Optional Fields:</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>email (valid email format)</li>
                  <li>bhk (1, 2, 3, 4, Studio) - Required for Apartment/Villa</li>
                  <li>budgetMin, budgetMax (numbers)</li>
                  <li>notes (max 1000 characters)</li>
                  <li>tags (comma-separated)</li>
                  <li>status (New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Template</h2>
            <p className="text-sm text-gray-600 mb-4">
              Download the CSV template with the correct format and sample data.
            </p>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {result && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h2>
          
          {result.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">
                  Successfully imported {result.imported} buyer(s).
                </p>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Errors ({result.errors.length} rows failed):
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700">
                          <span className="font-medium">Row {error.row}:</span> {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => router.push('/buyers')}>
                  View All Buyers
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Import failed. Please check your file and try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
