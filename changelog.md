# Changelog

All notable changes to this project will be documented in this file.

---

## [Unreleased/Planned for future]

- Adding request body validation to server using [Joi js]
- Exponential backoff retry policies for API integration with Starling sandbox
- Channeling logs to a log file or to a observability platform
- Better error message handling for the various Starling API errors
- Documentation & chores

Timeline TBD :)

---

## [1.0.0] – 2026-01-22

### Added

- Initial release of Spills monorepo.
- React client with:
  - Top header bar with Starling branding, profile, and savings goal icons.
  - Profile modal with account info and preferences.
  - Savings goal modal with creation, progress bar, and transfer integration.
  - Transaction feed with date filters, round-up calculation, and localStorage/Redux state.
  - Toast notifications for errors and actions.
- Express backend proxy with:
  - Secure Starling API proxying.
  - OAuth token refresh logic.
  - Structured logging (Morgan).
  - 404 and error handling.
- Full test coverage for client and server (Vitest, React Testing Library, supertest).
- Documentation for client, server, and root.

---

## [0.6.0] - 2026-01-21

### Added

- Update access token

---

## [0.5.0] - 2026-01-21

### Added

- Fix for transaction start date for a given week
- Fix for transaction start date. I have missed to calculate transactions date when the user selects the date and removed To date picker, it wasnt necessary.

- Some styles and chore updates

---

## [0.4.0] - 2026-01-21

### Added

- Savings goal feature to create/list/udpate the savings goal
- Ability to transfer the roundup transactions to savings goal

Chore

- Documentation updates
- Formatting
- README updates

---

## [0.3.0] - 2026-01-21

### Added

- Transaction lists with round up for each and total tranx for a given week
- Added transaction list view and collapsible accordian to show transx details
- The available round up amount should be in the details and also as a total for a selected week to be transferred.

Dev notes

- Since I am persisting account info and transxIds in local storage, i refactored code for redux usage

---

## [0.2.0] - 2026-01-20

### Added

- Account Info and account preferences in a profile section
- Fetches account details via proxy API and displays under the profile section. The profile section also contains account preferences for savings goal and round up.
- Tests coverage for the feature.
- Chore updates across

---

## [0.1.0] - 2026-01-19

### Added

- Project scaffolding for client and server.
- Initial README files.
