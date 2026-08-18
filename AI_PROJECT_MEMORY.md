# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-18. Accepted material truth is through **ANVIL-07 / ELASTIC-SEAM**. **ANVIL-08 / COMPLIANCE-RESOLUTION** is now the active Draft falsifier; its preflight is frozen and no executable ANVIL-08 result exists yet.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and executable evidence;
2. direct owner validation when required;
3. `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` as checkpoint claims verified against live Git;
4. this memory and canonical project documentation;
5. historical conversation/donor documents only as leads.

ANVIL tests **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime representations. Runtime bodies, colliders and joints are interpretations, not construction identity. The current cubic-cell dialect is a laboratory dialect, not final ontology.

## Accepted capability stack

- **ANVIL-00 / COLLAPSE** — persistent matter can compile into reduced rigid runtime representation.
- **ANVIL-01 / CUT** — bounded mass-preserving runtime topology replacement with source identity and rigid-field motion transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface can derive two rigid islands plus a passive revolute relation.
- **ANVIL-03 / REBIND** — persistent bearing semantics can be reconstructed onto changed disposable runtime bodies after a nearby moving CUT.
- **ANVIL-04 / LOAD-REBIND** — bounded loaded reconstruction without migrating Box3D joint cache and without gross first-step shock.
- **ANVIL-05 / TORQUE** — signed persistent active intent can create causal mechanical work through BEARING without authored Box3D motor semantics.
- **ANVIL-06 / TORQUE-PATCH** — local source-face placement can resolve the existing BEARING without an authored bearing reference.
- **ANVIL-07 / ELASTIC-SEAM** — for one frozen seven-cell one-dimensional fixture, a persistent local compliant seam can replace rigid adjacency, compile into disposable runtime representation, deform under load and restore after unload while remaining distinct from RIGID and FREE controls.

Exact metrics/artifacts remain in experiment evidence files.

## Latest accepted promotion identity

ANVIL-07:

```text
promoted source head  a34a769e4892bb5a3c117389af7c2bba47866623
Draft/core hardening   32188332165
Ready run              32188493917
Ready synthetic merge  c206a008458e2a244bf65663f0c11705a1d1c948
Ready/merge tree       d9833ba637f11c11ca7f01f67924b128191e1ada
actual material merge  62dcc651f73dc3f228109d3d8922afd534b75950
evidence log commit    97ab4d72475ae3d15ae79a496cb7bdb6689c952f
```

ANVIL-07 remains bounded. Its discrete `normalStiffnessNPerM` / `normalDampingNsPerM` coefficients are not accepted as resolution-independent constitutive properties.

## Strongest architectural lessons

- Authored identity must remain separate from runtime body/joint identity.
- Runtime representation may have different topology/resolution from authored matter.
- Locality should resolve physical relationships when geometry genuinely supplies the missing meaning.
- Box3D is a lowering target, not ontology.
- Passing experiment-local semantics does not automatically earn generic Bond, Relation, Surface, FUNCTION, Control or property-field architecture.
- Composition, not a catalog of isolated primitives, is the long-term test.
- After ANVIL-07, the highest-consequence uncertainty is whether compliance has honest representation/scaling meaning rather than being a spring-per-voxel convention.

## Active experiment — ANVIL-08 / COMPLIANCE-RESOLUTION

```text
PR                 #13
branch             experiment/anvil-08-compliance-resolution
base at freeze     79acf565d3505a0d71be055132779c2ed2d92d8c
preflight head     a1e1000cfd6b40c9e84e2d86a4f735f37205af9f
phase              Draft / preflight frozen / implementation pending
verdict            NO EXECUTABLE RESULT
```

Canonical contract: `docs/experiments/ANVIL-08-COMPLIANCE-RESOLUTION-PREFLIGHT.md`.

Primary question: can the same physical normal-compliance interface preserve macroscopic behavior across an exact 2x authored refinement without per-patch retuning, while four authored patches may compile to one disposable runtime relation?

Candidate authored hypothesis remains experiment-local:

```text
NormalCompliancePatch {
  id
  target: { cellId, face }
  normalStiffnessPerAreaNPerM3
  normalDampingPerAreaNsPerM3
}
```

The opposing face is inferred from local matter adjacency and patch area from source geometry. COARSE uses one `0.25 m²` patch; FINE uses four `0.0625 m²` patches over the same physical interface. Frozen candidate values `K_n=40000 N/m³`, `C_n=7200 N·s/m³` aggregate to the same `10000 N/m`, `1800 N·s/m` at both resolutions. A deliberately wrong fixed-per-patch control aggregates to `40000/7200` and must be physically distinguishable.

This is not accepted ontology and not yet evidence.

## Current exact next action

Implement only the frozen PR #13 C0 slice:

- local face/neighbor resolution and fail-closed validation;
- deterministic coarse and exact 2x refined fixtures;
- blocked rigid adjacency -> same two physical regions at both resolutions;
- area-derived patch contributions and one 1D aggregate runtime relation;
- naive fixed-per-patch control;
- structural/compiler + real pinned Box3D tests under frozen gates;
- canonical Node test registration;
- Draft/core execution and red-result classification before any repair.

Do not edit the frozen preflight after seeing results merely to obtain PASS.

## Strategic horizon

If ANVIL-08 resolves cleanly, stop the scaling challenge. **ACTIVATE** is the leading next composition checkpoint; compliant REBIND remains later unless new evidence changes the frontier.

Do not promote `NormalCompliancePatch`, `ElasticSeam`, generic compliant surface/property fields or runtime aggregation into foundation from ANVIL-08 alone.

## Process boundaries

- `AGENTS.md` — truth hierarchy and implementation cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift method.
- `docs/CURRENT_HANDOFF.md` + `.anvil/project-state.json` — current takeover state.
- `docs/FOUNDATION.md` — only already-earned reusable boundaries.

Known non-blocking infrastructure debt remains unchanged: no server-side main protection, production build still writes historical Forge manifest, and Node test registration is manually enumerated.
