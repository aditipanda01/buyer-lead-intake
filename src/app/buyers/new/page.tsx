'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerForm } from '@/components/buyers/buyer-form';
import { createBuyerSchema, type CreateBuyerInput } from '@/lib/validations/buyer';

export default function NewBuyerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateBuyerInput) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/buyers');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to create buyer');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Lead</h1>
        <p className="text-gray-600">Add a new buyer lead to your system</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <BuyerForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
