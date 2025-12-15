## Auth plan (Supabase) — Email/Password + Magic Links

### Goals
- **Guest mode (no login required)**:
  - Track all workouts
  - Track total XP
- **Login required for everything else** (progression, achievements, settings sync, history sync across devices, etc)
- **Scale to Premium tiers later** (paid entitlements that unlock additional features)

### Non-goals (for v1)
- Social logins
- Multi-tenant orgs/teams
- Complex permission systems beyond “guest vs signed-in vs premium”

---

## Architecture overview

### Key concept: guest identity + optional user identity
- Users start as **guests** with a locally-generated **guestId** stored in extension storage
- Guests can create workouts and accumulate total XP locally
- When a user signs in, the app:
  - **links** the existing guest data to the signed-in user (one-time migration)
  - then continues syncing to Supabase

### Storage strategy
- **Guest-only**: Chrome storage (or local storage abstraction you already have)
- **Signed-in**:
  - Supabase tables for workouts and XP ledger/summary
  - Chrome storage can remain as cache/offline buffer, but Supabase is source of truth

### Access tiers
- **guest**: workouts + total XP only (local)
- **signed_in**: all features (sync + advanced views)
- **premium** (future): additional gated features (determined by entitlements)

---

## Supabase setup

### 1) Create Supabase project and configure Auth providers
- Enable **Email** provider
- Turn on:
  - **Email + password** sign-up/sign-in
  - **Magic link** (passwordless) sign-in
- Configure:
  - **Site URL** (prod)
  - **Redirect URLs** (dev + prod extension redirect pages)
  - Email templates (magic link, confirm email, reset password)

### 2) Choose session strategy for a browser extension
- Use `@supabase/supabase-js`
- Store session securely in extension storage (via your existing storage layer)
- Implement a single place to:
  - initialize Supabase client
  - load persisted session
  - refresh session
  - broadcast auth state changes to UI

### 3) Define environment configuration
- Add config entries for:
  - Supabase URL
  - Supabase anon key
- Ensure dev/prod builds can swap values cleanly

---

## Data model (Supabase)

### 4) Tables

#### `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `created_at timestamptz default now()`
- Optional:
  - `display_name text`
  - `onboarding_complete boolean default false`

#### `workouts`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `performed_at timestamptz not null`
- `payload jsonb not null` (exercise list, sets, reps, etc)
- `xp_earned int not null default 0`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

#### `xp_events` (ledger)
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `source text not null` (e.g. `workout`, `bonus`, `adjustment`)
- `source_id uuid null` (e.g. workout id)
- `amount int not null` (positive/negative)
- `created_at timestamptz default now()`

#### `xp_totals` (optional denormalized summary)
- `user_id uuid primary key references auth.users(id) on delete cascade`
- `total_xp bigint not null default 0`
- `updated_at timestamptz default now()`

> Note: You can skip `xp_totals` initially and compute from `xp_events`, then add it later for performance.

### 5) RLS policies
Enable RLS on all user tables.

- `profiles`:
  - select/update: `auth.uid() = id`
  - insert: typically handled by trigger on `auth.users` creation

- `workouts`, `xp_events`, `xp_totals`:
  - select/insert/update/delete: `user_id = auth.uid()`

### 6) Triggers (optional but useful)
- On `auth.users` insert → create `profiles` row
- On `xp_events` insert → update `xp_totals.total_xp` (if using summary table)

---

## Guest mode requirements (no login)

### 7) Local identity + local-only data
- Generate `guestId` once:
  - `crypto.randomUUID()`
  - store in extension storage
- Store guest data separately from signed-in data:
  - `guest.workouts[]`
  - `guest.totalXp` (or `guest.xpEvents[]`)

### 8) Product gating rules
- Allow without login:
  - Create/edit/view workouts (local)
  - View total XP (local)
- Require login:
  - Sync to cloud
  - Cross-device history
  - Progression / unlocks / achievements
  - Reminders and multi-device settings
  - Any community/social features

Implementation approach:
- Add a single “capabilities” resolver:
  - input: `session`, `entitlements`
  - output: feature flags like `canUseProgression`, `canSync`, `canAccessPremiumX`
- UI reads capabilities and:
  - hides locked areas or shows locked cards
  - routes to sign-in when required

---

## Auth UX flows

### 9) Screens / actions
- **Sign in**:
  - email + password
  - magic link (send link)
- **Sign up**:
  - email + password (optional confirm email)
- **Magic link callback**:
  - handle redirect and finalize session
- **Forgot password / reset password**
- **Sign out**

### 10) Guest → signed-in migration
Goal: preserve workouts + XP earned as guest.

Recommended flow:
- After successful sign-in:
  - check for guest data in local storage
  - if present and not yet migrated:
    - upload workouts to Supabase
    - create corresponding `xp_events`
    - mark guest data as migrated (store `migratedToUserId` + timestamp)
  - then switch app state to “signed-in” data source

Important notes:
- Make migration **idempotent**:
  - include a `client_migration_id` stored locally and sent with each record (or embed inside `payload`)
  - on server, prevent duplicates (unique index or upsert strategy)

---

## Premium tiers (future-proofing now)

### 11) Model entitlements separately from auth
Auth tells you who the user is. Entitlements tell you what they can access.

Add tables (when ready):

#### `products`
- `id text primary key` (e.g. `premium_monthly`)
- `active boolean default true`

#### `entitlements`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `product_id text not null references products(id)`
- `status text not null` (e.g. `active`, `past_due`, `canceled`)
- `current_period_end timestamptz null`
- Primary key: `(user_id, product_id)`

### 12) Payments integration (typical: Stripe)
- Use Stripe Checkout + webhooks
- Webhook updates `entitlements`
- Client reads entitlements from Supabase and computes capabilities

Security:
- Webhook endpoint must verify Stripe signature
- Client must not be able to grant itself entitlements (RLS should prevent arbitrary writes)

---

## Implementation steps (recommended order)

### Phase 1: Auth foundation
- Add Supabase client wrapper and env config
- Implement auth store/state (session loading, refresh, sign out)
- Build sign-in UI:
  - email/password
  - magic link request
  - callback handler

### Phase 2: Guest mode baseline
- Implement `guestId` generation + storage
- Ensure workouts and total XP can be created/read purely locally
- Add capability gating so “everything else” is inaccessible unless signed in

### Phase 3: Cloud sync for signed-in users
- Create Supabase tables + RLS + triggers
- Implement signed-in data source for workouts and XP
- Implement guest → user migration
- Add basic conflict strategy (usually last-write-wins for simple records)

### Phase 4: Hardening
- Add logging + error handling around auth and sync
- Add rate limiting protections (mainly via Supabase settings and UX throttles)
- Add tests:
  - unit tests for capability resolver
  - integration tests for migration idempotency

### Phase 5: Premium readiness
- Add entitlements schema and capability flags
- Add Stripe integration + webhook service (when you’re ready to monetize)

---

## Security checklist
- RLS enabled everywhere for user data
- Policies only allow `auth.uid()` access
- Never trust client for entitlements
- Keep anon key public (expected), keep service role key server-only
- Ensure magic link redirect URLs are tightly scoped

---

## Open questions to decide (but you can safely start without)
- Whether XP should be purely derived from workouts or also allow “bonus/adjustments” (ledger vs computed)
- Whether to maintain a denormalized `xp_totals` for performance
- Conflict resolution rules if multiple devices edit the same workout offline
