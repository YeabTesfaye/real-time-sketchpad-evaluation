'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Link2, Loader2, Palette, Users, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SketchpadCanvas } from '@/components/sketchpad/Canvas';
import { PeoplePanel, ToolPanel, type Identity } from '@/components/sketchpad/panels';
import { RoomUtils } from '@/lib/room';
import { createRoomCode, roomHref } from '@/lib/room-code';
import { cn } from '@/lib/utils';

// Horizontal padding shared by the room bar, the workspace frame and the footer
const EDGE = 'px-4 sm:px-6';

// Clearing is owned by Canvas and has no page-level hook yet
const noop = () => {};

/* ---------- client-only helpers ---------- */

const subscribeNever = () => () => {};

// false on the server, true after hydration, so random identity never causes a mismatch
function useIsClient() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

function createIdentity(): Identity {
  const id = RoomUtils.generateUserId();
  return {
    id,
    name: RoomUtils.generateUserName(id),
    color: RoomUtils.generateUserColor(id),
  };
}

/* ---------- pieces ---------- */

function RoomLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-background">
      <div role="status" className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span>Setting up your room...</span>
      </div>
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Needs a secure context and permission. Failing quietly is fine for a convenience button.
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={copy} aria-label="Copy invite link">
      {copied ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy invite link'}</span>
    </Button>
  );
}

function SidePanel({ children }: { children: React.ReactNode }) {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto rounded-2xl border bg-card shadow-sm">
      {children}
    </aside>
  );
}

// Below lg the fixed 256px sidebars would leave no room for the canvas, so they become sheets
function PanelSheet({
  side,
  title,
  icon: Icon,
  children,
}: {
  side: 'left' | 'right';
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{title}</span>
          <span className="sr-only sm:hidden">{title}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="flex w-80 max-w-[85vw] flex-col gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="font-serif text-lg font-semibold">{title}</SheetTitle>
          <SheetDescription className="sr-only">{title} panel</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/* ---------- workspace ---------- */

function RoomWorkspace({ roomId }: { roomId: string }) {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Lazy initializer runs once, only on the client (see the gate below)
  const [user] = useState(createIdentity);
  const [color, setColor] = useState(user.color);
  const [size, setSize] = useState(2);

  const newRoom = useCallback(() => router.push(roomHref(createRoomCode())), [router]);
  const leave = useCallback(() => router.push('/sketchpad'), [router]);

  // Defined once, rendered either in a sidebar or in a sheet, never both
  const tools = (
    <ToolPanel
      userColor={user.color}
      color={color}
      size={size}
      onColorChange={setColor}
      onSizeChange={setSize}
      onClear={noop}
    />
  );
  const people = <PeoplePanel roomId={roomId} user={user} onNewRoom={newRoom} onLeave={leave} />;

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-background">
      {/* Room bar */}
      <div className={cn('flex h-14 shrink-0 items-center justify-between gap-3 border-b', EDGE)}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {!isDesktop && (
            <PanelSheet side="left" title="Tools" icon={Palette}>
              {tools}
            </PanelSheet>
          )}
          <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
            Room
          </span>
          <span
            className="truncate rounded-md bg-secondary px-2.5 py-1 font-mono text-sm tracking-widest text-foreground"
            title="Room code"
          >
            {roomId}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CopyLinkButton />
          {!isDesktop && (
            <PanelSheet side="right" title="People" icon={Users}>
              {people}
            </PanelSheet>
          )}
        </div>
      </div>

      {/* Body: tools, canvas, people */}
      <div className={cn('flex min-h-0 flex-1 gap-3 py-3 lg:gap-4 lg:py-4', EDGE)}>
        {isDesktop && <SidePanel>{tools}</SidePanel>}

        <section className="flex min-w-0 flex-1 overflow-auto rounded-2xl border bg-secondary text-border bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[22px_22px]">

          {/* m-auto centers the canvas, and still scrolls from the top-left when it is bigger than the area */}
          <div className="m-auto p-4 lg:p-6">
            {/* Paper stays light in both themes so stroke colors read the same everywhere.
                The [&_p] rules tidy the status lines Canvas prints under itself. */}
            <div className="w-fit overflow-hidden rounded-xl border bg-[#fbfaf7] text-neutral-900 shadow-md [&_canvas]:block [&_p]:border-t [&_p]:border-neutral-200 [&_p]:px-3 [&_p]:py-1.5 [&_p]:text-xs [&_p]:text-neutral-500">
              <SketchpadCanvas
                width={800}
                height={600}
                roomId={roomId}
                userId={user.id}
                currentColor={color}
                currentSize={size}
              />
            </div>
          </div>
        </section>

        {isDesktop && <SidePanel>{people}</SidePanel>}
      </div>

      <footer
        className={cn(
          'flex h-10 shrink-0 items-center justify-between gap-4 border-t text-xs text-muted-foreground',
          EDGE
        )}
      >
        <span className="truncate">Anyone with the room code can join and draw.</span>
        <span className="hidden shrink-0 sm:inline">© {new Date().getFullYear()} Sketchpad</span>
      </footer>
    </div>
  );
}

export default function RoomClient({ roomId }: { roomId: string }) {
  const isClient = useIsClient();
  // key remounts the workspace when the room changes, so sockets and canvas state reset cleanly
  return isClient ? <RoomWorkspace key={roomId} roomId={roomId} /> : <RoomLoading />;
}