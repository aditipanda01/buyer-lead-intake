import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SignInForm } from '@/components/auth/signin-form';

export default async function SignInPage() {
  const user = await getCurrentUser();
  
  if (user) {
    redirect('/buyers');
  }

  return <SignInForm />;
}
