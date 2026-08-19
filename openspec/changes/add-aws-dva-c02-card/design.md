## Context

See `proposal.md` - Why for motivation. This page is built entirely on top of the already-shared `study-engine.js`/`study-engine.css` and unified progress schema (see `.claude/skills/study-page-pattern/SKILL.md` for the house pattern this follows, and `aws_aif_c01_study.html` for the most recently added page using the same pattern). No engine changes are needed — this is a content page, not an engine change.

AWS's publicly published DVA-C02 exam guide defines 4 domains with these approximate weights: Domain 1 — Development with AWS Services (32%), Domain 2 — Security (26%), Domain 3 — Deployment (24%), Domain 4 — Troubleshooting and Optimization (18%). Exam format: 65 scored questions (plus unscored questions indistinguishable from scored ones), 130 minutes, minimum passing score 720/1000, USD 150 fee, Associate level.

## Goals / Non-Goals

**Goals:**
- Ship one new page, `aws_dva_c02_study.html`, indistinguishable in structure/behavior from the existing four certification pages to anyone using the hub.
- Reuse the shared engine and unified progress schema exactly as documented in the skill — zero engine changes.
- Cover all 4 published DVA-C02 domains in quizzes, exam bank, flashcards, and checklist.

**Non-Goals:**
- No changes to `study-engine.js`/`study-engine.css` — if something doesn't fit the existing engine config shape, that's a signal to revisit this design, not to fork the engine.
- No claim of exhaustive exam-bank coverage — question/flashcard/checklist counts are a reasonable starting depth (see Decisions), not a guarantee of passing the real exam.
- No changes to the other four certification pages or to `ai_concepts.html`/`aws_services.html`.

## Decisions

### 1. Checklist adapter: grouped (data-driven)
Per the skill's recommendation for new pages, use `checklist: { mode:'grouped', ... }` (the `ccaf`/`aif` style: a `CIG`-shaped array of `{g: groupLabel, items: [...]}` plus a parallel `CIG_URLS` array), not the static hardcoded-markup adapter clf/saa use. Simpler to author and maintain for a new page with no legacy markup to match.

### 2. Certification id: `dva`
Short, stable, matches the `ccaf`/`saa`/`clf`/`aif` convention. Used as `certId` in `StudyEngine.init(...)` and must exactly match the new `data-cert="dva"` attribute added to its `index.html` card. Chosen now and treated as permanent per the skill's guidance (renaming it later would orphan any user's already-stored progress).

### 3. Content depth
No existing content bank to migrate from. Reasonable starting depth, proportioned across the 4 domains by their published weights:
- **Quiz banks**: ~50-60 questions total across the 4 domain sections (comparable to clf's ~66 across 4 domains).
- **Exam bank**: at least 65 unique questions (the exam draws all 65 from the bank each run, similar to how the existing pages' exam banks are sized close to their scored-question count) so repeated attempts aren't identical.
- **Flashcards**: ~50, one per major exam-guide bullet, comparable to the existing pages' 45-66 range.
- **Checklist**: one item per major exam-guide sub-bullet, grouped by domain, comparable to clf's 45 / aif's 45.

Exact question/card/item text is authored from AWS's public DVA-C02 exam guide content outline — not from any copyrighted question bank or practice-exam product.

### 4. Visual accent
`--accent:#10b981` / `--accent2:#34d399` (emerald/green), `--accent-rgb:16,185,129`. Chosen to stay visually distinct from the four existing certification cards (purple/blue/amber/pink) and the two reference cards (teal/orange) on the hub carousel.

### 5. Domain-to-tag-color mapping
`.td1`..`.td4` assigned distinct hues per the existing per-page pattern (each page picks its own tag colors independently) — an implementation detail for the page author, not a spec-level concern.

## Risks / Trade-offs

- **[Risk] AWS may revise the DVA-C02 exam guide/domain weights over time** → Mitigation: content is versioned in git like the other pages; a future content-refresh is a normal edit, not an engine change.
- **[Risk] Authoring ~50-65 original questions/flashcards/checklist items by hand is the bulk of the work and error-prone to rush** → Mitigation: tasks.md breaks this into one task per domain so it can be reviewed domain-by-domain rather than as one large diff.
- **[Trade-off] Starting content depth is smaller than a commercial practice-exam product** → Accepted: matches this repo's existing pattern (self-authored study guides, not question-bank products) and can grow over time via later edits.

## Migration Plan

Purely additive — no existing file's behavior changes except `index.html` gaining one new card. Rollback is a plain revert of the new file and the `index.html` addition; no data migration is involved since `dva` is a brand-new certification id with no legacy storage key to migrate from.
