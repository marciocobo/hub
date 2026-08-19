## Why

The hub covers three certifications (CCA-F, AWS SAA-C03, AWS CLF-C02) but not AWS Certified AI Practitioner (AIF-C01), a foundational AWS certification adjacent to the existing AI/cloud content already in the hub (`ai_concepts.html`, CCA-F). Adding it extends the hub's coverage using the now-unified study-page pattern (`study-engine.js`/`study-engine.css`, unified progress storage, spaced repetition, exam history) established by `unify-and-enhance-study-hub`, so the new page gets all of that for free instead of being built from scratch.

## What Changes

- New certification study page `aws_aif_c01_study.html` following the established study-page pattern (`.claude/skills/study-page-pattern/SKILL.md`): dashboard, per-domain quizzes, timed practice exam with attempt history, flashcards with spaced repetition, readiness checklist, resources section.
- New certification card on `index.html` (hub) linking to the new page, with a progress indicator wired into the existing unified progress display.
- Content (questions, flashcards, checklist items, domain weights) is authored from AWS's publicly published AIF-C01 exam guide: 5 domains — Fundamentals of AI and ML, Fundamentals of Generative AI, Applications of Foundation Models, Guidelines for Responsible AI, Security/Compliance/Governance for AI Solutions — 65 questions, 90 minutes, minimum passing score 700/1000, USD 100 exam fee.

## Capabilities

### New Capabilities
- `aif-c01-study-guide`: the AWS AIF-C01 certification study page itself — its domain quiz banks, practice exam content, flashcards, and readiness checklist, and its presence as a selectable certification on the hub.

### Modified Capabilities
_None — this page consumes the existing generic capabilities (`study-progress-tracking`, `flashcard-spaced-repetition`, `exam-attempt-history`, `progress-export-import`) as-is; none of their requirements change. They're already written in terms of "a certification" / "the hub," not tied to specific certification ids, so no delta spec is needed for them._

## Impact

- **New file**: `aws_aif_c01_study.html` (consumes existing `study-engine.js`/`study-engine.css`, no engine changes needed).
- **Modified file**: `index.html` (new certification card + `.hub-progress` block with `data-cert="aif"`).
- **Not affected**: `study-engine.js`, `study-engine.css`, the three existing certification pages, `ai_concepts.html`, `aws_services.html`.
- **No backend/build step**: same static-site model as the rest of the hub.
