## Purpose

Gives each certification study page a single, consistently-keyed place to persist a user's progress (checklist, exam attempts, flashcard state), and lets the hub page surface that progress without duplicating tracking logic per page.

## ADDED Requirements

### Requirement: Unified progress storage schema
The system SHALL persist all study progress (checklist completion, flashcard state, exam attempt history) for a given certification under a single `localStorage` entry, keyed by a stable per-certification identifier that is consistent across the hub and the certification page.

#### Scenario: Checklist state persists under the unified key
- **WHEN** a user checks an item in the readiness checklist on a certification page
- **THEN** the updated checklist state is written under that certification's namespaced entry in the unified progress storage, not a page-specific ad hoc key

#### Scenario: Existing per-page progress is not silently lost
- **WHEN** a user who previously checked items under the old per-page storage keys (e.g. `ccaf_ck`, or a page's `CKKEY` value) opens a migrated certification page
- **THEN** their previously-saved checklist state is carried over into the unified schema so their progress is not reset to zero

### Requirement: Hub displays aggregate progress per certification
The system SHALL show, on each certification card in `index.html`, a summary of that certification's stored progress (at minimum: checklist completion percentage) derived from the unified progress storage.

#### Scenario: Progress shown for a certification with saved state
- **WHEN** the hub page loads and unified progress storage contains data for a certification
- **THEN** that certification's card displays a progress indicator reflecting the stored checklist completion percentage

#### Scenario: No progress yet recorded
- **WHEN** the hub page loads and unified progress storage has no entry for a certification
- **THEN** that certification's card displays with no progress indicator (or an explicit "not started" state), without errors

### Requirement: Progress isolated per certification
The system SHALL keep progress data for each certification independently addressable within the unified schema, so that updating one certification's progress does not overwrite or affect another certification's stored data.

#### Scenario: Updating one certification does not affect another
- **WHEN** a user updates checklist, flashcard, or exam state on one certification page
- **THEN** the stored progress for other certifications remains unchanged
