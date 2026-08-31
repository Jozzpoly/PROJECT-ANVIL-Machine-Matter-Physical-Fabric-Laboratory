# Minimal Product-Correction Candidate Gate

Date: 2026-08-31  
Status: **NO PRODUCT CORRECTION PROMOTED / NATURAL STOP / DO NOT MERGE BY MOMENTUM**

## Authority and isolation

This stage follows `CONSTRAINT-SAFE-ACTUATION-ENVELOPE`, which established that Bearing anchor-integrity loss is jointly affected by solver resolution, constant-effort speed accumulation and ground breakaway.

Live product authority was rechecked before work:

- product branch: `product/heir-grounded-runtime`
- exact inherited product head: `29c83ea3256a15923a7db648f2b03c7481223b42`
- PR #45: Draft, unmerged at stage start
- isolated candidate branch: `candidate/minimal-product-correction-gate`
- qualified evidence head before this record: `9855de5e716d0899bdc9bdde14c9b26beaaafe30`
- qualified GitHub Actions run: `33442182842`
- evidence artifact: `minimal-product-correction-gate`, ID `9776657845`
- artifact digest: `sha256:49dc622458f847c44a3cb70a3cd7ff31308c1ca7f2dc1ad7af2f56b9b2b9d192`

No product runtime source, Torque semantics, Bearing semantics, ground defaults, source schema or UI was changed by this stage. The candidate branch contains diagnostic scripts/workflow only.

### Operational correction

During branch setup an empty placeholder file was accidentally committed to `product/heir-grounded-runtime`. The mistake was detected immediately before material work continued. The product branch ref was restored directly and verified at the exact pre-stage authority SHA `29c83ea3256a15923a7db648f2b03c7481223b42`; the actual experiment was then created from that exact SHA on the isolated candidate branch.

This is recorded explicitly so the product-history boundary is not silently rewritten in the experiment narrative.

## Stage question

The goal was not to find a combination that merely looked stable. It was to test whether either of the smallest credible product corrections could earn promotion independently:

1. **numerical-only:** preserve current grounded world and true constant-effort Torque, varying only solver substeps;
2. **bounded Motor specimen:** if numerical-only failed, test a separate velocity-feedback actuator specimen without redefining Torque.

The existing diagnostic comparison bound remains maximum Bearing anchor separation `< 0.003 m`. This is a comparison convention, not a final universal tolerance.

---

## A — product calibration

The numerical gate first ran representative fixtures through the real current `FreedomRuntimeSession` at the product's `1/60 s`, 4-substep runtime.

| Fixture | max anchor error | peak relative speed | verdict |
|---|---:|---:|---|
| neutral y-axis, 100 Nm | 13.164 mm | 52.13 rad/s | **RED** |
| grounded y-axis, 500 Nm | 9.593 mm | 44.37 rad/s | **RED** |
| grounded z-axis, prior 1000 Nm fixture | 41.096 mm | 47.20 rad/s | **RED** |
| neutral 7-body / 6-Bearing chain | 2.563 mm | 6.15 rad/s | PASS |

The first three values reproduce the earlier grounded/runtime evidence closely enough to qualify the gate instrument. In particular, the exact difficult grounded z-axis fixture again exposes the blind spot in the old actionability-only qualification.

---

## B — numerical-only candidate sweep

The same body/shape/ground/revolute construction was swept at `4, 8, 16, 24, 32, 48, 64` substeps while preserving `1/60 s` outer dt, zero damping and constant authored Torque.

| substeps | neutral y 100 Nm | grounded y 500 Nm | grounded z 1000 Nm | 7-body / 6-joint chain | all pass? |
|---:|---:|---:|---:|---:|---|
| 4 | 13.164 mm | 9.593 mm | 41.096 mm | 2.563 mm | no |
| 8 | 7.103 mm | 5.426 mm | 79.177 mm | 0.575 mm | no |
| 16 | 4.027 mm | 2.997 mm | 66.471 mm | 0.979 mm | no |
| 24 | 2.900 mm | 2.205 mm | 56.920 mm | 0.489 mm | no |
| 32 | 2.331 mm | 1.837 mm | 65.876 mm | 0.589 mm | no |
| 48 | 1.763 mm | 1.358 mm | 68.611 mm | 0.867 mm | no |
| 64 | 1.435 mm | 1.115 mm | 58.210 mm | 0.793 mm | no |

### Numerical verdict

**`NUMERICAL_ONLY_NOT_SUFFICIENT_IN_SWEEP`**

The result is deliberately two-sided:

- solver resolution remains a real and valuable fidelity lever: `24` substeps is the first sampled level that brings the neutral 100 Nm fixture, grounded 500 Nm fixture and multi-Bearing chain below the 3 mm comparison bound;
- but the exact grounded z-axis 1000 Nm fixture remains severely RED at every sampled resolution through 64 substeps, with non-monotonic errors of roughly `57–79 mm` above 4 substeps.

Therefore this stage does **not** authorize changing the product default to 24, 32 or any other sampled value. Numerical fidelity can enlarge the safe envelope, but it is not a complete correction for the current difficult grounded mechanism.

