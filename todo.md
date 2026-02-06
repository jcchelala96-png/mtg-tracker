# MTG Tournament Tracker - Mobile Optimization & Rapid Entry

## Current Goal: Drag-and-Drop Organization

Enhance the dashboard to allow dragging unorganized results directly into recent tournaments.

### 1. Drag-and-Drop Interface

- [ ] **Dashboard Integration**: Implement DnD directly on the main dashboard (`src/app/page.tsx`).
- [ ] **Draggable Items**: "Unorganized Results" list items should be draggable.
- [ ] **Drop Zones**: "Recent Tournaments" cards should act as drop zones.
- [ ] **Interaction**:
  - Dragging a match over a tournament card highlights the card.
  - Dropping the match triggers the `moveMatch` API call.
  - UI updates optimistically (match disappears from Inbox, Tournament stats update).

---

## Completed Tasks

### Phase 11: Mobile Quick Entry (Complete) ✓

- [x] **Quick Action Button**: Added prominent "Quick Add Result" CTA on dashboard.
- [x] **Rapid Result Entry Form**: Created `/quick-add` with simplified inputs and one-tap result buttons.
- [x] **Inbox System**: Implemented `INBOX_ID` and storage logic for unassigned matches.
- [x] **Basic Organization**: Created `/organize` page (fallback for non-DnD usage or bulk actions).
- [x] **Dashboard Updates**: Display "Unorganized Results" section.

---

## Previous Completed Tasks

### Phase 1: Recreate Project Structure ✓

- [x] Create `src/` directory
- [x] Create `src/app/` directory (Next.js App Router)
- [x] Create `src/lib/` directory (utilities, types, data layer)
- [x] Create `src/components/` directory (React components)
- [x] Create `src/data/` directory (JSON storage)

### Phase 2: Core Types & Utilities ✓

- [x] Create `src/lib/types.ts` - TypeScript type definitions
- [x] Create `src/lib/utils.ts` - Utility functions (cn helper)
- [x] Create `src/lib/data.ts` - Data layer (CRUD operations)
- [x] Create `src/lib/stats.ts` - Statistics calculations

### Phase 3: Basic App Structure ✓

... (Standard setup complete)

### Phase 4: Data Layer ✓

- [x] Create `src/data/tournaments.json` - Sample data file

### Phase 5-10: Feature Implementation ✓

- All core tournament tracking, matchmaking, stats, and UI components implemented.
