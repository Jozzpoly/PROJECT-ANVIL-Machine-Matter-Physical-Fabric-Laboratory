# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-19.

Accepted material truth is through **ANVIL-09 / ACTIVATE**. **ANVIL-10 / TORQUE-PATCH-REBIND** is now active and unaccepted on Draft PR #15 with a frozen preflight and no executable result yet.

## Authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

1. live Git/code and executable evidence;
2. owner validation when required;
3. `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md` verified against live Git;
4. this memory and canonical docs;
5. conversation/donor history only as leads.

ANVIL tests persistent authored Machine Matter / Physical Fabric meaning compiling into disposable runtime representations. Runtime Box3D bodies/joints are interpretations, not construction identity. Cubic cells remain a laboratory dialect, not final ontology.

## Accepted capability stack

- **ANVIL-00 / COLLAPSE** — persistent matter can compile into reduced rigid runtime representation.
- **ANVIL-01 / CUT** — bounded mass-preserving runtime topology replacement with source identity and rigid-field transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface can derive two rigid islands plus a passive revolute relation.
- **ANVIL-03 / REBIND** — persistent BEARING semantics can be reconstructed onto changed disposable runtime bodies.
- **ANVIL-04 / LOAD-REBIND** — bounded loaded reconstruction without joint-cache migration or gross first-step shock.
- **ANVIL-05 / TORQUE** — signed persistent active intent can create causal mechanical work through BEARING without authored Box3D motor semantics.
- **ANVIL-06 / TORQUE-PATCH** — local source-face placement can resolve existing BEARING without an authored `bearingId`.
- **ANVIL-07 / ELASTIC-SEAM** — one frozen local compliant seam can deform and restore.
- **ANVIL-08 / COMPLIANCE-RESOLUTION** — frozen 1D area-normalized compliance survives exact 2x authored source refinement without per-patch retuning.
- **ANVIL-09 / ACTIVATE** — one unchanged persistent signed TORQUE-PATCH action can be compiled once while runtime-only binary activation switches it OFF/ON/OFF; OFF supplies no active torque rather than braking, and a fresh runtime from the same compilation defaults OFF.

Exact scientific evidence and promotion identities live in the corresponding evidence logs under `docs/experiments/`.

## Latest accepted promotion — ANVIL-09

Material merge: `a024c8cb134aabe0033ea2990068e6479c3da2b5`.  
Evidence grounding: `3da72fadec5cd145a8be149bacd12084c8d4fcde`.  
Ready run: `32195221850`.  
Qualified tree: `e2adf2ef0a4c9c0ce461113cafc4fe7706ca0135`.

ANVIL-09 does not earn generic FUNCTION, Control, Signal, Port, routing or power architecture. Preserve its two meaningful C2 RED runs and stale Ready merge-ref incident as negative/process evidence.

## Active frontier — ANVIL-10 / TORQUE-PATCH-REBIND

Draft PR: **#15**  
Branch: `experiment/anvil-10-torque-patch-rebind`  
Frozen preflight source: `d89f001705a8b80da822792ecef24e30af31ac89`  
Canonical preflight: `docs/experiments/ANVIL-10-TORQUE-PATCH-REBIND-PREFLIGHT.md`

Status: **FROZEN BEFORE IMPLEMENTATION / NO EXECUTABLE RESULT YET**.

### Strategic correction

The previous broad pointer `FUNCTION-REBIND` was narrowed before implementation. Generic FUNCTION is still unearned, so ANVIL-10 tests exactly the already-supported local semantic: TORQUE-PATCH.

Primary bounded question:

> Can one unchanged persistent local TORQUE-PATCH be re-lowered onto the correct post-CUT disposable body representation while a valid-looking stale pre-CUT action is rejected, then produce causal post-CUT ON-vs-OFF response without acting on the stale sibling body?

### Why this is non-trivial

Accepted TORQUE action compilation contains disposable `bodyAId/bodyBId`. Accepted REBIND changes the bearing endpoint body from `body:a:0` to `body:a:2` after a nearby CUT.

Crucially, stale `body:a:0` still exists after CUT as a different rigid component. Therefore a stale action can remain syntactically/runtime-valid while being semantically attached to the wrong persistent matter. ANVIL-10 must reject that case before solver creation.

### Frozen scope

- one unchanged patch: `torque-patch:seam-0`, target `a:2@x+`, signed effort `+100 N*m`;
- accepted REBIND before/after bearing compilations and motion transfer;
- experiment-local relowering/validation only;
- before parity with accepted ANVIL-06;
- required after remap to rebound body IDs;
- valid-looking stale before action paired with after bearing must fail closed;
- passive moving reconstruction transaction with no active torque before/during CUT;
- two fresh post-CUT runtimes default OFF from identical transferred state;
- one explicit ON vs one OFF control;
- stale sibling `body:a:0` must remain physically uninvolved;
- no transient activation migration through CUT.

Exact gates and thresholds belong only in the canonical preflight.

### Feasibility boundary

Accepted `ActivatePhysics` cannot initialize from REBIND transferred motion. Do not refactor ANVIL-09 merely for reuse. The preferred future shape is a new experiment-local ANVIL-10 runtime that consumes correctly relowered post-CUT compilation + accepted transferred motion and reuses `ActivateControlState` semantics.

If this requires semantic edits to accepted ANVIL-03/05/06/09 or `src/foundation`, stop and re-audit.

## Exact next action

**Micro A/B only.**

Implement the smallest experiment-local relowering/validation adapter, then prove:

1. accepted before parity against ANVIL-06;
2. deterministic after remap to the rebound relation;
3. valid-looking stale pre-CUT action rejection despite stale `body:a:0` still existing.

Audit the exact diff and run Draft/core. Do not implement the ANVIL-10 solver runtime until A/B is green and classified.

## Do not do now

- no Class C solver implementation before A/B passes;
- no transient command-state migration;
- no torque active during reconstruction;
- no load/contact, arbitrary transform, multiple patch, compliance or UI variants;
- no generic FUNCTION/Control/Signal/Port/routing architecture;
- no accepted-semantic refactor merely to make composition elegant;
- no foundation promotion;
- no weakening frozen discriminators after seeing ANVIL-10 results.

Known non-blocking process debt remains: server-side `main` protection is absent; production build still emits the historical Forge manifest; Node test registration remains manually enumerated.
