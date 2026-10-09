// Imported only by RoomClient, so it needs no "use client" of its own
import { useState } from 'react';
import { LogOut, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SketchpadUserList } from '@/components/sketchpad/UserList';
import { cn } from '@/lib/utils';
import type { Tool } from '@/lib/operations';

export type Identity = { id: string; name: string; color: string };

const PRESET_COLORS = ['#1c1917', '#dc2f1d', '#ea8a1f', '#2f9e5e', '#2563eb', '#7c3aed', '#db2777'];

const TOOLS: { id: Tool; icon: string }[] = [
  { id: 'pen', icon: '✏️' },
  { id: 'rectangle', icon: '■' },
  { id: 'ellipse', icon: '●' },
  { id: 'line', icon: '↔️' },
];

const sameColor = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function PanelSection({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/* ---------- left: drawing tools ---------- */

type ToolPanelProps = {
  userColor: string;
  color: string;
  size: number;
  currentTool: Tool;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onClear: () => void;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function ToolPanel({
  userColor,
  color,
  size,
  currentTool,
  onColorChange,
  onSizeChange,
  onClear,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolPanelProps) {
  const [confirming, setConfirming] = useState(false);

  // Your identity color first, then the presets (minus duplicates)
  const swatches = [userColor, ...PRESET_COLORS.filter((c) => !sameColor(c, userColor))];

  return (
    <div className="flex flex-col gap-6 p-4">
      <PanelSection title="Color">
        <div className="flex flex-wrap gap-2.5">
          {swatches.map((c, i) => {
            const active = sameColor(c, color);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onColorChange(c)}
                aria-label={i === 0 ? 'Your color' : `Color ${c}`}
                aria-pressed={active}
                title={i === 0 ? 'Your color' : c}
                style={{ backgroundColor: c }}
                className={cn(
                  'h-8 w-8 rounded-full border border-black/10 transition-transform hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  active && 'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                )}
              />
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="Brush size" aside={`${size}px`}>
        <input
          type="range"
          min={1}
          max={24}
          step={1}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          aria-label="Brush size"
          className="w-full accent-primary"
        />
        <div
          className="flex h-16 items-center justify-center rounded-lg border bg-background"
          aria-hidden="true"
        >
          <span className="rounded-full" style={{ width: size, height: size, backgroundColor: color }} />
        </div>
      </PanelSection>

      <PanelSection title="Tool">
        <div className="flex flex-wrap gap-2">
          {TOOLS.map(({ id, icon }) => {
            const active = currentTool === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToolChange(id)}
                aria-label={id}
                aria-pressed={active}
                title={id}
                className={cn(
                  'h-8 w-8 rounded-full border border-black/10 transition-transform hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  active && 'ring-2 ring-foreground ring-offset-2 ring-offset-card'
                )}
              >
                <span aria-hidden="true">{icon}</span>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="Canvas">
        {confirming ? (
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-foreground">Clear the canvas? This can&apos;t be undone.</p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
              >
                Clear
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear canvas
          </Button>
        )}
      </PanelSection>

      <PanelSection title="History">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onUndo} disabled={!canUndo}>
            ↶ Undo
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onRedo} disabled={!canRedo}>
            Redo ↷
          </Button>
        </div>
      </PanelSection>
    </div>
  );
}

/* ---------- right: people and room actions ---------- */

type PeoplePanelProps = {
  roomId: string;
  user: Identity;
  onNewRoom: () => void;
  onLeave: () => void;
};

export function PeoplePanel({ roomId, user, onNewRoom, onLeave }: PeoplePanelProps) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="space-y-4 p-4">
        <PanelSection title="In this room">
          <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: user.color }}
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">You</p>
            </div>
          </div>
          <SketchpadUserList roomId={roomId} />
        </PanelSection>
      </div>

      <div className="mt-auto space-y-2 border-t p-4">
        <Button variant="outline" className="w-full gap-2" onClick={onNewRoom}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New room
        </Button>
        <Button variant="ghost" className="w-full gap-2" onClick={onLeave}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Leave room
        </Button>
      </div>
    </div>
  );
}