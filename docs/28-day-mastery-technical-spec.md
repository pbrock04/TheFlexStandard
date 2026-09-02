# The Flex Standard — 28-Day Mastery V1 Technical Specification

Status: APPROVED FOR BUILD — September 2, 2026

## Product definition
28-Day Mastery is a complete standalone 28-day experience. It does not replace or modify the completed free 7-Day Foundation, 14-Day Momentum, or 21-Day Habit Lock challenges.

Core arc:
1. Days 1–7 — Calibration / FOCUS
2. Days 8–14 — Resilience / LEARN
3. Days 15–21 — Autonomy / EXECUTE
4. Days 22–28 — Ownership / eXcel

Each day offers three intentional prescriptions sharing a coherent daily movement theme:
- Express — approximately 10 minutes; the minimum sustainable floor.
- Standard — approximately 20 minutes; the recommended daily prescription.
- eXcel — approximately 30+ minutes; optional progression, never punishment.

## V1 product systems
### Daily tier selector
Persist the participant's selected tier per day. Tier selection can change day to day without penalty.

### Comeback Mode / Floor Day
A participant who misses or cannot complete the planned prescription can return with an Express/Floor Day. No streak-shaming, catch-up workouts, or punitive language.

### Standard Days
Track cumulative Mastery days completed. The counter represents proof of returning and is not reset by a missed calendar day.

### Four-stage progression
Stage transitions occur after Days 7, 14, and 21. Each transition includes a short review/reflection before the next stage.

### Day 28 Personal FLEX Charter
Capture and display:
- participant name
- completion date
- lifetime Standard Days
- daily movement floor
- comeback rule
- three personal non-negotiables
- personal Standard statement

V1 may provide a clean printable/saveable Charter screen. A complex certificate-generation service is explicitly out of scope.

### Companion Workbook
Content is authored separately from the application and should cover daily tracking, weekly stage assessments, non-negotiables, Comeback Mode, and the Personal FLEX Charter.

## State model
Use a new isolated namespace. Do not reuse free-tier storage keys.

Recommended keys:
- flexStandard.mastery28.v1 — Mastery progress state
- flexStandard.mastery28.standardDays.v1 — cumulative Standard Days
- flexStandard.mastery28.charter.v1 — Charter draft/completion data

Mastery progress should support:
- current/completed days
- selected tier for each day
- comeback/floor-day designation
- stage review completion
- started/completed timestamps

## Curriculum contract
The authoritative curriculum must contain exactly 28 days. Each day requires:
- day number
- stage
- FLEX pillar
- title/theme
- Express prescription
- Standard prescription
- eXcel prescription
- scalable alternative/modification guidance
- daily lifestyle/action item
- lesson/message
- reflection/check-in prompt

The three prescriptions do not need artificial exercise variety. They should scale one coherent daily theme through duration, volume, complexity, range, or intensity.

Reject placeholder/stub language including TBD, lorem ipsum, generic daily-standard placeholders, or empty tier prescriptions.

## Completion and milestones
Mastery must have its own completion event and must not alter the three verified free-funnel milestones. Proposed event name: 28_day_mastery_completed.

Do not add the event to production D1 until the Mastery implementation and access model are approved for release.

## Access and payment boundary
Stripe, checkout, billing, and paid production gating are NOT part of this build phase.

Mastery must be buildable/testable privately without a live payment dependency. Payment integration is a separate release gate requiring Paul's approval.

## Required automated tests
- exactly 28 curriculum days
- all three tiers populated on every day
- all required curriculum fields populated
- no placeholder strings
- stage boundaries 1–7 / 8–14 / 15–21 / 22–28
- selected tier persists independently per day
- Express/Floor Day completion counts as a valid Standard Day
- missed calendar day does not erase progress
- Standard Days do not double-count repeated completion actions
- free challenge storage remains untouched
- Charter required fields persist and render
- Day 28 completion requires valid Mastery state
- Mastery does not emit any of the three free-funnel milestone events

## Explicit V1 exclusions
- live Stripe activation
- community forums/chat
- live coaching
- mandatory photo/video verification
- complex AI generators
- mandatory merchandise/equipment
- production publishing before release approval

## Division of work
Gemini: authoritative 28-day x 3-tier curriculum, scalable alternatives, actions, lessons/reflections, workbook copy, email copy, Charter content, badge/visual specifications.

Chat: isolated state model, route/UI architecture, tier selector, Comeback Mode, Standard Days, stage transitions, Charter UI/data, tests, eventual milestone/access integration.

Paul: final approval for pricing/payment, production release, and optional audio coaching enhancements.
