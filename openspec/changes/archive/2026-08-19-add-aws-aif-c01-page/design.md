## Context

See `proposal.md` - Why for motivation. This page is built entirely on top of the already-shared `study-engine.js`/`study-engine.css` and unified progress schema established by `unify-and-enhance-study-hub` (see `.claude/skills/study-page-pattern/SKILL.md` for the house pattern this follows). No engine changes are needed — this is a content page, not an engine change.

AWS's publicly published AIF-C01 exam guide defines 5 domains with these approximate weights: Domain 1 — Fundamentals of AI and ML (20%), Domain 2 — Fundamentals of Generative AI (24%), Domain 3 — Applications of Foundation Models (28%), Domain 4 — Guidelines for Responsible AI (14%), Domain 5 — Security, Compliance, and Governance for AI Solutions (14%). Exam format: 65 scored questions (85 total, 20 unscored, indistinguishable), 90 minutes, minimum passing score 700/1000, USD 100 fee, Foundational level (same tier as CLF-C02).

## Goals / Non-Goals

**Goals:**
- Ship one new page, `aws_aif_c01_study.html`, indistinguishable in structure/behavior from the existing three certification pages to anyone using the hub.
- Reuse the shared engine and unified progress schema exactly as documented in the skill — zero engine changes.
- Cover all 5 published AIF-C01 domains in quizzes, exam bank, flashcards, and checklist.

**Non-Goals:**
- No changes to `study-engine.js`/`study-engine.css` — if something doesn't fit the existing engine config shape, that's a signal to revisit this design, not to fork the engine.
- No claim of exhaustive exam-bank coverage — question/flashcard/checklist counts are a reasonable starting depth (see Decisions), not a guarantee of passing the real exam.
- No changes to the other three certification pages or to `ai_concepts.html`/`aws_services.html`.

## Decisions

### 1. Checklist adapter: grouped (data-driven)
Per the skill's recommendation for new pages, use `checklist: { mode:'grouped', ... }` (the `ccaf` style: a `CIG`-shaped array of `{g: groupLabel, items: [...]}` plus a parallel `CIG_URLS` array), not the static hardcoded-markup adapter clf/saa use. Simpler to author and maintain for a new page with no legacy markup to match.

### 2. Certification id: `aif`
Short, stable, matches the `ccaf`/`saa`/`clf` convention. Used as `certId` in `StudyEngine.init(...)` and must exactly match the new `data-cert="aif"` attribute added to its `index.html` card. Chosen now and treated as permanent per the skill's guidance (renaming it later would orphan any user's already-stored progress).

### 3. Content depth
No existing content bank to migrate from (unlike the original three pages, which had existing content when the engine was unified). Reasonable starting depth, proportioned across the 5 domains by their published weights:
- **Quiz banks**: ~50-60 questions total across the 5 domain sections (comparable to clf's ~66 across 4 domains).
- **Exam bank**: at least 65 unique questions (the exam draws all 65 from the bank each run, similar to how ccaf/clf/saa's exam banks are sized close to their scored-question count) so repeated attempts aren't identical.
- **Flashcards**: ~50, one per major exam-guide bullet, comparable to the existing pages' 45-66 range.
- **Checklist**: one item per major exam-guide sub-bullet, grouped by domain, comparable to clf's 45 / saa's 53.

Exact question/card/item text is authored from AWS's public AIF-C01 exam guide content outline — not from any copyrighted question bank or practice-exam product.

### 4. Visual accent
`--accent:#ec4899` / `--accent2:#f472b6` (rose/pink), `--accent-rgb:236,72,153`. Chosen to stay visually distinct from the three existing certification cards (purple/blue/amber) and the two reference cards (teal/orange) on the hub carousel.

### 5. Domain-to-tag-color mapping
`.td1`..`.td5` assigned distinct hues per the existing per-page pattern (each page picks its own 4-5 tag colors independently, as seen in ccaf's `.td1`..`.td5` and clf/saa's `.td1`..`.td4`) — an implementation detail for the page author, not a spec-level concern.

## Risks / Trade-offs

- **[Risk] AWS may revise the AIF-C01 exam guide/domain weights over time** → Mitigation: content is versioned in git like the other pages; a future content-refresh is a normal edit, not an engine change.
- **[Risk] Authoring ~50-65 original questions/flashcards/checklist items by hand is the bulk of the work and error-prone to rush** → Mitigation: tasks.md breaks this into one task per domain so it can be reviewed domain-by-domain rather than as one large diff.
- **[Trade-off] Starting content depth is smaller than a commercial practice-exam product** → Accepted: matches this repo's existing pattern (self-authored study guides, not question-bank products) and can grow over time via later edits.

## Migration Plan

Purely additive — no existing file's behavior changes except `index.html` gaining one new card. Rollback is a plain revert of the new file and the `index.html` addition; no data migration is involved since `aif` is a brand-new certification id with no legacy storage key to migrate from.
