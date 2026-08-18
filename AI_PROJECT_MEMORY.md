# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after ANVIL-03 promotion and workflow audit.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. current canonical documentation;
5. historical conversation/branches only as leads.

Resolve live `main`, branch and HEAD before significant work. Never let later documentation redefine which artifact the owner actually tested.

## Current accepted state

ANVIL-03 promotion commit:

`f2bb10b52577829c4c283933b3c6148dd55d1064`

Its final tested synthetic merge and actual merge had identical tree:

`3bc506275e6c197421c1c2e06385783eea9c67fd`.

Lean workflow foundation was then promoted through PR #8:

```text
source head       4b1f4509db0920a7c9a49a0e4f7805e613ec5031
synthetic merge   7e58c42b3083b1d836c9a21631908bca2a20f701
actual merge      2e02e9eeed6694410ecc217a4d4ecc9389c26506
tested/merged tree 607e94e339219eb95144e8f6b0cbda008d96d68c
Draft core run    32129414961 — PASS
Ready full run    32129452139 — core PASS + candidate PASS
candidate browser 17/17 PASS
candidate artifact 9321665576
```

The tested synthetic merge and actual workflow merge have identical Git tree.

Accepted stack on `main`:

- ANVIL-00 / COLLAPSE — owner accepted and promoted;
- laboratory foundation — promoted;
- ANVIL-01 / CUT — owner accepted and promoted;
- ANVIL-02 / BEARING — owner accepted and promoted;
- ANVIL-03 / REBIND — owner accepted and promoted;
- Forge V0.2.1 — automated-validated and successfully field-tested on REBIND;
- lean two-speed evidence workflow — promoted and self-validated.

There is no active ANVIL-04 branch at this grounding.

## Immutable ANVIL-03 owner-tested identity

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR checkout      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run      32085543984 attempt 1
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
Forge revision   v0.2.1-human-owner-copy
owner verdict    ACCEPT after 14 observed REBIND runs
owner env        Windows 10 / Chrome 151 / 1920x911 DPR1
```

External GitHub provenance handshake passed. Owner screenshot visibly supported the intended left-connected/right-separated state.

Do not replace this identity with later merge/documentation commits.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent can compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Machines should increasingly emerge from matter, local physical relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies, colliders, joints and solver objects are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology because one fixture passes.

## Accepted experiment stack — strongest claims

### ANVIL-00 / COLLAPSE

Persistent authored cells/material can deterministically compile into a coarser disposable rigid-body/collider representation. One authored edit changes compiled topology. Not dynamic state migration.

### ANVIL-01 / CUT

Owner-accepted bounded mass-preserving topology continuity:

`51 source cells / 1 body -> same 51 source cells / 2 bodies`.

Accepted rigid-field transfer for the declared fixtures:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

CUT does not prove arbitrary fracture, contact-manifold migration, in-place world mutation or relation migration.

### ANVIL-02 / BEARING

One experiment-local authored rotational interface, expressed through persistent source endpoints rather than Box3D IDs, can split one rigid island into two bodies plus a revolute relation. It keeps a shared pivot while allowing free relative rotation. A strong no-relation control and arbitrary common 3D transform both passed.

Do not infer generic relation ontology or universal frame entities.

### ANVIL-03 / REBIND

A persistent authored bearing can be re-derived onto the correct changed runtime body after a nearby mass-preserving CUT while moving.

Declared transaction:

```text
same 7 source cells
2 runtime bodies + 1 source bearing
          ↓ nearby CUT while moving
3 runtime bodies + same source bearing
bearing endpoint runtime body: body:a:0 -> body:a:2
```

C0 and arbitrary common-3D-transform C1 passed the same frozen tolerances. Exact owner candidate passed **31/31** Node/real-Box3D and **17/17** Chromium tests; owner accepted the visual behavior.

Strongest correct interpretation:

> persistent source provenance plus persistent authored bearing endpoints are sufficient to reconstruct the correct relation onto a changed disposable body decomposition for the declared moving fixtures while maintaining observable pose/velocity/pivot continuity and free relative rotation.

This is **semantic relation continuity**, not Box3D joint-state migration. REBIND creates fresh runtime bodies, fresh world and fresh revolute joint; internal warm-start/joint cache is not migrated.

## Current foundation boundary

Promoted neutral capabilities include:

- solver-neutral `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic current mass/COM/inertia-diagonal measurements;
- source-provenance lineage independent of runtime IDs;
- solver-neutral runtime observation/motion boundary;
- continuity measurements for pose/velocity/linear momentum/translational energy;
- fail-closed evidence primitives;
- the lean evidence workflow below.

Still **not** foundation:

