# 🏗️ Architecture Guide

> Technical documentation for the RepsXtension codebase

---

## Overview

RepsXtension follows a **feature-based modular architecture** designed for scalability and maintainability. The codebase is organized around features (exercises, dashboard, history) rather than technical layers (components, hooks, utils).

---

## Directory Structure

```
src/
├── app/                      # Application entry point
│   └── App.tsx               # Root component, provider composition
│
├── components/               # Shared components
│   ├── common/               # Layout & navigation components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ViewToggle.tsx
│   │   └── icons/            # SVG icon components
│   ├── theme/                # Theme system
│   │   └── ThemeProvider.tsx
│   └── ui/                   # Base UI primitives (shadcn-style)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
│
├── features/                 # Feature modules (main business logic)
│   ├── exercises/            # Exercise management
│   │   ├── config/
│   │   │   └── exercises.ts  # Exercise registry
│   │   ├── components/
│   │   │   └── ExerciseCard.tsx
│   │   ├── __tests__/
│   │   └── index.ts
│   ├── dashboard/            # Dashboard view
│   │   ├── DashboardView.tsx
│   │   ├── StatsSummary.tsx
│   │   └── index.ts
│   └── history/              # History view
│       ├── HistoryView.tsx
│       └── index.ts
│
├── stores/                   # Global state management (React Context)
│   ├── ExerciseStore.tsx     # Exercise data & actions
│   ├── SettingsStore.tsx     # User settings
│   └── index.ts
│
├── lib/                      # Core libraries
│   ├── storage/              # Chrome storage abstraction
│   │   ├── chrome-storage.ts # Base storage class
│   │   ├── exercise-storage.ts
│   │   ├── settings-storage.ts
│   │   └── index.ts
│   └── utils/                # Utility functions
│       ├── dates.ts
│       ├── ids.ts
│       └── index.ts
│
├── types/                    # TypeScript type definitions
│   ├── exercises.ts
│   ├── settings.ts
│   └── index.ts
│
├── test/                     # Test utilities
│   ├── setup.ts              # Jest setup & mocks
│   └── test-utils.tsx        # Custom render helpers
│
└── scripts/                  # Extension scripts
    ├── background/
    │   └── background.ts     # Service worker
    └── content/
        └── content.ts        # Content script
```

---

## Key Concepts

### 1. Exercise Registry

All exercises are defined in a central registry (`src/features/exercises/config/exercises.ts`). This makes it easy to add new exercises without touching storage or UI code.

```typescript
// Adding a new exercise is as simple as:
{
  id: 'squats',
  name: 'Squats',
  subtitle: 'Lower body strength',
  icon: '🦵',
  category: 'lower_body',
  trackingType: 'reps',
  color: '#3498db',
  colorEnd: '#2980b9',
  defaultQuickOptions: [10, 15, 20, 25, 30],
  enabledByDefault: true,
}
```

The registry supports:
- **Categories**: upper_body, lower_body, core, cardio, stretch, eyes
- **Tracking types**: `reps` (count) or `duration` (seconds)
- **Customizable colors**: Primary and gradient end colors
- **Quick options**: Default quick-add button values

### 2. Storage Layer

Storage is abstracted into specialized modules:

| Module | Storage Area | Purpose |
|--------|--------------|---------|
| `exercise-storage.ts` | local | Exercise entries & history |
| `settings-storage.ts` | sync | User preferences (synced across devices) |
| `chrome-storage.ts` | - | Base class for all storage operations |

The storage layer is **dynamic** — it doesn't hardcode exercise types. Stats are computed based on the exercise registry.

### 3. State Management

Global state is managed with React Context:

- **ExerciseStore**: Exercise stats, history, and actions (log, clear)
- **SettingsStore**: User settings with persistence

```typescript
// Using the exercise store
const { todayStats, logExercise, enabledExercises } = useExerciseStore()

// Convenience hooks
const { today, week, isAnimating } = useExerciseStats('pushups')
const { todayTotals, weekTotals } = useTotalStats()
```

### 4. Feature Modules

Each feature is self-contained with its own:
- Components
- Hooks (if needed)
- Tests
- Index file for public exports

This makes it easy to:
- Add new features without touching existing code
- Delete features cleanly
- Understand feature scope at a glance

---

## Adding New Features

### Adding a New Exercise

1. Add definition to `src/features/exercises/config/exercises.ts`:

```typescript
{
  id: 'plank',
  name: 'Plank',
  // ... rest of definition
  enabledByDefault: true,  // Set to true to enable immediately
}
```

2. That's it! The exercise will automatically appear in:
   - Dashboard view
   - History charts
   - Stats calculations

### Adding a New Feature Module

1. Create feature folder:
```
src/features/my-feature/
├── components/
├── hooks/ (optional)
├── __tests__/
└── index.ts
```

2. Export from index.ts
3. Import and use in App.tsx or other features

### Adding Settings

1. Add to type definition in `src/types/settings.ts`
2. Add default value in `DEFAULT_SETTINGS`
3. Use via `useSettings()` or `useSettingsSection()`

---

## Testing

Tests are colocated with features in `__tests__` folders.

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# With coverage
npm test:coverage
```

### Test Structure

- **Unit tests**: Date utilities, exercise registry, storage
- **Integration tests**: Store behavior (coming soon)
- **Component tests**: React Testing Library (coming soon)

### Mocking Chrome APIs

Chrome APIs are mocked globally in `src/test/setup.ts`. The mock storage is automatically cleared between tests.

```typescript
// Seed storage for a test
import { seedMockStorage } from '@/test/setup'

beforeEach(() => {
  seedMockStorage({ key: 'value' })
})
```

---

## Type System

All types are centralized in `src/types/`:

```typescript
// Import types from central location
import { ExerciseDefinition, ExerciseEntry, AppSettings } from '@/types'
```

Key types:
- `ExerciseDefinition`: Exercise configuration
- `ExerciseEntry`: Single logged exercise
- `ExerciseStats`: Aggregated stats (totals, counts)
- `DailyTotals`: History data structure
- `AppSettings`: User preferences

---

## Path Aliases

Use `@/` prefix for imports:

```typescript
// Good
import { useExerciseStore } from '@/stores'
import { ExerciseCard } from '@/features/exercises'

// Avoid
import { useExerciseStore } from '../../../stores'
```

Configured in both `tsconfig.json` and `webpack.config.js`.

---

## Build & Development

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

---

## Future Considerations

### Planned Improvements

1. **More exercises**: Squats, planks, stretches (add to registry)
2. **Goals system**: Daily/weekly targets (use SettingsStore)
3. **Streak tracking**: Consecutive days (new feature module)
4. **Reminders**: Break notifications (background script + settings)
5. **Analytics**: Charts and insights (new feature module)

### Scaling Guidelines

- Keep features isolated in their own folders
- Use the store for shared state, props for local state
- Add new exercises to registry, not UI code
- Write tests for new utilities and storage logic
- Update this doc when adding major features

---

*Last updated: December 2024*

