'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AuthActions() {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  /*
   * Do not render anything while authentication
   * is being resolved.
   */
  if (loading) {
    return (
      <div
        className="h-9 w-20"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          asChild
          variant="ghost"
          className="h-9 border-transparent px-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <Link href="/login">
            Log in
          </Link>
        </Button>

        <Button
          asChild
          className="h-9 px-4 shadow-sm"
        >
          <Link href="/signup">
            Sign up
          </Link>
        </Button>
      </>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem(
      'sketchpad_token'
    );

    localStorage.removeItem(
      'sketchpad_user'
    );

    window.dispatchEvent(
      new Event(
        'sketchpad-auth-change'
      )
    );

    router.replace('/login');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="Log out"
      aria-label="Log out"
      className="cursor-pointer rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Avatar
        user={user}
        size={36}
        className="h-9 w-9"
      />
    </button>
  );
}
