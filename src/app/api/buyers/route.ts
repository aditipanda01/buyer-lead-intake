import { NextRequest, NextResponse } from 'next/server';
import { getBuyers, createBuyer, bulkCreateBuyers } from '@/lib/db/queries';
import { createBuyerSchema, csvImportRowSchema } from '@/lib/validations/buyer';
import { getCurrentUser } from '@/lib/auth';
import { rateLimit, getClientIP } from '@/lib/rate-limit';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const status = searchParams.get('status') || undefined;
    const timeline = searchParams.get('timeline') || undefined;
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const result = await getBuyers({
      page,
      limit,
      search,
      city,
      propertyType,
      status,
      timeline,
      sortBy,
      sortOrder,
      ownerId: user.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitResult = rateLimit(`create:${clientIP}`, 5, 60 * 1000); // 5 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const data = createBuyerSchema.parse(body);

    const buyer = await createBuyer(data, user.id);

    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating buyer:', error);
    return NextResponse.json(
      { error: 'Failed to create buyer' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { buyers: buyersData } = body as { buyers: unknown[] };

    if (!Array.isArray(buyersData) || buyersData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    if (buyersData.length > 200) {
      return NextResponse.json(
        { error: 'Maximum 200 rows allowed' },
        { status: 400 }
      );
    }

    // Validate each row
    const validationResults = buyersData.map((row: unknown, index: number) => {
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
      .map(result => ({ row: result.index + 1, message: result.error }));

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
