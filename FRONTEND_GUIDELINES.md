# Frontend Design and Build Instructions

## Goal
Build UI that looks intentionally designed by a human, not generated. Favor restraint, hierarchy, and craft over decoration. Every visual choice needs a reason.

## Tooling (use if installed, check `.claude/skills` and connected MCP servers first)
- Skills: frontend-design (Anthropic), Impeccable, Taste Skill, Emil Kowalski design skills. Read the relevant SKILL.md before writing any UI code.
- Component foundation: shadcn/ui (built on Radix primitives). See the shadcn section below.
- Playwright MCP: use for visual validation (see Verification).
- No Figma. Design source of truth is `references/` (screenshots, example sites) plus the design direction written in step 1.
- If a tool is missing, say so in one line and continue with the rest.

## shadcn/ui rules
- Add components with the CLI (`npx shadcn@latest add <component>`), never hand-copy or rewrite them from memory. Check the current docs for the installed version's CLI and Tailwind setup first.
- Use shadcn primitives for anything with complex behavior: dialog, dropdown, popover, select, tabs, tooltip, command, sheet, form. Do not rebuild these.
- shadcn components live in the repo, so edit them. Restyle them through design tokens and variants (`cva`) until they match the design direction. Default shadcn styling is the main source of the "generic AI look", so never ship it unmodified.
- Theme through CSS variables (`--background`, `--foreground`, `--primary`, `--radius`, etc.). Change the token values first, then adjust individual components.
- Keep `cn()` for class merging, and extend variants instead of piling on one-off class overrides.
- Compose new components from shadcn primitives, and keep them in `components/ui` (primitives) and `components/` (app-level compositions).
- Forms: shadcn Form with react-hook-form and zod, with labels, descriptions, and error messages wired up.
- Icons: use one set (lucide-react by default) at one stroke width.
- Ask before adding any non-shadcn UI dependency.

## Process (one step at a time, stop for my approval after each)
1. **Design direction first, no code.** Ask me for or infer from `references/`: audience, tone, 2-3 reference sites or screenshots, and one distinctive point of view (e.g. editorial, utilitarian, playful). Write it in 5 lines or fewer.
2. **Tokens before components.** Define colors, type scale, spacing scale, radii, shadows, and motion tokens in one place (Tailwind v4 `@theme` plus shadcn CSS variables). Components consume tokens only, never raw values.
3. **Install and restyle primitives, then compose.** Add the shadcn components needed, restyle to the direction, then build sections, then pages. Reuse before creating.
4. **Verify visually after each step**, then report what you checked and what you found.

## Anti-"AI look" rules
- No default purple-to-blue gradients, glassmorphism everywhere, or gradient text on headings.
- No unmodified shadcn defaults (stock zinc/slate palette, stock radius, stock shadows).
- No emoji as icons. One icon set, one stroke width.
- No identical card grids with icon, title, and blurb repeated three times. Vary layout rhythm and scale.
- No centered-everything hero with two buttons by default. Choose a layout deliberately.
- No generic fonts (Inter/Roboto/Arial) unless the design direction justifies it. Pick a distinctive display and body pairing, max two families.
- Limit palette: one neutral ramp, one accent, semantic colors only for state. Check contrast.
- Copy must be specific to the product. No lorem ipsum, no "Unlock the power of...".
- No decoration (blobs, grids, sparkles) unless it supports the direction.

## Craft details to apply
- **Typography:** clear scale with tight line-height on headings, comfortable measure (60-75ch) for body, tabular numbers for data, optical alignment of icons and text.
- **Spacing:** use the scale consistently, align to a grid, group related items tighter than unrelated ones.
- **Depth:** subtle layered shadows and 1px borders over heavy shadows. Consistent radii by component size.
- **States:** every interactive element gets hover, focus-visible, active, disabled, loading, and error states. Add empty and error states for every data view.
- **Motion (Emil Kowalski principles):**
  - Animate only `transform` and `opacity`.
  - UI transitions 150-250ms, custom ease-out curves, never `ease-in` for entering elements.
  - Press feedback on buttons (e.g. `scale(0.97)`).
  - Popovers and menus scale from their trigger origin (set `transform-origin` from the Radix CSS variable).
  - Skip animation for high-frequency actions (keyboard shortcuts, command palette).
  - Respect `prefers-reduced-motion`.
- **Responsive:** mobile first, test real breakpoints, no horizontal scroll, touch targets at least 44px.
- **Accessibility:** semantic HTML, one h1 per page, labels on all inputs, visible focus rings, keyboard navigable, no color-only meaning. Keep Radix's built-in a11y intact when restyling.
- **Dark mode:** if supported, design the dark token set separately, not by inverting.

## Verification (Playwright MCP)
After each step:
1. Screenshot at 375, 768, and 1280 widths, light and dark if supported.
2. Compare against `references/`. List concrete deviations (spacing, type, color, alignment).
3. Tab through the page and confirm focus order and focus rings. Open every dialog, menu, and popover and check its states.
4. Check the console for errors and the page for layout shift or overflow.
5. Fix issues, re-screenshot, then report. Delete temporary screenshots and keep `.playwright-mcp` in `.gitignore`.
6. Playwright is token-heavy: use targeted screenshots, not full-page captures on every change.

## Code standards
- TypeScript strict, no `any`, functional components, server components by default in Next.js (mark `"use client"` only where shadcn interactivity needs it).
- Prefer composition and CSS over JS for visuals. No inline styles except for dynamic values.
- Ask before adding dependencies or doing large refactors.

## Output rules
- Be concise. Show diffs, not full file dumps.
- If a design decision is subjective, give me 2 options with a recommendation instead of asking open-ended questions.