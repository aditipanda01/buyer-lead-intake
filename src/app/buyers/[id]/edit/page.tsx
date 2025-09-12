import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getBuyerById } from '@/lib/db/queries';
import { EditBuyerForm } from '@/components/buyers/edit-buyer-form';

interface EditBuyerPageProps {
  params: { id: string };
}

export default async function EditBuyerPage({ params }: EditBuyerPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    notFound();
  }

  const buyer = await getBuyerById(params.id, user.id);

  if (!buyer) {
    notFound();
  }

  return <EditBuyerForm buyer={buyer} />;
}
