import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getBuyerById, getBuyerHistory } from '@/lib/db/queries';
import { BuyerDetail } from '@/components/buyers/buyer-detail';

interface BuyerDetailPageProps {
  params: { id: string };
}

export default async function BuyerDetailPage({ params }: BuyerDetailPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  const [buyer, history] = await Promise.all([
    getBuyerById(params.id, user.id),
    getBuyerHistory(params.id, user.id),
  ]);

  if (!buyer) {
    notFound();
  }

  return <BuyerDetail buyer={buyer} history={history} />;
}
