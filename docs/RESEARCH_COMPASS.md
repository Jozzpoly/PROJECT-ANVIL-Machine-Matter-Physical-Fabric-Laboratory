# PROJECT ANVIL — Research Compass

Status: **durable strategic orchestration contract**

This is the macro-level companion to `docs/EXPERIMENT_PROTOCOL.md`.

The experiment protocol asks whether one bounded hypothesis is supported. The Research Compass asks a different question:

> Are we buying the right knowledge for Machine Matter / Physical Fabric, or merely making the current laboratory implementation more elaborate?

This document is intentionally **not a roadmap**. Current experiment selection and live frontier ranking belong in `AI_PROJECT_MEMORY.md` and the takeover state, not here.

## 1. Long-horizon invariants

### Author properties, not conventional parts

The target direction is closer to local physical properties/capabilities than a catalog of ready-made machine components.

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

These words are not a frozen schema. Authored intent should describe what matter is allowed or able to do, not directly prescribe a Box3D object or product-specific part.

### Runtime is disposable

Persistent authored identity must remain independent from runtime body/collider/joint identity. Runtime representation may be rebuilt, repartitioned, reduced or eventually replaced by another model.

### Locality should do real work

When a physical relationship can be resolved from local matter/topology/interface context, test that composition before introducing an explicit semantic component graph.

Stable authored IDs are valid when identity is genuinely part of the concept, but references must not become the default substitute for spatial/material semantics.

### Voxels/cells are a dialect, not ontology

The sparse cubic-cell representation is a useful falsification tool, not the final Machine Matter commitment. Future evidence may require adaptive cells, meshes, fields, SDF-like sources, hierarchy or another representation.

### Representations may use different resolutions

Authored matter, collision, visual representation and solver representation do not need one-to-one topology or resolution.

### Composition is the prize

A collection of isolated successful tricks is not yet Machine Matter.

```text
matter + binding + interface + function + environment
                         ↓
                  useful behavior
```

Composition should emerge from earned local rules rather than a hidden machine template.

### Evidence earns abstraction

Do not add generic Bond, Relation, FUNCTION, Device, Port, Signal, Surface or Power architecture because the vocabulary sounds inevitable. Reuse must be earned by evidence or be neutral measurement/process infrastructure.

### Solver convenience is not ontology

A solver primitive may be a useful lowering target without being the authored concept. Periodically seek experiments whose natural authored meaning does not map one-to-one onto an existing solver primitive; otherwise ANVIL risks becoming a shadow ontology of the current backend.

## 2. Frontier review dimensions

At each strategic checkpoint, assess these dimensions independently. Their current ranking is dynamic and belongs in project memory/state.

- **Matter** — material/source representation and constitutive meaning.
- **Bindings** — how neighboring matter remains connected, compliant, weak, directional or disconnected.
- **Interfaces** — local allowed relative motion/contact semantics.
- **Function** — local active capability that can perform physical work or sensing.
- **Control / Signal / Power** — transient commands, information and energy semantics.
- **Surface** — local contact/friction/traction behavior.
- **Topology / Continuity** — persistence of authored semantics across changing runtime decomposition.
- **Adaptation / Representation** — alternate source/runtime representations, resolution changes and model switching.

A strategically sensible sequence is not necessarily numerically balanced. Avoid deepening one frontier indefinitely while another high-consequence assumption remains completely untested unless an explicit dependency justifies it.

## 3. Macro Critical Validation Loop

Run after each strategically meaningful promotion, meaningful falsification, architectural contradiction, frontier change or major interruption.

### M0 — live truth lock

Resolve live `main`, active experiment PR/head, exact last accepted material checkpoint, relevant evidence and documentation drift. Use `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` only as claims to verify.

### M1 — vision delta

State in one sentence what part of the Machine Matter dream became more credible or less credible because of the last result.

If the answer is merely “the same fixture is more robust,” classify the work as hardening rather than frontier progress.

### M2 — anti-component-drift gate

Ask of each new authored concept:

- local physical property/capability or conventional part in disguise?
- runtime identity leak?
- unnecessary authored cross-component reference where locality could genuinely resolve it?
- one-to-one solver object being smuggled into authored truth?
- current cell/grid representation being mistaken for permanent ontology?

### M3 — frontier balance

Review the frontier dimensions above and identify the least-tested high-consequence assumptions.

### M4 — strongest live assumption

Choose the assumption with the largest combination of:

- consequence if false;
- uncertainty;
- architectural lock-in risk.

### M5 — compare credible next falsifiers

Compare at least two plausible next experiments using qualitative assessment of:

- information gain;
- vision alignment;
- lock-in reduction;
- discriminability;
- implementation/evidence cost;
- composition value.

Do not manufacture fake numeric precision.

### M6 — adversarial preflight

Before executable results:

- one primary question;
- smallest discriminating fixture;
- frozen meaningful gates;
- negative/control case when false-positive success is plausible;
- fail-closed expectations;
- explicit non-claims;
- only the evidence classes actually required.

### M7 — Lean Evidence Loop

Run Draft/core → Ready/candidate from `docs/EXPERIMENT_PROTOCOL.md`.

Classify a red result before modifying it:

- physical falsification;
- semantic/compiler failure;
- non-discriminating fixture;
- test representation defect;
- toolchain/infrastructure block.

### M8 — exact promotion and grounding

Promote only the exact supported candidate, verify synthetic/actual tree identity where applicable, then ground evidence/docs without changing already-qualified material code.

### M9 — composition checkpoint

After roughly 2–3 new primitive/frontier results, stop adding vocabulary and force existing semantics to compose.

Examples:

- active function through a reconstructed relation;
- function through compliant matter;
- surface property interacting with structure;
- transient control driving persistent capability without mutating construction semantics;
- one earned semantic expressed through a different authored representation.

## 4. Delta-audit rule

Do not repeat a full project-history reconstruction merely for reassurance.

For ordinary continuation, first compare the live fingerprint:

- live `main`;
- accepted material checkpoint;
- active PR/head;
- merge-base / branch delta;
- relevant latest evidence;
- frozen active preflight.

If that fingerprint matches the verified handoff and no contradiction appears, continue the bounded active experiment. Run the full macro loop only at the strategic triggers listed above.

## 5. Periodic challenges

The project should periodically attack its own most convenient assumptions:

- **representation challenge** — can an earned semantic survive a different authored representation or resolution?
- **solver-shadow challenge** — can a useful authored semantic require a lowering that is not a renamed stock primitive?
- **composition challenge** — do multiple earned local semantics produce useful behavior without a hidden machine template?
- **scaling challenge** — do physical parameters retain honest meaning when geometry/resolution changes?

These are strategic test categories, not scheduled roadmap items.

## Stability rule

This document should rarely change. Current frontier ranking, chosen experiment, exact SHAs, thresholds and next action belong elsewhere. Change the Compass only when the **method or long-horizon invariants** themselves need revision.