- generic Bond/Joint/Constraint/Relation ontology;
- universal authored frames;
- custom contact laws;
- arbitrary fracture/damage/plasticity/debris;
- deformable/compliant matter;
- mechanism inference;
- power/control networks;
- vehicle-specific concepts;
- generic scene/entity framework.

## Lean Evidence Loop — mandatory default workflow

Read `docs/EXPERIMENT_PROTOCOL.md` and `AGENTS.md` for details.

### 1. Start with information gain

Before implementation:

- name one primary falsifiable question;
- compare plausible next experiments by information gain vs added complexity;
- choose the smallest **discriminating** fixture, not merely the smallest fixture that can pass;
- freeze material gates before looking at results where practical;
- include a control/falsifier when false-positive success is plausible.

Do not accumulate extra variants after a strong result unless they attack a live remaining assumption.

### 2. Draft PR = fast research loop

Open the experiment PR early as Draft.

Each Draft synchronization runs only the **core** evidence gate:

- canonical Node/npm;
- strict TypeScript;
- complete Node/real-Box3D regression suite;
- production build.

Do not run Chromium/Forge owner packaging on every solver iteration.

Experiment/foundation branch pushes are no longer a second CI path; the PR is the canonical integration context. This removes duplicate push + pull_request runs for the same commit.

### 3. Ready PR = candidate loop

Mark Ready only after the core hypothesis deserves product/runtime validation.

Ready runs:

- core gate;
- stages the exact build produced by core;
- separate candidate job downloads that exact staged build;
- Windows launcher self-test;
- real Chromium evidence;
- final Forge owner artifact.

Core and candidate are separate jobs so a browser/dependency problem cannot hide a completed solver result.

If deep research resumes, convert the PR back to Draft.

### 4. Owner gate is conditional

Owner validation is required only when human observation adds material evidence that automated classes A–D cannot establish efficiently.

For a deterministic, obvious A/B visual gate, default manual workload is roughly **3 meaningful observations**: one orienting run plus two repeats. More only for intermittent, probabilistic, subtle or subjective behavior, or if the owner wants additional confidence.

Forge primary UI must use plain language. SHA/schema/run/provenance and diagnostics are for the agent/report, not required owner reading.

### 5. Freeze owner candidate

Once an exact artifact is handed to the owner:

- freeze the experiment branch head;
- preserve source SHA, synthetic checkout, run, artifact and digest;
- do not append acceptance Markdown to that branch before promotion;
- do not silently rebuild and call the replacement equivalent.

On REJECT/INCONCLUSIVE, resume from a new commit while preserving the tested candidate as evidence.

On ACCEPT, prefer merging the **exact owner-tested source head**.

Before merge:

1. externally cross-check report/provenance live on GitHub;
2. confirm PR head is still the owner-tested SHA;
3. confirm `main` base still matches the tested synthetic checkout;
4. merge with expected-head protection;
5. compare tested synthetic-merge Git tree with actual merge tree.

### 6. Ground documentation after merge

Only after exact-head promotion:

- write/update owner acceptance record;
- update `AI_PROJECT_MEMORY.md`;
- record actual merge/tree identity.

Verified documentation-only grounding does **not** re-run unchanged solver/browser evidence. Do not recreate the old docs-grounded full-promotion cycle.

### 7. Documentation ownership

Avoid repeating the same evidence everywhere:

- preflight = question, fixture, frozen gates, non-claims;
- evidence log = executed technical results + meaningful negative evidence;
- owner-gate record = exact artifact + human verdict when needed;
- PR body = concise current verdict/summary;
- project memory = current accepted state, strongest boundaries and next decision.

Do not preserve every transient typo as scientific negative evidence; preserve failures that teach something about model, fixture, lowering, toolchain contract or owner workflow.

## Forge current boundary

Forge exists only to reduce owner-validation friction:

`agent evidence -> packaged build -> double-click launcher -> simple visual decision -> generated technical report -> agent verifies provenance live`.

Do not build a universal Forge hub/plugin/DSL/backend now. Future improvements must be earned by real ANVIL owner gates.

Forge V0.2.1 successfully corrected the jargon-heavy BEARING owner flow and passed its first real field trial on REBIND. One successful consumer is not proof of universal usability.

## Next research decision

ANVIL-03 is complete. Do not continue REBIND merely by adding repetitions.

Highest-value next falsifiers:

1. **loaded relation continuity** — reconstruct the bearing while it carries a meaningful external/contact/constraint load, directly attacking the biggest remaining continuity assumption;
2. **local actuation/function** — add the smallest experiment-local authored torque/actuation intent to an already-earned bearing, beginning active Machine Matter without a generic power/control network.

Current preference remains **loaded relation continuity first**. It tests the weakest remaining assumption before active machine semantics are layered on top. If it survives, local actuation is the cleaner next step.

Do not combine both in the first falsifier.
