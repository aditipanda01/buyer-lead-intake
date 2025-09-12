'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBuyerSchema, updateBuyerSchema, type CreateBuyerInput, type UpdateBuyerInput } from '@/lib/validations/buyer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Buyer } from '@/lib/db/schema';

interface BuyerFormProps {
  buyer?: Buyer;
  onSubmit: (data: CreateBuyerInput) => Promise<void>;
  isLoading?: boolean;
}

export function BuyerForm({ buyer, onSubmit, isLoading = false }: BuyerFormProps) {
  const router = useRouter();
  const isEditing = !!buyer;
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateBuyerInput>({
    resolver: zodResolver(createBuyerSchema),
    defaultValues: buyer ? {
      fullName: buyer.fullName,
      email: buyer.email || '',
      phone: buyer.phone,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || undefined,
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin || undefined,
      budgetMax: buyer.budgetMax || undefined,
      timeline: buyer.timeline,
      source: buyer.source,
      notes: buyer.notes || '',
      tags: buyer.tags || [],
    } : {},
  });

  const propertyType = watch('propertyType');
  const budgetMin = watch('budgetMin');
  const budgetMax = watch('budgetMax');

  // Clear BHK when property type changes to non-residential
  useEffect(() => {
    if (propertyType && !['Apartment', 'Villa'].includes(propertyType)) {
      setValue('bhk', undefined);
    }
  }, [propertyType, setValue]);

  const handleFormSubmit = async (data: CreateBuyerInput) => {
    try {
      await onSubmit(data);
      router.push('/buyers');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register('fullName')}
            className="mt-1"
            placeholder="Enter full name"
          />
          {errors.fullName && (
            <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1"
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            {...register('phone')}
            className="mt-1"
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">City *</Label>
          <Select id="city" {...register('city')} className="mt-1">
            <option value="">Select city</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Mohali">Mohali</option>
            <option value="Zirakpur">Zirakpur</option>
            <option value="Panchkula">Panchkula</option>
            <option value="Other">Other</option>
          </Select>
          {errors.city && (
            <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select id="propertyType" {...register('propertyType')} className="mt-1">
            <option value="">Select property type</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot</option>
            <option value="Office">Office</option>
            <option value="Retail">Retail</option>
          </Select>
          {errors.propertyType && (
            <p className="text-red-600 text-sm mt-1">{errors.propertyType.message}</p>
          )}
        </div>

        {/* BHK */}
        {propertyType && ['Apartment', 'Villa'].includes(propertyType) && (
          <div>
            <Label htmlFor="bhk">BHK *</Label>
            <Select id="bhk" {...register('bhk')} className="mt-1">
              <option value="">Select BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="Studio">Studio</option>
            </Select>
            {errors.bhk && (
              <p className="text-red-600 text-sm mt-1">{errors.bhk.message}</p>
            )}
          </div>
        )}

        {/* Purpose */}
        <div>
          <Label htmlFor="purpose">Purpose *</Label>
          <Select id="purpose" {...register('purpose')} className="mt-1">
            <option value="">Select purpose</option>
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
          </Select>
          {errors.purpose && (
            <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
          )}
        </div>

        {/* Budget Min */}
        <div>
          <Label htmlFor="budgetMin">Budget Min (INR)</Label>
          <Input
            id="budgetMin"
            type="number"
            {...register('budgetMin', { valueAsNumber: true })}
            className="mt-1"
            placeholder="Enter minimum budget"
          />
          {errors.budgetMin && (
            <p className="text-red-600 text-sm mt-1">{errors.budgetMin.message}</p>
          )}
        </div>

        {/* Budget Max */}
        <div>
          <Label htmlFor="budgetMax">Budget Max (INR)</Label>
          <Input
            id="budgetMax"
            type="number"
            {...register('budgetMax', { valueAsNumber: true })}
            className="mt-1"
            placeholder="Enter maximum budget"
          />
          {errors.budgetMax && (
            <p className="text-red-600 text-sm mt-1">{errors.budgetMax.message}</p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Label htmlFor="timeline">Timeline *</Label>
          <Select id="timeline" {...register('timeline')} className="mt-1">
            <option value="">Select timeline</option>
            <option value="0-3m">0-3 months</option>
            <option value="3-6m">3-6 months</option>
            <option value=">6m">More than 6 months</option>
            <option value="Exploring">Exploring</option>
          </Select>
          {errors.timeline && (
            <p className="text-red-600 text-sm mt-1">{errors.timeline.message}</p>
          )}
        </div>

        {/* Source */}
        <div>
          <Label htmlFor="source">Source *</Label>
          <Select id="source" {...register('source')} className="mt-1">
            <option value="">Select source</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Call">Call</option>
            <option value="Other">Other</option>
          </Select>
          {errors.source && (
            <p className="text-red-600 text-sm mt-1">{errors.source.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          className="mt-1"
          rows={4}
          placeholder="Enter any additional notes"
        />
        {errors.notes && (
          <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          {...register('tags', {
            setValueAs: (value: string) => value ? value.split(',').map((t: string) => t.trim()) : []
          })}
          className="mt-1"
          placeholder="Enter tags separated by commas"
        />
        {errors.tags && (
          <p className="text-red-600 text-sm mt-1">{errors.tags.message}</p>
        )}
      </div>

      {/* Budget validation error */}
      {budgetMin && budgetMax && budgetMax < budgetMin && (
        <p className="text-red-600 text-sm">Maximum budget must be greater than or equal to minimum budget</p>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (isEditing ? 'Update Lead' : 'Create Lead')}
        </Button>
      </div>
    </form>
  );
}
