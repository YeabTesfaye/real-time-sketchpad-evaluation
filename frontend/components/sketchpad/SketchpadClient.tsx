'use client';

import { Check } from "lucide-react";
import { StartRoomButton } from "@/components/room-actions";
import JoinRoomForm from "@/components/join-room-form";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CONTAINER } from "@/lib/layout";
import { ROOM_CODE_LENGTH } from "@/lib/room-code";

const POINTS = [
  "Live cursors and strokes for everyone in the room",
  `Share a room with one ${ROOM_CODE_LENGTH}-character code`,
  "Works on any device, nothing to install",
];

export const SketchpadClient = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // If still loading, show a simple loading indicator
  if (loading) {
    return <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    router.push("/login");
    // Return null to prevent rendering while redirecting
    return null;
  }

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center">
      <div
        className={`${CONTAINER} grid items-center gap-12 py-14 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-20 xl:gap-32`}
      >
        {/* Copy */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Real-time rooms
          </div>

          <h1 className="font-serif text-5xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
            Start a room, or <span className="text-primary">join one.</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Open a fresh canvas and send the code, or enter the code a teammate shared with you.
          </p>

          <ul className="space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
          <div className="space-y-6">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">Start a new room</h2>
              <p className="text-sm text-muted-foreground">
                Get a blank canvas and a code to share.
              </p>
              <StartRoomButton className="h-12 w-full gap-2 text-base" />
            </section>

            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
              or
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">Join with a code</h2>
              <p className="text-sm text-muted-foreground">
                Enter the {ROOM_CODE_LENGTH}-character code you were given.
              </p>
              <JoinRoomForm />
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};