import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { csvImportRowSchema } from '@/lib/validations/buyer';
import { bulkCreateBuyers } from '@/lib/db/queries';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Skip header row
    const dataLines = lines.slice(1);
    
    if (dataLines.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 rows allowed' },
        { status: 400 }
      );
    }

    // Parse CSV rows
    const rows = dataLines.map(line => {
      const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
      return {
        fullName: values[0] || '',
        email: values[1] || '',
        phone: values[2] || '',
        city: values[3] || '',
        propertyType: values[4] || '',
        bhk: values[5] || '',
        purpose: values[6] || '',
        budgetMin: values[7] || '',
        budgetMax: values[8] || '',
        timeline: values[9] || '',
        source: values[10] || '',
        notes: values[11] || '',
        tags: values[12] || '',
        status: values[13] || 'New',
      };
    });

    // Validate each row
    const validationResults = rows.map((row, index) => {
      try {
        const validatedRow = csvImportRowSchema.parse(row);
        return { index, data: validatedRow, error: null };
      } catch (error) {
        return {
          index,
          data: null,
          error: error instanceof z.ZodError ? error.issues[0].message : 'Invalid data',
        };
      }
    });

    const validRows = validationResults
      .filter(result => result.error === null)
      .map(result => result.data);

    const errors = validationResults
      .filter(result => result.error !== null)
      .map(result => ({ row: result.index + 2, message: result.error })); // +2 because we skip header and 0-indexed

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: 'No valid rows to import', errors },
        { status: 400 }
      );
    }

    const createdBuyers = await bulkCreateBuyers(validRows, user.id);

    return NextResponse.json({
      success: true,
      imported: createdBuyers.length,
      errors,
    });
  } catch (error) {
    console.error('Error importing buyers:', error);
    return NextResponse.json(
      { error: 'Failed to import buyers' },
      { status: 500 }
    );
  }
}
