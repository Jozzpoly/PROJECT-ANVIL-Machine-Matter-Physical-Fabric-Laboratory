# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after strategic audit following ANVIL-05 / TORQUE.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. current canonical documentation;
5. historical conversation/donor documents only as leads.

Before material work resolve live `main`, open PRs/branch and exact HEAD. After an interrupted connection, verify live state before writing anything.

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime representations. Runtime bodies, colliders and joints are interpretations, not construction identity.

Long-horizon direction: author/paint local **matter, bindings, interfaces and functions** rather than conventional ready-made machine parts. Those categories are research vocabulary, not frozen ontology and not direct aliases for Box3D objects. The current cubic-cell dialect is temporary.

Read `docs/RESEARCH_COMPASS.md` before selecting a new major falsifier. It contains the macro anti-drift loop and current frontier map.

## Live accepted stack

- **ANVIL-00 / COLLAPSE** — persistent matter compiles into reduced rigid representation.
- **Foundation** — neutral spatial/motion/provenance/evidence/process boundaries.
- **ANVIL-01 / CUT** — bounded mass-preserving topology replacement with rigid-field motion transfer.
- **ANVIL-02 / BEARING** — a local authored rotational interface derives two rigid islands + passive revolute relation.
- **ANVIL-03 / REBIND** — persistent bearing semantics reconstruct onto changed disposable bodies after nearby CUT while moving.
- **ANVIL-04 / LOAD-REBIND** — bounded cold rebind immediately resumes the declared multi-kN constraint load without migrating joint cache.
- **ANVIL-05 / TORQUE** — signed persistent active intent creates causal mechanical work through BEARING via equal/opposite body torques without Box3D joint motor mode.
- **Forge V0.2.1** — conditional owner-validation transport.
- **Lean Evidence Loop** — Draft/core and Ready/candidate exact-build workflow.

## Strong continuity spine

CUT bounded transfer:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

BEARING uses persistent cell-face endpoints + free axis, not Box3D IDs. REBIND proved semantic relation continuity on a nearby moving CUT; fresh runtime bodies/world/joint are created.

Immutable owner-tested REBIND identity:

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

Key C1 load values:

```text
old joint force          2551.6168 N
fresh first-step force   2527.2393 N
first-step gap           0.0002455 m
position jump            7.24e-9 m
velocity jump            1.61e-8 m/s
control gap              16.3315 m
```

Interpretation: the bounded 2.5 kN fixture does not require migration of hidden Box3D joint warm-start/cache state. Do not generalize this to arbitrary loads, impacts, contacts or loops.

## ANVIL-05 / TORQUE — strongest boundary

Experiment-local source:

```text
TorqueMark {
  id
  bearingId      // persistent authored bearing identity
  effortNm
}
```

Lowering for bearing axis `a`:

```text
tau_A = -T * a
tau_B = +T * a
```

Runtime keeps a passive revolute relation and calls `b3Body_ApplyTorque`; authored source does not encode joint motor mode or runtime IDs.

C0 after 60 steps:

```text
+100 N*m: angle +1.341995 rad; speed +2.067048 rad/s; gap 0.049 mm
   0 N*m: angle ~0;          speed ~0
-100 N*m: angle -1.435700 rad; speed -2.223932 rad/s; gap 0.057 mm
max linear momentum 0.000192 kg*m/s
max barycenter drift < 9e-8 m
```

Historical red run `32137053186` was a representation-only test defect (`-0` versus `+0` in deep equality). The physical C0 already passed. Runtime and frozen thresholds were unchanged; the test was corrected to zero vector magnitude.

Promoted identity:

```text
source head        9ed7623df32ca30c147a585b43e43d008c772508
base main          3b422cd7e085c656cc2f91f3a60ca08be5ec1c8f
synthetic merge    49f145a56c5c9aee7ad73017eeca89548055cee1
actual merge       aee8b210758be82b1cfefe8d8ac2fb3ca94d27c6
tested/merged tree 482cb40ac131fc16b22fba72eb0ed202a63d38ee
Ready run          32137653388
Node               37/37 PASS
Chromium           19/19 PASS
staging artifact   9324599263 / 2f3a1760e8df2375b877c869a4149c879be1c57efa5a4bdaf3f6a23945c1e134
final artifact     9324665656 / 28ea22c513d741b4224c3deb32ee99bac03a044f8808e5096aae35158a29e602
```

Correct bounded interpretation:

> ANVIL has its first active Machine Matter result: persistent signed physical intent can compile through an existing mechanical relation into controlled runtime work without encoding a solver motor in authored source.

Not established: generic FUNCTION/device ontology, power/energy systems, signals/control, servo behavior, arbitrary orientation, contact actuation or actuation through runtime rebuild.

## Strategic audit after ANVIL-05

The accepted evidence is technically healthy, but there is an architectural risk:

`TorqueMark` directly references persistent `bearingId`.

This is **not a runtime-ID leak** and does not invalidate ANVIL-05. However, if higher layers are built on this pattern unchecked, ANVIL can drift back toward a conventional semantic component graph: named things connected to named things, rather than local physical properties composing through matter/topology.

This risk is more urgent than adding transient control semantics.

Current frontier imbalance:

- MATTER: thin but supported;
- BINDINGS: major open frontier beyond rigid adjacency/CUT;
- INTERFACE: bearing comparatively well developed;
- FUNCTION: first torque slice supported, locality debt open;
- CONTROL/SIGNAL/POWER: unearned;
- SURFACE: mostly open;
- TOPOLOGY/CONTINUITY: comparatively strong bounded spine;
- ADAPTATION/NON-GRID representation: open.

## Current selected next experiment

**ANVIL-06 / TORQUE-PATCH**.

Primary question:

> Can active torque be authored as a local persistent source-face property with no authored `bearingId`, then deterministically discover the already-earned BEARING through locality/topology and fail closed when painted on a non-bearing face?

Candidate experiment-local source:

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
- generic FUNCTION/device schema;
- command/signal/power concepts.

Required properties:

1. valid bearing-face patch resolves deterministically;
2. non-bearing-face patch is rejected instead of guessed;
3. source ordering/bearing endpoint ordering does not change meaning;
4. compiled output may contain derived bearing/runtime IDs, authored source may not;
5. real Box3D end-to-end signed torque behavior remains causal.

Do not combine ACTIVATE, CUT/REBIND, multiple bearings or generic FUNCTION architecture into ANVIL-06.

After TORQUE-PATCH, rerun the macro compass. Current likely candidates are:

- **ELASTIC-SEAM** — first local compliant binding, opening the weakest major physical frontier;
- **ACTIVATE** — separate persistent capability from transient command.

No fixed roadmap is authoritative; information gain and anti-lock-in risk decide.

## Process discipline

Per-experiment: `docs/EXPERIMENT_PROTOCOL.md`.

Macro direction: `docs/RESEARCH_COMPASS.md`.

Before each new major falsifier:

1. live truth lock;
2. state vision delta from previous result;
3. run anti-component-drift check;
4. inspect frontier balance;
5. compare at least two next experiments by information gain / vision alignment / lock-in reduction / discriminability / cost / composition value;
6. freeze adversarial preflight before results;
7. run Draft/core → Ready/candidate;
8. ground exact supported evidence after promotion;
9. after 2–3 primitives, force a composition checkpoint instead of endlessly adding vocabulary.

Forge owner validation remains conditional: use it only when human observation adds material evidence beyond automated classes A–D.
