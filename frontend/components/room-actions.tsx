'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const joinFormSchema = z.object({
  roomId: z.string().length(8, 'Room ID must be 8 characters').regex(/^[A-Z0-9]+$/, 'Room ID must contain only uppercase letters and numbers'),
});

export default function RoomActions() {
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

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // Generate an 8-char ID with crypto.getRandomValues
      const array = new Uint8Array(4); // 4 bytes = 8 hex characters
      crypto.getRandomValues(array);
      const id = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
      router.push(`/sketchpad/${id}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = handleSubmit(async (data) => {
    // Convert to uppercase and validate
    const roomId = data.roomId.toUpperCase();
    router.push(`/sketchpad/${roomId}`);
    reset({ roomId: '' });
  });

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="bg-card border border-card/50 rounded-[var(--card-radius)] p-6 space-y-4">
        <div className="flex w-full items-start space-x-3">
          {/* Create room button */}
          <Button
            variant="default"
            isLoading={isCreating}
            onClick={handleCreateRoom}
          >
            {isCreating ? 'Creating...' : 'Start a new room'}
          </Button>

          <div className="flex flex-col space-y-1">
            <p className="text-xs text-muted">
              or join with a code
            </p>

            <form onSubmit={handleJoinRoom} className="flex w-full space-x-2">
              <div className="relative">
                <Input
                  {...register('roomId')}
                  placeholder="Enter room code"
                  className="flex-1 h-10 w-0 flex-1 bg-input border border-input textForeground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 font-mono text-sm px-3"
                  id="room-code-input"
                  disabled={isSubmitting}
                />

                <button
                  type="submit"
                  className="h-10 w-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
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

        <p className="text-xs text-muted">
          No account needed • Join instantly with a room code
        </p>
      </div>
    </div>
  );
}