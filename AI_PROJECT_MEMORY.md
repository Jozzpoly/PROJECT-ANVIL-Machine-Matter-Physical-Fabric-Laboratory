# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after ANVIL-06 promotion, ANVIL-07 pre-C0 capability/hardening, and deliberate cold-handoff preparation.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. current canonical documentation;
5. historical conversation/donor documents only as leads.

Before material work resolve live `main`, open PR/branch and exact HEAD. After interruption, verify live state before writing anything.

For a new conversation, read and independently verify `docs/CURRENT_HANDOFF.md` before continuing the active experiment.

ANVIL tests **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime representations. Runtime bodies/colliders/joints are interpretations, not construction identity.

Long-horizon direction: author/paint local **matter, bindings, interfaces and functions** rather than conventional ready-made parts. These categories are research vocabulary, not frozen ontology. The cubic-cell dialect is temporary.

Read `docs/RESEARCH_COMPASS.md` before selecting any new major falsifier.

## Accepted stack

- **ANVIL-00 / COLLAPSE** — persistent matter -> reduced rigid runtime.
- **Foundation** — neutral spatial/motion/provenance/evidence/process boundaries.
- **ANVIL-01 / CUT** — bounded mass-preserving topology replacement with rigid-field transfer.
- **ANVIL-02 / BEARING** — local authored rotational interface -> two rigid islands + passive revolute relation.
- **ANVIL-03 / REBIND** — persistent bearing semantics reconstruct after nearby moving CUT.
- **ANVIL-04 / LOAD-REBIND** — bounded cold rebind resumes declared multi-kN constraint load without migrating joint cache.
- **ANVIL-05 / TORQUE** — signed persistent active intent -> equal/opposite runtime body torques through passive BEARING, without joint motor mode.
- **ANVIL-06 / TORQUE-PATCH** — local source-face active intent resolves BEARING without authored `bearingId`; invalid placement fails closed and accepted TORQUE physics is preserved.
- **Forge V0.2.1** — conditional owner-validation transport.
- **Lean Evidence Loop** — Draft/core and Ready/candidate exact-build workflow.
- **Research Compass** — macro anti-drift/frontier validation loop.

## Active experiment / cold-handoff checkpoint

Latest accepted **material/code** checkpoint before handoff documentation:

```text
accepted material checkpoint  e236f6a8b00858fa4d35f4fc32189f78b9cb33b2
accepted through              ANVIL-06 / TORQUE-PATCH
```

The handoff preparation intentionally adds documentation-only commit(s) on top of that material checkpoint. A new conversation must resolve live `main` and verify the delta back to `e236...` rather than assuming a fixed handoff-document SHA.

Active unaccepted work at handoff preparation:

```text
PR                #12
branch            experiment/anvil-07-elastic-seam
base              e236f6a8b00858fa4d35f4fc32189f78b9cb33b2
head              af93a116ab59bf4d32ac58956cd9a719b86175cc
state             OPEN / DRAFT
```

**Do not confuse ANVIL-07 capability PASS with ELASTIC-SEAM physics support.** There is no semantic/compiler/runtime C0 implementation yet.

ANVIL-07 currently contains only:

- original frozen preflight at `c7006b4f63a85ba36fb67af70460149866bb5527`;
- exact `box3d.js@0.0.2` weld-spring capability test at source `58c4580702d4604f2effcdc501cde09d796becea`;
- Draft/core run `32151014026`: 40/40 PASS + production build PASS;
- docs-only pre-C0 amendment at `af93a116ab59bf4d32ac58956cd9a719b86175cc`;
- hardening run `32159805481`: SUCCESS.

The amendment adds endpoint/source-order invariance, bounded validity of the reduced-mass conversion, exact fixture calibration, anti-hidden-help requirements and mandatory diagnostics without loosening any original threshold.

Next exact work after cold takeover: implement the experiment-local `RIGID / ELASTIC / FREE` C0 according to both ANVIL-07 preflight files. Keep PR #12 Draft. Do not add browser/Forge/owner ceremony, breakage/plasticity/TORQUE/ACTIVATE/contact complexity, or generic Bond architecture before C0 resolves.

Canonical takeover source: `docs/CURRENT_HANDOFF.md`.

## Continuity spine

CUT bounded transfer:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

BEARING uses persistent source face endpoints + free axis, not Box3D IDs. REBIND creates fresh runtime bodies/world/joint and proves semantic relation continuity on its bounded moving fixture.

Immutable owner-tested REBIND:

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR checkout      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run      32085543984
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
owner verdict    ACCEPT
```

ANVIL-04 strongest identity:

```text
source head        88844f874ba64932418331c3c0a996a33490d85a
actual merge       2dfac4c79e7c12be2795e87bb5d51c12fc29e231
tested/merged tree e5a311462772c29c26074d9d92ec9041ef5db94e
Ready run          32135764502
Node               34/34 PASS
Chromium           18/18 PASS
```

C1 load: old joint ~2551.6 N, fresh first-step ~2527.2 N, first-step gap 0.2455 mm, control gap 16.33 m. Bounded interpretation only; no arbitrary contacts/loops/load claim.

## ANVIL-05 / TORQUE

Experiment-local source:

```text
TorqueMark { id, bearingId, effortNm }
```

Lowering for bearing axis `a`:

```text
tau_A = -T * a
tau_B = +T * a
```

C0 at 60 steps:

```text
+100 N*m: angle +1.341995 rad; speed +2.067048 rad/s; gap 0.049 mm
   0 N*m: angle ~0;          speed ~0
