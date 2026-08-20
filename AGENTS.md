# PROJECT ANVIL — Agent Rules

ANVIL is a falsification-driven R&D laboratory. Prefer a small executable experiment over a large speculative architecture.

## Truth hierarchy

1. live repository state and executable evidence;
2. direct owner validation/feedback when human evidence is required;
3. `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` as checkpoint claims verified against live Git;
4. current `AI_PROJECT_MEMORY.md` and canonical documentation;
5. historical conversation and donor-project documents only as leads.

Never turn a passing build, capability probe, synthetic test, integration demo or code presence into a higher evidence claim.

## Document ownership — one fact, one canonical owner

- `.anvil/project-state.json` — compact machine-readable **current checkpoint claim** only; it may describe experiment, foundation, integration or maintenance work.
- `docs/CURRENT_HANDOFF.md` — current cold-takeover procedure, accepted-vs-active boundary, exact next action and do-not-do list.
- `AI_PROJECT_MEMORY.md` — concise accepted capability/architecture index and current strategic pointer; not a telemetry archive.
- `docs/ANVIL_EPOCH_I_CLOSURE.md` — historical one-time transition record for the completed Epoch I closure; not a recurring roadmap or live pointer.
- `docs/experiments/*-PREFLIGHT*.md` — primary question, fixture, frozen gates, controls and non-claims for scientific experiments.
- `docs/experiments/*-EVIDENCE.md` — executed technical results, meaningful negative evidence and promotion identity.
- owner-gate record — exact owner-tested artifact identity and human verdict, only when Class E is required.
- `docs/FOUNDATION.md` — only already-earned reusable foundation boundaries; never the active roadmap.
- `docs/RESEARCH_COMPASS.md` — durable macro method/invariants; never the current experiment plan.
- `docs/EXPERIMENT_PROTOCOL.md` — durable per-experiment lifecycle; do not force non-scientific integration/maintenance work into an ANVIL-NN experiment template.
- PR body — concise operational phase/verdict + links; not canonical science record.
- `README.md` — stable project entry point; not live orchestration state.

Do not copy detailed thresholds or telemetry into several documents. Link to the canonical owner instead.

## Cold takeover

A new conversation or agent must not continue from chat summary alone.

### Minimum takeover fingerprint

1. resolve live repository and `main`;
2. read `.anvil/project-state.json` as a claim;
3. identify the current `activeWork` type and resolve any referenced PR/branch/head from live Git;
4. compare live `main` with the accepted material checkpoint and classify the delta;
5. inspect merge-base / active branch delta when active work exists;
6. for an active scientific experiment, read its live preflight/evidence files; for integration/maintenance/foundation work, read its canonical scope record or PR boundary instead;
7. verify only the latest evidence material to the next action;
8. reconcile any mismatch before writing code.

Live Git wins over state/handoff prose when they differ.

If the fingerprint matches the verified handoff, use a **delta-audit**: do not reconstruct ANVIL-00…N from conversation history before ordinary continuation. Run a deeper Research Compass audit after promotion, meaningful falsification, architectural contradiction, frontier change, owner composition checkpoint or major interruption.

The takeover must distinguish explicitly:

- accepted scientific `main` truth;
- active but unaccepted work and its type;
- executed physics/semantic evidence;
- integration/owner evidence that does not automatically create a physics claim;
- capability/toolchain prechecks that are not physics evidence;
- exact next bounded action;
- explicit do-not-do list.

Do not merge/rebase an active Draft merely to make takeover prettier when the divergence is understood and non-material.

## Work classification

Material work must be classified before implementation so process does not manufacture evidence it does not have.

### Experiment

Asks a new falsifiable scientific, semantic or physics question. Use the experiment protocol, freeze discriminating gates before results where practical, and keep the implementation experiment-local until evidence earns reuse.

### Foundation

Promotes or hardens a reusable boundary already supported by evidence, or adds neutral measurement/process infrastructure required to falsify experiments. Foundation work must not prescribe the answer to an untested physics question.

### Integration

Composes already accepted capabilities for system-level or owner-facing evaluation. Integration may contain material code and may require owner validation, but a green integration artifact **does not automatically earn a new ANVIL-NN scientific capability**.

If integration requires a new physical law, semantic interpretation, generic ontology or solver-specific authored meaning, stop and formulate a separate experiment instead of smuggling the answer into integration code.

### Maintenance

Changes tooling, packaging, CI, documentation, process or other neutral infrastructure while preserving accepted scientific semantics. If maintenance requires changing accepted experiment/compiler/runtime behavior or physical thresholds, stop and reclassify the work.

