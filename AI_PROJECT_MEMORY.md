# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-18, accepted through ANVIL-06 with ANVIL-07 frozen at Draft/pre-C0.

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

## Active experiment pointer

Machine-readable checkpoint: `.anvil/project-state.json`.
Cold-takeover pointer: `docs/CURRENT_HANDOFF.md`.

At this handoff the active work is **ANVIL-07 / ELASTIC-SEAM**, PR #12, branch `experiment/anvil-07-elastic-seam`, frozen head `af93a116ab59bf4d32ac58956cd9a719b86175cc`, state **Draft / pre-C0 / capability-only**.

Accepted material checkpoint before handoff documentation: `e236f6a8b00858fa4d35f4fc32189f78b9cb33b2`, accepted through ANVIL-06.

ANVIL-07 has a frozen preflight, stricter pre-C0 amendment and successful pinned weld-spring capability check. It has **no implemented or executed `RIGID / ELASTIC / FREE` physics C0 yet**.

Next work after cold takeover: implement only that frozen C0 and classify the result before changing the research contract. Keep PR #12 Draft until the core hypothesis is actually supported.

## Current strategic frontier

Current frontier assessment is qualitative, not experimental truth:

- Matter: thin but real.
- Bindings: major open physical frontier; no earned compliant local binding yet.
- Interfaces: one bounded bearing slice is comparatively developed.
- Function: one bounded torque/local-placement slice is supported.
- Control / Signal / Power: intentionally unearned.
- Surface semantics: mostly open.
- Topology / Continuity: comparatively strong bounded spine.
- Adaptation / non-grid representation: open.

ANVIL-07 was selected because it opens the compliant-binding frontier after two FUNCTION experiments. ACTIVATE remains a credible later candidate; the choice is strategic, not proof that BINDINGS is objectively the only next direction.

## Process boundaries

- Per-experiment method: `docs/EXPERIMENT_PROTOCOL.md`.
- Macro anti-drift method: `docs/RESEARCH_COMPASS.md`.
- Agent rules and document ownership: `AGENTS.md`.
- Current takeover only: `docs/CURRENT_HANDOFF.md` + `.anvil/project-state.json`.

Use delta-audit by default: if live `main`, active PR/head, merge-base and relevant evidence fingerprint match the handoff, do not reconstruct the full project history before continuing. Run a deeper macro audit after promotion, meaningful falsification, architectural contradiction, frontier change or major interruption.

Known process/infrastructure debt that is **not** a blocker for ANVIL-07 C0:

- `main` currently lacks server-side branch protection/required checks;
- generic production build is still coupled to historical Forge manifest generation;
- Node test registration is manually enumerated in `package.json`.

Do not change those systems merely as part of the ANVIL-07 takeover unless they become material blockers.
