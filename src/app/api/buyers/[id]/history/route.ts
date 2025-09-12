import { NextRequest, NextResponse } from 'next/server';
import { getBuyerHistory } from '@/lib/db/queries';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const history = await getBuyerHistory(id, user.id);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching buyer history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buyer history' },
      { status: 500 }
    );
  }
}
