---
name: study-page-pattern
description: House style for this repo's certification study pages (ccaf_2026.html, aws_saa_study.html, clf_c02_study.html) and the shared study-engine.js/study-engine.css they run on. Use when adding a new certification study page, adding a new reference page that needs the study engine, or modifying dashboard/simulado/flashcard/checklist behavior on an existing study page.
license: MIT
---

# Study page pattern

This repo's certification study pages (`ccaf_2026.html`, `aws_saa_study.html`, `clf_c02_study.html`) share one engine (`study-engine.js` + `study-engine.css`) and one progress-storage schema, so that a new page or a new feature only has to be written once. `ai_concepts.html` and `aws_services.html` are simpler reference pages that do **not** use this engine — they have no simulado/flashcards/checklist and are out of scope for this pattern.

Read `openspec/changes/unify-and-enhance-study-hub/design.md` (once archived, check `openspec/specs/`) for the full rationale. This skill is the quick-reference for applying the pattern, not a replacement for that design doc.

## When to use this

- Adding a new certification study page (new cert, same shape: dashboard, per-domain quizzes, timed simulado, flashcards, readiness checklist).
- Adding a feature to the simulado/flashcard/checklist/dashboard engine that should apply to all three existing pages.
- Debugging why a study page's progress isn't persisting or isn't showing up on `index.html`.

Do **not** use this for `ai_concepts.html`, `aws_services.html`, or `index.html`'s own carousel/card logic — those follow different, simpler patterns.

## File layout

```
study-engine.css   ← shared layout/component styles (topbar, sidebar, exam UI,
                      flashcard UI, checklist, responsive rules). Colors driven
                      by CSS custom properties, not hardcoded per rule.
study-engine.js    ← shared engine: dashboard nav, quiz engine, exam engine +
                      history, flashcard engine + spaced repetition, two
                      checklist adapters, unified progress storage, sidebar
                      mobile wiring. Exposes `StudyEngine.init(config)`.
<cert>_study.html  ← page-specific: <title>, a ~5-line <style> override
                      (accent colors + .td1..4 tag colors), all HTML markup,
                      and one inline <script> with page data (TITLES, QD,
                      EXAM, FCS, checklist data) ending in one
                      `StudyEngine.init({...})` call.
```

A study page is never fully self-contained anymore — it depends on the two shared files via `<link rel="stylesheet" href="study-engine.css">` and `<script src="study-engine.js"></script>`. That's a deliberate trade-off (see design.md Decision 1): the site is hosted, not opened from disk, so this is safe.

## Per-page `<style>` override

Every study page's own `<style>` block should contain *only*:

```html
<style>
:root{--accent:#RRGGBB;--accent2:#RRGGBB;--accent-rgb:R,G,B;}
.td1{background:rgba(...,.2);color:#...;}
.td2{...}
.td3{...}
.td4{...}
/* .td5 etc. if the page has more than 4 domains */
</style>
<link rel="stylesheet" href="study-engine.css">
```

`--accent-rgb` must be the R,G,B components of `--accent` (no `#`, no spaces) — the shared stylesheet uses `rgba(var(--accent-rgb),.NN)` throughout so hover states, hero gradients, and active-nav backgrounds pick up each page's color without per-page rule duplication. If a page needs content-specific CSS beyond the shared set (ccaf's `pre`/`code`/`.ic`/`.wb`/`.sg`/`.sc` rules for rich domain prose, for example), add those extra rules in the same page-local `<style>` block, clearly separated with a comment — do not add them to `study-engine.css` unless more than one page needs them.

## Page data shape

Each page defines these in its own inline `<script>`, before the `StudyEngine.init(...)` call:

- `TITLES` (or `titles`): `{ pageId: 'Display name' }`, used for the topbar title when navigating.
- `QD`: per-domain quiz question banks, `{ w1: [...], w2: [...], ... }`. Each question: `{ q, o: [options], a: correctIndex, e: explanation }`.
- `EXAM`: the full simulado question bank, same question shape plus `d: 'D1'` (domain tag) on each question.
- `FCS`: flashcards, `[{ d: 'D1', f: front, b: back }, ...]`. The engine assigns a stable `_id` (array index) to each card at init time — do not add your own `id` field.
- Checklist data — see below, shape depends on adapter.

## Checklist: two adapters, one storage schema

There are two rendering styles in use, both writing into the same unified progress schema:

