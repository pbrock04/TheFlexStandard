# The Flex Standard — Agent Execution Handshake

## Repository State

- Repository: https://github.com/pbrock04/TheFlexStandard.git
- Active Branch: main
- Local Path: C:\Users\pbroc\TheFlexStandard
- Last Verified Commit: 3bf3a34
- Repository Status: CLEAN / SYNCED
- Test Status: PASS
- Production Deployment: LOCKED

## Active Front

Execution Continuity / CI-CD Readiness

## Current Task

### Task ID
OPS-001

### Objective
Establish AGENT_HANDOFF.md as the repository-level source of truth before Cloudflare deployment configuration is changed.

### Allowed Changes
- AGENT_HANDOFF.md only

### Out of Bounds
- No Cloudflare deployment
- No D1 migration
- No production configuration changes
- No GitHub secret changes
- No Slack configuration changes
- No application feature changes
- No content publishing
- No unrelated file edits

## Approval Gate

Current State:

DRAFTED — PENDING PAUL APPROVAL

No execution beyond the approved task scope is permitted without explicit authorization from Paul.

Required approval format:

APPROVED: APPLY OPS-001

## Verification Criteria

Before OPS-001 can be marked VERIFIED:

- [ ] AGENT_HANDOFF.md exists in repository root
- [ ] File contains current branch
- [ ] File contains current verified commit SHA
- [ ] Allowed changes are explicitly documented
- [ ] Out-of-bounds actions are explicitly documented
- [ ] Production remains LOCKED
- [ ] git status is clean after commit
- [ ] npm test passes
- [ ] origin/main contains the approved commit

## Execution Protocol

Every future agent must follow this sequence:

1. Read AGENT_HANDOFF.md.
2. Confirm repository branch and commit.
3. Identify the single active Task ID.
4. Confirm the allowed change scope.
5. Confirm out-of-bounds actions.
6. Prepare changes as DRAFT only.
7. Stop and request Paul's approval.
8. Execute only after explicit approval.
9. Run predefined verification checks.
10. Record the resulting commit and status in AGENT_HANDOFF.md.
11. Do not begin another task until the current task is VERIFIED or formally BLOCKED.

## Task Status

- [x] DRAFTED
- [x] APPROVED
- [ ] EXECUTED
- [ ] VERIFIED

## Next Planned Gate

After OPS-001 is VERIFIED:

OPS-002 — Cloudflare / Git Configuration Reconciliation

OPS-002 must begin as inspection only.

No production deployment is authorized until Paul separately approves it.
