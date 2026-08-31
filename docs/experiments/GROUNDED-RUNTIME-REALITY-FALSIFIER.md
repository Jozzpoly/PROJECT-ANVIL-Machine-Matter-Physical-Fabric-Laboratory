# Grounded Runtime Reality Falsifier

Date: 2026-08-31  
Status: **DIAGNOSTIC RED / NATURAL STOP / DO NOT MERGE BY MOMENTUM**

## Authority and scope

This is a bounded diagnostic experiment, not a product correction and not a new ANVIL ontology decision.

- product base: `product/heir-grounded-runtime` @ `29c83ea3256a15923a7db648f2b03c7481223b42`
- isolated experiment branch: `experiment/grounded-runtime-reality-falsifier`
- qualified measurement head: `d8a53ca2ff9fd9e5534ec98d917e50f50c9d5ec2`
- GitHub Actions run: `33418935897`
- evidence artifact: `grounded-runtime-reality-falsifier`, ID `9768116908`
- artifact digest: `sha256:46c42fc588b0de651d126976782573802b423d570cd65c9761f71c2c6df5adac`

No production runtime, source schema, authoring semantics, Meaning kind, Bearing definition, Torque definition, ground parameters, timestep, substep count, damping, or UI was changed for this experiment. Only the diagnostic harness/workflow was added on the isolated branch.

The screen recordings that motivated the probe remain qualitative Owner evidence. Their exact build SHA could not be established from visible UI alone, so the repo-native result below does not depend on assigning them provenance that is not proven.

## Question

The grounded product candidate had already proved three narrow facts: Matter falls and settles on physical ground, Runtime Hand can drag a settled mechanism, and an explicitly authored `1000 Nm` Torque can make a grounded Bearing move.

The missing question was more fundamental:

> Does the current Bearing remain geometrically coherent while the grounded product is driven through the Torque range needed for ordinary mechanical action, or can an actionability check pass while the revolute constraint is materially lost?

The pre-existing regression convention of `< 0.003 m` maximum Bearing anchor separation was used as the comparison threshold.

## Probe A — same simple mechanism, environment and Torque sweep

Fixture:

- three starter cells;
- Bearing between `starter:a x+` and `starter:b x-`;
- `freeAxis = y` so gravity does not directly drive the hinge angle;
- `starter:a` and `starter:b/c` remain ordinary dynamic authored rigid islands;
- same current Box3D runtime: `1/60 s`, `4` substeps, zero damping;
- 240 settle steps, then 180 driven steps;
- no Runtime Hand.

### Environment-neutral control

| Torque | Peak relative speed | Max driven anchor error | First >3 mm | Verdict |
|---:|---:|---:|---:|---|
| 0 Nm | 0 rad/s | 0 mm | — | control |
| 20 Nm | 11.51 rad/s | 0.761 mm | — | within bound |
| 40 Nm | 22.73 rad/s | 2.873 mm | — | within bound, close |
| 60 Nm | 35.94 rad/s | 6.689 mm | step 115 | **RED** |
| 80 Nm | 45.01 rad/s | 10.013 mm | <180 | **RED** |
| 100 Nm | 52.13 rad/s | 13.164 mm | step 72 | **RED** |
| 150 Nm | 64.23 rad/s | 18.569 mm | <180 | **RED** |

This falsifies the hypothesis that the observed integrity loss requires the new ground/contact environment. At sustained higher angular speed, the same revolute constraint loses the existing 3 mm integrity bound even with `grounded=false`.

### Grounded product control

The ground settling transient briefly reaches about `3.284 mm`, but every condition settles back to about `0.04 mm` before Torque is enabled. Settling and driven errors are therefore separated in the evidence rather than conflated.

