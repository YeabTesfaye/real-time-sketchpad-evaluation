# Header Refactor Plan

## Files to Change:
1. `frontend/components/site-header.tsx` - Main header component (complete rewrite)
2. `frontend/components/theme-toggle.tsx` - May need adjustments for shadcn Button variant

## Shadcn Components to Add:
1. `sheet` - For mobile menu (using `npx shadcn@latest add sheet`)
2. Possibly update button usage to ensure proper variants

## Implementation Approach:

### Layout Requirements:
- Single flex container with three zones:
  - Left: logo + icon (PencilLine + "Sketchpad" wordmark)
  - Center: nav links (How it works, Features) 
  - Right: theme toggle, Log in, Sign up
- Use `items-center` and fixed header height
- Constrain content with max-width container and consistent horizontal padding

### Component Specifications:
- Log in: Button variant="ghost" or "outline" 
- Sign up: Button variant="default" using primary (red) token
- Theme toggle: Button variant="ghost" size="icon" with lucide-react Sun/Moon icons
- Nav links: plain Next.js Link with text-muted-foreground and hover:text-foreground
- Mobile: collapse nav links and auth buttons into shadcn Sheet (hamburger) below md breakpoint

### Behavior:
- Sticky header with subtle bottom border and backdrop blur
- Visible focus-visible ring on all interactive elements
- Active state for current route using usePathname from next/navigation
- Proper theming using only CSS variable tokens
- Hydration-safe theme toggle

### Process:
1. Add shadcn sheet component
2. Rewrite site-header.tsx with new layout
3. Update theme-toggle if needed to use shadcn Button
4. Run type check and lint
5. Report what to verify visually