# PROJECT ANVIL — Agent Rules

ANVIL is a falsification-driven R&D laboratory. Prefer a small executable experiment over a large speculative architecture.

## Truth hierarchy

1. live repository state and executable evidence;
2. direct owner validation/feedback when human evidence is required;
3. `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` as checkpoint claims verified against live Git;
4. current `AI_PROJECT_MEMORY.md` and canonical documentation;
5. historical conversation and donor-project documents only as leads.

Never turn a passing build, capability probe, synthetic test or code presence into a higher evidence claim.

## Document ownership — one fact, one canonical owner

- `.anvil/project-state.json` — compact machine-readable **current checkpoint claim** only.
- `docs/CURRENT_HANDOFF.md` — current cold-takeover procedure, accepted-vs-active boundary, exact next action and do-not-do list.
- `AI_PROJECT_MEMORY.md` — concise accepted capability/architecture index and current strategic pointer; not a telemetry archive.
- `docs/experiments/*-PREFLIGHT*.md` — primary question, fixture, frozen gates, controls and non-claims.
- `docs/experiments/*-EVIDENCE.md` — executed technical results, meaningful negative evidence and promotion identity.
- owner-gate record — exact owner-tested artifact identity and human verdict, only when Class E is required.
- `docs/FOUNDATION.md` — only already-earned reusable foundation boundaries; never the active roadmap.
- `docs/RESEARCH_COMPASS.md` — durable macro method/invariants; never the current experiment plan.
- `docs/EXPERIMENT_PROTOCOL.md` — durable per-experiment lifecycle.
- PR body — concise operational phase/verdict + links; not canonical science record.
- `README.md` — stable project entry point; not live orchestration state.

Do not copy detailed thresholds or telemetry into several documents. Link to the canonical owner instead.

## Cold takeover

A new conversation or agent must not continue from chat summary alone.

### Minimum takeover fingerprint

1. resolve live repository and `main`;
2. read `.anvil/project-state.json` as a claim;
3. resolve the referenced active PR/branch/head from live Git;
4. compare live `main` with the accepted material checkpoint and classify the delta;
5. inspect merge-base / active branch delta;
6. read the active preflight/evidence files from the live branch;
7. verify only the latest evidence material to the next action;
8. reconcile any mismatch before writing code.

Live Git wins over state/handoff prose when they differ.

If the fingerprint matches the verified handoff, use a **delta-audit**: do not reconstruct ANVIL-00…N from conversation history before ordinary continuation. Run a deeper Research Compass audit after promotion, meaningful falsification, architectural contradiction, frontier change or major interruption.

The takeover must distinguish explicitly:

- accepted `main` truth;
- active but unaccepted experiment state;
- executed physics/semantic evidence;
- capability/toolchain prechecks that are not physics evidence;
- exact next bounded action;
- explicit do-not-do list.

Do not merge/rebase an active Draft merely to make takeover prettier when the divergence is understood and non-material.

## Git and lifecycle discipline

- Resolve live repository, `main`, intended branch and exact HEAD before significant work.
- `main` is for accepted checkpoints and verified documentation/process grounding.
- Material code changes go through explicit experiment/foundation PRs.
- Open experiment PRs early as **Draft**; Draft is the fast research loop.
- Mark Ready only when the core hypothesis deserves the expensive candidate gate.
- If deep research resumes, convert the PR back to Draft.
- Once an owner candidate is handed off, freeze that source head until verdict.
- On owner ACCEPT, prefer merging the **exact owner-tested source head** after provenance/base checks.
- After merge, documentation-only grounding may be applied separately if path diff is verified documentation-only.
- Do not rewrite history or force-push without a specific recovery reason.
- Do not make direct material code changes to `main`.

Server-side branch protection may be absent; therefore agent-side expected-head checks and path audits remain mandatory until repository protection is explicitly enabled.

## CI discipline

ANVIL uses two evidence speeds.

**Draft/core gate**
- canonical Node/npm;
- strict TypeScript;
- complete Node/real-Box3D regression suite;
- production build.

**Ready/candidate gate**
- core already passes;
- exact staged production build;
- launcher regression;
- real Chromium evidence;
- final artifact/owner transport only when required by current workflow.

Do not pay for Chromium/owner validation on every solver iteration merely for ceremony. Do not skip a required evidence class when the claim actually depends on it.

Documentation-only commits after an already qualified exact-head merge do not requalify unchanged material code; verify the changed paths instead.

## Experimental discipline

Every material experiment should have:

- one concrete falsifiable question;
- smallest discriminating fixture;
- observable success/failure gates;
- meaningful negative/control case when false-positive success is plausible;
- explicit failure interpretation and non-claims.

Freeze material gates before seeing the result whenever practical. Do not tune thresholds merely to obtain PASS. Do not add variants after a strong result unless they attack a live uncertainty.

Classify a red result before changing it:

- physical falsification;
- semantic/compiler failure;
- non-discriminating fixture;
- test representation defect;
- toolchain/infrastructure block.

Owner manual validation is conditional. Use it only when human observation contributes evidence automation cannot establish efficiently.

## Strategic anti-drift discipline

After strategically meaningful results:

- state the actual vision delta;
- inspect new authored concepts for conventional-component disguise or solver shadow ontology;
- prefer local physical semantics over unnecessary cross-component references when locality genuinely resolves meaning;
- review Matter, Bindings, Interfaces, Function, Control/Signal/Power, Surface, Topology/Continuity and Adaptation/Representation;
- compare at least two next falsifiers by information gain and lock-in risk;
- after roughly 2–3 primitive/frontier results, force a composition checkpoint.

Do not let current cubic cells, Box3D, BEARING, TORQUE or any first successful lowering become the ontology merely because they passed first.

## Promotion discipline

A reusable concept belongs in `src/foundation` / `docs/FOUNDATION.md` only when accepted evidence supports reuse or it is neutral measurement/process infrastructure required to falsify experiments.

If an abstraction prescribes the answer to an untested physics question, keep it experiment-local.

## Architectural boundaries

- Authored truth must not persist Box3D/runtime IDs.
- Runtime physics is disposable and reconstructible from authored/compiled truth where evidence supports it.
- Persistent authored identity and runtime identity are separate domains.
- Foundation state must not expose Box3D handles/types.
- Structure, mechanics, surfaces, power/control and visuals should not collapse into one mega-object without evidence.
- Do not assume the sparse cubic-cell dialect is final Machine Matter representation.

## Box3D intervention ladder

Stock Box3D is not sacred. Start at the shallowest sufficient intervention:

1. stock primitives;
2. external physical model / compiler lowering;
3. instrumentation or thin fork;
4. custom constraint;
5. custom contact law;
6. deeper solver change or another solver.

Move deeper only when reproduced evidence justifies it.

## Donor repositories

Other Jozzpoly repositories are evidence and donor sources. Read their current source-of-truth files before harvesting ideas/code. Do not modify donor repositories as a side effect of ANVIL work unless explicitly requested.

Preserve actual third-party licensing/provenance requirements.
