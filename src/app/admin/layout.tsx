import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin-session')?.value;
  
  // If no admin session, redirect to login
  if (!adminSession) {
    redirect('/admin-login');
  }

  // If authenticated, show the admin page
  return <>{children}</>;
}