Direct Node-harness wall-time measurements also increased materially at higher resolution, reaching roughly 4.2x the aggregate 4-substep cost at 64 substeps. Those timings are useful only as an early cost warning; they are not browser-performance authority. Because numerical-only failed the mechanical gate first, a browser default-performance qualification was intentionally not started.

---

## C — bounded Motor specimen

After numerical-only failed, the gate tested a separate diagnostic actuator. Authored Torque was not reinterpreted.

For the Motor specimen, the authored effort value is used only as maximum available torque and command application is shaped by relative-speed feedback:

`commandScale = clamp((targetSpeed - currentRelativeSpeed) / targetSpeed, -1, 1)`

The short candidate sweep used:

- substeps: `4, 16, 24, 32`;
- target relative speeds: `5, 10, 15, 20 rad/s`;
- neutral y 100 Nm, grounded y 500 Nm and difficult grounded z 1000 Nm fixtures.

A short apparent candidate existed at product resolution:

`4 substeps / target 20 rad/s`

All three short fixtures were actionable and below the comparison bound. The difficult grounded z-axis fixture reached:

- 2 s max anchor error: `2.637 mm`;
- peak relative speed: `17.646 rad/s`;
- last-second mean speed: `7.865 rad/s`.

That green result was **not promoted**, because nearby resolution/target combinations were non-monotonic and the difficult fixture was already known to be contact-sensitive.

---

## D — bounded Motor robustness falsifier

The exact difficult grounded z-axis 1000 Nm fixture was then expanded to:

- substeps: `4, 6, 8, 10, 12, 16, 24, 32`;
- targets: `18, 20, 22 rad/s`;
- driven duration: `2, 5, 10 s` after the same 1.5 s settle.

The short `4 substeps / target 20` apparent pass degraded with duration:

| drive duration | max anchor error | last-second mean speed | verdict |
|---:|---:|---:|---|
| 2 s | 2.637 mm | 7.865 rad/s | PASS |
| 5 s | 6.069 mm | 6.863 rad/s | **RED** |
| 10 s | 19.532 mm | 7.541 rad/s | **RED** |

No tested target/substep setting passed both actionability and anchor integrity across all three durations.

Representative 10 s worst cases remained materially RED:

- 4 substeps / target 18: `16.655 mm`;
- 8 / target 18: `13.148 mm`;
- 12 / target 20: `15.581 mm`;
- 24 / target 20: `20.111 mm`;
- 32 / target 20: `21.972 mm`.

### Motor verdict

**`MOTOR_NO_LONG_RUN_PASS`**

The simple bounded velocity-feedback specimen proves that short-horizon actuation shaping can avoid immediate runaway, but it does **not** provide a robust correction for the difficult grounded horizontal-axis mechanism. The earlier 2 s green was a transient/trajectory-sensitive island, not an earned product envelope.

This is also why the stage does not create a Motor source kind, UI control or final actuator ontology.

---

## Combined verdict

**`NO_MINIMAL_PRODUCT_CORRECTION_PROMOTED`**

The stage falsified two tempting shortcuts:

1. **"Just increase substeps."** False as a complete correction. It materially improves several mechanisms but does not stabilize the difficult grounded z-axis fixture even through 64 sampled substeps.
2. **"Just bound Torque with a simple velocity servo."** False as a robust correction. It can produce short green runs, but the same grounded z-axis fixture accumulates large anchor error over 5–10 seconds across the sampled target/resolution space.

At the same time, neither result says the levers are useless. Higher numerical resolution is clearly beneficial, and bounded actuation is still a plausible component of a future machine-control model. They simply have not earned standalone product promotion.

## Updated diagnosis

The strongest unresolved discriminator is now the geometry of **contact versus revolute constraint under a grounded horizontal-axis hinge**.

The difficult z-axis fixture rotates two grounded dynamic cubic bodies about a horizontal axis at their shared side face. That motion can require one body to lift while another presses into the ground, creating a qualitatively different constraint/contact problem from the y-axis spin fixture. The non-monotonic response to higher substeps and the long-run failure at bounded moderate speed are consistent with such a contact/constraint conflict, but this stage does **not** claim that explanation as proven.

The next separately selected experiment should therefore be a bounded **Contact-Constraint Geometry Falsifier**, not another actuator-tuning sweep. It should hold the Bearing and actuation question fixed while discriminating ground contact from free/elevated motion and axis orientation.

Useful controls include the same z-axis mechanism:

- environment-neutral versus grounded;
- grounded at increasing initial elevation before contact;
- y/z axis orientation under matched source topology and effort/control;
- onset of anchor error relative to body height/ground interaction;
- only if needed, a disposable reference/fixed-base specimen as an instrument, not as final support ontology.

A clean result would route the project either toward contact/reference/support mechanics or back toward revolute constraint formulation. Do not implement support semantics before that discriminator.

## Natural stop

Stop here.

Do not change product substeps, add damping, lower friction, redefine Torque, add Motor ontology, merge PR #45, resume WER-1 or begin support/fixed Matter semantics by momentum.

The next stage is a separate contact/constraint causality gate and should be selected explicitly from this evidence.
