import { NextRequest, NextResponse } from 'next/server';
import { getBuyers } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const status = searchParams.get('status') || undefined;
    const timeline = searchParams.get('timeline') || undefined;
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Get all buyers with current filters (no pagination for export)
    const result = await getBuyers({
      page: 1,
      limit: 10000, // Large number to get all results
      search,
      city,
      propertyType,
      status,
      timeline,
      sortBy,
      sortOrder,
      ownerId: user.id,
    });

    // Convert to CSV
    const headers = [
      'fullName',
      'email',
      'phone',
      'city',
      'propertyType',
      'bhk',
      'purpose',
      'budgetMin',
      'budgetMax',
      'timeline',
      'source',
      'notes',
      'tags',
      'status',
      'createdAt',
      'updatedAt',
    ];

    const csvRows = result.buyers.map(buyer => [
      buyer.fullName,
      buyer.email || '',
      buyer.phone,
      buyer.city,
      buyer.propertyType,
      buyer.bhk || '',
      buyer.purpose,
      buyer.budgetMin || '',
      buyer.budgetMax || '',
      buyer.timeline,
      buyer.source,
      buyer.notes || '',
      buyer.tags ? buyer.tags.join(',') : '',
      buyer.status,
      buyer.createdAt.toISOString(),
      buyer.updatedAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="buyers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json(
      { error: 'Failed to export buyers' },
      { status: 500 }
    );
  }
}