- **Static markup** (`clf`, `saa`): the checklist items are hardcoded `<div class="chi" id="chi0" onclick="toggleChi(0)">...</div>` in the page HTML. Use `checklist: { mode:'static', total:N, legacyKey:'<old-localStorage-key>', barId:'cpf', txtId:'cp-txt' }`.
- **Grouped/data-driven** (`ccaf`): checklist items live in a JS array of groups (`CIG`) plus a parallel array of doc URLs (`CIG_URLS`), rendered into a single `<div id="chklist"></div>` by the engine. Use `checklist: { mode:'grouped', groups: CIG, urls: CIG_URLS, legacyKey:'<old-key>', containerId:'chklist', barId:'cpfill', txtId:'cptxt' }`.

New pages: prefer the **grouped** adapter — it's the more maintainable of the two (no hand-authored per-item HTML/ids to keep in sync). Only use `static` if you're intentionally matching the clf/saa markup style for some reason.

`legacyKey` only matters for pages that shipped before the unified progress schema existed. A brand-new page has no legacy key to migrate from — pass any unique string; `migrateLegacyChecklist` is a no-op if that key was never written.

## Unified progress storage

All progress (checklist, flashcard known/unknown + spaced-repetition state, exam attempt history) lives under one `localStorage` key, `hub_study_progress`, namespaced by a short, stable **certification id** (`ccaf`, `saa`, `clf`, ...). That id:

- Is the `certId` you pass into `StudyEngine.init({ certId: '...', ... })`.
- Must exactly match the `data-cert="..."` attribute on that certification's card in `index.html` (see `.hub-progress` divs there) — the hub reads the same schema to show aggregate progress.
- Is permanent once chosen. Don't rename it later; that silently orphans existing users' stored progress.

Never read or write `hub_study_progress` directly from page code — go through `getCertProgress(certId)` / `setCertProgress(certId, data)` in `study-engine.js`, or the higher-level helpers (`recordExamAttempt`, `fcMark`, `migrateLegacyChecklist`, `exportProgressEnvelope`, `validateProgressEnvelope`).

## Adding a new certification page — checklist

1. Copy an existing page (prefer `clf_c02_study.html` if using the static checklist adapter, or `ccaf_2026.html` if using grouped) as your starting skeleton — same `#sidebar`/`#topbar`/`#content` structure, same element ids (`exam-domain`, `exam-q`, `exam-opts`, `exam-dots`, `exam-clock`, `exam-qnum`, `exam-bf`, `exam-score-live`, `exam-result-card`, `exam-history`, `fc-card`, `fc-dom`, `fc-dom2`, `fc-front`, `fc-back`, `fc-ctr`, `fc-tags`, `fc-due-badge`, `fc-known-controls`, `cpf`/`cp-txt` or `cpfill`/`cptxt`, `ptext`, `gpbar`). The engine binds to these ids by convention — renaming any of them silently breaks that feature.
2. Pick a new, permanent `certId` (short, lowercase, e.g. `dva` for a Developer Associate cert). Add a matching `.hub-progress` block to that certification's card in `index.html` with `data-cert="<id>"` and `data-total="<checklist item count>"`.
3. Write `TITLES`/`QD`/`EXAM`/`FCS`/checklist data for the new cert.
4. End the page's inline `<script>` with one `StudyEngine.init({ certId, titles, quizzes, exam, examMinutes, passScore, flashcards, checklist })` call. Do not re-implement any engine function locally — if a page-specific behavior tweak seems necessary, it almost always means the tweak belongs in `study-engine.js` as a config option instead, so all pages benefit.
5. Set `--accent`/`--accent2`/`--accent-rgb`/`.td1..N` in the page's own `<style>` block.
6. Verify: `node --check` the page's extracted inline script (syntax), and cross-check that every `getElementById`/`onclick` the engine references exists in the new page's markup (see the grep-based checks used during the original migration — `openspec/changes/unify-and-enhance-study-hub/` if not yet archived, or ask to re-derive them; they're not checked into the repo as a script).
7. Open the page in a real browser and click through: dashboard load, one quiz, the full timed simulado + result screen + history, flashcard flip/known/unknown/due-badge, checklist toggle + reload-persistence, and the hub's progress indicator for the new card.

## Non-goals

- No build step. `study-engine.js`/`.css` are hand-authored plain files, not bundled or transpiled. Don't introduce one for this.
- No change to `ai_concepts.html`/`aws_services.html` — they're intentionally simpler and outside this pattern.
- No backend/accounts. Cross-device progress sync is the export/import JSON flow on `index.html`, not a server.
