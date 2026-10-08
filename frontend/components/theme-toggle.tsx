'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      // text-foreground so the icon is clearly visible, not the muted ghost color
      className={cn('h-9 w-9 text-foreground', className)}
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {/* Both icons render, CSS picks one, so there is no hydration mismatch */}
      <Sun className="hidden h-4.5 w-4.5 dark:block" aria-hidden="true" />
      <Moon className="h-4.5 w-4.5 dark:hidden" aria-hidden="true" />
    </Button>
  );
}