# PROJECT ANVIL — Physical Fabric Workbench v0 / W0 Design Gate

Status: **ACTIVE DESIGN GATE — NO WORKBENCH IMPLEMENTATION AUTHORIZED YET**

Work type: **integration design / owner reality gate**.

This document does not create ANVIL-11 and does not broaden ANVIL-00…10 scientific claims. Its purpose is to decide whether there is a sufficiently small, honest owner-facing composition that can be implemented using already accepted behavior without inventing new physical semantics or a generic Machine Matter ontology for convenience.

## W0.0 — Live baseline lock

Start baseline:

```text
main                         56993324c636e55607b18059ada4e33153d263be
main tree                    8e5cb31dbe5801c42bd30473cb4d8d1cc061bba9
accepted science             ANVIL-10 / TORQUE-PATCH-REBIND
accepted material merge      ffde8c0babdd473454b3e769cb10fd31537a0c70
ANVIL-10 evidence grounding  ba7ce2dc67c6f7aa936e20a0294d9cc12208a549
Epoch I executable tree      870a5b416c262eefbee13b817636a9246afb0378
Epoch I qualification run    32372701068
active work before W0        none
open PRs before W0           none
server-side main protection  absent
```

Live Git remains authoritative. Because `main` is not protected, expected-head and changed-path checks remain mandatory for every W0 transaction.

## Primary W0 question

> What is the smallest transparent owner-facing specimen that composes already accepted ANVIL behavior, lets the owner directly judge whether the current stack begins to express useful Physical Fabric / Machine Matter, and does not require a new physical law, authored identity model, generic ontology or hidden conventional machine template merely to make the composition convenient?

## Non-goals

W0 is not:

- a product-design phase;
- a free-form editor design;
- a generic `FabricRuntime` design;
- ANVIL-11;
- a new scientific falsifier of representation independence;
- permission to combine active torque with compliance;
- permission to support arbitrary CUT locations;
- permission to keep active torque ON through CUT/reconstruction;
- permission to promote BEARING, TORQUE-PATCH, ACTIVATE or REBIND into Foundation;
- evidence that cells or `cellId@face` are final ontology.

## W0.1 — Capability / interaction ledger

Every owner-visible interaction proposed for Workbench v0 must map to an already accepted capability or neutral visualization. Anything without such a mapping is either removed from v0 or split into a separate scientific falsifier.

| Proposed owner-visible behavior | Existing accepted basis | W0 classification | Boundary |
| --- | --- | --- | --- |
| show persistent authored cells | ANVIL-00 authored `MatterDocument` | accepted reuse | cells are laboratory dialect only |
| show compiled/runtime body decomposition separately from authored matter | ANVIL-00 COLLAPSE separation | accepted reuse | visualization may not imply runtime bodies are authored identity |
| show one local BEARING marker | ANVIL-02 BEARING | accepted reuse | one frozen local rotational interface; no generic relation ontology |
| run/pause/reset the frozen specimen | neutral owner tooling used by existing browser probes | neutral integration | no new physics |
| show runtime moving before topology change | ANVIL-03 REBIND fixture/runtime | accepted reuse | frozen moving fixture only |
| perform one specifically marked nearby CUT | ANVIL-01 CUT + ANVIL-03/10 frozen nearby CUT | accepted reuse | exactly one accepted CUT location; no arbitrary cutting |
| show body decomposition changing from 2 to 3 while authored source identity remains | ANVIL-01/03 | accepted reuse | runtime topology is disposable representation |
| reconstruct the same persistent BEARING onto the new body decomposition | ANVIL-03 REBIND | accepted reuse | recompile/reconstruct, not migrate solver joint state |
| show one local TORQUE-PATCH authored mark | ANVIL-06 TORQUE-PATCH | accepted reuse | current `cellId@face` targeting is laboratory-specific and not representation-independent |
| toggle active intent OFF/ON | ANVIL-09 ACTIVATE | accepted reuse | runtime-only binary activation; fresh runtime defaults OFF |
| apply signed torque through the bearing while ON | ANVIL-05/06/09 | accepted reuse | frozen effort; no new slider/scaling law |
| require OFF before CUT | conservative integration constraint | accepted-boundary guard | active-during-CUT is explicitly unearned |
| after CUT, re-lower the unchanged persistent TORQUE-PATCH against the rebound BEARING | ANVIL-10 | accepted reuse | re-lowering, not migration of compiled action state |
| show old body `body:a:0` still exists but is no longer the active target | ANVIL-10 stale-sibling discriminator | accepted reuse / diagnostic | runtime ID is evidence only, never authored truth |
| turn torque ON again after reconstruction and observe causal work through the new endpoint | ANVIL-10 | accepted reuse | frozen single-bearing fixture only |
| show authored / physical / overlay view modes | neutral visualization of existing source and runtime state | neutral integration | view modes cannot add semantics |
| show provenance/technical details on demand | existing provenance/evidence infrastructure | neutral integration | diagnostics are not new scientific gates |
| arbitrary user-drawn CUT | none | **not allowed in v0** | needs a broader topology/authorship contract |
| torque magnitude slider | accepted fixed effort does not establish arbitrary owner-edit semantics | **not allowed in v0** | avoid turning one frozen parameter into implied generic function law |
| torque ON during CUT | explicitly unearned | **not allowed in v0** | separate falsifier if strategically needed later |
| compliance in the active mechanism | composition not earned | **not allowed in v0** | ANVIL-07/08 stay separate |
| generic function/control graph | not earned | **not allowed** | no FUNCTION/Control/Signal ontology |
| generic runtime/entity/component framework | not earned | **not allowed** | explicit bounded orchestration is preferred |

