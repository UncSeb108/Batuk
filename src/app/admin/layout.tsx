import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;
  
  // If no admin token, redirect to login
  if (!token) {
    redirect('/admin-login');
  }

  // If authenticated, show the admin page
  return <>{children}</>;
}