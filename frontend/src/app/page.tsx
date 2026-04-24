import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  const cookieStore = cookies();
  const jwt = cookieStore.get('jwt');

  if (jwt) {
    redirect('/lobby');
  } else {
    redirect('/login');
  }
}
