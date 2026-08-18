# PROJECT ANVIL — Agent Rules

ANVIL is a falsification-driven R&D laboratory. Prefer a small executable experiment over a large speculative architecture.

## Truth hierarchy

1. live repository state and executable evidence;
2. direct owner validation/feedback;
3. current `AI_PROJECT_MEMORY.md`;
4. promoted boundaries in `docs/FOUNDATION.md`;
5. current experiment documentation;
6. historical conversation and donor-project documents.

Do not turn a passing build, synthetic test, or code presence into a product-quality claim.

Before significant research work, read both:

- `docs/RESEARCH_COMPASS.md` for macro direction, frontier balance and anti-component-drift checks;
- `docs/EXPERIMENT_PROTOCOL.md` for the bounded evidence lifecycle.

Use `docs/DONOR_MAP.md` before substantial donor harvesting.

## Git and lifecycle discipline

- Resolve repository, branch, live `main` and HEAD before significant work.
- `main` is for accepted checkpoints. Material code changes go through explicit experiment/foundation PRs.
- Open experiment PRs early as **Draft**. Draft is the fast research loop.
- Mark a PR **Ready** only when it deserves the expensive browser/Forge candidate gate.
- If deep experimentation resumes, convert the PR back to Draft.
- Once an owner candidate artifact is handed off, freeze that branch head until the owner verdict.
- On owner ACCEPT, prefer merging the **exact owner-tested source head** after external provenance/base checks. Do not append acceptance Markdown to the experiment branch before promotion.
- After merge, grounding documentation may be updated separately if the diff is verified documentation-only.
- Do not rewrite history or force-push without a specific recovery reason.
- Do not make direct material code changes to `main`; documentation-only grounding is allowed when the exact changed paths are verified.
- Update `AI_PROJECT_MEMORY.md` when evidence changes current research truth, but keep it as a concise orchestration index rather than an archive.

## CI discipline

ANVIL uses two evidence speeds:

**Draft/core gate**
- canonical Node/npm;
- strict TypeScript;
- complete Node/real-Box3D regression suite;
- production build.

**Ready/candidate gate**
- everything above must already pass;
- exact staged production build;
- packaged Windows launcher self-test;
- real Chromium evidence;
- owner-candidate Forge artifact.

Do not run full Chromium/owner packaging on every solver iteration merely for ceremony. Do not skip the candidate gate when a browser/owner claim is required.

Documentation-only commits after an already verified exact-head merge do not need solver/browser requalification; verify that they are actually documentation-only.

## Experimental discipline

Every material experiment should have:

- one concrete hypothesis;
- a bounded, discriminating fixture;
- observable success/failure criteria;
- at least one plausible falsifier/control when false-positive success is possible;
- a recorded result and limitations.

Keep meaningful negative results. Do not tune thresholds merely to make a gate green. Change one primary physical assumption at a time where practical.

Do not add extra variants after a strong result unless they attack a remaining live assumption.

Use the evidence classes and verdict vocabulary in `docs/EXPERIMENT_PROTOCOL.md`. Owner manual validation is required only when human observation adds material evidence beyond automation.

For a deterministic clear visual gate, roughly three meaningful owner observations are normally enough; do not impose 10–20 repeat runs as ritual.

## Strategic anti-drift discipline

A successful experiment is not automatically the right next direction.

After each strategically meaningful promotion:

- state what part of the Machine Matter vision became more credible;
- inspect whether new authored concepts are becoming conventional parts/components in disguise;
- prefer local physical semantics over explicit cross-component references when locality/topology can genuinely resolve the relationship;
- review frontier balance across Matter, Bindings, Interfaces, Function, Control/Signal/Power, Surface, Topology/Continuity and Adaptation/Representation;
- compare at least two next falsifiers by information gain and lock-in risk;
- after 2–3 new primitive results, force a composition checkpoint rather than endlessly adding vocabulary.

Do not let current cubic cells, Box3D, BEARING or TORQUE become the ontology merely because they are the first things that passed.

## Promotion discipline

Do not promote incidental fixture details into the global architecture.

A reusable concept belongs in `src/foundation` / `docs/FOUNDATION.md` only when:

1. accepted experiment evidence already supports it; or
2. it is a solver/domain-neutral measurement/process boundary directly required to falsify the next experiment.

If an abstraction prescribes the answer to an untested physics question, it belongs inside that experiment instead.

## Architectural boundaries

- Authored truth must not persist Box3D/runtime IDs.
- Runtime physics is disposable and reconstructible from authored/compiled truth.
- Persistent authored identity and runtime body/collider identity are separate domains.
- Foundation spatial/runtime state must not expose Box3D handles or Box3D-specific math types.
- Structure, mechanics, surfaces, future power/control and visual representation should not be collapsed into one mega-object without evidence.
- Prefer testing local matter/property composition before introducing a generic component graph.
- Do not add `CarCompiler`, `WheelPart`, or other domain-specific foundations merely because a demo needs them.
- Do not assume the current sparse cubic cell dialect is the final Machine Matter representation.

## Box3D policy

Stock Box3D is not sacred. Native JV already demonstrates evidence-backed core modification. ANVIL starts each hypothesis at the shallowest sufficient intervention level:

1. stock Box3D primitives;
2. external physical model / compiler lowering;
3. instrumentation or thin fork;
4. custom constraint;
5. custom contact law;
6. deeper solver change or another solver.

Move deeper only when a reproduced limitation justifies it.

## Donor repositories

Other Jozzpoly repositories are evidence and donor sources. Read current source-of-truth branches/files before harvesting ideas or code. Do not modify donor repositories as a side effect of ANVIL work unless the owner explicitly asks for that repository to be changed.

When reusing code or third-party material, preserve actual licensing/provenance requirements. Project-owned assets do not need artificial secrecy, but ownership does not erase third-party licenses.
