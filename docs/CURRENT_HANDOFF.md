# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 TORQUE-PATCH-REBIND ACCEPTED / POST-PROMOTION MACRO AUDIT COMPLETE / NO ACTIVE EXPERIMENT**

Live Git and executable evidence override this pointer if they differ.

## Start here

1. Resolve live `main` before writing.
2. Accepted material truth is through **ANVIL-10 / TORQUE-PATCH-REBIND**.
3. Material checkpoint: `ffde8c0babdd473454b3e769cb10fd31537a0c70`.
4. Canonical evidence: `docs/experiments/ANVIL-10-TORQUE-PATCH-REBIND-EVIDENCE.md`.
5. Evidence grounding: `ba7ce2dc67c6f7aa936e20a0294d9cc12208a549`.
6. No experiment, PR or branch is active.
7. The post-promotion macro audit selected **TORQUE-PATCH-REPRESENTATION** as the leading strategic candidate, but it is **not frozen and not active**.

## Accepted ANVIL-10 result

ANVIL-10 supports only this bounded statement:

> For the frozen single-bearing moving fixture, one unchanged persistent local TORQUE-PATCH can be re-lowered onto the rebound BEARING after a nearby CUT; a valid-looking stale pre-CUT action is rejected even though its old body ID still exists, and the fresh post-CUT action produces causal ON-vs-OFF torque through the correct new endpoint body without acting on the stale sibling.

The key architectural consequence is **re-lowering, not migration**: persistent local active meaning survives this bounded topology rebuild, while `TorqueActionPlan` remains disposable compiled representation.

Promotion identity:

```text
frozen preflight        d89f001705a8b80da822792ecef24e30af31ac89
A/B source/run          4be76be143a93acc13c45842218d5efa4e1dfe4a / 32199521910
C0-C2 source/run        a448167642d0fd2435d44b8efc42f972fdac698a / 32199721488
Ready source            c173a6d336f3917bbd8ef74e1fb2f2118ffc6d20
Ready run               32199826901
Ready base              b825002141d30cf2190ae3475b94020f261fc8dd
Ready synthetic merge   94015244dc854ff03210eaa9fc6b459ac61ceb9d
qualified tree          6cbfede282e2d9243634d5d73d0c2dfd74df269f
actual material merge   ffde8c0babdd473454b3e769cb10fd31537a0c70
evidence grounding      ba7ce2dc67c6f7aa936e20a0294d9cc12208a549
```

Actual material merge tree equals the Ready-qualified tree exactly.

Ready qualification: 53/53 Node PASS + production build PASS + exact staged artifact consumed + launcher self-test PASS + 19/19 Chromium regression PASS. Launcher/Chromium are whole-product regression evidence, not direct ANVIL-10 scientific evidence.

## Post-ANVIL-10 macro verdict

### Vision delta

ANVIL now has bounded evidence that one persistent local active semantic can survive a disposable runtime topology change without making compiled body binding persistent truth. The remaining lock-in is one level higher: the local semantic still depends on the current authored `cellId@face` dialect.

### Leading candidate — TORQUE-PATCH-REPRESENTATION

Primary intended question, still to be critically designed:

> Can the same physical local torque meaning be expressed and resolved across a deliberately different authored source representation/resolution without preserving `cellId@face` as semantic identity, without manual runtime-ID retargeting and without making torque scale accidentally with source patch count?

Why this leads:

- directly attacks the Research Compass rule that cells are a dialect, not ontology;
- challenges an already-earned active semantic rather than opening another isolated primitive;
- ANVIL-08 demonstrates that authored-resolution/runtime-resolution decoupling is possible for bounded compliance, but does not prove it for active function;
- consequence is high: if TORQUE-PATCH only survives while source cell identity remains fixed, active Machine Matter is still representation-locked.

### Critical design problem before preflight

Do **not** assume that refined faces each inherit `+100 N*m`, or that torque must be area-normalized. Those are different physical meanings.

Before freezing an experiment, define one representation-independent physical localization/effort contract that makes coarse and refined authored sources genuinely equivalent. Prefer a design that tests physical locality rather than introducing a generic function-field ontology.

### Alternatives re-ranked

**CONTROL-REBIND** — valuable later, but one-action carry-over is nearly tautological; making it discriminating would likely require multiple targets/addressing and therefore introduce routing at the same time.

**SURFACE / local traction** — major underexplored frontier and a strong later candidate, but opens new vocabulary before resolving the remaining authored-representation lock-in of an already-earned active semantic.

**ACTIVE-DURING-REBIND** — useful stress/hardening question, but lower frontier information gain after LOAD-REBIND and TORQUE-PATCH-REBIND.

**FUNCTION × COMPLIANCE** — still confounded by rotational/distributed modes not earned by the frozen 1D compliance model.

## Exact next action

Critically design a bounded **TORQUE-PATCH-REPRESENTATION preflight only** before implementation.

The design should first answer:

1. what physical local target remains the same when source cells/refinement change;
2. what `effort` quantity remains physically equivalent across those representations;
3. how coarse/fine authored sources can differ materially enough to prove this is not preserved-ID bookkeeping;
4. what wrong-scaling or manual-retarget control would expose a false-positive success;
5. which structural and real-solver gates are needed without inventing a generic field architecture.

Do not create/activate ANVIL-11 until that design survives adversarial review.

## Do not do now

- no ANVIL-10 command migration, active-during-CUT, load/contact, transform, multiple-action, compliance or UI extension;
- do not treat compiled torque actions as persistent/migrated state;
- no generic FUNCTION/Control/Signal/Port or action-cache architecture;
- no foundation promotion from ANVIL-10 alone;
- do not start CONTROL-REBIND merely because it was previously on the horizon;
- do not copy `effortNm` onto every refined face or area-normalize it without a justified physical contract;
- do not treat `cellId@face` as final Machine Matter ontology.

## Stable project documents

- `AGENTS.md` — truth hierarchy and orchestration cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift method.
- `docs/FOUNDATION.md` — accepted reusable boundaries only.
- `AI_PROJECT_MEMORY.md` — concise capability/architecture index + current strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.
