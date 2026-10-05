# Build Plan

List the features that make up your project, high level and in rough build order.
Keep each item to one line; the details come later in `/feature`.

Plain bullets are fine. When both planning docs are ready, run `/overview`.
It adds tracking numbers and checkboxes to your feature list before generating
the project overview.

Run `/feature` to spec the next unchecked item, or `/feature 2` to pick one.
Keep completed items checked and append new features as the project grows.
Do not renumber completed features; their archived specs refer to those IDs.

Scaffolding the app and prototyping its look are pre-build steps, not features.
Start with your first real slice of functionality.

## Your features

- [ ] 1. **Room creation and basic WebSocket connection** - Users can generate/share a room URL and establish a real-time connection
- [ ] 2. **Basic pen tool drawing** - Freehand drawing with mouse/touch on canvas (single user, no sync yet)
- [ ] 3. **Real-time drawing operation synchronization** - See remote users' strokes appear as they draw (event/operation-based sync)
- [ ] 4. **Cursor visibility and basic presence** - See your own cursor on canvas
- [ ] 5. **Real-time cursor synchronization** - See remote users' cursors move in real-time with names/colors
- [ ] 6. **Handle reconnections gracefully** - Resume drawing after network interruption
- [ ] 7. **Support late-joining users** - Sync current canvas state to new participants
- [ ] 8. **Clear canvas** - Reset the drawing area to blank
- [ ] 9. **Shape tools (rectangle, ellipse, line)** - Add basic geometric shapes with styling (optional later)
- [ ] 10. **Text tool** - Insert and edit text boxes/sticky notes on canvas (optional later)
- [ ] 11. **Undo/redo functionality** - Step backward and forward through drawing actions (optional later)
- [ ] 12. **Room persistence (optional)** - Save/load room states for later reuse (optional later)
- [ ] 13. **UI polishing and responsiveness** - Refine layout, touch support, and visual feedback (optional later)