-100 N*m: angle -1.435700 rad; speed -2.223932 rad/s; gap 0.057 mm
max linear momentum 0.000192 kg*m/s
max barycenter drift < 9e-8 m
```

Historical red `32137053186` was only IEEE `-0/+0` deep-equality representation defect. Physical C0 already passed; runtime/thresholds unchanged.

Promoted identity:

```text
source head        9ed7623df32ca30c147a585b43e43d008c772508
actual merge       aee8b210758be82b1cfefe8d8ac2fb3ca94d27c6
tested/merged tree 482cb40ac131fc16b22fba72eb0ed202a63d38ee
Ready run          32137653388
Node               37/37 PASS
Chromium           19/19 PASS
```

## ANVIL-06 / TORQUE-PATCH

Strategic purpose: attack semantic component drift exposed by ANVIL-05's authored `bearingId` reference.

Experiment-local source:

```text
TorquePatch {
  id
  target: { cellId, face }
  effortNm
}
```

Authored patch has no bearing/body/joint ID. Compiler validates local source target, matches exactly one BEARING endpoint, derives persistent bearing identity only in compiled output, and then reuses accepted TORQUE lowering. Non-bearing face must fail closed rather than select the only bearing by convenience.

Preflight identity:

```text
preflight head      5be6811de1c20558c03e397c250b1c045c25b85b
```

Supported A/B/C source:

```text
source head         f776c1a385da73044cdbe235e470d3dc196f2844
Draft/core run      32149358539
Node                39/39 PASS
production build    PASS
```

Key semantic evidence:

- `a:2@x+` -> `bearing:seam-0`;
- non-bearing `a:2@x-` rejects;
- unknown cell/invalid face/blank id/non-finite effort reject;
- source-cell order and bearing endpoint declaration order do not change meaning;
- resolved action equals accepted ANVIL-05 physical action.

Real Box3D C0 reproduces ANVIL-05 exactly:

```text
+100 N*m: +1.341995 rad / +2.067048 rad/s
0 N*m:    ~0 / ~0
-100 N*m: -1.435700 rad / -2.223932 rad/s
```

Ready candidate was used as whole-product **regression evidence**, not mislabeled as direct TORQUE-PATCH Class D:

```text
Ready run           32149627579
base main           de1b25174ec651f7457eb425a642d813c80448fb
synthetic merge     3c5f131bc64dc549b0a7c2ead78e364d9e4ad602
actual merge        68f68104734084e0e284c77776a42e954e783d4d
tested/merged tree  0bcae0e8188b74ffc21861bd8968fba2c3cde071
Node                39/39 PASS
existing Chromium   19/19 PASS
launcher            PASS
staging artifact    9329190928 / 9aa8b610604746f9a19a212caf172f7a5912cf46b22bed555f4d6c4a768234b1
final artifact      9329240948 / f8cf4062cd1e118baa1f215c877bc5bb077cacebf173f8d8a5ccfaec0af88a15
```

Synthetic and actual merge trees are identical.

Correct bounded interpretation:

> For the single-bearing fixture, active intent can be locally painted on a persistent source face, resolve the existing mechanical interface without an authored cross-component reference, fail closed off-interface, and preserve the accepted TORQUE behavior.

This reduces component-graph drift risk but does not prove a generic local-property system, multiple-bearing inference, fields, control, power, REBIND actuation or non-grid matter.

Detailed record: `docs/experiments/ANVIL-06-TORQUE-PATCH-EVIDENCE.md`.

## Frontier after ANVIL-06

- **MATTER:** thin but real; current material model mostly density/friction.
- **BINDINGS:** largest core gap by current strategic audit; effectively rigid adjacency or separation/interface split only.
- **INTERFACES:** bearing comparatively mature for one bounded slice.
- **FUNCTION:** torque + local placement now supported in one bounded slice.
- **CONTROL/SIGNAL/POWER:** unearned.
- **SURFACE:** mostly open.
- **TOPOLOGY/CONTINUITY:** comparatively strong bounded spine.
- **ADAPTATION/NON-GRID:** open.

The statement that BINDINGS is the largest gap is a strategic ranking, not an experimentally proven fact. It selected ANVIL-07 because ELASTIC-SEAM opens a new physical category after two FUNCTION experiments, not because ACTIVATE became invalid.

**Selected active direction: ANVIL-07 / ELASTIC-SEAM.**

ACTIVATE remains high priority after the binding frontier has at least one earned non-rigid slice or when a composition experiment explicitly needs command state.

## Process discipline

Per-experiment: `docs/EXPERIMENT_PROTOCOL.md`.
Macro direction: `docs/RESEARCH_COMPASS.md`.
Cold takeover: `docs/CURRENT_HANDOFF.md`.

Before each new major falsifier:

1. live truth lock;
2. state vision delta;
3. anti-component-drift check;
4. frontier balance;
5. compare at least two candidates by information gain / vision alignment / lock-in reduction / discriminability / cost / composition value;
6. adversarial preflight before results;
7. Draft/core -> Ready/candidate;
8. exact-head promotion and docs-only grounding;
9. after 2–3 primitive/frontier results, force a composition checkpoint.

Forge owner validation is conditional and used only when human observation adds material evidence beyond automation.