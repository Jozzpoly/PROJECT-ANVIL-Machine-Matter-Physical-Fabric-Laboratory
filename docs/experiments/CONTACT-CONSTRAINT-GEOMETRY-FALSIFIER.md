# Contact-Constraint Geometry Falsifier

Date: 2026-08-31  
Status: **CAUSAL DISCRIMINATOR PASS / TWO CONTACT MODES RESOLVED / NATURAL STOP / DO NOT MERGE BY MOMENTUM**

## Authority and scope

This stage follows the grounded-runtime, actuation-envelope and minimal-correction falsifiers. Those stages established that higher solver resolution improves Bearing integrity but does not by itself cure the difficult grounded horizontal-axis fixture, and that simple bounded velocity feedback avoids immediate runaway but does not remain robust over long grounded runs.

Live authority was rechecked before this stage:

- product branch: `product/heir-grounded-runtime`
- exact product head: `29c83ea3256a15923a7db648f2b03c7481223b42`
- product PR: #45, still Draft and unmerged
- isolated experiment branch: `experiment/contact-constraint-geometry-falsifier`
- qualified measurement head: `7acd81401b6126fa1d52b84f7bade2ea737e59c0`
- qualified GitHub Actions run: `33443684958`
- evidence artifact: `contact-constraint-geometry-falsifier`, ID `9777208316`
- artifact digest: `sha256:40331c3518606b53fd39fe81b969e662b4b49ce40cb69d06409aa14a341a08c0`

No product runtime, source schema, Bearing semantics, Torque semantics, ground default, UI or authored ontology was changed. All controls exist only in diagnostic scripts/workflow.

The existing `3 mm` anchor-separation bound remains a comparison convention inherited from the project regression evidence. It is not asserted as a universal final engineering tolerance.

## Question

The previous stage left a specific unresolved hypothesis:

> Is the difficult grounded horizontal-axis Bearing primarily failing because contact with the ground conflicts with the revolute motion, or would the same constraint fail under matched gravity/orientation even without contact?

The experiment deliberately separates:

1. axis orientation (`y` versus horizontal `z`);
2. zero gravity versus gravity-only with no ground;
3. real ground contact versus no ground / ground far outside reachable motion;
4. zero-friction normal contact versus product friction `0.8`;
5. settled contact versus dynamic drop impact;
6. passive impact versus driven contact.

A bounded relative-speed feedback command is used only as a repeatable stimulus. It is not a proposed source semantic and does not redefine authored Torque.

---

## A — direct environment discriminator

Fixtures use the starter topology, one Bearing, maximum diagnostic effort `1000 Nm`, targets `10` or `20 rad/s`, and compare 4 versus 24 substeps.

The 4-substep / 20 rad/s free-space condition already reaches about `3.39 mm`, so it is **confounded by the previously established numerical envelope** and is not used to claim contact causality.

The 24-substep controls are the clean causal slice because free-space remains well inside the comparison bound.

### 24 substeps, 10 s drive

| axis / target | neutral | gravity only | ground friction 0 | ground friction 0.8 |
|---|---:|---:|---:|---:|
| y / 10 rad/s | 0.176 mm | comparable safe | 0.177 mm | 0.279 mm |
| y / 20 rad/s | 0.715 mm | comparable safe | 0.715 mm | 0.430 mm |
| z / 10 rad/s | 0.176 mm | 0.192 mm | 2.411 mm | **3.581 mm RED** |
| z / 20 rad/s | 0.715 mm | 0.727 mm | **17.767 mm RED** | **20.111 mm RED** |

Before drive, the same grounded 24-substep fixtures settle with a transient maximum below about `1.7 mm`. The driven z-axis errors therefore are not merely carry-over from an already-broken settle.

At target `20 rad/s`, even **zero-friction ground contact** drives the horizontal-axis fixture to `17.767 mm`, while no-ground/gravity-only remain around `0.7 mm`. Friction can amplify or shift the boundary, but tangential friction is **not required** for the large RED.

The matched y-axis fixtures stay inside the bound under the same settled ground and stimulus. This falsifies the broad claim that ordinary grounded contact necessarily destroys all Bearings.

---

## B — matched-elevation / corrected far-ground discriminator

Dynamic drop tests initially used a `far ground` only 10 m below the normal plane. That control was discovered to be invalid: over the 5 s observation window, a freely falling body can reach it. Results from that original far-ground control are retained in the artifact for provenance but are **not used as evidence**.

A corrected control moved the comparison plane to `-1000.26 m`, beyond reachable motion in the test window. At 24 substeps, for all 12 matched combinations of axis, target and elevation:

> **no-ground and corrected far-ground produce identical measured maximum anchor error.**

This is strong evidence that merely adding a ground body to the world does not perturb the Bearing. Proximity/contact with the real ground is the discriminating variable.

### Horizontal z-axis, 24 substeps

| target | initial elevation | no ground | far ground | normal ground | first RED clearance |
|---:|---:|---:|---:|---:|---:|
| 10 | 0.1 m | 0.180 mm | 0.180 mm | 0.470 mm | — |
| 10 | 0.5 m | 0.182 mm | 0.182 mm | **6.934 mm** | ~4.67 mm |
| 10 | 2.0 m | 0.179 mm | 0.179 mm | **91.848 mm** | ~4.84 mm |
| 20 | 0.1 m | 0.718 mm | 0.718 mm | **25.229 mm** | ~4.42 mm |
| 20 | 0.5 m | 0.715 mm | 0.715 mm | **33.066 mm** | ~4.31 mm |
| 20 | 2.0 m | 0.716 mm | 0.716 mm | **58.672 mm** | ~4.18 mm |