## Git and lifecycle discipline

- Resolve live repository, `main`, intended branch and exact HEAD before significant work.
- `main` is for accepted checkpoints and verified documentation/process grounding.
- Material code changes go through an explicit PR whose work type is experiment, foundation, integration or maintenance.
- Open experiment PRs early as **Draft**; Draft is the fast research loop. Integration/maintenance work should also use Draft while scope or evidence is still moving.
- Mark Ready only when the relevant core hypothesis or integration/maintenance contract deserves the expensive candidate gate.
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

Do not pay for Chromium/owner validation on every solver iteration merely for ceremony. Do not skip a required evidence class when the claim or integration contract actually depends on it.

Documentation-only commits after an already qualified exact-head merge do not requalify unchanged material code; verify the changed paths instead.

## Long-horizon implementation orchestration

Long implementation runs should preserve momentum without letting momentum become authority. Use three nested review scales.

### Micro loop — coherent implementation checkpoint

For each bounded implementation batch:

1. lock live branch/head before writing;
2. make the smallest coherent change that can be validated as one claim or maintenance/integration contract;
3. keep source + directly coupled tests/evidence atomic when practical;
4. inspect the exact diff before moving the branch ref;
5. run the required evidence gate;
6. classify any red result before changing code or thresholds;
7. record only durable checkpoint facts in their canonical owner.

A normal green micro loop does not justify a strategic redesign. Continue when the result is expected, discriminating and still inside the frozen question/scope.

### Meso loop — progress and direction audit

After roughly **2–4 coherent implementation checkpoints**, or immediately after any surprising result, evidence contradiction, repeated repair cycle or material scope expansion, pause implementation and audit the trajectory.

The orchestrator must answer:

- What new fact has actually been established since the previous audit?
- Is the current work still attacking the frozen hypothesis/scope, or merely polishing the implementation?
- Has evidence debt grown faster than capability?
- Are we accumulating solver-shadow semantics, fixture-specific assumptions or representation lock-in?
- Is a red result teaching us something, or are we repeatedly patching around it?
- Has the expected information gain of the next planned batch materially fallen?
- Is owner validation being requested because it adds evidence, or because automation is incomplete?
- Should the next action be **continue, harden, stop, split, promote, or pivot**?

A meso audit should normally produce only:

- current verified truth;
- evidence quality / unresolved debt;
- strongest live implementation risk;
- one exact next bounded action;
- explicit do-not-do items if direction changed.

Do not create a large speculative backlog. Keep one executable next action and at most a small ranked horizon of plausible later falsifiers.

### Macro loop — Research Compass

Run the full `docs/RESEARCH_COMPASS.md` Critical Validation Loop after promotion, meaningful falsification, architectural contradiction, frontier change, composition checkpoint or major interruption.

The macro loop may reorder future experiments even when the previous experiment passed. Passing the current fixture is evidence about that fixture, not permission to follow the old roadmap indefinitely.

### Anti-momentum triggers

Stop ordinary implementation and escalate to at least a meso audit when any of these appears:

- two successive fixes address symptoms without reducing the same underlying uncertainty;
- a new abstraction is introduced mainly to make the current solver lowering convenient;
- authored meaning begins depending on current cell resolution, runtime IDs or one-to-one solver objects without explicit evidence;
- test/evidence scaffolding starts changing the physical claim it is supposed to observe;
- implementation complexity rises substantially while information gain stays flat;
- the next planned step exists mainly because it was already planned;
- a supposedly local change requires unexplained edits across multiple accepted boundaries;
- an experiment remains green only after weakening a previously frozen discriminator;
- integration starts inventing generic semantics mainly to make composition convenient;
- maintenance starts changing accepted behavior merely to make cleanup prettier.

If one of these is present, classify the cause before proceeding. Prefer deleting or narrowing work over preserving sunk cost.

### Orchestrator responsibility

The orchestrator is responsible for periodically comparing implementation progress with ANVIL's accepted truth, active work scope, evidence quality and long-horizon invariants. It must actively correct direction when evidence warrants it rather than merely supervise execution of an old plan.

This review cadence is **evidence-triggered first, checkpoint-count second, clock-time last**. Do not interrupt clean bounded work merely because an arbitrary amount of wall-clock time has passed, but do not allow many green commits to accumulate without a meso review.

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

Integration reuse alone is not evidence for foundation promotion; first determine whether the abstraction reflects earned semantics or only current integration convenience.

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
