# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-18, accepted through ANVIL-06; ANVIL-07 C0 is active/unaccepted, **SUPPORTED FOR FIXTURE**, with a bounded evidence-hardening pass required before Ready.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and executable evidence;
2. direct owner validation when required;
3. `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` as checkpoint claims verified against live Git;
4. this memory and canonical project documentation;
5. historical conversation/donor documents only as leads.

ANVIL tests **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime representations. Runtime bodies, colliders and joints are interpretations, not construction identity. The current cubic-cell dialect is a laboratory dialect, not the final ontology.

## Accepted capability stack

- **ANVIL-00 / COLLAPSE** — persistent matter can compile into reduced rigid runtime representation.
- **ANVIL-01 / CUT** — bounded mass-preserving runtime topology replacement with source identity and rigid-field motion transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface can derive two rigid islands plus a passive revolute relation.
- **ANVIL-03 / REBIND** — persistent bearing semantics can be reconstructed onto changed disposable runtime bodies after a nearby moving CUT.
- **ANVIL-04 / LOAD-REBIND** — the declared bounded multi-kN fixture can cold-reconstruct that relation without migrating Box3D joint cache and without a gross first-step shock.
- **ANVIL-05 / TORQUE** — signed persistent active intent can create causal mechanical work through BEARING via an equal/opposite body-torque pair without authored Box3D motor semantics.
- **ANVIL-06 / TORQUE-PATCH** — the same active intent can be authored on a local source face without an authored `bearingId`; valid locality resolves the existing BEARING and invalid placement fails closed.

ANVIL-07 is **not** in this accepted list yet.

Exact experiment identities, metrics, artifacts and negative results belong to the corresponding evidence files under `docs/experiments/`.

Immutable latest owner-tested artifact identity remains the ANVIL-03 REBIND owner gate:

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
Actions run      32085543984
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
owner verdict    ACCEPT
```

## Strongest architectural lessons

- Authored identity must not be synonymous with runtime body/joint identity.
- Runtime representation may be rebuilt from persistent semantics and provenance; accepted evidence is bounded and does not imply universal solver-state migration is unnecessary.
- Locality can replace at least one authored semantic cross-reference in the bounded TORQUE-PATCH fixture, but this is not mechanism discovery or a generic property-field system.
- Box3D is a current lowering target, not project ontology. Move deeper only after a reproduced limitation justifies it.
- Passing one experiment-local semantic slice never automatically promotes a generic Bond, Relation, FUNCTION, Surface, Power or Control architecture.
- Composition, not a catalog of isolated primitives, is the long-term test of the Machine Matter idea.
- ANVIL-07 C0 makes one local compliant binding physically credible for a fixed one-dimensional fixture, but its `normalStiffnessNPerM` / `normalDampingNsPerM` coefficients are only supported for that discrete seam. They must not silently become resolution-independent material ontology.
- The next architectural risk is therefore not “can a spring work?” but whether compliant authored meaning survives changes in interface patching/source resolution while runtime representation remains disposable.

## Active experiment pointer

Machine-readable checkpoint: `.anvil/project-state.json`.
Cold-takeover pointer: `docs/CURRENT_HANDOFF.md`.

Active work is **ANVIL-07 / ELASTIC-SEAM**, PR #12, branch `experiment/anvil-07-elastic-seam`, still Draft and unaccepted.

Last audited C0 source:

```text
source head      1a31a69096f48d2eccb08ba88d683607f15d0ce3
Draft/core run   32166041812
suite            42/42 PASS + production build PASS
verdict          SUPPORTED FOR FIXTURE
```

The C0 strongly discriminates RIGID / ELASTIC / FREE and shows deformation under load plus restoration after unload. Capability-only weld-spring evidence remains a separate earlier evidence class.

A post-C0 independent audit found **evidence/test hardening gaps, not a physical falsification**:

- source-cell reorder and endpoint-swap invariance are perturbed together instead of independently;
- blank ID and invalid stiffness/damping domains lack adversarial test assertions despite implementation validation;
- runtime isolation/tuning is partly evidenced by harness receipts rather than direct solver-state observation where getters exist;
- raw diagnostics should report compiled body counts and compiled masses rather than omit/hard-code those report fields.

Exact next action is owned by `.anvil/project-state.json` / `docs/CURRENT_HANDOFF.md`: close only those gaps on PR #12, rerun Draft/core, then decide Ready. Do not alter C0 physics, coefficients or frozen thresholds.

## Current strategic frontier

Current frontier assessment is qualitative, not experimental truth:

- **Matter:** thin but real; constitutive semantics remain shallow.
- **Bindings:** first compliant C0 is physically supported for one fixed fixture but not accepted/promoted.
- **Interfaces:** one bounded bearing slice is comparatively developed.
- **Function:** one bounded torque/local-placement slice is accepted.
- **Control / Signal / Power:** intentionally unearned.
- **Surface:** mostly open.
- **Topology / Continuity:** comparatively strong bounded spine.
- **Adaptation / Representation:** open and now directly implicated by ELASTIC-SEAM scaling semantics.

Post-C0 Research Compass ranking after ANVIL-07 lifecycle closes:

1. **COMPLIANCE-RESOLUTION** — same physical compliant interface under different source resolutions/patch counts; test whether authored compliance can retain honest macroscopic meaning without per-voxel retuning and whether multiple authored patches may compile to a different-resolution runtime relation.
2. **ACTIVATE** — transient control over already-earned persistent function semantics; high composition value and the leading runner-up.
3. compliant **REBIND** — continuity of compliant semantics through runtime repartition; defer until the simpler scaling/representation assumption is understood.

Why COMPLIANCE-RESOLUTION currently leads: cells are explicitly a dialect rather than ontology, representations may use different resolutions, and the current C0 explicitly does **not** prove scaling/resolution independence. Testing this before building richer composition reduces the risk of locking a spring-per-cell artifact into future Machine Matter semantics.

Composition remains mandatory. After at most one deliberate scaling/representation challenge, the next strategic experiment should force existing semantics to compose unless new evidence materially changes the frontier.

## Promotion stance for ANVIL-07

- Do not promote `ElasticSeam` or generic compliant binding into `src/foundation` / `docs/FOUNDATION.md` from this C0.
- If the evidence-hardening pass is green, Ready/candidate may be used as exact integration/whole-product regression before merge.
- The current Ready Chromium gate is **not** direct physics evidence for ELASTIC-SEAM because the experiment is not browser-wired.
- No owner manual gate is presently justified by the quantitative C0 claim unless a new human/browser uncertainty appears.
- If promoted, accept only the bounded experiment result; keep schema/lowering experiment-local until further scaling/composition evidence earns abstraction.

## Process boundaries

- Per-experiment method: `docs/EXPERIMENT_PROTOCOL.md`.
- Macro anti-drift method: `docs/RESEARCH_COMPASS.md`.
- Agent rules and document ownership: `AGENTS.md`.
- Current takeover: `docs/CURRENT_HANDOFF.md` + `.anvil/project-state.json`.

Use delta-audit by default. Run a deeper macro audit after promotion, meaningful falsification, architectural contradiction, frontier change or major interruption.

Known process/infrastructure debt that is not a current blocker:

- `main` lacks server-side branch protection/required checks;
- generic production build remains coupled to historical Forge manifest generation;
- Node test registration is manually enumerated in `package.json`.

Do not change those systems as a side effect of ANVIL-07 unless they become material blockers.
