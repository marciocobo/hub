## Why

The hub covers four certifications (CCA-F, AWS SAA-C03, AWS CLF-C02, AWS AIF-C01) but not AWS Certified Developer - Associate (DVA-C02), a natural next step for the hub's AWS coverage above the foundational CLF-C02 level. Adding it extends the hub's coverage using the established study-page pattern (`study-engine.js`/`study-engine.css`, unified progress storage, spaced repetition, exam history), so the new page gets all of that for free instead of being built from scratch.

## What Changes

- New certification study page `aws_dva_c02_study.html` following the established study-page pattern (`.claude/skills/study-page-pattern/SKILL.md`): dashboard, per-domain quizzes, timed practice exam with attempt history, flashcards with spaced repetition, readiness checklist, resources section.
- New certification card on `index.html` (hub) linking to the new page, with a progress indicator wired into the existing unified progress display.
- Content (questions, flashcards, checklist items, domain weights) is authored from AWS's publicly published DVA-C02 exam guide: 4 domains — Development with AWS Services, Security, Deployment, Troubleshooting and Optimization — 65 scored questions, 130 minutes, minimum passing score 720/1000, USD 150 exam fee.

## Capabilities

### New Capabilities
- `dva-c02-study-guide`: the AWS DVA-C02 certification study page itself — its domain quiz banks, practice exam content, flashcards, and readiness checklist, and its presence as a selectable certification on the hub.

### Modified Capabilities
_None — this page consumes the existing generic capabilities (`study-progress-tracking`, `flashcard-spaced-repetition`, `exam-attempt-history`, `progress-export-import`) as-is; none of their requirements change. They're already written in terms of "a certification" / "the hub," not tied to specific certification ids, so no delta spec is needed for them._

## Impact

- **New file**: `aws_dva_c02_study.html` (consumes existing `study-engine.js`/`study-engine.css`, no engine changes needed).
- **Modified file**: `index.html` (new certification card + `.hub-progress` block with `data-cert="dva"`).
- **Not affected**: `study-engine.js`, `study-engine.css`, the four existing certification pages, `ai_concepts.html`, `aws_services.html`.
- **No backend/build step**: same static-site model as the rest of the hub.
