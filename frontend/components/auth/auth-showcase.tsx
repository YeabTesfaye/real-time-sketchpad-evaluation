import { Check } from "lucide-react";

const POINTS = [
  "Live cursors and strokes for everyone in the room",
  "Share a room with one 8-character code",
  "Works on any device, nothing to install",
];

export default function AuthShowcase() {
  return (
    <div className="w-full max-w-xl space-y-10">
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Sketchpad</p>
        <h2 className="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground xl:text-5xl">
          Pick up where the whiteboard left off.
        </h2>
      </div>

      {/* Mini board */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs tracking-widest text-muted-foreground">
            K7QX92AB
          </span>
        </div>

        <div className="relative aspect-video">
          <div
            aria-hidden="true"
            className="absolute inset-0 text-border bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] bg-size-[22px_22px]"
            />
          <svg
            viewBox="0 0 480 270"
            className="relative h-full w-full"
            role="img"
            aria-label="A client and API diagram being sketched together"
          >
            <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="40" y="50" width="140" height="76" rx="12" className="fill-card stroke-foreground" />
              <rect x="300" y="50" width="140" height="76" rx="12" className="fill-card stroke-foreground" />
              <path d="M180 88 H294 M284 78 L296 88 L284 98" className="stroke-primary" />
              <path d="M370 126 V170" strokeDasharray="1 9" className="stroke-foreground" />
            </g>

            <g textAnchor="middle" className="fill-foreground font-serif text-[20px] font-semibold">
              <text x="110" y="94">Client</text>
              <text x="370" y="94">API</text>
            </g>

            <g transform="rotate(-3 370 215)">
              <rect x="305" y="172" width="130" height="62" rx="4" strokeWidth="2" className="fill-primary/15 stroke-primary" />
              <text x="370" y="209" textAnchor="middle" className="fill-foreground text-[16px] font-medium">
                Add a cache?
              </text>
            </g>

            <g transform="translate(150 175)">
              <path d="M0 0 L0 18 L5 13.5 L9 22 L12.5 20.5 L8.5 12.5 L15 12 Z" strokeWidth="1.5" strokeLinejoin="round" className="fill-primary stroke-card" />
              <rect x="16" y="20" width="52" height="22" rx="11" className="fill-primary" />
              <text x="42" y="35" textAnchor="middle" className="fill-primary-foreground text-[12px] font-medium">
                Maya
              </text>
            </g>
          </svg>
        </div>
      </div>

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
  );
}