## 1. Page skeleton

- [x] 1.1 Create `aws_dva_c02_study.html` from the `study-page-pattern` skill's skeleton (sidebar/topbar/content structure, engine element ids), following the grouped-checklist adapter style (design.md Decision 1)
- [x] 1.2 Set page `--accent`/`--accent2`/`--accent-rgb` and link `study-engine.css` (design.md Decision 4)
- [x] 1.3 Build the sidebar nav: dashboard, simulado, checklist, one entry per domain (4), flashcards, resources

## 2. Domain quiz content

- [x] 2.1 Domain 1 — Development with AWS Services: write quiz questions (`QD.w1`) and section copy
- [x] 2.2 Domain 2 — Security: write quiz questions (`QD.w2`) and section copy
- [x] 2.3 Domain 3 — Deployment: write quiz questions (`QD.w3`) and section copy
- [x] 2.4 Domain 4 — Troubleshooting and Optimization: write quiz questions (`QD.w4`) and section copy

## 3. Practice exam

- [x] 3.1 Write the `EXAM` question bank (≥65 questions, each tagged `d: 'D1'`..`'D4'`, proportioned per design.md Decision 3's domain weights)
- [x] 3.2 Build the exam-start card (domain question-count breakdown, 130 min / 720-1000 copy) and `#exam-history` container, matching the existing pages' markup

## 4. Flashcards and checklist

- [x] 4.1 Write `FCS` flashcards (~50) covering all 4 domains, each tagged `d: 'D1'`..`'D4'`
- [x] 4.2 Write grouped checklist data (`CIG`/`CIG_URLS`) covering all 4 domains, with doc links where available
- [x] 4.3 Wire flashcard markup (`fc-tags`, known/unknown controls, due badge) and checklist container (`chklist`) per the skill's grouped-adapter conventions

## 5. Engine wiring and hub integration

- [x] 5.1 End the page's inline script with one `StudyEngine.init({ certId:'dva', titles, quizzes:QD, exam:EXAM, examMinutes:130, passScore:720, flashcards:FCS, checklist:{mode:'grouped', groups:CIG, urls:CIG_URLS, legacyKey:'dva_unused_ck', containerId:'chklist', barId:'cpfill', txtId:'cptxt'} })` call
- [x] 5.2 Add the DVA-C02 certification card to `index.html`'s carousel, including a `.hub-progress` block with `data-cert="dva"` and the correct `data-total` (checklist item count from 4.2)
- [x] 5.3 Update the carousel's total-card count/dots in `index.html` (`TOTAL`, dot buttons) to include the new card

## 6. Verification

- [x] 6.1 `node --check` the new page's extracted inline script; cross-check every `getElementById`/`onclick` the engine references exists in the new page's markup
- [x] 6.2 Confirm all 4 domains are represented in quizzes, exam bank, flashcards, and checklist (functional check against `study-engine.js`, matching the approach used for `aws_aif_c01_study.html`)
- [ ] 6.3 Manually verify in a browser: dashboard load, each domain quiz, full timed simulado + result + history, flashcard flip/known-unknown/due-badge, checklist toggle + reload-persistence, and the new hub card's progress indicator
