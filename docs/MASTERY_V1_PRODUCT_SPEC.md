# The Flex Standard — 28-Day Mastery V1

Status: APPROVED FOR IMPLEMENTATION PLANNING

## Product ladder
7-Day Foundation → 14-Day Momentum → 21-Day Habit Lock → 28-Day Mastery (paid) → FLEX 365 / Standard Club (future)

## Product principle
The free challenges teach participants how to start. Mastery teaches participants to take ownership of their standard.

Mastery progression:
- Week 1 — Take Control: ~75% FLEX guidance / 25% participant choice
- Week 2 — Make Decisions: ~50% guidance / 50% choice
- Week 3 — Own It: ~25% guidance / 75% choice
- Week 4 — Live the Standard: increasingly self-directed

## V1 premium feature set
1. Mastery Setup: 5–6 high-impact onboarding questions covering goal, time, activity preference, equipment, schedule, consistency obstacle, and a non-fitness improvement area.
2. Personalized roadmap derived from setup choices.
3. Mobile-first premium Mastery Dashboard.
4. FLEX Score plus XP ledger and five levels: Starter, Builder, Consistent, Locked In, Mastery.
5. 8–10 core achievements plus FLEX Proof achievements.
6. Time-based workout selector: 10 min / 20 min / 30+ min, with bodyweight, dumbbell, walking/cardio, mobility/recovery and mixed options.
7. Standard Maintained consistency status plus truthful consecutive-day streak.
8. Comeback Mode. A lost streak does not erase progress. Core message: “Your streak ended. Your progress didn’t.”
9. Day-14 Halfway Checkpoint and standard recalibration.
10. Personal FLEX Standard builder near completion.
11. Day-28 celebration, completion summary, certificate and shareable FLEX Card.
12. My Journey display showing completed 7/14/21 stages and current Mastery progress.

## Dashboard navigation
Keep the Mastery surface focused:
- Today
- Progress
- Trophies
- My Standard

The Today view prioritizes: day/progress shield → today’s mission → time selector → FLEX actions → standard status.

## FLEX actions and XP
XP should be ledger-based rather than only a mutable total. Awards must be idempotent and auditable. Categories include Focus, Learn, Execute, eXcel, FLEX+, comeback, milestones and special events. Avoid permanently constraining the system to exactly 100 XP per day so future missions can award bonuses safely.

## FLEX Proof
FLEX Proof is an optional interactive accountability feature for eligible missions.

Participant flow:
1. Complete an eligible mission.
2. Optionally upload a relevant photo (workout, walk, book/learning, organized space, completed project, etc.).
3. Earn the eligible FLEX Proof XP award once per mission.
4. Upload remains private by default.
5. Participant may separately opt in to “Consider this for a FLEX Spotlight.”
6. Opt-in content enters moderation.
7. Only approved, explicitly consented submissions may be surfaced publicly.

Important rules:
- XP never depends on granting publication rights.
- Upload permission and publication permission are separate choices.
- One Proof XP award per eligible mission; duplicate uploads do not farm XP.
- Featured status itself should not award XP.
- No upload is automatically public.
- Actual photo objects should live outside D1 (planned object storage); D1 stores metadata/reference/state.

Initial FLEX Proof achievements:
- Proof of Work — first eligible proof
- Show Your Work — 5 proof missions
- Featured FLEX — selected for an approved community spotlight (recognition, no XP required)

## Competitions / events
V1 may support limited themed events without building a public forum. Examples: Weekend Walk, What Are You Reading?, Reset Your Space, Finish It. Events can award bounded bonus XP and optional badges.

## Day 28
Final mission emphasizes autonomy: choose movement, execute the top priority, face something avoided, prepare for tomorrow, and define the Personal FLEX Standard. Completion locks in the participant’s continuing standard and generates the completion experience.

## Completion rewards
- Mastery completion summary
- Final FLEX Score and level
- Longest streak / consistency summary
- Workouts and priorities completed
- Achievements
- Personalized Mastery Certificate
- 9:16 shareable FLEX Card

## Future / explicitly deferred
- AI FLEX Coach
- Personalized FLEX voice/video coaching
- Full public forum/social network
- Comments/reactions/teams/leaderboards
- FLEX 365 subscription mechanics

These are future enhancements and are not V1 launch dependencies.

## Implementation guardrails
- Mobile first.
- Keep the core experience simple and encouraging rather than overloaded.
- Do not punish a missed day by erasing earned progress.
- Keep streak counts mathematically truthful.
- Private uploads by default; explicit consent and moderation before public use.
- Build data/API contracts around the approved UX rather than reshaping UX around existing tables.
- Payment/unlock and pricing remain separate implementation decisions before production launch.
