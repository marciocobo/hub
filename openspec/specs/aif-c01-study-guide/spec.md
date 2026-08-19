# aif-c01-study-guide Specification

## Purpose

Adds AWS Certified AI Practitioner (AIF-C01) as a selectable certification in the study hub, with domain-organized quiz content, a timed practice exam, flashcards, and a readiness checklist consistent with the hub's other certification pages.

## Requirements

### Requirement: AIF-C01 selectable from the hub
The system SHALL present AWS Certified AI Practitioner (AIF-C01) as a certification card on the hub (`index.html`), linking to its dedicated study page.

#### Scenario: Hub lists the new certification
- **WHEN** a user opens the hub page
- **THEN** a card for "AWS Certified AI Practitioner (AIF-C01)" is shown alongside the existing certification cards, and clicking it navigates to the AIF-C01 study page

### Requirement: Domain-organized quiz content
The AIF-C01 study page SHALL provide per-domain quiz questions covering all five domains published in AWS's AIF-C01 exam guide: Fundamentals of AI and ML, Fundamentals of Generative AI, Applications of Foundation Models, Guidelines for Responsible AI, and Security/Compliance/Governance for AI Solutions.

#### Scenario: Each domain has its own quiz
- **WHEN** a user navigates to a specific domain's study section on the AIF-C01 page
- **THEN** that section presents a quiz containing only questions tagged to that domain, with immediate per-answer feedback and an explanation

### Requirement: Practice exam matches published exam parameters
The AIF-C01 page's practice exam SHALL simulate the real exam's format: 65 scored questions, a 90-minute timer, and a minimum passing score of 700 out of 1000, with questions drawn proportionally from the five domains per AWS's published domain weighting.

#### Scenario: Starting the practice exam
- **WHEN** a user starts the AIF-C01 practice exam
- **THEN** the exam presents 65 questions drawn from the domain question bank, counts down from 90 minutes, and reports a scaled score out of 1000 with a pass/fail determination at 700

### Requirement: Flashcards and checklist cover all exam domains
The AIF-C01 page SHALL provide flashcards and a readiness checklist whose items are tagged to and cover all five exam domains.

#### Scenario: Flashcard domain filter includes every domain
- **WHEN** a user opens the flashcard domain filter on the AIF-C01 page
- **THEN** every one of the five AIF-C01 domains appears as a filter option, and each has at least one flashcard

#### Scenario: Checklist covers every domain
- **WHEN** a user opens the readiness checklist on the AIF-C01 page
- **THEN** checklist items are grouped by domain, covering all five AIF-C01 domains

### Requirement: Page participates in unified progress tracking
The AIF-C01 page SHALL use the same unified progress storage, spaced-repetition flashcard behavior, exam attempt history, and export/import participation as the hub's other certification pages, under its own stable certification identifier.

#### Scenario: Progress shown on the hub
- **WHEN** a user has checked items on the AIF-C01 checklist or completed a practice exam
- **THEN** the AIF-C01 card on the hub reflects that stored progress, the same way it does for the hub's other certifications

#### Scenario: Included in progress export
- **WHEN** a user exports their study progress from the hub
- **THEN** the exported file includes the AIF-C01 certification's progress data if any exists
