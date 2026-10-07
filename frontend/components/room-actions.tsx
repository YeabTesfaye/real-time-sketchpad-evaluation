'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const joinFormSchema = z.object({
  roomId: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8}$/, 'Enter the 8-character code'),
});

export default function RoomActions({ className }: { className?: string }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof joinFormSchema>>({
    resolver: zodResolver(joinFormSchema),
    defaultValues: {
      roomId: '',
    },
  });

  const navigateToRoom = (roomId: string) => {
    router.push(`/sketchpad/${roomId}`);
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Generate an 8-char ID with crypto.getRandomValues
      const array = new Uint8Array(4); // 4 bytes = 8 hex characters
      crypto.getRandomValues(array);
      const id = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
      navigateToRoom(id);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = handleSubmit(async (data) => {
    const roomId = data.roomId;
    navigateToRoom(roomId);
    reset({ roomId: '' });
  });

  return (
    <div className={className}>
      <div className="flex w-full items-start space-x-3">
        {/* Create room button */}
        <Button
          variant="default"
          disabled={isCreating}
          onClick={handleCreateRoom}
          className="h-11"
        >
          {isCreating ? (
            <span>Creating...</span>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Start a new room
            </>
          )}
        </Button>

        <div className="flex flex-col space-y-1">
          <p className="text-xs text-muted-foreground">
            Have a code?
          </p>

          <form onSubmit={handleJoinRoom} className="flex w-full space-x-2">
            <div className="relative">
              <Input
                {...register('roomId')}
                placeholder="ROOM CODE"
                className="flex-1 h-11 w-0 font-mono uppercase tracking-widest"
                id="room-code-input"
                disabled={isSubmitting}
                aria-label="Room code"
                aria-describedby="room-code-error"
              />

              <button
                type="submit"
                className="h-11 w-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Join
              </button>

              {errors.roomId && (
                <p className="mt-1 text-xs text-destructive" id="room-code-error">
                  {errors.roomId.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function StartRoomButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleClick = () => {
    // Generate an 8-char ID with crypto.getRandomValues
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const id = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
    router.push(`/sketchpad/${id}`);
  };

  return (
    <Button
      variant="default"
      onClick={handleClick}
      className={className ?? 'h-11'}
    >
      <Plus className="h-4 w-4" />
      Start a new room
    </Button>
  );
}