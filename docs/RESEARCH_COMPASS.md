# PROJECT ANVIL — Research Compass

Status: **strategic orchestration contract**

This document is the macro-level companion to `docs/EXPERIMENT_PROTOCOL.md`.

The experiment protocol asks whether one bounded hypothesis is supported. The Research Compass asks a different question:

> Are we still buying the right knowledge for the Machine Matter / Physical Fabric vision, or are we merely making the current laboratory implementation more elaborate?

The compass is intentionally not a roadmap. It exists to prevent local success from hardening into the wrong architecture.

## 1. Long-horizon vision invariants

### 1.1 Author properties, not conventional parts

The desired authoring direction is closer to local physical properties than a catalog of ready-made machine components.

Useful research vocabulary includes, for example:

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

These words are **not** a frozen schema. The invariant is the direction: authored intent should describe what matter is allowed or able to do, not directly prescribe a particular Box3D body/joint or a product-specific part.

### 1.2 Runtime objects are disposable interpretations

Persistent authored identity must remain independent from runtime body/collider/joint identity.

A runtime representation may be rebuilt, repartitioned, reduced or eventually replaced by a different solver/model without invalidating construction identity.

### 1.3 Locality should do real work

When a physical relation can be resolved from local matter/topology/interface context, prefer testing that composition before introducing an explicit semantic component graph.

Stable authored IDs are valid when identity is genuinely part of the concept, but references must not become the default substitute for spatial/material semantics.

### 1.4 Current voxels are a dialect, not the ontology

The sparse cubic-cell representation is useful because it is easy to falsify. It must not silently become the final answer.

Future evidence may require meshes, adaptive cells, continuous fields, splats/SDF-like representations, hierarchical matter or another source representation. The current foundation should not make those impossible.

### 1.5 Different representations may have different resolutions

Authored matter, collision, visual representation and solver representation do not need one-to-one topology or resolution.

ANVIL should preserve this freedom rather than forcing one universal data structure to own every concern.

### 1.6 Composition is the actual prize

A collection of isolated successful tricks is not yet Machine Matter.

The long-term target requires local semantics to compose:

```text
matter + binding + interface + function + environment
                         ↓
                  useful behavior
```

Composition should emerge from earned local rules, not a hidden hand-written machine template.

### 1.7 Evidence must earn abstraction

Do not add a generic Bond, Relation, FUNCTION, Device, Port, Signal, Surface or Power architecture because the vocabulary sounds inevitable.

Each reusable boundary must be earned by evidence or be neutral measurement/process infrastructure required to falsify the next question.

## 2. Current capability frontier after ANVIL-05

### MATTER — thin but real

Supported:

- persistent source-cell identity;
- material density/friction in the current box dialect;
- deterministic mass/COM/inertia-diagonal measurement;
- independent collision reduction;
- authored/runtime representation separation.

Unsupported:

- richer material constitutive behavior;
- continuous/anisotropic/composite fields;
- adaptive source resolution;
- non-grid authored matter.

### BINDINGS — major open frontier

Supported:

- implicit rigid adjacency;
- experiment-local blocked face used by CUT/BEARING.

Unsupported:

- compliant/elastic binding;
- weak/breakable strength;
- directional/asymmetric binding;
- plasticity/damage/fatigue;
- generic Bond ontology.

### INTERFACE — first useful slice supported

Supported:

- one local face-to-face BEARING mark;
- passive revolute runtime relation;
- covariance under an arbitrary common rigid transform;
- nearby CUT + semantic rebind;
- bounded loaded rebind.

Unsupported:

- slider, friction/tire/contact surface semantics;
- multiple interacting relations/loops;
- generic Relation/Constraint ontology.

### FUNCTION — first active slice supported, semantic debt exposed

Supported:

- signed persistent torque intent;
- causal `+ / 0 / -` behavior;
- equal/opposite body torque lowering;
- passive bearing relation retained;
- no Box3D joint-motor encoding in authored source.

Open debt:

- ANVIL-05 authored `TorqueMark` points directly to persistent `bearingId`;
- function is not yet demonstrated as a local painted property that discovers mechanics through matter/topology;
- capability and transient command are still conflated in one authored `effortNm`.

### CONTROL / SIGNAL / POWER — intentionally unearned

No generic runtime command, signal graph, ports, power source, energy storage, controller or sensor architecture is foundation.

### TOPOLOGY / CONTINUITY — comparatively strong bounded evidence

CUT, REBIND and LOAD-REBIND provide a useful bounded reconstruction spine.

Remaining risks include active contacts, multiple relations, loops, arbitrary topology and deeper solver-state dependencies.

### SURFACE — almost untouched

Material friction exists, but local authored surface laws and interface-specific contact behavior are not established.

### ADAPTATION / REPRESENTATION SWITCHING — open

No adaptive rigid/compliant switching, simulation LOD or representation migration is proven.

## 3. Macro Critical Validation Loop

Run this loop after every strategically meaningful accepted experiment and whenever the project resumes after a major interruption.

### M0 — live truth lock

Resolve:

- repository and current `main`;
- open experiment PRs/branches;
- last promoted evidence identity;
- regression state;
- documentation drift.

Do not plan from conversation history when live Git can answer the question.

### M1 — vision delta

State in one sentence:

> What part of the original Machine Matter dream became more credible because of the last experiment?

If the answer is merely “the same fixture is a little more robust,” treat that as hardening, not frontier progress.

### M2 — anti-component-drift gate

Inspect new authored concepts and ask:

