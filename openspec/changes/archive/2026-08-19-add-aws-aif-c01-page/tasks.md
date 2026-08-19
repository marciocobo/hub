## 1. Page skeleton

- [x] 1.1 Create `aws_aif_c01_study.html` from the `study-page-pattern` skill's skeleton (sidebar/topbar/content structure, engine element ids), following the grouped-checklist adapter style (design.md Decision 1)
- [x] 1.2 Set page `--accent`/`--accent2`/`--accent-rgb` and link `study-engine.css` (design.md Decision 4)
- [x] 1.3 Build the sidebar nav: dashboard, simulado, checklist, one entry per domain (5), flashcards, resources

## 2. Domain quiz content

- [x] 2.1 Domain 1 — Fundamentals of AI and ML: write quiz questions (`QD.w1`) and section copy — 10 questions
- [x] 2.2 Domain 2 — Fundamentals of Generative AI: write quiz questions (`QD.w2`) and section copy — 12 questions
- [x] 2.3 Domain 3 — Applications of Foundation Models: write quiz questions (`QD.w3`) and section copy — 14 questions
- [x] 2.4 Domain 4 — Guidelines for Responsible AI: write quiz questions (`QD.w4`) and section copy — 8 questions
- [x] 2.5 Domain 5 — Security, Compliance, and Governance for AI Solutions: write quiz questions (`QD.w5`) and section copy — 9 questions

## 3. Practice exam

- [x] 3.1 Write the `EXAM` question bank (≥65 questions, each tagged `d: 'D1'`..`'D5'`, proportioned per design.md Decision 3's domain weights) — 65 questions (13/16/18/9/9)
- [x] 3.2 Build the exam-start card (domain question-count breakdown, 90 min / 700-1000 copy) and `#exam-history` container, matching the existing pages' markup

## 4. Flashcards and checklist

- [x] 4.1 Write `FCS` flashcards (~50) covering all 5 domains, each tagged `d: 'D1'`..`'D5'` — 50 cards (10/12/14/7/7)
- [x] 4.2 Write grouped checklist data (`CIG`/`CIG_URLS`) covering all 5 domains, with doc links where available — 45 items across 5 groups (9/11/13/6/6)
- [x] 4.3 Wire flashcard markup (`fc-tags`, known/unknown controls, due badge) and checklist container (`chklist`) per the skill's grouped-adapter conventions

## 5. Engine wiring and hub integration

- [x] 5.1 End the page's inline script with one `StudyEngine.init({ certId:'aif', titles, quizzes:QD, exam:EXAM, examMinutes:90, passScore:700, flashcards:FCS, checklist:{mode:'grouped', groups:CIG, urls:CIG_URLS, legacyKey:'aif_unused_ck', containerId:'chklist', barId:'cpfill', txtId:'cptxt'} })` call
- [x] 5.2 Add the AIF-C01 certification card to `index.html`'s carousel, including a `.hub-progress` block with `data-cert="aif"` and the correct `data-total` (checklist item count from 4.2)
- [x] 5.3 Update the carousel's total-card count/dots in `index.html` (`TOTAL`, dot buttons) to include the new card

## 6. Verification

- [x] 6.1 `node --check` the new page's extracted inline script; cross-check every `getElementById`/`onclick` the engine references exists in the new page's markup — clean (no missing ids/handlers) for `aws_aif_c01_study.html` and `index.html`
- [x] 6.2 Confirm all 5 domains are represented in quizzes, exam bank, flashcards, and checklist — verified via a Node/vm functional check that executes the real page data against `study-engine.js`: QD 53q (10/12/14/8/9 per domain), EXAM 65q (13/16/18/9/9, all D1-D5 present, ≥65 met), FCS 50 cards (10/12/14/7/7), checklist 45 items across 5 groups (9/11/13/6/6), `index.html`'s `data-total="45"` matches, every question well-formed (4 options, valid answer index, explanation present)
- [x] 6.3 Manually verify in a browser: dashboard load, each domain quiz, full timed simulado + result + history, flashcard flip/known-unknown/due-badge, checklist toggle + reload-persistence, and the new hub card's progress indicator — confirmed by user
