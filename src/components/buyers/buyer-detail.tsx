'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Edit, ArrowLeft, Trash2 } from 'lucide-react';
import type { Buyer, BuyerHistory } from '@/lib/db/schema';

interface BuyerDetailProps {
  buyer: Buyer;
  history: BuyerHistory[];
}

export function BuyerDetail({ buyer, history }: BuyerDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/buyers/${buyer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/buyers');
      } else {
        alert('Failed to delete buyer');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{buyer.fullName}</h1>
            <p className="text-gray-600">Lead Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">{buyer.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{buyer.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{buyer.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <p className="text-sm text-gray-900">{buyer.city}</p>
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Property Type</label>
                <p className="text-sm text-gray-900">{buyer.propertyType}</p>
              </div>
              {buyer.bhk && (
                <div>
                  <label className="text-sm font-medium text-gray-500">BHK</label>
                  <p className="text-sm text-gray-900">{buyer.bhk}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-sm text-gray-900">{buyer.purpose}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Timeline</label>
                <p className="text-sm text-gray-900">{buyer.timeline}</p>
              </div>
            </div>
          </div>

          {/* Budget Information */}
          {(buyer.budgetMin || buyer.budgetMax) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyer.budgetMin && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Minimum Budget</label>
                    <p className="text-sm text-gray-900">{formatCurrency(buyer.budgetMin)}</p>
                  </div>
                )}
                {buyer.budgetMax && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Maximum Budget</label>
                    <p className="text-sm text-gray-900">{formatCurrency(buyer.budgetMax)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="text-sm text-gray-900">{buyer.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                  buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                  buyer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                  buyer.status === 'Visited' ? 'bg-purple-100 text-purple-800' :
                  buyer.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                  buyer.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {buyer.status}
                </span>
              </div>
              {buyer.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{buyer.notes}</p>
                </div>
              )}
              {buyer.tags && buyer.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {buyer.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Current Status</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  buyer.status === 'New' ? 'bg-blue-100 text-blue-800' :
                  buyer.status === 'Qualified' ? 'bg-green-100 text-green-800' :
                  buyer.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                  buyer.status === 'Visited' ? 'bg-purple-100 text-purple-800' :
                  buyer.status === 'Negotiation' ? 'bg-orange-100 text-orange-800' :
                  buyer.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {buyer.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-900">{formatDate(buyer.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm text-gray-900">{formatDate(buyer.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-gray-200 pl-3">
                    <div className="text-sm text-gray-900">
                      {Object.entries(entry.diff).map(([field, change]) => (
                        <div key={field} className="mb-1">
                          <span className="font-medium">{field}:</span>{' '}
                          <span className="text-gray-600">
                            {change.old === null ? 'Created' : 
                             change.new === null ? 'Deleted' :
                             `${change.old} → ${change.new}`}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(entry.changedAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No changes recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
