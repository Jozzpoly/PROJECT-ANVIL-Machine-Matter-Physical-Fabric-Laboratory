# Constraint-Safe Actuation / Runtime Envelope Falsifier

Date: 2026-08-31  
Status: **DIAGNOSTIC PASS / COUPLED CAUSES RESOLVED / NATURAL STOP / DO NOT MERGE BY MOMENTUM**

## Authority and scope

This stage follows `GROUNDED-RUNTIME-REALITY-FALSIFIER`, which established a repeatable Bearing anchor-integrity RED under the current constant-effort runtime.

Live product authority was rechecked before this stage:

- product branch: `product/heir-grounded-runtime`
- exact product head: `29c83ea3256a15923a7db648f2b03c7481223b42`
- product PR: #45, still Draft and unmerged at experiment start
- isolated experiment branch: `experiment/constraint-safe-actuation-envelope`
- qualified measurement head: `aed5cf8fa0235d74cc963ae26140372596c8fea4`
- GitHub Actions run: `33439778550`
- evidence artifact: `constraint-safe-actuation-envelope`, ID `9775773030`
- artifact digest: `sha256:a6325e84ec88170c3dee6fb7a56710ba916262ba0bc92c008d38ca9cb10426c7`

No product source file was changed. In particular, `src/studio-recovery/runtime.ts`, Torque source semantics, Bearing semantics, ground defaults, authored source schema and UI remain byte-for-byte inherited from the product head.

The diagnostic harness reconstructs the same product body/shape/ground/revolute setup directly from `realizeFreedomSource` + the same `box3d.js` engine, then varies only explicitly recorded experiment parameters.

## Question

The prior stage left four plausible contributors:

1. insufficient numerical resolution at sustained angular speed;
2. unbounded constant-effort Torque continuously increasing angular speed in a zero-damping runtime;
3. ground friction creating a large breakaway gap between no useful action and runaway action;
4. whether a bounded disposable velocity-control specimen can cross the ground breakaway regime while keeping Bearing integrity without silently redefining Torque.

The existing Bearing anchor-integrity comparison bound remains:

> maximum anchor separation `< 0.003 m`.

This is a diagnostic comparison convention, not a final universal engineering tolerance.

---

## A — numerical resolution discriminator

Fixture:

- three starter cells;
- Bearing `starter:a x+ ↔ starter:b x-`;
- `freeAxis = y`;
- environment neutral (`grounded=false`);
- zero damping;
- constant authored Torque;
- 3 s drive.

### 60 Nm

| outer dt | substeps | effective substep dt | peak speed | max anchor error | verdict |
|---:|---:|---:|---:|---:|---|
| 1/60 s | 4 | 1/240 s | 35.94 rad/s | 6.689 mm | **RED** |
| 1/60 s | 8 | 1/480 s | 36.38 rad/s | 3.392 mm | **RED, near bound** |
| 1/60 s | 16 | 1/960 s | 36.84 rad/s | 1.895 mm | PASS |
| 1/60 s | 32 | 1/1920 s | 36.90 rad/s | 1.180 mm | PASS |
| 1/120 s | 4 | 1/480 s | 36.43 rad/s | 3.392 mm | **RED, near bound** |
| 1/240 s | 4 | 1/960 s | 36.84 rad/s | 1.904 mm | PASS |

### 100 Nm

| outer dt | substeps | effective substep dt | peak speed | max anchor error | verdict |
|---:|---:|---:|---:|---:|---|
| 1/60 s | 4 | 1/240 s | 52.13 rad/s | 13.164 mm | **RED** |
| 1/60 s | 8 | 1/480 s | 54.27 rad/s | 7.103 mm | **RED** |
| 1/60 s | 16 | 1/960 s | 56.78 rad/s | 4.027 mm | **RED** |
| 1/60 s | 32 | 1/1920 s | 56.46 rad/s | 2.331 mm | PASS |
| 1/120 s | 4 | 1/480 s | 55.35 rad/s | 7.103 mm | **RED** |
| 1/240 s | 4 | 1/960 s | 57.05 rad/s | 4.027 mm | **RED** |

### Interpretation

This is strong evidence that numerical resolution is a real causal variable.

The especially useful comparison is not merely that "more substeps looks better":

- `1/60 + 8 substeps` and `1/120 + 4 substeps` have the same effective substep dt (`1/480 s`) and produce essentially identical anchor error;
- `1/60 + 16` and `1/240 + 4` have the same effective substep dt (`1/960 s`) and again produce essentially identical error.

