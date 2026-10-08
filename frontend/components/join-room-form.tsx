'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROOM_CODE_LENGTH, roomHref } from '@/lib/room-code';
import { cn } from '@/lib/utils';

export default function JoinRoomForm({ className }: { className?: string }) {
  const router = useRouter();
  const inputId = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== ROOM_CODE_LENGTH) {
      setError(`Room codes are ${ROOM_CODE_LENGTH} characters.`);
      return;
    }
    router.push(roomHref(code));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={cn('space-y-1.5', className)}>
      <label htmlFor={inputId} className="sr-only">
        Room code
      </label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={code}
          maxLength={ROOM_CODE_LENGTH}
          placeholder="ROOM CODE"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            setError(null);
          }}
          className="h-12 min-w-0 flex-1 font-mono text-base uppercase tracking-widest"
        />
        <Button type="submit" variant="outline" className="h-12 px-6 text-base">
          Join
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}