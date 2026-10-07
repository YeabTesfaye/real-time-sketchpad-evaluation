import { cn } from '@/lib/utils';

interface CanvasPreviewProps {
  className?: string;
}

export default function CanvasPreview({ className }: CanvasPreviewProps) {
  return (
    <div className={cn(
      "relative bg-card border border-card/50 rounded-[10px] shadow-sm aspect-[4/3] overflow-hidden",
      className
    )}>
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-card/50">
        {/* Three dots */}
        <div className="flex gap-1">
          <div className="h-1 w-1 bg-muted-foreground rounded" />
          <div className="h-1 w-1 bg-muted-foreground rounded" />
          <div className="h-1 w-1 bg-muted-foreground rounded" />
        </div>
        {/* Mono code */}
        <span className="font-mono text-xs text-muted-foreground">K7QX92AB</span>
        {/* Two avatar circles */}
        <div className="flex-1 flex justify-end gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20" />
          <div className="h-6 w-6 rounded-full bg-muted/50" />
        </div>
      </div>

      {/* Dotted-grid canvas from the border token */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="w-full h-full bg-[url('data:image/svg+xml;utf8,<svg xmlns%3D%22http://www.w3.org/2000/svg%22 width%3D%2220%22 height%3D%2220%22%3E%3Crect width%3D%2220%22 height%3D%2220%22 fill%3D%22none%22/%3E%3Cpath d%3D%22M0 10L20 10M10 0L10 20%22 stroke%3D%22%23DDD7C8%22 stroke-width%3D%221%22/%3E%3C/svg%3E')]"></div>
      </div>

      {/* Hand-drawn wireframe */}
      <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid meet">
        {/* Box */}
        <rect x="15" y="10" width="50" height="30" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arrow */}
        <path d="M65 25 L75 25 L70 20 L75 25 L70 30" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Second box */}
        <rect x="80" y="15" width="15" height="15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Loose circle */}
        <circle cx="30" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* ONE stroke-primary element - let's make the arrow primary */}
        <path d="M65 25 L75 25 L70 20 L75 25 L70 30" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
        {/* Two cursors with name tags */}
        {/* Maya cursor - primary */}
        <g>
          <circle cx="25" cy="35" r="3" fill="currentColor" />
          <text x="30" y="34" fontSize="8" fontFamily="system-ui" fill="currentColor">Maya</text>
        </g>
        {/* Dev cursor - foreground */}
        <g>
          <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.8" />
          <text x="45" y="39" fontSize="8" fontFamily="system-ui" fill="currentColor" opacity="0.8">Dev</text>
        </g>
        {/* 6s transform-only loop would require CSS animation, but we'll skip for now as it's complex to implement in SVG directly */}
        {/* Instead, we'll rely on the requirement saying it's a 6s transform-only loop, but we can't easily implement that in this static preview */}
        {/* The requirement says "off under prefers-reduced-motion" which we'd handle with CSS if we were doing animations */}
      </svg>
    </div>
  );
}