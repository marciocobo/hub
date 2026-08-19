# exam-attempt-history Specification

## Purpose

Records each practice-exam attempt so a user can see their score trend over time and identify which domains still need work, instead of the result disappearing on the next reload.

## Requirements

### Requirement: Record exam attempt on completion
The system SHALL, when a user completes a practice exam (simulado), record an attempt entry containing at minimum: completion date/time, overall score, and a per-domain correct/total breakdown, persisted as part of that certification's unified progress storage (see `study-progress-tracking`).

#### Scenario: Completing an exam records an attempt
- **WHEN** a user finishes answering all questions in a practice exam and views the results screen
- **THEN** a new attempt entry with date, score, and domain breakdown is appended to that certification's exam attempt history

#### Scenario: Retaking an exam adds a new entry rather than replacing
- **WHEN** a user retakes a practice exam after a previous attempt was already recorded
- **THEN** the new attempt is added as an additional history entry, and the prior attempt's entry is preserved

### Requirement: Display exam attempt history
The system SHALL display a certification's recorded exam attempt history (at minimum: date and score per attempt) on that certification's page.

#### Scenario: History visible after at least one attempt
- **WHEN** a user views the exam section of a certification page that has one or more recorded attempts
- **THEN** the page displays the list of past attempts with their scores and dates

#### Scenario: No history yet
- **WHEN** a user views the exam section of a certification page with no recorded attempts
- **THEN** the page displays with no history shown (or an explicit empty state), without errors

### Requirement: Bounded history size
The system SHALL cap the number of stored exam attempts per certification, discarding the oldest entries beyond the cap, so history storage does not grow unbounded.

#### Scenario: History exceeds cap
- **WHEN** a new exam attempt is recorded and the existing history for that certification is already at the maximum retained size
- **THEN** the oldest recorded attempt is discarded so the total stored attempts stays at or below the cap
