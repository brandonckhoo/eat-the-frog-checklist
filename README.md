# Flow

> Task management with a game loop. Eisenhower matrix board, XP, streaks, quests, and Pip the duck.

---

## Live Demo

| Method | Link |
|---|---|
| **Expo Web** | `https://YOUR-EXPO-USERNAME.github.io/flow-app` *(deploy steps below)* |
| **Expo Go (device)** | Scan QR code from `npx expo start` |
| **Android APK** | Download from [GitHub Releases](../../releases) |

---

## Run Locally

### Prerequisites

- Node 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Install

```bash
git clone https://github.com/YOUR-USERNAME/flow-app
cd flow-app
npm install
```

### Start dev server

```bash
npx expo start
```

This opens Expo Dev Tools. From there:

- **Web** — press `w` in the terminal
- **iOS simulator** — press `i`
- **Android emulator** — press `a`
- **Physical device** — scan the QR code in Expo Go

---

## Demo Options

### Option 1: Expo Web (default — public link)

Deploy to GitHub Pages via EAS:

```bash
npx expo export --platform web
# Then push the dist/ folder to gh-pages branch
```

Or use EAS hosting:

```bash
npx eas-cli deploy --platform web
```

The public URL will be printed after deploy. Paste it in the table above.

### Option 2: Expo Go QR Code

1. Run `npx expo start`
2. A QR code appears in the terminal
3. Open Expo Go on your phone
4. Scan the QR code
5. The app loads live on your device with hot reload

> Note: Your phone and computer must be on the same Wi-Fi network.

### Option 3: Android APK via GitHub Releases

Build an APK with EAS:

```bash
# One time setup
npx eas-cli login
npx eas build:configure

# Build APK
npm run build:apk
```

When the build finishes, EAS prints a download URL. Upload that APK to a GitHub Release on this repo.

**To install the APK on Android:**
1. Download the `.apk` file from the Releases page
2. Open it on your Android device
3. If prompted, enable "Install from unknown sources"
4. Tap Install

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Expo SDK 52 + Expo Router v4 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand v5 |
| Storage | Expo SQLite (WAL mode, migrations) |
| Animations | React Native Reanimated v3 |
| Gestures | React Native Gesture Handler v2 |
| Charts | None (custom progress bars) |
| CI | GitHub Actions |
| Build | EAS (Expo Application Services) |

---

## Project Structure

```
flow-app/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (GestureHandler, splash)
│   └── (tabs)/
│       ├── _layout.tsx     # Tab bar
│       ├── index.tsx       # Home board (Eisenhower matrix)
│       └── progress.tsx    # XP, streak, badges, quests
│
├── src/
│   ├── types/index.ts      # All TypeScript types
│   ├── theme/tokens.ts     # Design system tokens
│   │
│   ├── domain/             # Pure business logic (no side effects)
│   │   ├── gamification.ts # XP, level math
│   │   ├── streaks.ts      # Streak calculation
│   │   ├── badges.ts       # Badge unlock rules
│   │   └── quests.ts       # Quest generation and progress
│   │
│   ├── data/               # Repository layer (SQLite)
│   │   ├── db.ts           # DB connection + migrations
│   │   ├── migrations.ts   # Schema migrations
│   │   └── repositories/   # One file per entity
│   │
│   ├── store/              # Zustand stores
│   │   ├── taskStore.ts    # Task CRUD
│   │   ├── progressStore.ts# XP, streak, badges, quests
│   │   └── uiStore.ts      # Modal visibility, pending badges
│   │
│   └── components/
│       ├── mascot/         # Pip the duck SVG + animations
│       ├── board/          # Column, TaskCard, DnD, FAB
│       ├── modals/         # Task sheet, celebration, badge modal
│       └── ui/             # Header, XP bar, badge grid, quest card
│
├── __tests__/              # Unit tests for domain logic
├── .github/workflows/      # GitHub Actions CI
├── eas.json                # EAS build profiles
└── app.json                # Expo config
```

---

## Data Model

### Task
| Field | Type | Notes |
|---|---|---|
| id | string | UUID |
| title | string | Required |
| notes | string? | Optional |
| column | 'do_first' \| 'do_later' \| 'do_free' | Eisenhower quadrant |
| createdAt | number | Unix ms |
| dueAt | number? | Optional deadline |
| completedAt | number? | Set on completion |
| difficulty | 1 \| 2 \| 3 | Easy / Medium / Hard |
| tags | string[]? | Comma-separated in DB |

### XP Formula

- Difficulty 1 = 10 XP
- Difficulty 2 = 20 XP
- Difficulty 3 = 30 XP
- Level N requires `N * 100` XP to advance

### Streak Rule

Streak increments when at least 1 task is completed each calendar day. Missing a day resets to 1 on next completion.

---

## Mascot — Pip

Pip is a confused but determined yellow duck. He shows up when things go well, and looks mildly shocked that you pulled it off. He never gives up.

**Animation states:** `idle` `celebrate` `surprised` `encouraging`

SVG source: `src/components/mascot/PipMascot.tsx`

---

## Gamification Rules

### Badges

| Badge | Condition |
|---|---|
| First Step | Complete 1 task |
| 3 Day Streak | Best streak is 3 |
| 7 Day Streak | Best streak is 7 |
| 10 Tasks | Complete 10 tasks total |
| 50 Tasks | Complete 50 tasks total |
| 100 Tasks | Complete 100 tasks total |

### Weekly Quests (reset every Monday)

| Quest | Target | XP reward |
|---|---|---|
| Complete tasks | 5 | 50 |
| Complete Do First tasks | 3 | 30 |
| Complete 1 hard task | 1 | 40 |
| Keep a 3 day streak | streak 3 | 60 |

---

## Run Tests

```bash
npm test
```

Tests cover all pure domain functions: gamification math, streak logic, badge unlock rules, and quest progress updates.

---

## Build for Production

### Android APK (for testing / portfolio)

```bash
npm run build:apk
```

### iOS (requires Apple Developer account)

```bash
eas build --platform ios --profile production
```

### Submit to stores (when ready)

```bash
eas submit --platform android
eas submit --platform ios
```

---

## CI

GitHub Actions runs on every push and PR to `main`:

1. TypeScript typecheck
2. ESLint
3. Jest unit tests

See `.github/workflows/ci.yml`.

---

## License

MIT
