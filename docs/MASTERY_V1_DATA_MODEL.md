# 28-Day Mastery V1 — Data Model and API Contracts

Status: implementation blueprint

## Storage model

### D1
D1 stores participant state, action completion, XP ledger entries, achievements, checkpoints, personal standards, FLEX Proof metadata, moderation state, and competition/event records.

### R2 / object storage
Actual FLEX Proof image bytes must not be stored in D1. D1 stores only the object key and metadata. Uploaded proof remains private by default and must not become publicly addressable solely because it was uploaded.

## Core tables

- `mastery_profiles`: onboarding choices and overall Mastery lifecycle.
- `mastery_daily_actions`: one idempotent record per completed action/day.
- `mastery_xp_ledger`: append-only XP source ledger. `UNIQUE(user_id, source_type, source_key)` prevents duplicate awards.
- `mastery_achievements`: unlocked badges.
- `mastery_weekly_checkpoints`: Day 7/14/21/28 reflection and recalibration.
- `mastery_personal_standards`: participant-defined ongoing standard.
- `mastery_proof_submissions`: private-by-default proof metadata, explicit spotlight opt-in, and moderation state.
- `mastery_events` / `mastery_event_entries`: bounded competitions and special missions.

## Derived values
Do not persist values that can be safely derived unless performance later requires it:

- Total XP = SUM(`mastery_xp_ledger.xp`) per participant.
- Current level = map total XP to configured level thresholds.
- Completed actions = count/query `mastery_daily_actions`.
- Current streak = consecutive calendar-day rule from qualifying completed-day data.
- Consistency = qualifying days completed / eligible days.
- Standard Maintained = product rule derived from recent consistency rather than a permanent mutable flag.

Keeping these values derived avoids score drift and makes corrections auditable.

## XP contract
Every XP award must have a deterministic source key. Example source keys:

- `day:9:focus`
- `day:9:execute`
- `day:9:flex-proof`
- `achievement:on-fire`
- `event:weekend-walk:2026-09-05`

A repeated request using the same participant + source type + source key must return the existing award rather than creating additional XP.

Featured/spotlight selection should not award XP. XP must never depend on consent to public use.

## FLEX Proof privacy contract

1. Request an upload target for an eligible mission.
2. Store image privately in object storage.
3. Create proof metadata with `spotlight_opt_in = 0` and moderation status `private`.
4. Award proof XP if eligible and not previously awarded for the mission.
5. Participant may separately opt in for spotlight consideration.
6. Opt-in changes moderation state to `pending` and records consent timestamp.
7. Moderator can approve/reject.
8. Public rendering is permitted only when opt-in is true AND moderation status is `approved`.
9. Withdrawing consent must stop future public rendering and set state to `withdrawn`.

## Proposed API surface

### Mastery lifecycle
- `POST /api/mastery/setup`
- `GET /api/mastery/dashboard`
- `GET /api/mastery/day/:day`
- `POST /api/mastery/actions/complete`
- `POST /api/mastery/checkpoints/:day`

### Progress / rewards
- `GET /api/mastery/progress`
- `GET /api/mastery/xp`
- `GET /api/mastery/achievements`

### Personal Standard
- `GET /api/mastery/standard`
- `PUT /api/mastery/standard`
- `POST /api/mastery/standard/lock`

### FLEX Proof
- `POST /api/mastery/proof/upload-request`
- `POST /api/mastery/proof`
- `GET /api/mastery/proof`
- `POST /api/mastery/proof/:id/spotlight-opt-in`
- `POST /api/mastery/proof/:id/withdraw-consent`

### Moderation (admin-only)
- `GET /api/admin/mastery/proof/pending`
- `POST /api/admin/mastery/proof/:id/approve`
- `POST /api/admin/mastery/proof/:id/reject`

### Events
- `GET /api/mastery/events`
- `POST /api/mastery/events/:eventKey/complete`

## Dashboard response shape
The dashboard endpoint should aggregate the minimum data needed for the mobile Today view in one call:

- participant current day
- phase/week
- progress percentage
- today mission/actions
- time selector options
- total XP and current level
- XP to next level
- current streak
- rolling consistency / Standard Maintained status
- recent achievement unlocks
- halfway/comeback state when applicable

Secondary Progress/Trophies/My Standard views can use separate endpoints or lazy-loaded sections.

## Implementation sequence
1. Apply/test schema locally and against a non-production D1 target.
2. Add pure XP/level/streak/consistency helpers and unit tests.
3. Implement setup + dashboard read APIs.
4. Implement idempotent action completion + XP ledger writes in transactions where available.
5. Implement achievements.
6. Add private object-storage binding and FLEX Proof upload flow.
7. Add moderation endpoints and admin authorization.
8. Build mobile dashboard UI.
9. Add Day 14 and Day 28 special states.
10. Add checkout/unlock only after Mastery behavior is stable and reviewed.

## Safety / product guardrails
- Never erase earned XP due to a missed day.
- Keep streak numbers truthful.
- Never make proof uploads public by default.
- Never couple XP rewards to publication consent.
- Never expose an unmoderated object as a community image.
- Maintain a deletion/withdrawal path for user-generated proof.
- Keep V1 focused; AI coaching and a full social forum remain deferred.
