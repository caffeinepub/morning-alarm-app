# Dusk Alarm

## Current State
Fully working frontend-only alarm clock app with: alarm list, add alarm form, repeat schedules, snooze/dismiss overlay, PWA install support, and install banner. All data persisted in localStorage. Custom Suzume mp3 alarm sound.

## Requested Changes (Diff)

### Add
- **Settings screen**: Accessible via a "Settings" nav link. Contains a text input for the user's name, saved to localStorage under key `dusk-user-name`. Shows a save confirmation.
- **Personalized wake-up message**: When the alarm firing overlay appears, show:
  - `"[NAME], you said you want to crack exams. Wake up."` (if name is set; else `"Wake up!"` )
  - `"This alarm will NOT stop until you complete a real-world task."`
- **Math challenge**: 3 simple arithmetic questions (addition and subtraction, numbers 1–20). User must answer all 3 correctly (wrong answer shakes/resets current question). Progress shown as 1/3, 2/3, 3/3.
- **Tap challenge**: A button labeled "Tap!" that must be tapped 20 times. A progress bar shows current count (e.g., 8/20 taps).
- **Challenge selection**: When alarm fires, user sees both challenges side by side (or stacked on mobile). They pick ONE to complete. Once a challenge is fully completed, the alarm stops and overlay closes.
- Snooze button remains available alongside the challenges.

### Modify
- **Alarm firing overlay**: Replace the simple Dismiss button with the two-challenge UI. Snooze button stays. Remove standalone Dismiss button (alarm only stops when challenge is completed or snoozed).
- **Nav**: Add a "Settings" link that switches the main view to the settings screen. Replace the current non-functional "Sleep" link.

### Remove
- The standalone "Dismiss" button from the alarm overlay (user must complete a challenge to dismiss).

## Implementation Plan
1. Add `userName` state, load/save from localStorage key `dusk-user-name`.
2. Add `view` state: `'alarms' | 'settings'`. Nav links switch views.
3. Build `SettingsScreen` component: name input + save button + confirmation.
4. Add `generateMathQuestion()` helper: returns `{ a, b, op, answer }` with op being + or -, numbers 1–20, result always positive.
5. Build `MathChallenge` component: shows question, number input, submit. Tracks 3-question progress. On completion, calls `onComplete()`.
6. Build `TapChallenge` component: large tap button, progress bar 0–20. On completion, calls `onComplete()`.
7. Update alarm firing overlay: show motivational message with username, render both challenge cards, remove Dismiss button, keep Snooze.
8. Wire `onComplete` to `handleDismiss` in the overlay.