## W0.2 — Credible specimen candidates

### Candidate A — Passive topology / REBIND specimen

Sequence:

```text
Matter → BEARING → motion → frozen CUT → 2 bodies become 3 → same BEARING reconstructed
```

Strengths:

- very small semantic surface;
- entirely within accepted ANVIL-00/01/02/03 behavior;
- existing browser REBIND owner gate already proves the scene can be made legible;
- low implementation risk.

Weaknesses:

- low new owner information gain because an owner-facing REBIND comparison already exists;
- does not exercise persistent active local capability or ACTIVATE;
- risks feeling like a nicer presentation of ANVIL-03 rather than a composition checkpoint for Epoch I.

### Candidate B — Active topology / re-lowering specimen

Sequence:

```text
Matter
  + BEARING
  + local TORQUE-PATCH
      ↓ compile/lower
runtime OFF
      ↓
ON → visible causal rotation
      ↓
OFF
      ↓
frozen nearby CUT
      ↓
old runtime discarded / topology recompiled
same BEARING reconstructed
same persistent TORQUE-PATCH re-lowered
fresh runtime defaults OFF
      ↓
ON → causal torque through rebound endpoint
```

Strengths:

- composes ANVIL-00/01/02/03/05/06/09/10 without needing compliance;
- directly exposes authored meaning vs disposable representation;
- directly exposes re-lowering rather than hidden runtime-state migration;
- gives substantially higher owner information gain than the existing passive REBIND demo;
- the central technical sequence already exists in the accepted ANVIL-10 runtime test path rather than being hypothetical integration physics.

Weaknesses:

- implementation must orchestrate multiple experiment-local modules explicitly;
- `TorquePatchRebindPhysics` is an experiment-local runtime, not a generic production runtime;
- current source targeting still uses `cellId@face`, so the UI must not imply representation independence;
- careless UI architecture could tempt a premature generic `FabricRuntime` or function/component system.

### Candidate C — Compliance / resolution specimen

Sequence:

```text
coarse authored representation ↔ exact 2× refined authored representation
                         ↓
             same frozen physical compliance response
```

Strengths:

- strongly communicates authored resolution != runtime/physical meaning;
- attacks an important long-term representation intuition;
- supported by ANVIL-08.

Weaknesses:

- does not exercise the main topology + active composition chain;
- is conceptually a different owner question from the active re-lowering story;
- combining it with B would create a broad v0 and could imply unearned active-through-compliance composition.

### Comparative decision

Qualitative ranking for the first Workbench specimen:

```text
owner information gain       B > C > A
composition value            B > C > A
semantic risk                A < C < B
implementation/evidence cost A < C < B
fit to post-Epoch-I question B > C > A
```

Candidate **B is the leading design**, but it is not accepted until W0.3 semantic-gap attack passes.

Candidate A remains the fallback if B requires new semantics. Candidate C is deferred as a possible separate later Workbench specimen and must not be combined into v0 merely for feature richness.

## W0.3 — Semantic-gap attack on Candidate B

The design is acceptable only if every gap can be classified as one of:

- existing accepted behavior;
- neutral owner visualization;
- explicit orchestration of existing experiment-local modules;
- conservative restriction that narrows behavior inside accepted evidence.

A gap that requires a new physical/semantic rule fails W0.

### Gap 1 — one continuous runtime across CUT

**Temptation:** invent one persistent `FabricRuntime` object that internally mutates topology and relations.

**Reality:** accepted ANVIL behavior already models runtime representation as disposable. The accepted ANVIL-10 path runs pre-CUT `RebindPhysics`, captures snapshots, transfers motion, recompiles/re-lowers, disposes the old world and creates a fresh `TorquePatchRebindPhysics` world.

