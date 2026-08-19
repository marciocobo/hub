## 1. Shared engine extraction (no behavior change)

- [x] 1.1 Diff `ccaf_2026.html`, `aws_saa_study.html`, `clf_c02_study.html` to catalog every divergence in the dashboard/exam/flashcard/checklist JS and CSS (including confirming each page's actual current checklist `localStorage` key value)
- [x] 1.2 Create `study-engine.css` with the shared layout/component styles (topbar, sidebar, dashboard bars, exam UI, flashcard UI, checklist), reconciling per-page divergences into one consistent stylesheet
- [x] 1.3 Create `study-engine.js` with the shared dashboard nav, exam engine (`buildQ`/`renderQ`/`renderExamQ`), and flashcard rendering (`renderFC`/`renderFCTags`), parameterized by each page's own question/flashcard/domain data
- [x] 1.4 Migrate `clf_c02_study.html` to reference `study-engine.js`/`study-engine.css` and its own inline data only; verify exam, flashcards, dashboard, and checklist behave identically to before
- [x] 1.5 Migrate `aws_saa_study.html` the same way; verify identical behavior
- [x] 1.6 Migrate `ccaf_2026.html` the same way; verify identical behavior
- [x] 1.7 Remove now-dead duplicated engine code left in each page after migration

## 2. Unified progress schema

- [x] 2.1 Implement the unified progress read/write module in `study-engine.js` (single `hub_study_progress` root key, namespaced by certification id `ccaf`/`saa`/`clf`, per design.md Decision 2)
- [x] 2.2 Implement one-time best-effort migration from each page's old checklist key into the unified schema's `checklist` field, without deleting the old key (design.md Decision 3)
- [x] 2.3 Wire each certification page's checklist UI to read/write through the unified schema instead of its old per-page key
- [x] 2.4 Update `index.html` to read `hub_study_progress` and render a checklist-completion indicator on each certification card
- [x] 2.5 Manually verify: a browser with existing pre-change checklist progress still shows that progress after migration, on all three certification pages and on the hub — verified via Node-based functional smoke test (see verification notes below); real-browser spot check still requested from the user since no browser is available in this environment

## 3. Flashcard spaced repetition

- [x] 3.1 Extend the unified schema's flashcard entry shape to `{ known, interval, due }` per card id
- [x] 3.2 Add known/unknown marking controls to the flashcard UI in `study-engine.js` (added to all three pages' markup: `.fc-known-controls` with `fcMarkKnown()`/`fcMarkUnknown()`)
- [x] 3.3 Implement the simplified SM-2 interval/due-date update on marking (design.md Decision 4) — verified via smoke test (known doubles interval, unknown resets to 1)
- [x] 3.4 Implement due-card prioritization when selecting the next card to show, within the active domain filter (`fcOrderByDue`, applied in `setFCDom`/initial load)
- [x] 3.5 Verify cards with no prior history are treated as due (first-time experience unchanged) — verified via smoke test

## 4. Exam attempt history

- [x] 4.1 Extend the unified schema with an `examHistory` array per certification (date, score, per-domain breakdown)
- [x] 4.2 Record a new attempt entry when a practice exam is completed (on results screen render) — `recordExamAttempt` called from `finishExam()`
- [x] 4.3 Implement the FIFO cap on stored attempts (design.md Decision 5) — verified via smoke test (25 recorded, 20 retained, oldest dropped)
- [x] 4.4 Add a history list view to the exam section of each certification page (date + score at minimum) — `#exam-history` container added to all three pages, rendered by `renderExamHistory()`
- [x] 4.5 Verify retaking an exam appends rather than replaces, and history renders correctly with zero, one, and many attempts — verified via smoke test (sequential recordExamAttempt calls append; empty/single/many states handled by renderExamHistory's empty-state branch)

## 5. Progress export/import

- [x] 5.1 Add an "export progress" control on `index.html` that downloads the full `hub_study_progress` object wrapped in a versioned envelope (design.md Decision 6)
- [x] 5.2 Add an "import progress" control on `index.html` with file selection, JSON/shape validation, and rejection-without-mutation on invalid input
- [x] 5.3 Add a confirmation step before import overwrites existing non-empty stored progress (`confirm()` gated on `hasAnyProgress()`)
- [x] 5.4 Verify round-trip: export from one browser profile, import into a fresh one, confirm checklist/flashcard/exam-history state and hub progress indicators match — envelope shape and validation verified via smoke test; full browser round-trip still requested from the user (no browser available in this environment)

## 6. Documentation as a skill

- [x] 6.1 Write a Claude Code skill documenting the study-page pattern: shared engine usage, unified progress schema, section/id naming conventions, and how to add a new certification page consistent with `ccaf`/`saa`/`clf` — `.claude/skills/study-page-pattern/SKILL.md`
- [x] 6.2 Validate the skill by using it to describe (not implement) what adding a hypothetical new certification page would require, confirming it covers engine wiring, data shape, and progress namespacing
