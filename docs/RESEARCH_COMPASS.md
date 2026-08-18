# PROJECT ANVIL — Research Compass

Status: **strategic orchestration contract**

This is the macro-level companion to `docs/EXPERIMENT_PROTOCOL.md`.

The experiment protocol asks whether one bounded hypothesis is supported. The Research Compass asks:

> Are we buying the right knowledge for Machine Matter / Physical Fabric, or merely making the current laboratory implementation more elaborate?

It is intentionally not a fixed roadmap.

## 1. Long-horizon invariants

### Author properties, not conventional parts

The target direction is closer to local physical properties than a catalog of ready-made machine components.

Research vocabulary may include:

```text
MATTER
steel / aluminium / rubber / foam / composite

BINDINGS
stiff / weak / elastic / breakable / directional

INTERFACES
bearing / slider / friction surface / tire surface / contact pad

FUNCTION
torque / linear force / sensor / power / signal
```

These are not a frozen schema. Authored intent should describe what matter is/does, not directly prescribe a Box3D object or product-specific part.

### Runtime is disposable

Persistent authored identity must remain independent from runtime body/collider/joint identity. Runtime representation may be rebuilt, repartitioned, reduced or eventually replaced by another model.

### Locality should do real work

When a physical relationship can be resolved from local matter/topology/interface context, test that composition before introducing an explicit semantic component graph.

Stable authored IDs are valid when identity is genuinely part of the concept, but references must not become the default substitute for spatial/material semantics.

### Voxels are a dialect, not ontology

The sparse cubic-cell representation is a useful falsification tool, not the final Machine Matter commitment. Future evidence may require adaptive cells, meshes, fields, SDF-like sources, hierarchy or another representation.

### Representations may use different resolutions

Authored matter, collision, visuals and solver representation do not need one-to-one topology or resolution.

### Composition is the prize

A collection of isolated successful tricks is not yet Machine Matter.

```text
matter + binding + interface + function + environment
                         ↓
                  useful behavior
```

Composition should emerge from earned local rules rather than a hidden machine template.

### Evidence earns abstraction

Do not add generic Bond, Relation, FUNCTION, Device, Port, Signal, Surface or Power architecture because the vocabulary sounds inevitable. Reuse must be earned.

## 2. Capability frontier after ANVIL-06

### MATTER — thin but real

Supported:

- persistent source-cell identity;
- density/friction in current material dialect;
- deterministic mass/COM/inertia-diagonal measurement;
- collision reduction;
- authored/runtime representation separation.

Open: richer constitutive behavior, composites/anisotropy, adaptive/non-grid sources.

### BINDINGS — largest core gap

Supported:

- implicit rigid adjacency;
- experiment-local blocked connection used by CUT/BEARING.

Open:

- compliant/elastic binding;
- weak/breakable strength;
- directional/asymmetric binding;
- plasticity/damage/fatigue;
- any earned generic Bond boundary.

### INTERFACE — first slice comparatively mature

Supported:

- local face-to-face BEARING;
- passive revolute relation;
- rigid-transform covariance;
- nearby moving CUT + REBIND;
- bounded loaded REBIND.

Open: slider, friction/tire/contact interfaces, multiple relations/loops, generic Relation ontology.

### FUNCTION — first local active slice supported

Supported:

- signed torque intent;
- causal `+ / 0 / -` behavior;
- equal/opposite torque lowering;
- passive bearing retained;
- no authored Box3D motor;
- ANVIL-06 local source-face placement without authored `bearingId`, with fail-closed off-interface behavior.

Open: capability/command separation, other function kinds, actuation through rebuild/contact, generic FUNCTION ontology.

### CONTROL / SIGNAL / POWER — intentionally unearned

No generic command runtime, ports, signals, power source/storage, controller or sensor system is foundation.

### TOPOLOGY / CONTINUITY — comparatively strong bounded spine

CUT, REBIND and LOAD-REBIND provide useful reconstruction evidence. Active contacts, loops and arbitrary topology remain open.

### SURFACE — mostly open

Global/current material friction exists; local surface semantics/contact laws do not.

### ADAPTATION / REPRESENTATION — open

No adaptive rigid/compliant switching, simulation LOD or representation migration is proven.

## 3. Macro Critical Validation Loop

Run after each strategically meaningful promotion and after major interruption.

### M0 — live truth lock

Resolve live `main`, open experiment PRs, exact last evidence, regression state and documentation drift.

### M1 — vision delta

State in one sentence what part of the Machine Matter dream became more credible because of the last experiment. If answer is merely “same fixture is more robust,” classify it as hardening rather than frontier progress.

### M2 — anti-component-drift gate

Ask of every new authored concept:

- local physical property/capability or conventional part in disguise?
- runtime identity leak?
- unnecessary authored cross-component reference where locality could resolve it?
- one-to-one solver object being smuggled into authored truth?

### M3 — frontier balance

Review Matter, Bindings, Interfaces, Function, Control/Signal/Power, Surface, Topology/Continuity, Adaptation/Representation. Avoid deepening one frontier indefinitely while another foundational category remains untouched unless dependency demands it.

