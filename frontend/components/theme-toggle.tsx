'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="p-1 [&>svg]:h-4 [&>svg]:w-4"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="text-accent" />
      ) : (
        <Moon className="text-accent" />
      )}
    </Button>
  );
}