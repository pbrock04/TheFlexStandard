# The Flex Standard — Advertising Readiness Audit
Date: 2026-08-29
Branch: feature/advertising-readiness-v1

## Locked V1 Funnel
7-Day Foundation (free lead) -> 14-Day Momentum (free earned) -> 21-Day Habit Lock (free earned) -> 28-Day Mastery (paid).

## Audit Summary

### DONE
- Customer-facing homepage progression uses Foundation -> Momentum -> Habit Lock -> Mastery.
- Dedicated 14-Day, 21-Day, Challenge Hub and Mastery modules exist.
- 28-Day Mastery has a locked-by-default production gate.
- D1 is configured and migrations exist.
- Automated Vitest test suite exists.
- Mastery backend foundation includes profile, dashboard/action and proof components.

### PARTIAL
- Challenge persistence exists in portions of the experience, but the acquisition-to-Mastery lifecycle is not yet unified around one server-side event ledger.
- Lead capture exists, but is currently optional after 7-Day completion rather than the locked start-of-Foundation lead_captured architecture.
- Mastery has a launch lock, but paid eligibility, Stripe session creation and verified purchase access are not yet wired to the Habit Lock completion event.
- Challenge tier naming is aligned on the homepage, while older schema/default identifiers still include legacy names such as 7-day-kickstart.
- Tests cover existing challenge/Mastery logic, but not the complete advertising funnel.

### MISSING / BLOCKING PAID TRAFFIC
- Start-of-funnel /api/subscribe or equivalent production lead endpoint tied to lead_captured.
- Unified idempotent lifecycle event persistence and milestone dispatch.
- 7_day_foundation_completed -> 14-Day Momentum server-side unlock.
- 14_day_momentum_completed -> 21-Day Habit Lock server-side unlock.
- 21_day_habit_lock_completed -> Mastery eligibility gate.
- Stripe /api/create-checkout-session for eligible Mastery users.
- Stripe webhook verification that alone emits 28_day_mastery_purchased / Purchase and grants paid access.
- ESP/Brevo production integration and event-driven lifecycle dispatch.
- GA4 / Meta / TikTok tracking adapters and consent-aware client wiring.
- Privacy Policy, Terms, fitness disclaimer and cookie/analytics consent experience in the audited repo.
- End-to-end mobile funnel test from ad landing -> lead -> challenge -> resume -> milestone -> checkout -> purchase.

## Event Contract
- lead_captured: initialize participant and Foundation access.
- 7_day_foundation_completed: unlock Momentum and dispatch completion communication.
- 14_day_momentum_completed: unlock Habit Lock.
- 21_day_habit_lock_completed: mark Mastery eligible. Do NOT count checkout here.
- 28_day_mastery_checkout_started: emitted only from explicit user checkout action; maps to InitiateCheckout.
- 28_day_mastery_purchased: emitted only after verified Stripe webhook; maps to Purchase and grants Mastery.
- 28_day_mastery_completed: closes curriculum and triggers continuity path.
- inactivity_48h_detected: re-engagement trigger independent of calendar-day assumptions.

## First Safe Implementation Package
This branch contains an additive, non-production-wired lifecycle scaffold:
1. src/eventTaxonomy.js — locked event/tier identifiers and validation helpers.
2. migrations/0004_lifecycle_events.sql — additive lifecycle event ledger schema.
3. test/eventTaxonomy.spec.js — guardrails separating eligibility, checkout and verified purchase.

Nothing in this package changes production routing, deploy configuration, Stripe behavior, analytics tags or Mastery launch mode. Integration into src/worker.js should occur only after tests and explicit production approval.

## Recommended Build Order
1. Lead capture + participant identity + lifecycle event persistence.
2. Milestone completion/unlock service for free tiers.
3. Mastery eligibility gate.
4. Stripe Checkout endpoint and webhook verification.
5. ESP dispatch adapters.
6. Consent-aware GA4/Meta/TikTok adapters.
7. Legal/footer/consent UX and mobile E2E validation.