At 100 Nm, moving from the product's 4 substeps to 32 substeps reduces max error from `13.164 mm` to `2.331 mm` while peak angular speed remains above `56 rad/s`.

Therefore high angular speed is not by itself proof that the Bearing formulation is structurally wrong. The current solver resolution has a finite constraint-safe speed/load envelope, and the product can drive outside it.

This does **not** authorize `32 substeps` as a product setting. Cost, larger mechanisms, contacts, multi-Bearing composition and browser performance were not tested here.

---

## B — friction / breakaway discriminator

Same y-axis fixture, grounded runtime, product-like 4 substeps, zero damping, 3 s drive. Only the diagnostic ground friction is varied.

A sustained-action reference was defined as mean absolute relative speed during the last second >= `1 rad/s`; this is used only to compare the sweep and does not replace product judgement.

| ground friction | first sampled sustained Torque | sampled constraint-safe sustained region |
|---:|---:|---|
| 0.8 | 400 Nm | 400 Nm |
| 0.4 | 300 Nm | 300 Nm |
| 0.2 | 200 Nm | 200 Nm |
| 0.1 | 200 Nm | none among sampled efforts |
| 0.02 | 100 Nm | 100 Nm |

At product friction `0.8`:

- 20–200 Nm: effectively pinned;
- 300–350 Nm: small transient responses but no sustained action;
- 400 Nm: sustained action, peak `11.08 rad/s`, max anchor error `0.810 mm`;
- 450 Nm: peak `26.11 rad/s`, max anchor error `3.842 mm` → RED;
- 500 Nm: peak `44.37 rad/s`, max anchor error `9.593 mm` → RED.

Lowering friction moves the breakaway threshold downward, but after breakaway the same constant effort has less resistance and accelerates harder. Example:

- friction `0.4`, 300 Nm: safe sustained action (`1.158 mm` max error);
- 350 Nm: already RED (`6.015 mm`);
- friction `0.1`, 200 Nm: sustained action but already RED (`5.091 mm`);
- friction `0.02`, 100 Nm: safe (`2.441 mm`), while 200 Nm is strongly RED (`15.813 mm`).

Therefore **"lower ground friction" is falsified as a robust correction strategy**. It shifts the cliff; it does not remove the coupled breakaway/runaway problem.

The exact safe-window widths remain unknown because this was a coarse discriminator sweep, not a tuning pass.

---

## C — bounded disposable velocity-servo specimen

This specimen is deliberately **not** a proposed Torque semantic.

The harness retains the same realized Torque axis and body pair but changes command application only inside the diagnostic instrument:

`commandScale = clamp((targetSpeed - currentRelativeSpeed) / |targetSpeed|, -1, 1)`

so the listed Torque is a maximum command magnitude and the controller can taper or reverse command as the target is approached.

This answers one bounded question:

> Can high available effort overcome ground breakaway without inevitably entering the runaway/constraint-RED regime if actuation is shaped by velocity feedback?

### Grounded, product friction 0.8, product 4 substeps

Every tested condition remained below the 3 mm anchor bound:

| max command | target | mean speed last 1 s | peak speed | max anchor error |
|---:|---:|---:|---:|---:|
| 500 Nm | 5 rad/s | 1.36 | 1.40 | 0.188 mm |
| 500 Nm | 10 rad/s | 2.73 | 2.90 | 0.203 mm |
| 500 Nm | 20 rad/s | 5.36 | 6.39 | 0.353 mm |
| 500 Nm | 30 rad/s | 7.33 | 9.36 | 0.607 mm |
| 1000 Nm | 5 rad/s | 3.15 | 3.24 | 0.257 mm |
| 1000 Nm | 10 rad/s | 6.30 | 6.91 | 0.480 mm |
| 1000 Nm | 20 rad/s | 11.75 | 14.22 | 1.233 mm |
| 1000 Nm | 30 rad/s | 16.74 | 21.69 | 2.682 mm |

The targets are not reached exactly because this is only a simple proportional, torque-limited diagnostic controller fighting contact/friction. That is acceptable for the falsifier: it demonstrates sustained low/moderate-speed mechanical action with large available effort and without the constant-effort runaway seen in the control.

Environment-neutral controls sharpen the limit:

- target 5 and 10 rad/s remain comfortably constraint-safe;
- target 20 rad/s overshoots to ~25 rad/s and reaches ~3.4 mm → RED at product 4-substep resolution;
- target 30 rad/s is strongly RED (~7.0 mm).

