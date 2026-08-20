# PROJECT ANVIL — Physical Fabric Workbench v0 / W0 Final Scope Candidate

Status: **FREEZE CANDIDATE — implementation still unauthorized until PR #20 final gate passes**

This document converts the adversarially narrowed B0 design into an exact W1 implementation contract. It is intentionally smaller than the first provisional concept.

## 1. Selected specimen

**B0 — post-rebind activation specimen**

Primary owner-facing idea:

> One persistent authored local capability remains meaningful while the disposable runtime topology and action binding are replaced. After the accepted topology transaction, a fresh compiled action derived from the same source meaning can perform physical work through the rebound endpoint.

This is an integration/reality specimen, not a new scientific result.

## 2. Exact semantic sequence

```text
AUTHORED TRUTH
- frozen Matter fixture
- one persistent BEARING
- one persistent local TORQUE-PATCH with frozen effort

PRE-CUT RUNTIME
- known moving passive state
- no owner torque activation before CUT
- deterministic progression to CUT READY

OWNER ACTION
- execute the single marked accepted CUT transaction

CUT TRANSACTION
- capture accepted pre-CUT motion state
- discard old runtime representation
- apply the one frozen topology change
- transfer motion using accepted REBIND logic
- reconstruct the same persistent BEARING against current topology
- re-lower the same persistent TORQUE-PATCH against that BEARING
- create fresh post-CUT runtime
- fresh activation state = OFF

POST-CUT OWNER OBSERVATION
- inspect changed runtime decomposition
- activate the fresh action for a bounded observation interval
- observe causal torque through the rebound endpoint
- optionally compare against an internal/background OFF control for diagnostics
```

## 3. Frozen interaction contract

### Always available

- **RESET SPECIMEN** — returns to the exact initial authored/runtime state.
- view selector: **AUTHORED MATTER / RUNTIME INTERPRETATION / BOTH**.
- optional **TECHNICAL DETAILS** disclosure.

### Pre-CUT

Allowed:

- **START / CONTINUE TO CUT READY** — deterministic prepared motion sequence;
- presentation pause/resume only if it does not alter the deterministic state delivered to CUT READY;
- reset.

Not allowed:

- torque activation;
- arbitrary free-running beyond the frozen pre-CUT checkpoint;
- arbitrary CUT timing;
- arbitrary CUT location.

### CUT READY

Allowed:

- **EXECUTE ACCEPTED CUT** at exactly one marked location;
- reset.

The CUT action is not presented as a free-form editing tool. The UI must explicitly call it a bounded/accepted specimen operation.

### Post-CUT OFF

Required visible facts:

- authored source cell count/identity survives according to the accepted fixture;
- runtime body decomposition changed 2 → 3;
- persistent BEARING source identity is unchanged but runtime relation was reconstructed;
- persistent TORQUE-PATCH source identity/target meaning is unchanged;
- old disposable action binding is not migrated;
- fresh post-CUT action is derived against the rebound BEARING/current bodies;
- activation starts OFF.

Allowed:

- inspect view modes/details;
- **ACTIVATE TORQUE**;
- reset.

### Post-CUT active observation

The first implementation should use a **bounded fixed observation window**, not indefinite owner-selected simulation time presented as accepted behavior.

At minimum show:

- rebound endpoint rotates causally under the accepted signed effort;
- bearing remains constrained within the existing accepted fixture behavior;
- stale sibling is not part of the fresh action binding;
- optional OFF-control comparison can support the technical reveal.

After the bounded observation, the specimen may stop at an **OBSERVED** state. Additional OFF/ON cycling is not required in v0 and must not be added merely because the runtime API can technically toggle it.

## 4. Frozen environment

Keep the first specimen inside the accepted active-rebind environment:

- Box3D version/binding already pinned by the project;
- zero gravity for the ANVIL-10 active-rebind world;
- contacts disabled in the accepted ANVIL-10 runtime fixture;
- no floor, traction, external load or compliance added for visual richness;
- no new damping/sleep policy beyond the accepted runtime.

Decorative grid/axes/camera have no physical meaning.

## 5. Allowed implementation reuse

W1 may call and compose existing experiment-local APIs whose accepted behavior is required by B0, including the bounded equivalents of:

- REBIND fixture/compilation;
- pre-CUT `RebindPhysics` motion and snapshots;
- `transferRebindMotion`;
- persistent TORQUE-PATCH source fixture/meaning;
- `relowerTorquePatchToBearing`;
- `TorquePatchRebindPhysics` fresh post-CUT runtime;
- runtime activation and accepted measurements;
- neutral Foundation spatial/provenance/continuity utilities;
- existing browser rendering ideas for authored cells/runtime bodies.