Five of six horizontal-axis normal-ground pairs therefore change from a comfortably safe matched control (`~0.18–0.72 mm`) to RED solely when the real ground becomes reachable.

The first RED commonly occurs with a measured geometric clearance around `4–5 mm`, rather than after deep visual penetration. The evidence should therefore be described as **contact-proximity / contact-solver-region causality**, not as proof that visible overlap must occur first. Box3D may begin speculative/contact processing before the simple hull-corner clearance reaches zero.

---

## C — passive impact control

One y-axis drop condition also produced a large transient during the driven drop matrix. To avoid falsely attributing every drop failure to horizontal-axis geometry, the final discriminator removes actuation entirely.

At 24 substeps, ordinary gravity, product ground friction `0.8`, one Bearing and **no Torque patch / no actuator**:

| axis | drop height | max anchor error | verdict |
|---|---:|---:|---|
| y | 0.1 m | 0.202 mm | PASS |
| y | 0.5 m | **5.220 mm** | RED |
| y | 2.0 m | **9.375 mm** | RED |
| z | 0.1 m | 0.224 mm | PASS |
| z | 0.5 m | **5.214 mm** | RED |
| z | 2.0 m | **9.479 mm** | RED |

The near-equality between y and z passive-drop results is important. It establishes a second, more general mode:

> **sufficient contact impact alone can transiently stress Bearing anchor integrity, largely independent of hinge axis.**

This is distinct from the settled horizontal-axis problem, where the y-axis remains healthy but the driven z-axis accumulates large error after an already-safe settle.

---

## Combined verdict

**`CONTACT_SHOCK_AND_HORIZONTAL_HINGE_CONFLICT_CONFIRMED`**

The evidence supports two separate contact-coupled failure modes:

1. **General contact-impact shock.** A passive 0.5–2.0 m drop can exceed the current 3 mm Bearing anchor convention even at 24 substeps, and does so similarly for y and z axes.
2. **Sustained horizontal-hinge contact conflict.** After a safe settle, a driven horizontal z-axis Bearing can become strongly RED while matched y-axis and no-ground/gravity-only controls remain safe. Zero-friction ground contact is sufficient for strong failure at the higher stimulus.

This falsifies several tempting simplifications:

- **not gravity alone** — matched gravity-only z-axis controls remain safe at 24 substeps;
- **not merely the presence of a ground body** — corrected far-ground and no-ground controls match exactly;
- **not friction alone** — zero-friction normal contact can still produce severe horizontal-axis RED;
- **not a universal Bearing failure** — matched free-space and settled y-axis controls can remain well inside the comparison bound;
- **not only actuator runaway** — passive impact can produce RED without any actuator, and bounded moderate-speed horizontal motion can remain contact-coupled RED.

The evidence does **not** establish that Box3D is defective. It establishes that the current ANVIL geometry/runtime permits contact and revolute constraints to enter regimes where the existing solver configuration does not preserve the project's anchor-integrity convention.

## Product interpretation

The current grounded product can author a horizontal hinge between bodies resting directly on the floor. A physically meaningful rotation of those bodies may require one body to lift or sweep volume through the ground while the ground simultaneously imposes unilateral contact constraints.

That is qualitatively different from the y-axis spin fixture. Treating both situations as if they were merely `Bearing + more Torque` is therefore an incomplete machine model.

The grounded-world addition remains useful and real. Removing ground, reducing friction to zero, or globally hiding the conflict is not justified as a product correction.

## Routing boundary

The next separately selected stage should **not** return to generic Torque tuning or another substep sweep. The nearest upstream question is now whether an explicit machine reference/support arrangement can turn the same horizontal-axis mechanism into a coherent grounded machine without changing Bearing semantics.

A bounded next falsifier should use runtime-only experimental fixtures, not final ontology, and compare at least:

- the current two-dynamic-bodies-on-floor specimen;
- a disposable fixed/reference base with the hinge elevated enough for the moving body to clear the ground;
- the same reference arrangement with insufficient clearance as a control;
- free-space equivalent;
- passive impact separately from driven operation.

The goal would be to determine whether **support/reference + geometric clearance** is the missing mechanical condition, or whether horizontal-axis contact remains problematic even when the mechanism is physically well-posed.

Do not create final `Fixed Matter`, Anchor, Support or Motor source semantics until that discriminator earns them.

Numerical fidelity remains a likely component of any eventual product correction: 24 substeps gave a clean causal window here where free-space was reliable enough to expose contact effects. It is still not authorized as a product default until larger-mechanism/browser cost and the corrected machine geometry are qualified.

## Natural stop

Stop here.

Do not merge PR #45, change product substeps, add damping, lower friction, reinterpret Torque, create Motor ontology, implement support/fixed Matter, resume WER-1 or broadly redesign the UI by momentum.

This stage has answered its causal question. The next stage is a separate **Reference / Support Geometry Falsifier** if selected after regrounding from this evidence.
