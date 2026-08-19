## Context

See `proposal.md` - Why/What Changes for motivation. Relevant current-state facts that shape this design:

- The site is fully static: no build step, no bundler, no backend, no package.json. Pages are hosted as plain files (GitHub Pages-style hosting, per user confirmation that external `<script src>`/`<link>` references are acceptable).
- `ccaf_2026.html`, `aws_saa_study.html`, `clf_c02_study.html` each independently implement: dashboard nav (`P()`), exam engine (`buildQ`/`renderQ`/`renderExamQ`), flashcards (`renderFC`/`renderFCTags`), and a checklist backed by `localStorage`. Function names and internal data shapes are near-identical but not shared code.
- Checklist storage keys are inconsistent today: `ccaf_2026.html` uses the literal string `'ccaf_ck'`; `aws_saa_study.html` and `clf_c02_study.html` use a `CKKEY` variable (need to confirm at implementation time whether its value already differs per page or collides).
- `ai_concepts.html` and `aws_services.html` are simpler reference pages (no exam/flashcards/checklist) and are out of scope.

## Goals / Non-Goals

**Goals:**
- One shared engine (JS + CSS) for exam/flashcards/checklist/dashboard-nav, consumed by all three certification pages.
- One unified `localStorage` schema for all study progress, namespaced per certification, readable by both a certification page and the hub.
- Migration path that preserves users' existing checklist progress rather than resetting it.
- Additive features (spaced repetition, exam history, export/import) built on top of the unified schema, not bolted on per page.

**Non-Goals:**
- No backend, accounts, or cross-device sync beyond manual JSON export/import.
- No change to `ai_concepts.html` / `aws_services.html` (they stay simple reference pages).
- No build tooling (bundler, transpiler, minifier) introduced — shared files are hand-authored plain JS/CSS.
- No change to exam question banks/flashcard content — this change is about the engine and progress layer, not content.

## Decisions

### 1. Shared engine as external files, not a build step
`study-engine.js` and `study-engine.css` live at the repo root and are referenced via `<script src="study-engine.js" defer></script>` / `<link rel="stylesheet" href="study-engine.css">` from each certification page. Alternative considered: a build script that generates each self-contained HTML file from a template (keeps "open one file, get everything" property). Rejected because it introduces a build step and tooling dependency the project has never had, for a static site that's already multi-file (index.html already links out to other pages) and already hosted rather than opened from disk.

### 2. Unified progress schema shape
Single `localStorage` key (e.g. `hub_study_progress`) holding a JSON object namespaced by a stable certification id:

```json
{
  "ccaf": {
    "checklist": { "0": true, "3": true },
    "flashcards": { "12": { "known": true, "interval": 4, "due": "2026-08-25" } },
    "examHistory": [
      { "date": "2026-08-19T10:00:00Z", "score": 780, "pct": 78, "byDomain": { "D1": [7,8] } }
    ]
  },
  "saa": { ... },
  "clf": { ... }
}
```
Alternative considered: one `localStorage` key per certification (`hub_progress_ccaf`, etc.). Rejected because export/import (must cover "all certifications' progress") and hub-level aggregation both become simpler against a single root object than against an enumerated set of keys the hub would need to know about in advance.

Certification ids (`ccaf`, `saa`, `clf`) are the stable namespace and must match between each certification page and `index.html`'s card data — this mapping is established once during migration and treated as a fixed contract afterward.

### 3. Migration of existing checklist data
On first load after this change ships, each certification page's engine checks for data under its old key (`'ccaf_ck'`, or the page's prior `CKKEY` value) and, if present and the new unified entry for that certification is empty, copies it into the unified schema under `checklist`, then leaves the old key in place (no deletion) to avoid any risk of data loss if migration logic has a bug. This is a one-time, idempotent, best-effort read — not a versioned migration system, since there is exactly one migration to perform.

### 4. Spaced repetition: simplified SM-2
Each flashcard's stored state is `{ known: bool, interval: number (days), due: ISO date }`. On "known": interval grows (e.g. roughly doubles, capped), due date pushed out. On "unknown": interval resets to a short value (e.g. 1 day), due date set to now/soon. Full SM-2 (ease factor, quality grades 0-5) is deliberately not implemented — binary known/unknown is consistent with the existing UI's simplicity and the proposal's "SM-2 simplificado" framing. Cards with no history are always due, preserving today's default browse experience for first-time users.

### 5. Exam history cap
Cap history at a fixed number of most-recent attempts per certification (exact number is an implementation detail, not a spec-level contract) to bound `localStorage` growth. Oldest entries drop first (FIFO).

### 6. Export/import format
Export downloads the entire root `hub_study_progress` object (all certifications at once) as a single JSON file with a small envelope (e.g. `{ "version": 1, "exportedAt": ..., "progress": { ... } }`) so future schema changes can be detected on import. Import validates the envelope/shape before applying; on any validation failure, it rejects without touching existing storage. Import always confirms before overwriting non-empty existing progress (per spec).

### 7. Documentation as a skill, not just a README
The resulting page pattern (shared engine usage, unified progress schema, section/id conventions) is captured as a Claude Code skill (task in `tasks.md`) rather than a static doc, so that future page creation is guided interactively rather than relying on someone remembering to open and re-read an existing page as a template.

## Risks / Trade-offs

- **[Risk] Migration copies stale/incorrect old data if `CKKEY` values collide across pages** → Mitigation: verify each page's actual current `CKKEY` value during implementation before writing migration logic; if two pages happen to share a key today, migration must not cross-contaminate their unified entries.
- **[Risk] External `study-engine.js`/`.css` adds a network request per page (vs. today's fully self-contained files)** → Mitigation: acceptable since the site is already hosted (not opened from local disk) and `index.html` already does cross-page navigation; browser caching applies once loaded.
- **[Risk] `localStorage` has a size ceiling (~5-10MB/origin)** → Mitigation: exam history is capped; flashcard/checklist state is small (booleans/short objects per item); not a realistic concern at this data volume.
- **[Risk] Import of a malformed file could corrupt stored progress** → Mitigation: spec requires validation before applying and rejection without mutation on failure.
- **[Trade-off] Simplified SM-2 (binary known/unknown) is less precise than full SM-2 grading** → Accepted: matches existing UI simplicity; can be revisited later without a spec-breaking change since the storage shape (`interval`/`due`) already supports a richer algorithm later.

## Migration Plan

1. Add `study-engine.js`/`study-engine.css` alongside existing pages (no page changes yet) — safe, inert until referenced.
2. Migrate one certification page (suggest CLF, simplest content) to consume the shared engine, verifying feature parity before touching the others.
3. Migrate the remaining two certification pages.
4. Introduce unified progress schema + old-key migration logic in the shared engine; verify existing checklist state survives on all three pages.
5. Update `index.html` to read and display aggregate progress.
6. Add spaced repetition, exam history, export/import on top of the now-shared, now-unified foundation.
7. Author the page-pattern skill last, once the pattern has stabilized through the above steps.

No rollback beyond standard git revert is needed — this is a static site with no data migrations that touch a shared server; the only irreversible-in-the-wild state is what's sitting in a user's browser `localStorage`, and migration is additive/non-destructive (old keys are never deleted).
