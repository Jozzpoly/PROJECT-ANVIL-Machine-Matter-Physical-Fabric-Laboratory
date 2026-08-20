# PROJECT ANVIL — Epoch I Branch Audit

Status: **C3 CLASSIFICATION COMPLETE — NO UNSAFE DELETION PERFORMED**

Reference `main` at audit: `4f3cec42424ef4b70ad1992af21ec3a2b1a2d6e0`.

Purpose: classify historical branches before any deletion so repository tidiness cannot erase unique scientific/process history. This is repository hygiene, not a scientific experiment.

## Classification rules

- **A — deletion-safe ancestry**: branch has `ahead_by = 0` against `main`; all branch commits are reachable from current accepted history.
- **B — deletion-safe unique transient marker**: branch has a unique commit, but inspection shows it carries only superseded transient staging state and no unique scientific/process evidence.
- **C — preserve unique history**: branch has unique commits whose historical sequence should remain reachable until separately archived or intentionally retired.
- **D — active/current work**: branch is part of the current closure transaction and must remain.
- **E — unresolved**: insufficient evidence to classify safely; retain.

Deletion is optional after classification. The closure rule is to delete only when loss is demonstrably harmless, not to minimize branch count at any cost.

## A — deletion-safe ancestry

The following branches compare against `main` with `ahead_by = 0`. Their branch tips are already ancestors of current `main` and no unique branch-only commits would be lost by deleting the refs:

- `experiment/anvil-01-cut`
- `experiment/anvil-02-bearing`
- `experiment/anvil-03-rebind`
- `experiment/anvil-04-loaded-rebind`
- `experiment/anvil-05-torque`
- `experiment/anvil-06-torque-patch`
- `experiment/anvil-07-elastic-seam`
- `experiment/anvil-08-compliance-resolution`
- `experiment/anvil-09-activate`
- `experiment/anvil-10-torque-patch-rebind`
- `forge/v0.2.1-human-owner-copy`
- `foundation/forge-cut-field-trial`
- `foundation/lean-evidence-loop`
- `hardening/handoff-v2`
- `meta/anvil-08-active-grounding-atomic`
- `maintenance/epoch-i-closure-truth`
- `maintenance/epoch-i-infrastructure-hygiene`

These refs are **safe deletion candidates**, not required deletions. Exact accepted experiment evidence remains in `main` plus canonical preflight/evidence documents and recorded SHAs.

## B — deletion-safe transient unique marker

### `meta/anvil-08-active-grounding`

Comparison against audit `main`:

```text
status      diverged
ahead_by    1
behind_by   68
merge base  79acf565d3505a0d71be055132779c2ed2d92d8c
unique diff .anvil/ACTIVE-ANVIL-08-STAGING.md — one added line only
```

The unique branch content is a superseded one-line ANVIL-08 active-staging marker. Current ANVIL-08 acceptance/provenance is already canonically grounded in `main`; the staging marker is not scientific evidence. This branch is therefore a **safe deletion candidate**.

## C — preserve unique history

### `experiment/anvil-00-collapse`

Comparison against audit `main`:

```text
status      diverged
ahead_by    36
behind_by   202
merge base  421a123207dbef5438756353e8edd319e2bf1fc4
```

The branch carries the early ANVIL-00 project/bootstrap history across CI, rules, memory, experiment record, compiler/runtime/browser and tests. Much of the resulting content exists in evolved form on `main`, but the 36-commit historical sequence is not graph-reachable from `main`.

Classification: **C — preserve unique history**. Do not delete merely because the final ANVIL-00 capability is accepted elsewhere.

### `foundation/lab-kernel`

Comparison against audit `main`:

```text
status      diverged
ahead_by    24
behind_by   201
merge base  d67d8270839d713c6f2f5b78890b0172d6afb5c0
```

The branch carries 24 unique commits from the early foundation/lab-kernel consolidation, including evolution of protocol, foundation boundaries, provenance/continuity utilities, donor map, CI and CUT preflight preparation. Later `main` contains evolved descendants of much of this material, but the unique commit sequence itself is process/history evidence.

Classification: **C — preserve unique history**. Do not delete without a separate archival decision.

## D — current work

- `maintenance/epoch-i-repository-hygiene` — active C3 branch while this record is being prepared.

After its merge, this branch itself becomes an A candidate.

## Actual deletion result

No branch ref was deleted during this C3 transaction.

Reason: the available GitHub connector in this orchestration session exposes branch discovery/comparison/create/update capabilities but no supported branch-ref delete operation. Creating a temporary workflow, force-moving refs or using another workaround solely to reduce branch count would add unnecessary operational risk and violate the closure preference for simple, evidence-preserving actions.

This is **not a blocker** to Epoch I closure. The important safety work is complete: every historical branch is now classified, the deletion-safe set is explicit, and the two branches with substantial unique history are protected by policy rather than being mistaken for clutter.

## Branch hygiene policy after closure

- Delete A/B refs later only when a supported direct branch-delete operation is available and live ancestry is rechecked immediately before deletion.
- Preserve C refs unless their unique commit history is intentionally archived elsewhere first.
- Never infer deletion safety from naming, age, merged PR state or similar file content alone.
- New experiment/integration branches should normally become deletion candidates after exact accepted merge/provenance grounding, but deletion is housekeeping rather than scientific completion.

## Other repository debt

Server-side `main` protection remains absent. Agent-side expected-head checks and path audits therefore remain mandatory. The current connector exposes no supported protection-setting operation; do not invent a workaround during closure. Revisit repository rules/protection when the available GitHub administration surface supports it directly.
