# Plan: MTG Tournament Tracker Dashboard

## Overview

A Next.js dashboard to track Magic: The Gathering Modern format weekly tournament matches with full analytics.
> [!NOTE]
> This application is intended for **local execution only**. Data persistence relies on the local filesystem (`src/data/tournaments.json`). It is not designed for edge deployment (Vercel/Netlify) without migrating to a database.

## User Requirements

- **Game**: Magic: The Gathering, Modern format
- **Schedule**: Every Monday at local game store
- **Matches per tournament**: 4 matches with different opponents
- **Deck usage**: 2-3 decks in rotation
- **Data storage**: Local JSON file
- **Analytics**: Full statistics with trends, including "On the Play/Draw" win rates.

## Data Model

### Tournament

```json
{
  "id": "uuid",
  "date": "2025-01-27",
  "location": "Local Game Store",
  "format": "Modern",
  "matches": [] // Array of Match objects
}
```

### Match

```json
{
  "id": "uuid",
  "opponentName": "string",
  "myDeck": "string",       // Normalized deck name (e.g. from a dropdown)
  "opponentDeck": "string", // Normalized deck name if possible
  "games": [
    { "onPlay": true, "won": true },
    { "onPlay": false, "won": false },
    { "onPlay": true, "won": true }
  ],
  "notes": "string"
}
```

> [!IMPORTANT]
> **Derived Fields**: The UI should calculate `result` (e.g., "2-1") and `won` (boolean) dynamically from the `games` array. Storing them creates a risk of desynchronized state.

## Project Structure

```
mtg-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard home
│   │   ├── tournaments/
│   │   │   ├── page.tsx          # Tournament list
│   │   │   ├── new/page.tsx      # Add new tournament
│   │   │   └── [id]/page.tsx     # Tournament details
│   │   ├── stats/page.tsx        # Analytics page
│   │   └── layout.tsx            # App layout with nav
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (Button, Input, Dialog, etc.)
│   │   ├── match/
│   │   │   ├── MatchForm.tsx     # Add/edit match form (with Deck Autocomplete)
│   │   │   ├── MatchCard.tsx     # Display match result
│   │   │   └── DeleteMatch.tsx   # Delete confirmation dialog
│   │   ├── tournament/
│   │   │   ├── TournamentCard.tsx
│   │   │   └── TournamentForm.tsx # Add/Edit tournament
│   │   ├── stats/
│   │   │   ├── WinRateChart.tsx
│   │   │   └── DeckStats.tsx
│   │   └── Navigation.tsx
│   ├── lib/
│   │   ├── data.ts               # JSON file read/write
│   │   ├── stats.ts              # Statistics calculations
│   │   ├── utils.ts              # CN helper and other utils
│   │   └── types.ts              # TypeScript types
│   └── data/
│       └── tournaments.json      # Data storage file
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Features

### 1. Dashboard Home

- Quick stats: Total record, current win rate
- Recent tournaments (last 4)
- Quick "Add Tournament" button

### 2. Tournament Management

- **List View**: All tournaments with summary record.
- **Create/Edit**: Date picker for tournament date.
- **Match Management**:
  - Add Match with **Deck Autocomplete** (prevent "Murktide" vs "Izzet Murktide" split).
  - Edit existing match results.
  - Delete matches.
  - Delete entire tournament.

### 3. Analytics Page

- **Win rate trend**: Line chart showing win % over time.
- **Deck performance**: Bar chart comparing your decks.
- **Play/Draw Stats**: Win rate when on the play vs on the draw.
- **Matchup matrix**: How you perform vs common opponent decks.

## Implementation Steps

### Phase 1: Project Setup & UI Foundation

- [ ] Initialize Next.js project with TypeScript
- [ ] Install **shadcn/ui** (cli) for rapid UI development
- [ ] Add core components: `Button`, `Input`, `Card`, `Dialog`, `Select`, `Calendar`, `Popover`
- [ ] Configure project structure & types

### Phase 2: Data Layer (Improved)

- [ ] Create `tournaments.json` with sample data conforming to new schema
- [ ] Implement `getTournaments`, `saveTournament`, `deleteTournament`
- [ ] Implement `addMatch`, `updateMatch`, `deleteMatch`

### Phase 3: Core Pages & CRUD

- [ ] Build Layout & Navigation
- [ ] **Tournament List**: Display and Delete capability
- [ ] **Tournament Details**:
  - Header with date/location
  - List of matches
  - "Add Match" Dialog/Form
  - "Edit/Delete" actions per match
- [ ] **Match Form**:
  - Implement `CreatableSelect` for Deck names (normalize inputs)
  - Game 1/2/3 inputs (checkbox for "On Play", checkbox for "Won")

### Phase 4: Analytics

- [ ] Install `recharts`
- [ ] Build **Win Rate Trend** chart
- [ ] Build **Deck Performance** chart
- [ ] Calculate and display "Play vs Draw" win rates

### Phase 5: Polish

- [ ] Add responsive design
- [ ] Add loading states and empty states
- [ ] Test "Edit" flows to ensure data consistency

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + **shadcn/ui** (Radix UI)
- **Charts**: Recharts
- **Storage**: Local JSON file (Node.js `fs` module)
- **Language**: TypeScript

## Verification

1. **Data Integrity**: Add a match, check `tournaments.json`. Ensure no redundant fields.
2. **Deck Normalization**: Create a match with "Murktide", then another. Ensure the dropdown offers "Murktide" as an option.
3. **CRUD**: Create a tournament, add a match, edit the match result, delete the match, delete the tournament. Verify file state at each step.
4. **Stats**: Verify "On Play" win rate is calculating correctly from the game data.