This is consistent with the resolution experiment: actuation shaping can keep the product inside the current numerical envelope, while finer solver resolution can enlarge that envelope.

No inference is made that a velocity servo should replace Torque. Accepted Torque remains a true effort quantity in Nm unless a separate scientific/product decision changes that later.

---

## D — passive damping discriminator

Environment neutral, constant 100 Nm, product 4 substeps, 6 s drive. Only angular damping is varied diagnostically.

| angular damping | peak speed | mean speed last 1 s | max anchor error | verdict |
|---:|---:|---:|---:|---|
| 0 | 63.63 rad/s | 48.69 | 18.856 mm | **RED** |
| 0.25 | 53.34 | 41.76 | 14.187 mm | **RED** |
| 0.5 | 45.87 | 35.92 | 10.556 mm | **RED** |
| 1 | 31.95 | 25.17 | 5.491 mm | **RED** |
| 2 | 17.60 | 13.65 | 1.742 mm | PASS |
| 4 | 8.89 | 6.96 | 0.456 mm | PASS |

This is additional causal evidence that unbounded speed accumulation is a major amplifier at fixed numerical resolution.

It is **not** evidence that global angular damping `2` is a desirable product correction. Damping changes physical behavior and was not evaluated for feel, energy semantics, larger mechanisms or other motions.

---

## Combined verdict

**`COUPLED_RESOLUTION_ACTUATION_BREAKAWAY_CONFIRMED`**

The evidence now supports a more precise model than the previous generic "high-speed constraint RED":

1. **Solver resolution is genuinely causal.** At equivalent physical speed/load, decreasing effective substep dt sharply improves Bearing anchor integrity. The equivalence between matching effective substep dt pairs is especially strong evidence.
2. **Constant-effort runaway is genuinely causal as an envelope driver.** With zero damping, sustained Torque can continuously push angular speed beyond what the current 4-substep runtime constrains accurately.
3. **Ground friction is genuinely causal to the dead zone / breakaway cliff.** It raises the effort required to begin useful motion; lowering friction merely moves the cliff and can make post-breakaway acceleration worse.
4. **The Bearing formulation is not falsified as fundamentally unusable.** The same 100 Nm fixture that fails badly at 4 substeps is within the existing 3 mm bound at 32 substeps while running at >56 rad/s.
5. **A constraint-safe grounded actuation regime demonstrably exists.** A bounded feedback specimen with high available torque crosses the grounded breakaway regime and sustains motion without anchor RED in all eight sampled grounded cases.
6. **No single lever is yet authorized as the product correction.** More substeps, damping, servo/motor semantics, friction changes, torque limits or combinations have different physical/product costs.
7. **Reducing friction alone should not be pursued as the fix.** That candidate is sufficiently falsified by this stage.
8. **Silently redefining authored Torque as a velocity servo is not authorized.** The servo is evidence about actuation shaping, not a semantic migration.

## What this changes about the project diagnosis

The current product candidate is no longer best described as "Box3D/Bearing is broken" or "ground physics is wrong".

A better current diagnosis is:

> The product currently couples a narrow solver-resolution envelope with an unbounded constant-effort actuator and a high-friction grounded environment. Ground contact creates a high breakaway requirement; once that requirement is exceeded, constant effort can accelerate the mechanism into a regime where the current solver resolution no longer preserves Bearing anchors to the existing integrity convention.

That explains the Owner observation, the earlier green actionability test, the grounded dead zone and the later constraint RED without requiring one universal defect.

## Routing boundary

Stop here. Do not implement a product correction by momentum.

The next separately selected stage should be a **minimal product-correction candidate gate**, not another broad discovery sweep. It should preserve the scientific identity of Torque and compare the smallest credible corrections against both mechanical integrity and Owner loop quality.

At minimum, candidates should be kept separable:

- **numerical fidelity candidate:** higher/adaptive solver resolution, with explicit browser-performance cost and larger/multi-Bearing validation;
- **actuation candidate:** a bounded actuator/motor specimen distinct from Torque unless evidence earns a semantic change;
- **energy/damping candidate:** only if physically/product-meaningful, not as a hidden stabilizer;
- **contact candidate:** ground friction/material behavior may later be tuned for world feel, but not treated as the root fix.

Any product candidate must add the missing regression invariant that exposed this failure:

> actionability is insufficient; driven Bearings must also retain measured anchor integrity over the tested operating envelope.

Do not resume WER-1, broad UI work, support/anchor ontology, merge PR #45, or final actuator ontology inside this stage.
