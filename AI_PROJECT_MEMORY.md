# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-20.

Accepted scientific truth is through **ANVIL-10 / TORQUE-PATCH-REBIND**. **Epoch I (ANVIL-00…10) is closed.** No ANVIL-11 is active.

**W0 / Physical Fabric Workbench v0 design is complete once PR #20 is merged.** It selected **B0 / post-rebind activation specimen**. W1 implementation is selected but not active; it must begin on a new integration branch/PR after cold verification of the merged W0 contract.

Live Git overrides this memory. If PR #20 is still open, finish/reconcile W0 before treating the post-merge state below as live.

## Authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

1. live Git/code and executable evidence;
2. direct owner validation when genuinely required;
3. `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md` verified against live Git;
4. this memory and canonical docs;
5. conversation/donor history only as leads.

ANVIL investigates persistent authored Machine Matter / Physical Fabric meaning compiling into disposable runtime representations. Runtime Box3D bodies/joints/actions are interpretations, not construction identity. Cubic cells remain a laboratory dialect, not final ontology.

## Accepted capability stack — Epoch I

- **ANVIL-00 / COLLAPSE** — persistent matter → reduced rigid runtime representation.
- **ANVIL-01 / CUT** — bounded mass-preserving topology replacement with source identity and rigid-field transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface → passive revolute relation.
- **ANVIL-03 / REBIND** — persistent BEARING semantics reconstructed onto changed disposable bodies.
- **ANVIL-04 / LOAD-REBIND** — bounded loaded reconstruction without joint-cache migration or gross first-step shock.
- **ANVIL-05 / TORQUE** — signed persistent active intent creates causal work through BEARING without authored Box3D motor semantics.
- **ANVIL-06 / TORQUE-PATCH** — local source-face placement resolves existing BEARING without authored `bearingId`.
- **ANVIL-07 / ELASTIC-SEAM** — one frozen local compliant seam deforms and restores.
- **ANVIL-08 / COMPLIANCE-RESOLUTION** — frozen area-normalized 1D compliance survives exact 2× authored refinement without per-patch retuning.
- **ANVIL-09 / ACTIVATE** — runtime-only OFF/ON/OFF activation; OFF adds no active torque; fresh runtime defaults OFF.
- **ANVIL-10 / TORQUE-PATCH-REBIND** — unchanged persistent local TORQUE-PATCH can be re-lowered after CUT onto the rebound BEARING/current body; stale action binding is rejected; fresh action acts through the correct new endpoint without acting on stale sibling.

Exact claims and negative evidence live under `docs/experiments/`.

## ANVIL-10 accepted boundary

```text
frozen preflight        d89f001705a8b80da822792ecef24e30af31ac89
A/B source/run          4be76be143a93acc13c45842218d5efa4e1dfe4a / 32199521910
C0-C2 source/run        a448167642d0fd2435d44b8efc42f972fdac698a / 32199721488
Ready source/run        c173a6d336f3917bbd8ef74e1fb2f2118ffc6d20 / 32199826901
Ready synthetic merge   94015244dc854ff03210eaa9fc6b459ac61ceb9d
qualified tree          6cbfede282e2d9243634d5d73d0c2dfd74df269f
material merge           ffde8c0babdd473454b3e769cb10fd31537a0c70
evidence grounding       ba7ce2dc67c6f7aa936e20a0294d9cc12208a549
```

Frozen discriminator: ACTIVE-vs-OFF final relative-speed advantage `5.955601841211319 rad/s` versus minimum `0.25 rad/s`; stale sibling angular and linear deltas were both zero.

Supported interpretation: **persistent semantic re-lowering across changed disposable representation**, not persistence/migration of `TorqueActionPlan`, activation state or solver state.

Not earned generically: FUNCTION, Control/Signal, Surface, generic invalidation, command migration, representation independence or foundation promotion of BEARING/TORQUE-PATCH/ACTIVATE/REBIND.

## Epoch I closure

```text
C1 truth/governance merge bd1e1a61f1fe1bc2c6dae38c86c95b587e935e30
C2 infrastructure merge   4f3cec42424ef4b70ad1992af21ec3a2b1a2d6e0
C3 repository merge       5aaa5eca256bf64f83fa7949f05d29db25b894e8
C4 closure merge          56993324c636e55607b18059ada4e33153d263be
Q0 / C3 tree              870a5b416c262eefbee13b817636a9246afb0378
Q0 run                    32372701068
```

