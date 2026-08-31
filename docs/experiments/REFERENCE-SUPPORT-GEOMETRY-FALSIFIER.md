# Reference / Support Geometry Falsifier

Date: 2026-09-01  
Status: **CAUSAL PASS / REFERENCE + CLEARANCE SUFFICIENT IN FIXTURE / NUMERICAL DEBT REMAINS / NATURAL STOP / DO NOT MERGE BY MOMENTUM**

## Authority and scope

This stage follows the Contact-Constraint Geometry Falsifier, which separated two contact-coupled modes: general impact shock and sustained horizontal-hinge contact conflict.

Live authority was rechecked before work:

- product branch: `product/heir-grounded-runtime`
- exact product head: `29c83ea3256a15923a7db648f2b03c7481223b42`
- product PR: #45, still Draft and unmerged
- isolated experiment branch: `experiment/reference-support-geometry-falsifier`
- qualified measurement head: `cbed999518d9b4bf475f2cb50b11b6b5c7c551f2`
- qualified GitHub Actions run: `33447461768`
- evidence artifact: `reference-support-geometry-falsifier`, ID `9778540817`
- artifact digest: `sha256:4d1e4fe88aa691f8a7c67c7d0a758d73f13273074d997f48cdd345fdb8a57cb7`

No product runtime, source schema, Bearing semantics, Torque semantics, UI, ground default or authored ontology was changed. The experimental reference is implemented only by making Bearing body A static inside the standalone Box3D harness.

The `3 mm` anchor-separation bound remains the project's existing regression comparison convention, not a claimed universal engineering tolerance.

A bounded relative-speed feedback command with `1000 Nm` maximum available authored-like effort is used only as a repeatable stimulus. It is not a proposed Motor semantic and does not redefine Torque.

## Question

The previous stage established that a horizontal Bearing can be healthy in free space yet fail when its motion conflicts with the floor. This stage asks a narrower mechanical question:

> If the same horizontal mechanism receives an explicit reference/support and enough swept-volume clearance to perform its revolute motion without intersecting the ground, does it become a coherent grounded machine without changing Bearing semantics?

The experiment deliberately separates:

1. the current two-dynamic-body floor specimen;
2. a disposable fixed/reference body with no useful clearance;
3. the same reference with deliberately insufficient clearance;
4. a near-boundary positive-clearance arrangement;
5. a comfortably clear arrangement;
6. the same clear arrangement with no ground;
7. matched y-axis controls;
8. a bounded solver-resolution transfer only after the geometry is mechanically coherent;
9. passive impact as an independent prior-mode reproduction.

## Geometry is derived, not guessed

The moving realized body is `body:starter:b`. Because it contains the remaining two-cell arm beyond the Bearing, the farthest moving corner has a radius of about:

`1.030776 m`

around the horizontal z-axis Bearing.

The harness analytically computes the minimum y reached by every moving-body corner over a full revolution. At the authored zero elevation the predicted minimum swept y is:

`-0.780776 m`

With product ground top at `-0.26 m`, the reference must therefore be elevated by approximately:

`0.520776 m`

merely to reach zero theoretical full-sweep clearance.

The tested reference elevations are derived from that value:

| condition | reference elevation | predicted full-sweep clearance |
|---|---:|---:|
| floor | `0` | `-520.8 mm` |
| insufficient | `0.470776 m` | `-50 mm` |
| boundary | `0.525776 m` | `+5 mm` |
| clear | `0.620776 m` | `+100 mm` |

This avoids tuning the test around an arbitrary hand-picked support height.

## Qualification correction discovered during the stage

The first raw harness verdict was **rejected**.

The raw script initially treated anchor integrity by itself as a successful fixed-floor result. That was methodologically wrong: the fixed-floor mechanism preserved its anchor precisely because the ground prevented it from rotating. Its final relative angular speed was effectively zero.

The authoritative qualification therefore requires both:

- **integrity:** maximum anchor separation `< 3 mm`;
- **actionability:** sustained final relative speed `>= 1 rad/s`.

The qualified artifact explicitly records the rejected raw verdict for provenance and computes the final verdict separately in `qualified-result.json`.

## A — reference and clearance causal matrix

All rows below use 24 substeps, 10 s driven operation after the configured settle, product ground friction `0.8`, and the same bounded diagnostic stimulus.

### Target 10 rad/s

| configuration | max anchor error | tail speed | operational verdict |
|---|---:|---:|---|
| dynamic bodies on floor | `0.569 mm` | `~0.000001 rad/s` | **FAIL — blocked** |
| fixed reference on floor | `0.306 mm` | `~0.000008 rad/s` | **FAIL — blocked** |
| fixed + `-50 mm` predicted clearance | `0.556 mm` | `~0.000001 rad/s` | **FAIL — blocked** |
| fixed + `+5 mm` predicted clearance | `0.535 mm` | `9.659 rad/s` | **PASS** |
| fixed + `+100 mm` predicted clearance | `0.535 mm` | `9.659 rad/s` | **PASS** |

### Target 20 rad/s

| configuration | max anchor error | tail speed | operational verdict |
|---|---:|---:|---|
| dynamic bodies on floor | **`22.746 mm`** | `11.119 rad/s` | **FAIL — constraint RED** |
| fixed reference on floor | `1.179 mm` | `~0.000005 rad/s` | **FAIL — blocked** |
| fixed + `-50 mm` predicted clearance | `0.552 mm` | `~0.000001 rad/s` | **FAIL — blocked** |
| fixed + `+5 mm` predicted clearance | `1.460 mm` | `19.432 rad/s` | **PASS** |
| fixed + `+100 mm` predicted clearance | `1.462 mm` | `19.438 rad/s` | **PASS** |