| Torque | Driven behavior | Peak relative speed | Max driven anchor error | First >3 mm | Verdict |
|---:|---|---:|---:|---:|---|
| 20 Nm | effectively pinned | ~0 | 0.045 mm | — | constraint coherent but not actionable |
| 100 Nm | effectively pinned | ~0 | 0.054 mm | — | constraint coherent but not actionable |
| 250 Nm | effectively pinned | ~0 | 0.076 mm | — | constraint coherent but not actionable |
| 300 Nm | no sustained action | 0.047 rad/s | 0.134 mm | — | below actionability threshold |
| 350 Nm | transient response, returns near rest | 0.101 rad/s | 0.175 mm | — | no sustained useful action |
| 400 Nm | sustained action | 11.08 rad/s | 0.810 mm | — | actionable + within bound in this probe |
| 450 Nm | sustained fast action | 26.11 rad/s | 3.842 mm | step 140 | **RED** |
| 500 Nm | runaway-scale action | 44.37 rad/s | 9.593 mm | step 72 | **RED** |
| 750 Nm | runaway-scale action | 66.32 rad/s | 19.932 mm | <180 | **RED** |
| 1000 Nm | runaway-scale action | 73.33 rad/s | 24.559 mm | step 13 | **RED** |

The grounded candidate therefore has a pronounced **dead-zone → breakaway → high-speed constraint-loss** region on this simple mechanism. The historical UI default `20 Nm` is far below sustained action here, while the previously used `1000 Nm` probe is far inside the constraint-RED region.

All measured states remained finite. This is not evidence of NaN/explosive numerical corruption; it is evidence of material constraint-fidelity loss under the current actuation/runtime regime.

## Probe B — exact prior `1000 Nm is actionable` qualification fixture

The existing `tests/studio-grounded-runtime.test.mjs` actionability test was reproduced with its exact mechanism and timing:

- Bearing `starter:a x+ ↔ starter:b x-`;
- `freeAxis = z`;
- Torque `1000 Nm`;
- grounded runtime;
- settle `90` steps;
- enable forces;
- drive `120` steps.

Result:

- final relative angular speed: **17.10 rad/s** → the existing actionability criterion still passes;
- peak relative angular speed: **47.20 rad/s**;
- first driven anchor separation above 3 mm: **step 15** (~0.25 s after force enable);
- maximum driven anchor separation: **41.10 mm**;
- final anchor separation after 120 driven steps: **4.49 mm**;
- all runtime state remained finite.

Therefore the prior green test was not lying about its literal claim. It answered a narrower question than product use required:

> `1000 Nm` can produce motion.

It did **not** establish:

> the Bearing remains a coherent revolute constraint while producing that motion.

That missing invariant is sufficient to explain how exact CI could stay green while ordinary Owner play exposed visibly poor mechanical behavior.

## Diagnostic verdict

**`GENERAL_HIGH_SPEED_CONSTRAINT_RED`**

Current evidence supports all of the following simultaneously:

1. Grounding fixed a real earlier product deficiency; the product world is no longer merely zero-g with a decorative floor.
2. Grounding did not make the current mechanical loop product-safe by itself.
3. The current `20 Nm` creation default is too weak against the grounded contact regime for this simple mechanism.
4. Raising Torque enough to overcome that regime can drive the current constant-effort, zero-damping runtime rapidly into angular speeds where Bearing anchor integrity materially degrades.
5. The integrity RED also exists without ground/contact, so it cannot be routed solely to friction, support, or environment semantics.
6. The prior `1000 Nm is actionable` qualification is materially insufficient as a product-quality gate because its exact fixture passes actionability while violating the existing Bearing anchor-integrity convention by more than an order of magnitude transiently.
7. A runtime-only fixed-base/support falsifier is no longer the nearest upstream question. It is deferred, not rejected.
8. WER-1 remains a valid BUILD-side study but is not the next bottleneck to spend Owner attention on.

## Routing boundary

Stop here. Do not repair by momentum.

The next separately selected stage should establish a **constraint-safe actuation/runtime envelope** and discriminate at least these candidate causes before promoting any product correction:

- solver-resolution / timestep / substep limitations at sustained angular speed;
- unbounded constant-effort Torque producing indefinite acceleration in a zero-damping system;
- contact/friction creating a large breakaway gap between useful low-speed control and runaway actuation;
- whether a bounded disposable velocity/servo-style control specimen improves the experiment without implying final Torque semantics.

Do not bundle those candidates into one fix. Support/anchor semantics, WER-1, broader UI work, merge of the grounded heir, and final actuation ontology remain outside this diagnostic stage.
