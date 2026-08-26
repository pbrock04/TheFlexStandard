# The Flex Standard — AI Collaboration Protocol

**Version:** 1.0  
**Status:** ACTIVE  
**Purpose:** Establish one shared operating system for Gemini, ChatGPT, Codex, and any future AI agents working on The Flex Standard.

---

## 1. Core Principle

No AI agent owns the project by itself.

All agents must work from the same approved requirements, respect the same boundaries, and leave a clear record of what was proposed, approved, changed, tested, deployed, and verified.

When instructions conflict, the latest explicit instruction from Paul takes priority.

---

## 2. Source of Truth

Two files serve different purposes:

### `AI_COLLABORATION_PROTOCOL.md`
Defines the permanent collaboration rules, roles, approval system, and quality gates.

### `AGENT_HANDOFF.md`
Tracks the current repository state, active task, allowed changes, approval status, verification criteria, and execution result.

Before making project changes, every AI agent must read both files when available.

---

## 3. AI Roles

### Gemini — Strategy & Specification
Primary responsibilities:
- Brainstorm and explore solutions.
- Develop structured requirements and implementation briefs.
- Identify risks, alternatives, and opportunities.
- Prepare clean handoffs for implementation.

Gemini does not override an approved implementation without documenting the proposed change.

### ChatGPT — Review, Coordination & Verification
Primary responsibilities:
- Convert ideas into clear project decisions and actionable plans.
- Review Gemini specifications for conflicts, gaps, unnecessary complexity, and alignment with project goals.
- Maintain continuity between strategy, implementation, and user approval.
- Review implementation results against the approved requirements.
- Help verify deployment, UX, and project status.

### Codex — Implementation & Technical Execution
Primary responsibilities:
- Inspect the actual repository before editing.
- Implement only approved requirements within the defined scope.
- Keep changes focused and reversible.
- Run required technical checks.
- Report exactly what changed, what passed, what failed, and what remains unresolved.

Codex must not invent new product requirements during implementation.

### Future Agents
Any future AI agent must be assigned a clear role before being allowed to make project changes and must follow this protocol.

---

## 4. Standard Task Lifecycle

Every meaningful project task moves through these states:

**PROPOSED → REVIEWED → APPROVED → IN PROGRESS → TESTED → DEPLOYED → VERIFIED**

Additional valid states:
- **BLOCKED** — Cannot safely continue without resolving a dependency or failure.
- **REJECTED** — Proposal was reviewed and intentionally not pursued.
- **ROLLED BACK** — A deployed or committed change was intentionally reversed.

No agent may represent a task as VERIFIED merely because code was written or committed.

---

## 5. Standard Handoff Format

Every implementation handoff should include:

### Task ID
A short unique identifier.

### Objective
What outcome is being requested and why.

### Approved Requirements
The exact behavior, copy, design, or technical outcome that has been approved.

### Allowed Changes
Files, systems, pages, routes, components, or settings that may be changed.

### Locked / Out of Bounds
Anything that must not be changed.

### Acceptance Criteria
Observable conditions that determine whether the task is successful.

### Required Checks
Tests, syntax validation, visual review, route checks, deployment checks, or other verification steps.

### Approval State
PROPOSED, REVIEWED, APPROVED, or another lifecycle state.

### Result
After execution: changed files, commit or PR reference, test result, deployment result, verification result, and unresolved issues.

---

## 6. Approval Rules

1. Proposals, drafts, analysis, and recommendations may be created without modifying production systems.
2. Project changes require explicit approval before execution unless Paul has explicitly approved the specific task in the current conversation.
3. Approval applies only to the described scope. It does not authorize unrelated cleanup, redesign, refactoring, deletion, publishing, configuration changes, or infrastructure changes.
4. Deletion requires explicit approval when it is not already clearly included in the approved task.
5. Publishing public-facing content requires explicit approval.
6. If execution reveals that the approved plan must materially change, the agent must surface the difference before treating the altered work as approved.
7. Reversible, minimal changes are preferred over broad rewrites unless a full rewrite was explicitly approved.

---

## 7. Checks and Balances

No single AI output is automatically treated as correct.

### Specification Check
Does the proposed change match the actual project goal and approved requirements?

### Scope Check
Are all proposed edits inside the allowed-change boundary?

### Technical Check
Does the code parse, build, and pass the required automated tests?

### Product / UX Check
For user-facing changes, does the result look and behave as intended on relevant screen sizes and flows?

### Deployment Check
Did the intended deployment mechanism complete successfully?

### Live Verification Check
Does the actual production or preview experience match the approved result?

A task reaches **VERIFIED** only after all applicable checks pass.

---

## 8. Conflict Resolution

When two agents disagree:

1. Do not silently choose one answer.
2. Identify the exact disagreement.
3. Compare both proposals against the approved goal, repository reality, test evidence, and project constraints.
4. Prefer the simpler solution when both satisfy the requirements equally well.
5. Escalate material product or business tradeoffs to Paul for the decision.

When an older document conflicts with a newer explicit approval, the newer approval wins and the shared project documentation should be updated accordingly.

---

## 9. Repository Safety

Before editing repository code, the implementing agent should confirm:
- Correct repository.
- Correct branch or target branch.
- Current relevant files have been inspected.
- Active task and scope are known.
- Locked areas are understood.

After editing, the implementing agent should record:
- Files changed.
- Tests/checks performed.
- Pass/fail status.
- Commit or pull request reference when applicable.
- Deployment status.
- Remaining risks or unresolved items.

Never claim a deployment, test, or verification occurred unless it actually occurred.

---

## 10. Keep the Protocol Lightweight

This protocol exists to reduce mistakes, duplication, confusion, and unauthorized changes — not to slow down normal work.

Small discussions and brainstorming do not need full task paperwork.

Use the full task lifecycle when work changes code, infrastructure, public content, production behavior, persistent data, integrations, or important project decisions.

---

## 11. Protocol Changes

This document is expected to evolve.

When the workflow shows a recurring weakness, bottleneck, or unnecessary step, propose a protocol revision. Significant protocol changes should be approved before they become the new operating standard.

Version updates should preserve a short record of what changed and why.

---

## 12. Version History

### v1.0
- Established shared roles for Gemini, ChatGPT, and Codex.
- Established `AI_COLLABORATION_PROTOCOL.md` as permanent governance and `AGENT_HANDOFF.md` as active execution state.
- Established standard task lifecycle and handoff structure.
- Established approval, scope, safety, testing, deployment, and verification gates.
- Established conflict-resolution rules and a path for future protocol revisions.