### M4 — strongest live assumption

Choose the assumption with largest combination of consequence if false, uncertainty and architectural lock-in risk.

### M5 — compare credible next falsifiers

Use qualitative assessment of:

- information gain;
- vision alignment;
- lock-in reduction;
- discriminability;
- cost;
- composition value.

Do not manufacture fake numeric precision.

### M6 — adversarial preflight

Before results: one primary question, frozen meaningful gates, negative/control case, fail-closed expectations, explicit non-claims, only necessary evidence classes.

### M7 — Lean Evidence Loop

Run Draft/core -> Ready/candidate. Classify a red result before modification as physical falsification, semantic/compiler failure, non-discriminating fixture, test representation defect, or toolchain/infrastructure block.

### M8 — exact promotion and grounding

Promote exact supported candidate, compare synthetic/actual tree, then ground evidence/docs without changing qualified material code.

### M9 — composition checkpoint

After 2–3 new primitive/frontier results, stop adding vocabulary and test composition.

Examples:

- function through reconstructed relation;
- actuation through compliant matter;
- surface property interacting with structure;
- control driving function without mutating construction semantics.

## 4. Vision delta from ANVIL-06

Before ANVIL-06, active source semantics still had a component-graph smell:

```text
TorqueMark -> bearingId
```

ANVIL-06 supported a narrower but more vision-aligned route:

```text
paint torque on persistent source face
        ↓ local/topological resolution
existing BEARING
        ↓
accepted runtime action
```

A valid local patch resolves deterministically; non-bearing placement fails closed. This does not prove a generic field/local-property system, but it demonstrates that locality can replace an authored semantic cross-reference in a real end-to-end active path.

Therefore the immediate ANVIL-05 component-drift debt is boundedly reduced.

## 5. Post-ANVIL-06 candidate comparison

### Candidate A — ELASTIC-SEAM

Question: can one local authored binding property produce bounded compliant relative motion and restoring behavior instead of either rigid union or free separation?

- information gain: **Very High**
- vision alignment: **Very High**
- lock-in reduction: **High**
- discriminability: **High**
- cost: **Medium–High**
- composition value: **Very High**

Why now: BINDINGS is the largest untouched core category. A pass would establish that local matter connectivity need not be binary rigid/disconnected; a fail would reveal whether stock solver lowering or the authored concept is insufficient.

Risk: easy to accidentally rename a solver spring/joint as “elastic matter.” Preflight must force source semantics to remain local binding intent and include rigid/free controls.

Verdict: **selected next**.

### Candidate B — ACTIVATE

Question: same persistent torque capability, transient command changes `off / forward / reverse` without mutating construction semantics.

- information gain: **High**
- vision alignment: **High**
- lock-in reduction: **Medium**
- discriminability: **High**
- cost: **Low–Medium**
- composition value: **High**

Why not first: ANVIL-05 and ANVIL-06 already spent two frontier steps on FUNCTION. Control is important, but deepening it immediately would leave BINDINGS effectively binary and make later machines structurally impoverished.

Verdict: **defer, high priority**.

### Candidate C — TORQUE + REBIND

Information gain is now lower than A/B because topology continuity is comparatively strong. Defer until a concrete composition experiment needs active-function persistence through rebuild.

### Candidate D — SURFACE / FRICTION PATCH

High long-term value, but local surface semantics are less foundational to the next composition milestone than proving that authored connections themselves can be compliant.

## 6. Selected immediate tactic — ANVIL-07 / ELASTIC-SEAM

Primary strategic question:

> Can persistent local binding intent express bounded compliance between neighboring matter, with measurable deformation and restoring behavior, without promoting a generic Bond ontology or encoding one final solver representation in authored truth?

The first falsifier must remain smaller than “deformable matter.” It should test one local seam between two otherwise rigid islands.

Candidate source shape should be experiment-local and physical rather than solver-named, approximately:

```text
ElasticSeam {
  id
  endpointA: { cellId, face }
  endpointB: { cellId, face }
  // minimal physical compliance parameters to be earned by preflight
}
```

Do not freeze exact parameter vocabulary until binding-capability research identifies the smallest physically meaningful contract. Avoid fields named after Box3D APIs (`hertz`, solver spring flags, joint kind) in authored source unless evidence shows they are the only honest description.

Mandatory controls should distinguish at least:

```text
RIGID      seam does not appreciably deform
ELASTIC    deforms under load and restores when load is removed
FREE       separates / does not restore
```

The experiment must demonstrate more than visual wobble: measure deformation, restoring direction/response, finite state and causal separation from both controls.

Do not combine damage/breakage, plasticity, TORQUE, ACTIVATE, contact complexity or generic bond architecture into the first elastic falsifier.

## 7. Next composition checkpoint

If ELASTIC-SEAM earns one compliant binding slice, the next macro decision should strongly consider **ACTIVATE** or a composition experiment combining already-earned active function with compliant matter.

After that, the project should resist adding another isolated primitive until at least two of the new semantics are forced to compose.