**Decision:** W0 must preserve this explicit phase boundary. A thin specimen controller may coordinate phases, but it must not become a reusable semantic runtime abstraction.

Result: **PASS — orchestration only.**

### Gap 2 — user-triggered CUT timing

The accepted fixtures define the topology operation and motion-transfer/rebind mechanics. Allowing the owner to choose *when* to invoke that already frozen CUT while the action is OFF does not change the physical rule; it changes only the timing of an already supported owner command within a bounded state machine.

The specimen must disable CUT while active torque is ON and must not expose arbitrary CUT location/geometry.

Result: **PASS WITH RESTRICTION.**

### Gap 3 — activation before and after reconstruction

ANVIL-09 supports runtime-only OFF/ON/OFF and fresh runtime defaults OFF. ANVIL-10 supports a fresh post-CUT torque action acting through the rebound endpoint. No transient activation state needs to migrate.

Decision: the phase controller explicitly forces/observes OFF before CUT, destroys the old runtime, creates the fresh runtime in OFF, and lets the owner turn it ON again afterward.

Result: **PASS — directly matches accepted boundary.**

### Gap 4 — preserving the same authored TORQUE-PATCH

ANVIL-10 already accepts re-lowering one unchanged persistent patch against the rebound BEARING. The Workbench must keep the source patch object/meaning unchanged across the transaction and may show this fact visually/diagnostically.

Result: **PASS.**

### Gap 5 — exposing authored/runtime views

Existing ANVIL-00 browser work already renders authored cells separately from runtime/compiled representation. REBIND browser code already visualizes source cells against changing body plans.

Decision: view modes are presentation-only. They may read source/compiled/runtime state but must not define new source semantics.

Result: **PASS — neutral visualization.**

### Gap 6 — owner-friendly labels such as “same bearing” or “same torque patch”

These labels are allowed only where backed by persistent source identity already present in the accepted fixture. Do not label runtime joint/body IDs as persistent entities.

Result: **PASS WITH LANGUAGE GUARD.**

### Gap 7 — scene/environment behavior

ANVIL-10 accepted runtime uses zero gravity and disabled contacts. Adding floor contact, gravity, traction or load merely for visual richness would introduce unvalidated composition.

Decision: first specimen retains the accepted environment. Visual orientation/grid may be decorative only.

Result: **PASS BY EXCLUSION.**

### Gap 8 — editable effort or general function control

The accepted active fixture uses a frozen signed effort and binary runtime activation. A magnitude slider would be visually easy but would imply a wider authored function-control contract than W0 needs.

Decision: fixed effort in v0; owner controls only OFF/ON.

Result: **PASS BY EXCLUSION.**

### Gap 9 — implementation reuse without premature abstraction

Candidate B needs logic from several experiment-local modules. Duplication or a bounded Workbench-specific adapter may be less elegant than a generic framework, but it preserves epistemic boundaries.

Decision: W1 may add Workbench-specific orchestration/presentation modules that call existing experiment-local APIs. It may factor truly neutral rendering/state-machine helpers, but may not promote experiment semantics into Foundation or introduce generic `Relation`, `Function`, `Device`, `FabricRuntime`, component graph, signal bus or universal authored-property APIs.

Result: **PASS WITH ARCHITECTURE STOP RULE.**

### W0.3 verdict

No required interaction in Candidate B currently demands a new physical law or generic ontology if the scope restrictions above are enforced.

**Candidate B survives the semantic-gap attack.**

This is a design result, not implementation evidence. W0 still requires owner-reality contract and frozen implementation boundary before code is authorized.

## W0.4 — Owner reality contract

Workbench v0 is not successful merely because automated checks are green. The owner should be able to answer these questions from direct use without reading evidence logs:

1. **Authored vs runtime:** Can I tell what is persistent authored meaning and what is only the current physical representation?
2. **Prediction:** Before CUT, can I predict which meaning should survive and which runtime details may change?
3. **Topology intuition:** Does CUT feel like changing/recompiling matter, or merely like a scripted body swap?
4. **Local active meaning:** Does the torque capability feel attached to local authored meaning, or like a hidden motor attached to a runtime joint?
5. **Re-lowering legibility:** After CUT, is it clear that the old compiled action was discarded and a fresh action was derived for the rebound endpoint?
6. **Runtime disposability:** Is the 2-body → 3-body representation change understandable without treating body IDs as object identity?
7. **Creative pull:** After using the specimen, do I want to change/build my own small authored structure and see what behavior emerges?

The owner verdict is classified as:

### VALUE SIGNAL