- Is this describing a local physical property/capability, or a named conventional part in disguise?
- Does it reference runtime identity?
- Does it unnecessarily reference another authored component when locality/topology could resolve the relationship?
- Is a one-to-one solver object being smuggled into authored truth?

A failure here does not automatically invalidate the experiment, but it becomes a priority research debt before higher-level architecture is built on top.

### M3 — frontier balance

Review the capability frontier:

- Matter
- Bindings
- Interfaces
- Function
- Control/Signal/Power
- Surface
- Topology/Continuity
- Adaptation/Representation

Do not spend many experiments deepening one frontier while foundational assumptions in another remain completely untouched unless the dependency is explicit.

### M4 — strongest live assumption

Name the assumption with the largest product of:

- consequence if false;
- uncertainty;
- architectural lock-in risk.

This is more important than “what comes next numerically.”

### M5 — candidate comparison

Compare at least two credible next falsifiers using qualitative scores:

- **information gain** — how much search space a pass/fail removes;
- **vision alignment** — how directly it advances Machine Matter rather than current implementation;
- **lock-in reduction** — whether it attacks a dangerous architectural assumption;
- **discriminability** — whether failure has a clear interpretation;
- **cost** — implementation + evidence + owner burden;
- **composition value** — whether the result can combine with already-earned semantics.

Do not manufacture fake numeric precision. A simple High / Medium / Low table is enough.

### M6 — adversarial preflight

Before executable results:

- state one primary question;
- freeze meaningful gates;
- include an invalid/negative control when false-positive success is plausible;
- identify what must fail closed;
- list explicit non-claims;
- identify which evidence classes are actually needed.

### M7 — Lean Evidence Loop

Run the per-experiment Draft/core → Ready/candidate lifecycle from `docs/EXPERIMENT_PROTOCOL.md`.

A red result is classified before it is modified:

- physical falsification;
- semantic/compiler failure;
- non-discriminating fixture;
- test representation defect;
- toolchain/infrastructure block.

### M8 — promotion and grounding

Promote only the exact supported candidate. Then update evidence and orchestration docs without changing already-qualified material code.

### M9 — composition checkpoint

After two or three new primitive/frontier results, stop and test whether they compose instead of immediately adding another primitive.

Examples:

- function through a reconstructed relation;
- actuation through compliant matter;
- surface property interacting with structure;
- control driving a function without mutating construction semantics.

This prevents the project from becoming a collection of isolated demos.

## 4. Strategic audit after ANVIL-05

### Candidate A — ACTIVATE

Question: separate persistent torque capability from transient `off / forward / reverse` command.

- information gain: **High**
- vision alignment: **High**
- lock-in reduction: **Medium**
- discriminability: **High**
- cost: **Low–Medium**

Risk: it would build control semantics on top of the still-direct `TorqueMark -> bearingId` authored coupling.

Verdict: **valuable, but one step too early**.

### Candidate B — TORQUE + REBIND

Question: active intent follows persistent bearing semantics through CUT/runtime body replacement.

- information gain: **Medium**
- vision alignment: **Medium–High**
- lock-in reduction: **Medium**
- discriminability: **High**
- cost: **Medium**

Risk: continues deepening the already comparatively strong reconstruction frontier before fixing active-function locality.

Verdict: **defer**.

### Candidate C — ELASTIC-SEAM

Question: a local non-rigid binding property creates bounded compliant behavior instead of rigid union or free separation.

- information gain: **Very High**
- vision alignment: **Very High**
- lock-in reduction: **High**
- discriminability: **High**
- cost: **Medium–High**

This opens the currently weakest major frontier: BINDINGS.

Verdict: **strong candidate immediately after locality debt is attacked**.

### Candidate D — TORQUE-PATCH

Question: can active torque be authored as a local source-face property with no authored `bearingId`, then resolve deterministically to the unique BEARING through local topology and fail closed when painted elsewhere?

- information gain: **High**
- vision alignment: **Very High**
- lock-in reduction: **Very High**
- discriminability: **Very High**
- cost: **Low**

This directly tests whether ANVIL can move from “semantic components connected by IDs” toward “painted local properties compose into mechanics.”

Verdict: **selected as ANVIL-06**.

## 5. Chosen immediate tactic

### ANVIL-06 / TORQUE-PATCH

The first experiment should remain deliberately narrow.

Candidate authored concept:

```text
TorquePatch {
  id
  target: { cellId, face }
  effortNm
}
```

Deliberately absent:

- `bearingId`;
- runtime body/joint IDs;
- generic device/function type system;
- signal/control/power concepts.

The compiler must:

1. compile the already-earned BEARING semantics;
2. match the painted source face to exactly one bearing endpoint;
3. derive the bearing identity and disposable runtime bodies only in compiled output;
4. lower to the already-supported equal/opposite torque action;
5. reject a patch on a non-bearing face instead of guessing a target.

Primary evidence should prove:

- the authored patch contains no relation reference;
- valid local placement resolves deterministically;
- invalid placement fails closed;
- cell ordering / bearing endpoint ordering does not change the resolved physical meaning;
- end-to-end real Box3D behavior still obeys signed causal torque gates.

Do not add ACTIVATE, CUT/REBIND, multiple bearings or a generic FUNCTION framework to the same first falsifier.

## 6. Likely next macro decision

After TORQUE-PATCH, rerun this compass rather than following a fixed sequence.

Current expectation — not a promise — is to compare:

- **ELASTIC-SEAM**, opening the missing BINDINGS frontier;
- **ACTIVATE**, separating persistent capability from transient command.

Whichever attacks the larger remaining architectural uncertainty at that point should win.