Reuse does not promote these APIs to Foundation.

## 6. Allowed new W1 code

Only bounded integration/presentation code:

- Workbench-specific phase/state controller;
- Workbench-specific DOM/UI;
- Workbench-specific rendering;
- narrow conversion/adaptation glue between accepted experiment-local APIs;
- optional background OFF-control orchestration for technical comparison;
- browser regression tests for the Workbench interaction contract;
- integration-only assertions that the specimen does not violate its frozen state machine.

A helper is neutral only if it contains no new physical/semantic rule.

## 7. Forbidden W1 architecture

Do not introduce:

- `FabricRuntime` or equivalent universal runtime facade;
- generic relation/component/entity graph;
- generic FUNCTION / Device / Control / Signal / Port / Bus / Power / Surface system;
- new persistent authored runtime references;
- universal local-property field architecture;
- mechanism inference;
- arbitrary source editor;
- runtime-object migration framework;
- generic action cache/invalidation subsystem.

If implementation appears to need one, stop and return to design/science.

## 8. Explicit scientific non-claims

A successful Workbench v0 does **not** show that:

- `cellId@face` is representation-independent;
- arbitrary CUT timing or geometry works;
- active torque can cross a topology transaction while remaining active;
- transient activation state migrates;
- arbitrary effort magnitudes or torque fields are authored correctly;
- active function composes with compliance/contact/load;
- BEARING/TORQUE-PATCH/ACTIVATE/REBIND are generic foundation contracts;
- generic Machine Matter ontology exists;
- the owner-facing composition is evidence for a new ANVIL-NN claim.

## 9. W1 implementation stop rules

Stop implementation immediately if the smallest functioning B0 requires:

1. changing accepted ANVIL-00…10 semantics or thresholds;
2. inventing a new physical law;
3. inventing a new persistent authored identity/reference contract;
4. relying on arbitrary pre-CUT timing/state not represented by the frozen path;
5. active torque through CUT;
6. migration of compiled action or solver state;
7. torque distribution/scaling semantics;
8. a generic runtime/relation/function framework;
9. hidden conventional machine-template data not already present in the fixture;
10. adding environment/compliance behavior to make the result visually convincing.

When a stop rule fires, classify the gap before modifying the design: integration defect, presentation defect, missing reusable neutral adapter, or genuinely new scientific uncertainty.

## 10. Owner reality evaluation

### First-pass observation

Before showing detailed provenance, ask the owner to describe:

- what appeared to remain the same through CUT;
- what appeared to be replaced;
- where the torque capability seems to “live”;
- what they expect will happen when torque is activated after CUT.

The UI must not front-load the expected answer so heavily that this becomes a reading-comprehension test.

### Technical reveal

After first-pass observation, allow inspection of:

- persistent source IDs/marks;
- pre/post body decomposition;
- rebound BEARING provenance;
- fresh action body binding;
- old/stale runtime body still existing where applicable;
- optional ON-vs-OFF control diagnostics.

### Owner verdict

**VALUE SIGNAL** — the composition begins to feel like a useful Physical Fabric abstraction.

**LEGIBLE BUT SCRIPTED** — understandable, but still feels like a prepared mechanism. This points toward authorship/locality/editing/emergence rather than automatically toward more physics primitives.

**NO VALUE SIGNAL** — the composition does not make the abstraction useful; reopen the macro hypothesis rather than deepening the same stack automatically.

The owner verdict is integration evidence, not scientific promotion evidence.

## 11. W1 technical validation target

W1 should retain the project's two-speed evidence discipline:

### Draft/core

- TypeScript strict check;
- all existing Node/real-Box3D tests remain green;
- Workbench integration/state-machine tests;
- production build;
- exact changed-path audit.

### Ready/candidate

- exact staged browser artifact from core;
- Windows launcher self-test;
- existing Chromium regression;
- new browser regression covering the frozen B0 interaction path;
- exact source/checkout/run/artifact provenance.

Browser green proves implementation/integration behavior only. It does not create new physics evidence.

## 12. W0 acceptance condition

W0 may be accepted only if final review confirms:

- PR #20 is docs/meta-only;
- this scope is consistent with `W0-DESIGN-GATE.md` plus the adversarial narrowing record;
- no required B0 behavior depends on new physical semantics;
- owner evaluation can produce a meaningful negative result;
- W1 can be attempted by explicit bounded orchestration rather than premature generic architecture;
- the exact W0 head is grounded before implementation begins.

If all hold, the next work item is **W1 — implement B0 exactly as frozen here**.