The composition is understandable and begins to feel like a useful Physical Fabric abstraction rather than a renamed mechanism.

Implication: proceed to determine which authorship/locality freedom would produce the highest next information gain. Representation-independent locality becomes a strong possible frontier, but is not automatically selected.

### LEGIBLE BUT SCRIPTED

The technical idea is understandable, but the specimen still feels like a prepared mechanism with semantic labels.

Implication: do not respond by adding more physics primitives automatically. Investigate whether the dominant missing ingredient is authorship freedom, representation/locality, editing, emergence or reduced fixture scripting.

### NO VALUE SIGNAL

The composition does not yet make the core abstraction useful or compelling even when presented transparently.

Implication: reopen the macro hypothesis rather than deepening the same capability chain. Candidate causes include the cell dialect, too much explicit semantics, insufficient emergence, insufficient owner freedom or the Physical Fabric abstraction itself.

Owner judgement is integration evidence only. It does not upgrade ANVIL-00…10 scientific claims.

## W0.5 — Frozen integration architecture boundary

If Candidate B is authorized for implementation, W1 should use an explicit bounded phase controller rather than a generic runtime architecture.

Allowed conceptual phases:

```text
READY_OFF
PRE_CUT_ON
PRE_CUT_OFF
CUT_TRANSACTION
POST_CUT_OFF
POST_CUT_ON
```

The exact UI naming may differ. The semantic requirements are:

- no CUT transition from an ON state;
- old runtime is disposed at the topology transaction;
- motion is captured/transferred using accepted REBIND behavior;
- BEARING is reconstructed from persistent authored meaning/current topology;
- the same persistent TORQUE-PATCH is re-lowered against that current BEARING;
- the fresh post-CUT runtime starts OFF;
- activation is owner-controlled again only after reconstruction completes.

Allowed implementation additions:

- Workbench-specific controller/state machine;
- Workbench-specific rendering/presentation code;
- read-only authored/compiled/runtime overlays;
- neutral diagnostics/provenance formatting;
- narrowly scoped adapters needed to call existing experiment-local modules without changing their semantics.

Forbidden implementation additions without a separate design/science review:

- generic `FabricRuntime`;
- generic relation/component/entity graph;
- generic FUNCTION/Control/Signal/Power system;
- new persistent authored references to runtime bodies/joints/actions;
- arbitrary cutting/editor semantics;
- torque scaling law or editable effort semantics;
- activation migration through runtime replacement;
- active-during-CUT behavior;
- gravity/contact/load/compliance composition;
- foundation promotion of experiment-local semantics.

## W0.6 — Proposed frozen v0 interaction scope

If W0 is accepted, W1 implementation scope is limited to one specimen with:

1. one frozen authored matter fixture;
2. one persistent BEARING;
3. one persistent local TORQUE-PATCH with frozen effort;
4. three visual modes: **AUTHORED**, **PHYSICAL**, **BOTH**;
5. run/pause/reset;
6. binary torque **OFF/ON**;
7. one clearly marked accepted CUT action, enabled only while torque is OFF;
8. explicit visualization of pre-CUT 2-body vs post-CUT 3-body decomposition;
9. explicit indication that the persistent BEARING and TORQUE-PATCH source meaning remain unchanged;
10. explicit indication that the old compiled action/runtime binding is discarded and a fresh post-CUT action is derived;
11. fresh post-CUT runtime starting OFF;
12. owner can turn torque ON again and observe causal work through the rebound endpoint;
13. technical/provenance details hidden behind an optional disclosure rather than dominating the owner experience;
14. no free-form editing and no capability outside the frozen boundaries above.

## W0 implementation stop conditions

W1 must stop and return to design/science if implementation discovers that Candidate B actually requires any of the following:

- new physical semantics rather than merely orchestration;
- a new authored identity/reference model;
- a torque distribution/scaling law;
- active torque through the CUT transaction;
- preserving/migrating compiled `TorqueActionPlan` or solver state;
- generic runtime/relation/function architecture to make the specimen possible;
- hidden conventional machine-template data not already present in the accepted fixture;
- a change to accepted ANVIL-00…10 experiment semantics or thresholds.

## W0 provisional verdict

**PROVISIONAL ACCEPT — Candidate B / Active topology re-lowering specimen.**

Reason: it offers the strongest post-Epoch-I owner information gain and its required physical sequence already exists across accepted ANVIL capabilities, especially the ANVIL-10 test path. The semantic-gap attack found no mandatory new physical law if the scope remains narrow and explicit.

This provisional verdict does **not** authorize implementation until the W0 PR itself is adversarially reviewed, live state is rechecked, and the final design/head is frozen as the exact W1 contract.