Q0: 29 automatically discovered Node test files, 53/53 Node + real-Box3D PASS, production build PASS, launcher PASS and 19/19 Chromium PASS. Whole-project regression/transport evidence only.

Residual process debt: no server-side `main` protection; deletion-safe historical refs remain. Expected-head/path audits remain mandatory.

## Workbench W0 — accepted B0 design

Authority order:

1. `docs/workbench/W0-FINAL-SCOPE.md` — exact W1 implementation contract;
2. `docs/workbench/W0-ADVERSARIAL-REVIEW.md` — narrowing evidence;
3. `docs/workbench/W0-VERDICT.md` — acceptance logic;
4. `docs/workbench/W0-DESIGN-GATE.md` — initial provisional design only where not contradicted later.

W0 compared:

- A / passive topology — fallback; too close to existing ANVIL-03 owner gate.
- B / original active topology — **rejected** because pre-CUT torque and arbitrary CUT timing could feed unqualified dynamic states into CUT/REBIND.
- **B0 / post-rebind activation — accepted.**
- C / compliance-resolution — deferred as a separate possible later specimen.

### B0 exact story

```text
AUTHORED
Matter + one BEARING + one local TORQUE-PATCH

PRE-CUT
known moving passive state
→ deterministic CUT READY
→ no pre-CUT torque activation

OWNER
execute one accepted nearby CUT

TRANSACTION
old runtime discarded
motion transferred
2 bodies → 3 bodies
same persistent BEARING reconstructed
same persistent TORQUE-PATCH re-lowered
fresh post-CUT runtime/action starts OFF

OWNER
activate torque

OBSERVATION
bounded active window
causal work through rebound endpoint
stale sibling not part of fresh action binding
```

B0 does **not** demonstrate that active behavior survived through CUT. Persistent source meaning survives/rebinds; a **fresh** compiled action derived after the transaction can act correctly.

## Frozen W1 boundary

W1 may implement only:

- one frozen authored fixture;
- one persistent BEARING;
- one persistent TORQUE-PATCH with frozen effort;
- **AUTHORED MATTER / RUNTIME INTERPRETATION / BOTH** views;
- deterministic progression to CUT READY;
- one marked accepted CUT;
- explicit 2 → 3 runtime decomposition;
- BEARING reconstruction;
- same-source TORQUE-PATCH re-lowering;
- fresh post-CUT runtime OFF;
- one bounded post-CUT activation/observation;
- optional background OFF control / technical provenance reveal;
- reset;
- bounded Workbench-specific controller/rendering/glue/tests.

W1 must not add pre-CUT torque activation, arbitrary CUT timing/location, active-during-CUT, action/activation/solver-state migration, torque scaling/editor semantics, indefinite owner control presented as accepted behavior, gravity/contact/load/compliance composition, generic `FabricRuntime`, generic Relation/Entity/Component/FUNCTION/Control/Signal/Surface/Power architecture, or foundation promotion for integration convenience.

Any required forbidden item is a STOP/reclassification point.

## Owner Reality Gate

First-pass observation must precede detailed technical explanation. The owner should say what remained the same, what changed, where torque meaning appears to live, and what they expect after activation. Then technical reveal may show source IDs, body decomposition, rebound bearing provenance, fresh action binding and control diagnostics.

Verdict classes:

- **VALUE SIGNAL**;
- **LEGIBLE BUT SCRIPTED**;
- **NO VALUE SIGNAL**.

All are integration evidence only. `LEGIBLE BUT SCRIPTED` should point toward authorship/locality/editing/emergence investigation rather than automatic primitive accumulation.

## Next action after W0 merge

1. Resolve live `main` and open PRs; verify PR #20 is merged and no W1 implementation is already active.
2. Read the merged `W0-FINAL-SCOPE.md`, adversarial review and verdict.
3. Create a new W1 integration branch/PR.
4. Implement B0 only; do not resurrect freedoms rejected by W0.
5. Preserve Draft/core → Ready/candidate validation, and keep browser/owner evidence separate from scientific promotion.

Do not create ANVIL-11 by inheritance.
