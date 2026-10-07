@AGENTS.md

## JSX text
- Never put raw `'` or `"` in JSX text nodes. Use `&apos;` / `&rsquo;` / `&quot;`
  or wrap the text in a string expression: `{"Who's here"}`.
  (ESLint rule: react/no-unescaped-entities)


## SVG in JSX
- Use camelCase props: `strokeWidth`, `strokeLinecap`, `strokeLinejoin`,
  `fillRule`, `clipRule`, `strokeDasharray`. Never kebab-case.

  ## Before finishing a task
- Run `npm run lint` and `npx tsc --noEmit` in `frontend/` and fix all
  warnings introduced by your changes.