## Purpose

Lets users mark flashcards as known/unknown and have the study page prioritize showing cards they don't yet know, instead of purely sequential or random review with no memory of prior performance.

## ADDED Requirements

### Requirement: Mark flashcard as known or unknown
The system SHALL let the user mark the currently displayed flashcard as "known" or "unknown", and SHALL persist that marking as part of that certification's unified progress storage (see `study-progress-tracking`).

#### Scenario: Marking a card known
- **WHEN** a user marks a flashcard as "known"
- **THEN** that card's known/unknown state is updated and persisted, and reflected the next time that card is shown

#### Scenario: Marking a card unknown
- **WHEN** a user marks a flashcard as "unknown"
- **THEN** that card's known/unknown state is updated and persisted, and the card becomes eligible for earlier review

### Requirement: Spaced review scheduling
The system SHALL schedule each flashcard's next eligible review date using a simplified SM-2-style algorithm driven by the known/unknown marking history for that card, and SHALL prioritize presenting cards that are due for review over cards not yet due.

#### Scenario: Repeatedly known card is scheduled further out
- **WHEN** a flashcard is marked "known" on consecutive reviews
- **THEN** the interval before that card is next due for review increases

#### Scenario: Unknown card becomes due again soon
- **WHEN** a flashcard is marked "unknown"
- **THEN** that card's next due date is reset to be eligible for review again sooner than a card in good standing

#### Scenario: Due cards surfaced first
- **WHEN** a user opens the flashcard view and at least one card in the current domain filter is due for review
- **THEN** the system presents a due card before cards that are not yet due

### Requirement: New flashcards default to due
The system SHALL treat any flashcard with no prior known/unknown history as immediately due for review.

#### Scenario: First-time flashcard view
- **WHEN** a user opens flashcards for a certification with no prior flashcard progress stored
- **THEN** all cards are treated as due, preserving the current default browsing experience
