'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Check, Link2, Loader2, Palette, Users, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createRoomCode, roomHref } from '@/lib/room-code';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  SketchpadCanvas,
  type HistoryState,
  type SketchpadCanvasHandle,
} from '@/components/sketchpad/Canvas';
import { PeoplePanel, ToolPanel, type Identity } from '@/components/sketchpad/panels';
import type { Tool } from '@/lib/operations';
import { cn } from '@/lib/utils';

// Horizontal padding shared by the room bar, the workspace frame and the footer
const EDGE = 'px-4 sm:px-6';

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
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    // Reset error state
    setError(null);

    try {
      // Get the token from localStorage (same as useWebSocket hook)
      const token = localStorage.getItem('sketchpad_token');

      // Build the invite URL with token as query parameter
      const baseUrl = window.location.origin + window.location.pathname + window.location.search;
      // Avoid duplicating token parameter if it already exists in the URL
      const inviteUrl = token && !baseUrl.includes('token=')
        ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`
        : baseUrl;

      // Try to use the modern Clipboard API
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback to hidden textarea approach for older browsers or when Clipboard API is not available
      try {
        const textarea = document.createElement('textarea');
        // Get the token from localStorage (same as useWebSocket hook)
        const token = localStorage.getItem('sketchpad_token');

        // Build the invite URL with token as query parameter
        const baseUrl = window.location.origin + window.location.pathname + window.location.search;
        // Avoid duplicating token parameter if it already exists in the URL
        const inviteUrl = token && !baseUrl.includes('token=')
          ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`
          : baseUrl;

        textarea.value = inviteUrl;
        // Avoid scrolling to bottom
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Both methods failed
        setError('Failed to copy link. Please copy manually.');
        setCopied(false);
      }
    }
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={copy} aria-label="Copy invite link">
      {copied ? (
        <Check className="h-4 w-4 text-primary" aria-hidden="true" />
      ) : (
        <Link2 className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">
        {copied ? 'Copied' : 'Copy invite link'}
      </span>
      {error && (
        <span className="text-sm text-destructive ml-2">
          {error}
        </span>
      )}
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

function RoomWorkspace({ roomId, user }: { roomId: string; user: Identity | null }) {
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Get the verified user from props, with fallback for edge cases
  const userState = user ?? null;
  // Initialize drawing-related state
  const [color, setColor] = useState(userState?.color ?? '#888888');

  // Initialize drawing-related state
  const [size, setSize] = useState(2);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  // Canvas pushes these flags up, so nothing reads the ref during render
  const [history, setHistory] = useState<HistoryState>({ canUndo: false, canRedo: false });
  const canvasRef = useRef<SketchpadCanvasHandle>(null);

  const newRoom = useCallback(() => router.push(roomHref(createRoomCode())), [router]);
  const leave = useCallback(() => router.push('/sketchpad'), [router]);

  // Generate fallback user ID only once using useState with function initializer
  const [fallbackUserId] = useState<string>(() => {
    return 'guest-' + Math.random().toString(36).slice(2, 11);
  });

  const fallbackUser = useMemo(() => ({
    id: fallbackUserId,
    name: 'Guest',
    color: '#888888',
  }), [fallbackUserId]);

  // Defined once, rendered either in a sidebar or in a sheet, never both
  const tools = (
    <ToolPanel
      userColor={userState?.color ?? '#888888'}
      color={color}
      size={size}
      currentTool={currentTool}
      onColorChange={setColor}
      onSizeChange={setSize}
      onClear={() => canvasRef.current?.clear()}
      onToolChange={setCurrentTool}
      onUndo={() => canvasRef.current?.undo()}
      onRedo={() => canvasRef.current?.redo()}
      canUndo={history.canUndo}
      canRedo={history.canRedo}
    />
  );
  const people = <PeoplePanel roomId={roomId} user={userState ?? fallbackUser} onNewRoom={newRoom} onLeave={leave} />;

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

        <section className={cn('flex min-w-0 flex-1 overflow-auto rounded-2xl border bg-secondary text-border bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[22px_22px]')}>
          {/* m-auto centers the canvas, and still scrolls from the top-left when it is bigger than the area */}
          <div className="m-auto p-4 lg:p-6">
            {/* Paper stays light in both themes so stroke colors read the same everywhere.
                The [&_p] rules tidy the status lines Canvas prints under itself. */}
            <div className="w-fit overflow-hidden rounded-xl border bg-[#fbfaf7] shadow-md [&_canvas]:block [&_p]:border-t [&_p]:border-neutral-200 [&_p]:px-3 [&_p]:py-1.5 [&_p]:text-xs [&_p]:text-neutral-500">
              <SketchpadCanvas
                ref={canvasRef}
                width={800}
                height={600}
                roomId={roomId}
                userId={userState?.id ?? ''}
                currentColor={color}
                currentSize={size}
                currentTool={currentTool}
                onHistoryChange={setHistory}
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
  const router = useRouter();
  const { user, loading } = useAuth();
  const isClient = useIsClient();

  // If not authenticated, redirect to login with next parameter.
  // Done in an effect because navigating during render is a side effect.
  // replace() keeps the login redirect out of history so Back doesn't loop.
  useEffect(() => {
    if (loading || !isClient || user) return;
    const next = window.location.pathname + window.location.search;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [loading, isClient, user, router]);

  // Show loading state on the server and while checking auth on the client
  if (loading || !isClient) {
    return <RoomLoading />;
  }

  // Not authenticated: the effect above is redirecting, so keep the loader up meanwhile
  if (!user) {
    return <RoomLoading />;
  }

  // Transform user object from useAuth to Identity format
  const computeColor = (userId: string): string => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    let hue = hash % 360;
    if (hue < 0) hue += 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const identityUser = {
    id: user.id,
    name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || `User-${String(user.id).slice(0, 4)}`,
    color: computeColor(user.id),
    joinedAt: new Date().toISOString(),
  };

  // key remounts the workspace when the room changes, so sockets and canvas state reset cleanly
  return <RoomWorkspace key={roomId} roomId={roomId} user={identityUser} />;
}