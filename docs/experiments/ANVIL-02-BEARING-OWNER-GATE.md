# ANVIL-02 / BEARING — Owner Gate

Status: **OWNER ACCEPTED — 2026-08-18**

This file records the exact human-validation event for ANVIL-02. It does not redefine the automated evidence or broaden the research claim.

## Exact owner-tested candidate

```text
repository        Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory
branch            experiment/anvil-02-bearing
source head       3869cbb3ece204acd7f5c05cf7da43e53e219c0c
PR synthetic      a107661d2f8854cf45a51047f93f06b2d5b8c0a4
Actions run       32080991801 attempt 1
artifact          anvil-browser-laboratory
artifact ID       9305115231
artifact SHA256   336987e773b643c1b25f472cf1f585c2724f98760412359015f7f464f381bdac
Forge schema      anvil-forge-owner-gate/v2
Forge revision    v0.2-second-consumer
entry path        /?experiment=bearing
```

Live GitHub cross-check after handoff confirmed:

- PR #5 still pointed to source head `3869cbb3...` and synthetic checkout `a107661d...`;
- Actions run `32080991801` was `completed / success`, attempt 1, for that same source head;
- artifact `9305115231` belonged to that run and source head;
- GitHub's artifact digest was exactly `sha256:336987e773b643c1b25f472cf1f585c2724f98760412359015f7f464f381bdac`.

The Forge report therefore passed the required external provenance handshake.

## Owner observation

Owner verdict: **ACCEPT**

Observed BEARING runs: **17**

Owner environment:

```text
Windows 10
Chrome 151
viewport 1920 x 911 @ DPR 1
```

Owner's direct behavioral observation, paraphrased faithfully:

- left side: the two structures remain connected at the bearing;
- right side: the same structures without the relation separate and fly in opposite directions;
- the red line clearly shows the growing separation on the control side;
- the green circle clearly identifies the connection on the bearing side.

Owner notes from the generated report:

> Wszystko działa, po lewej połączone, po prawej nie, i odlatują od siebie, czerwona linia pokazuje dystans. A zielone koło pokazuje połączenie w lewym przykładzie.

The owner supplied an approximately 18.73 s, 1920x908, 30 fps screen recording in the project conversation. Representative frames were reviewed by the agent and visibly support the same qualitative A/B distinction. The recording itself is conversation evidence and is not stored in this repository.

## Automated values shown in the accepted report

```text
automated evidence       PASS
automated gates          8/8 PASS
source cells             7 -> 7
runtime bodies           1 -> 2
derived relation         0 -> 1
bearing anchor gap       0.015 mm
no-relation control gap  1.366 m
relative bearing angle   2.010 rad
```

The owner verdict remains independent of these automated metrics; the manual ACCEPT is based on the observed behavior.

## Accepted bounded claim

For the declared 7-cell fixture, one experiment-local authored bearing mark on two opposite adjacent source faces can causally split one rigid island into two disposable rigid bodies and compile one body-local rotational relation. Stock Box3D lowers that relation to a revolute joint that keeps the shared pivot coincident while allowing relative rotation. The same body-local anchor/axis semantics also survived the declared arbitrary common-rigid-transform fixture.

This result is now supported by automated semantic/solver/browser evidence **and** owner-visible manual validation.

## Forge V0.2 field feedback — functional pass, communication defect

The same field trial produced important Forge product evidence.

What worked:

- ZIP -> `START_ANVIL.cmd` -> localhost -> correct BEARING page worked on the owner's Windows machine;
- the A/B visual comparison was immediately understandable once the owner reached the concrete test instruction;
- repeated RESET/RUN flow worked through 17 observed runs;
- verdict selection and report generation worked;
- the generated report contained enough exact identity to complete the external GitHub handshake.

What failed the owner experience:

The opening Forge explanation was described as essentially unreadable technical jargon. Terms such as `SECOND CONSUMER`, `authored interface`, `canonical artifact`, `fail-closed`, `schema`, provenance identifiers and the dense `BUILD IDENTIFIED ... RUN ...` line should **not** be primary owner-facing instructions.

The later concrete instruction was much better because it said what to look at visually: left stays connected and rotates, right separates.

### Earned design rule for the next Forge revision

Primary owner UI must be written for a non-programmer visual creator:

1. say in plain Polish what the test is checking;
2. say exactly what should happen on the left/right or before/after;
3. say what visible failure to watch for;
4. use ordinary action labels;
5. keep SHA/schema/run/artifact/provenance and source-interface notation under collapsed **technical details** unless the agent needs them in the generated report.

Internally Forge may remain strict and technical. The owner-facing path should not require the owner to understand that machinery.

This feedback **does not invalidate BEARING**. It is a field-derived Forge V0.2 UX requirement for V0.2.1 / the next owner gate.

## Promotion decision

Owner acceptance unblocks promotion of ANVIL-02 for the bounded claim above. Promotion must still preserve the exact accepted artifact identity and must not silently broaden the claim to generic joints, mechanisms, frame ontology, motors, closed loops or arbitrary interfaces.
