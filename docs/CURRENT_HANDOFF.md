# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / W0 B0 ACCEPTED / W1 SELECTED-NOT-ACTIVE**

Live Git and executable evidence override this checkpoint if they differ.

## Start here

1. Resolve live `main` and open PRs before writing.
2. Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only.
3. Accepted material checkpoint: `ffde8c0babdd473454b3e769cb10fd31537a0c70`.
4. ANVIL-10 evidence grounding: `ba7ce2dc67c6f7aa936e20a0294d9cc12208a549`.
5. Epoch I is closed. W0 has selected **B0 / post-rebind activation specimen**.
6. If PR #20 is still open, finish/reconcile that docs/meta W0 transaction before treating W0 as merged truth.
7. If PR #20 is merged, there is no active W1 implementation yet. Create a **new** W1 integration branch/PR before writing executable Workbench code.
8. Implement from the merged W0 contract, not from conversation memory.

## W0 authority order

For Workbench scope, later narrowing overrides the initial proposal:

1. `docs/workbench/W0-FINAL-SCOPE.md` — exact W1 implementation contract;
2. `docs/workbench/W0-ADVERSARIAL-REVIEW.md` — why original Candidate B was narrowed;
3. `docs/workbench/W0-VERDICT.md` — selection and acceptance logic;
4. `docs/workbench/W0-DESIGN-GATE.md` — initial comparison/provisional history only where it does not conflict with the files above.

## Accepted scientific boundary

ANVIL-10 supports only this bounded result:

> For the frozen single-bearing moving fixture, one unchanged persistent local TORQUE-PATCH can be re-lowered onto the rebound BEARING after a nearby CUT; a valid-looking stale pre-CUT action is rejected even though its old body ID still exists, and the fresh post-CUT action produces causal ON-vs-OFF torque through the correct new endpoint body without acting on the stale sibling.

The architectural consequence is **re-lowering, not migration**. `TorqueActionPlan` remains disposable compiled representation.

ANVIL-10 does not earn generic FUNCTION, Control, Signal, Surface, action invalidation, command migration, representation independence or foundation promotion.

## Epoch I executable baseline

```text
qualified / C3 tree          870a5b416c262eefbee13b817636a9246afb0378
qualification run            32372701068
Node test files              29
Node / real-Box3D tests      53/53 PASS
production build             PASS
launcher self-test           PASS
Chromium regression          19/19 PASS
owner artifact               9407794380
owner artifact digest        sha256:4280b53915286832c68eb2b6fa329c2b8a8d153a972595abc8893e2c117f786d
Epoch I closure merge        56993324c636e55607b18059ada4e33153d263be
```

This is whole-project regression/transport evidence, not a new scientific claim.

Residual process debt remains non-blocking: server-side `main` protection is absent and deletion-safe historical refs remain. Expected-head and changed-path checks remain mandatory.

## W0 decision

W0 compared four outcomes:

- **A — passive topology / REBIND:** safe but too close to the existing ANVIL-03 owner gate; fallback only.
- **B — original active topology:** rejected as proposed because pre-CUT torque and arbitrary owner-selected CUT timing could feed unqualified dynamic states into CUT/REBIND.
- **B0 — post-rebind activation:** **accepted**.
- **C — compliance / resolution:** deferred as a separate possible later specimen.

The adversarial review therefore changed the design materially rather than merely confirming it.

## Exact B0 story

```text
AUTHORED
Matter + one persistent BEARING + one persistent local TORQUE-PATCH

PRE-CUT
known moving passive state
→ deterministic progression to CUT READY
→ no pre-CUT torque activation

OWNER
execute the one accepted nearby CUT

TRANSACTION
old runtime discarded
motion transferred
2 bodies → 3 bodies
same persistent BEARING reconstructed
same persistent TORQUE-PATCH re-lowered
fresh post-CUT runtime/action starts OFF

OWNER
activate torque

OBSERVATION
bounded active window
causal torque through rebound endpoint
stale sibling is not part of the fresh action binding
```

B0 does **not** claim that active behavior, activation state or a compiled action survives CUT. Persistent source meaning remains; disposable runtime representation is rebuilt and a fresh action is derived afterward.

## Frozen W1 boundary

W1 may implement only the bounded specimen in `W0-FINAL-SCOPE.md`, including:

- one frozen authored fixture;
- one persistent BEARING and one persistent TORQUE-PATCH with frozen effort;
- **AUTHORED MATTER / RUNTIME INTERPRETATION / BOTH** views;
- deterministic progression to **CUT READY**;
- one marked accepted CUT;
- explicit 2 → 3 runtime decomposition;
- BEARING reconstruction and same-source TORQUE-PATCH re-lowering;
- fresh post-CUT runtime starting OFF;
- one bounded post-CUT activation/observation;
- optional background OFF control / technical provenance reveal;
- reset;
- Workbench-specific bounded controller, rendering, glue and tests.

W1 must not add pre-CUT torque activation, arbitrary CUT timing/location, active-during-CUT, activation/action/solver-state migration, torque scaling/editor semantics, gravity/contact/load/compliance composition, generic `FabricRuntime`, generic relation/component/FUNCTION/Control/Signal/Surface/Power architecture, or foundation promotion for integration convenience.

If any forbidden capability becomes necessary, stop and reclassify the gap before changing scope.

## Owner Reality Gate

The future specimen must permit a genuine negative result. Before detailed technical explanation, the owner should describe what appeared to remain the same, what was replaced, where torque meaning seems to live, and what they expect after post-CUT activation.

Only afterward should technical details reveal persistent source identity, body decomposition, rebound bearing provenance, fresh action binding and optional control diagnostics.

Owner verdict classes:

- **VALUE SIGNAL**;
- **LEGIBLE BUT SCRIPTED**;
- **NO VALUE SIGNAL**.

These are integration/owner evidence only, not scientific promotion verdicts.

## Next action after W0 merge

1. Cold-verify live `main`, open PRs and the merged W0 files.
2. Confirm no executable Workbench code entered PR #20.
3. Create a new W1 integration branch/PR.
4. Implement only `docs/workbench/W0-FINAL-SCOPE.md` under its stop rules.
5. Preserve the two-speed Draft/core → Ready/candidate validation model.

Do not create ANVIL-11 by inheritance and do not restore freedoms rejected during W0.
