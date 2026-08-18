# PROJECT ANVIL — Current Handoff

Status: **ANVIL-09 ACCEPTED / ANVIL-10 TORQUE-PATCH-REBIND PREFLIGHT FROZEN / NO IMPLEMENTATION YET**

Live Git and executable evidence override this pointer if they differ.

## Start here

1. Resolve live `main` before writing.
2. Accepted material truth remains through **ANVIL-09 / ACTIVATE**.
3. Accepted material checkpoint: `a024c8cb134aabe0033ea2990068e6479c3da2b5`.
4. Active unaccepted experiment: **ANVIL-10 / TORQUE-PATCH-REBIND**.
5. Draft PR: **#15**.
6. Branch: `experiment/anvil-10-torque-patch-rebind`.
7. Frozen preflight head: `d89f001705a8b80da822792ecef24e30af31ac89`.
8. Canonical preflight: `docs/experiments/ANVIL-10-TORQUE-PATCH-REBIND-PREFLIGHT.md`.
9. There is **no executable ANVIL-10 evidence yet**.

## What changed strategically

The former broad pointer `FUNCTION-REBIND` was narrowed before implementation to **TORQUE-PATCH-REBIND**. Generic FUNCTION remains unearned.

The primary uncertainty is now specifically whether one unchanged persistent local TORQUE-PATCH can be re-lowered onto the correct post-CUT disposable body representation while a valid-looking stale pre-CUT action is rejected.

The key adversarial fixture is important because after the accepted nearby CUT:

- persistent endpoint `a:2` moves from `body:a:0` to `body:a:2`;
- stale `body:a:0` still exists as a different post-CUT body;
- therefore checking only whether an old body ID exists would permit a semantically wrong action binding.

## Frozen experiment boundary

The preflight owns all exact gates and thresholds. Do not duplicate or reinterpret them here.

Core design decisions:

- one unchanged patch: `torque-patch:seam-0`, target `a:2@x+`, effort `+100 N*m`;
- use accepted REBIND `before`/`after` BearingCompilation and motion transfer;
- new relowering/validation remains experiment-local;
- against `before`, it must match accepted ANVIL-06 meaning;
- against `after`, it must remap to the rebound relation body IDs;
- an intentionally stale after-bearing + before-action pair must fail closed even though the old body ID still exists;
- the moving REBIND transaction itself is passive: no torque before/during reconstruction;
- two fresh post-CUT runtimes start OFF from the same transferred state;
- ACTIVE is explicitly switched ON; CONTROL remains OFF;
- stale sibling `body:a:0` must remain physically uninvolved;
- no transient command-state migration is tested.

## Feasibility boundary

Accepted `ActivatePhysics` cannot start from `transferRebindMotion()` state. Do **not** refactor ANVIL-09 merely to reuse it.

If implementation begins, prefer a new experiment-local ANVIL-10 runtime consuming:

- correctly relowered post-CUT `TorquePatchCompilation`;
- accepted REBIND transferred motion;
- accepted `ActivateControlState` OFF/ON semantics.

No `src/foundation` changes are expected.

If the smallest implementation requires semantic edits to accepted ANVIL-03/05/06/09 or foundation, stop and re-audit rather than refactoring through the warning.

## Exact next action

**Micro A/B only. Do not implement the solver runtime yet.**

1. Re-lock live `main`, PR #15 and active head.
2. Implement the smallest experiment-local relowering/validation adapter.
3. Prove accepted **before parity** against ANVIL-06.
4. Prove required **after remap** onto the rebound body IDs.
5. Prove the **valid-looking stale pre-CUT action fails closed** against the after relation even though `body:a:0` still exists.
6. Audit the exact diff before moving the branch.
7. Run Draft/core.
8. If any A/B gate is red, classify it before changing code and do not proceed to Class C.

Only a clean A/B checkpoint may unlock the ANVIL-10 moving solver runtime.

## Do not do now

- no C0/C1/C2 solver implementation before A/B is green;
- no command-state migration through CUT;
- no active torque during reconstruction;
- no load/contact, arbitrary-transform, multiple-patch, compliance or browser-science variant;
- no generic FUNCTION/Control/Signal/Port architecture;
- no edits to accepted ANVIL-03/05/06/09 semantics for elegance;
- no foundation promotion;
- no threshold weakening after executable results.

## Stable project documents

- `AGENTS.md` — truth hierarchy and orchestration cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift method.
- `docs/FOUNDATION.md` — accepted reusable boundaries only.
- `AI_PROJECT_MEMORY.md` — concise capability/architecture index + current strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.