The measured minimum clearance in the `+5 mm` specimen remains positive: approximately `4.50 mm` at 10 rad/s and `3.93 mm` at 20 rad/s.

The `+100 mm` grounded and no-ground specimens produce the same anchor result to the recorded precision. Once contact is geometrically removed from the moving sweep, merely having the ground in the world does not degrade the fixture.

## Interpretation of A

The result is stronger than either tempting simplification:

- **reference alone is not enough** — fixed-floor and fixed-insufficient arrangements are mechanically blocked;
- **numerical stabilization alone is not what makes the reference case pass** — the same 24-substep solver already showed a strongly RED dynamic-floor 20 rad/s case;
- **reference + physically possible swept geometry is sufficient in this fixture** — both tested positive-clearance arrangements remain actionable and below the anchor bound;
- **the current ground is not inherently incompatible with horizontal Bearings** — the conflict disappears when the moving body no longer asks the solver to occupy forbidden ground volume.

The experiment does not establish that `5 mm` is a product clearance rule. It only establishes that this particular analytically predicted positive-clearance specimen operated coherently. Final tolerances must not be inferred from this one geometry.

## B — resolution transfer on a mechanically coherent fixture

After establishing the `fixed + 100 mm clearance` arrangement as mechanically coherent, the experiment varies only solver substeps.

### Target 10 rad/s

| substeps | max anchor error | tail speed | verdict |
|---:|---:|---:|---|
| 4 | `2.232 mm` | `9.612` | PASS |
| 8 | `1.129 mm` | `9.643` | PASS |
| 12 | `0.818 mm` | `9.652` | PASS |
| 16 | `0.674 mm` | `9.655` | PASS |
| 24 | `0.535 mm` | `9.659` | PASS |
| 32 | `0.467 mm` | `9.660` | PASS |

### Target 20 rad/s

| substeps | max anchor error | tail speed | verdict |
|---:|---:|---:|---|
| 4 | **`6.325 mm`** | `18.832` | RED |
| 8 | **`3.254 mm`** | `19.243` | RED, near bound |
| 12 | `2.334 mm` | `19.352` | PASS |
| 16 | `1.895 mm` | `19.399` | PASS |
| 24 | `1.462 mm` | `19.438` | PASS |
| 32 | `1.243 mm` | `19.453` | PASS |

The first sampled solver resolution that passes **both** 10 and 20 rad/s on the coherent supported fixture is therefore:

**12 substeps**

This does not authorize `12` as a product default. It only shows that after the mechanical contradiction is removed, the numerical requirement becomes finite and monotonic in this fixture. Browser cost, larger mechanisms, multiple Bearings, impacts and contact-rich assemblies remain unqualified.

## C — passive impact remains a separate problem

The stage repeats the previous 0.5 m passive drop at 24 substeps with no applied actuator:

- y-axis: `5.220 mm` maximum anchor error;
- z-axis: `5.214 mm` maximum anchor error.

This reproduces the prior general contact-impact mode and confirms that solving supported operating geometry does not make impact-shock evidence disappear.

Support/reference geometry and impact robustness therefore remain separate engineering questions.

## Combined verdict

**`REFERENCE_PLUS_CLEARANCE_SUFFICIENT_IN_FIXTURE`**

The best current diagnosis is now:

> The pathological grounded horizontal-hinge behavior was not evidence that horizontal Bearings are intrinsically incompatible with the grounded runtime. In the tested fixture, an explicit mechanical reference plus enough swept-volume clearance converts the same horizontal mechanism into a stable, actionable grounded machine. Reference without usable clearance merely blocks the mechanism. Once geometry is coherent, solver resolution remains a separate quantitative fidelity constraint, with 12 substeps the first sampled level to satisfy the existing anchor convention at both tested speeds.

This earns several conclusions and rejects several shortcuts.

### Earned

- explicit mechanical reference/support is a credible missing ingredient for grounded machines;
- support must be paired with physically possible geometry, not used as a hidden stabilizer;
- horizontal Bearing operation can be coherent in a grounded world;
- numerical fidelity remains independently causal after geometry is corrected;
- the current product default of 4 substeps is not sufficient for the tested coherent fixture at 20 rad/s under the existing 3 mm convention;
- passive contact impact remains a separate unresolved robustness mode.

### Not earned

- final `Fixed Matter`, Anchor, Support, Grounded or World-Joint source semantics;
- `5 mm` as a universal clearance requirement;
- `12 substeps` as the product default;
- reinterpretation of Torque;
- a Motor source type;
- global damping or lower friction;
- a claim that Box3D itself is defective;
- merge of PR #45.

## Routing boundary

The next separately selected stage should generalize the result **before** ontology is designed.

A suitable next gate is a **Supported Mechanism Generalization Gate**:

1. build several small runtime-only mechanisms with one explicit disposable reference and physically valid clearance;
2. include more than one Bearing and at least one topology where loads propagate through a chain;
3. compare horizontal and mixed-axis operation;
4. qualify anchor integrity, actionability and contact behavior at a small solver set centered around `4 / 8 / 12 / 16`;
5. measure execution cost so numerical fidelity can begin to be judged as a product candidate rather than only a physics improvement;
6. keep passive impact as a separate control rather than blending it into ordinary driven operation.

Only if supported multi-Bearing machines remain coherent should the project spend design authority on what an authored reference/support actually means.

## Natural stop

Stop here.

Do not implement final Fixed Matter / Anchor / Support semantics, change product substeps, merge PR #45, reinterpret Torque, add Motor ontology, hide impact failure with damping, or resume broad UI/WER work by momentum.
