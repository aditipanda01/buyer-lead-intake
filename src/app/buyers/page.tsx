import { Suspense } from 'react';
import { BuyersList } from '@/components/buyers/buyers-list';

export default function BuyersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Leads</h1>
        <p className="text-gray-600">Manage and track your buyer leads</p>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <BuyersList />
      </Suspense>
    </div>
  );
}
