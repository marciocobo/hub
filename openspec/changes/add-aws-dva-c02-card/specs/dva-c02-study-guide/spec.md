## Purpose

Adds AWS Certified Developer - Associate (DVA-C02) as a selectable certification in the study hub, with domain-organized quiz content, a timed practice exam, flashcards, and a readiness checklist consistent with the hub's other certification pages.

## ADDED Requirements

### Requirement: DVA-C02 selectable from the hub
The system SHALL present AWS Certified Developer - Associate (DVA-C02) as a certification card on the hub (`index.html`), linking to its dedicated study page.

#### Scenario: Hub lists the new certification
- **WHEN** a user opens the hub page
- **THEN** a card for "AWS Certified Developer - Associate (DVA-C02)" is shown alongside the existing certification cards, and clicking it navigates to the DVA-C02 study page

### Requirement: Domain-organized quiz content
The DVA-C02 study page SHALL provide per-domain quiz questions covering all four domains published in AWS's DVA-C02 exam guide: Development with AWS Services, Security, Deployment, and Troubleshooting and Optimization.

#### Scenario: Each domain has its own quiz
- **WHEN** a user navigates to a specific domain's study section on the DVA-C02 page
- **THEN** that section presents a quiz containing only questions tagged to that domain, with immediate per-answer feedback and an explanation

### Requirement: Practice exam matches published exam parameters
The DVA-C02 page's practice exam SHALL simulate the real exam's format: 65 scored questions, a 130-minute timer, and a minimum passing score of 720 out of 1000, with questions drawn proportionally from the four domains per AWS's published domain weighting.

#### Scenario: Starting the practice exam
- **WHEN** a user starts the DVA-C02 practice exam
- **THEN** the exam presents 65 questions drawn from the domain question bank, counts down from 130 minutes, and reports a scaled score out of 1000 with a pass/fail determination at 720

### Requirement: Flashcards and checklist cover all exam domains
The DVA-C02 page SHALL provide flashcards and a readiness checklist whose items are tagged to and cover all four exam domains.

#### Scenario: Flashcard domain filter includes every domain
- **WHEN** a user opens the flashcard domain filter on the DVA-C02 page
- **THEN** every one of the four DVA-C02 domains appears as a filter option, and each has at least one flashcard

#### Scenario: Checklist covers every domain
- **WHEN** a user opens the readiness checklist on the DVA-C02 page
- **THEN** checklist items are grouped by domain, covering all four DVA-C02 domains

### Requirement: Page participates in unified progress tracking
The DVA-C02 page SHALL use the same unified progress storage, spaced-repetition flashcard behavior, exam attempt history, and export/import participation as the hub's other certification pages, under its own stable certification identifier.

#### Scenario: Progress shown on the hub
- **WHEN** a user has checked items on the DVA-C02 checklist or completed a practice exam
- **THEN** the DVA-C02 card on the hub reflects that stored progress, the same way it does for the hub's other certifications

#### Scenario: Included in progress export
- **WHEN** a user exports their study progress from the hub
- **THEN** the exported file includes the DVA-C02 certification's progress data if any exists
