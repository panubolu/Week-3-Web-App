---
name: ux-design
description: Use whenever designing, building, or reviewing a screen, page, user flow, form, navigation, dashboard, or any feature a person interacts with. Ensures the experience is clear, consistent, forgiving of mistakes, and complete in every state (loading, empty, error, success). Also use when asked about "UX", "usability", "user flow", or "make it easier to use".
---

# UX Design

Goal: a first-time user can understand what to do, do it without help, and recover easily when something goes wrong.

Base every decision on Nielsen's 10 usability heuristics. When a design choice trades one rule against another, state the trade-off.

## 1. Start from the user's task

- Before building, write one sentence: "The user wants to ___ so that ___." Design for that task first; everything else is secondary.
- Put the main action where the eye lands first, styled as the primary button. Only one primary action per screen.
- Use the user's words, not internal or technical terms ("Your orders", not "Order entities").

## 2. Every screen has every state

Design and build all of these, not just the "happy path":

| State | What to show |
|---|---|
| Loading | A skeleton or spinner within 1 second; never a blank screen |
| Empty | Why it is empty and what to do next ("No projects yet. Create your first project.") |
| Error | What happened, in plain language, and how to fix it. Keep the user's input. |
| Success | Clear confirmation ("Saved") and the obvious next step |
| Partial / long content | Long names, 0 items, 1 item, 1,000 items, slow network |

## 3. Visibility and feedback

- Every click gets a visible response within 100 ms (pressed state, spinner, or result).
- Show where the user is (active nav item, page title, breadcrumbs for deep pages).
- Show progress for multi-step processes ("Step 2 of 3").

## 4. Prevent errors, then help recover

- Prevent mistakes: disable impossible options, use pickers instead of free text for dates, validate as the user types (after they leave a field, not on every keystroke).
- Confirm destructive actions, and prefer **Undo** over "Are you sure?" dialogs.
- Error messages say what went wrong and how to fix it: "Password must be at least 12 characters", never "Invalid input" or an error code alone.

## 5. Consistency

- Same action = same label, icon, color, and position everywhere.
- Follow platform conventions (logo links home, X closes, links look like links).
- Use a consistent spacing scale (for example 4/8/16/24/32 px) and a small set of text sizes.

## 6. Reduce effort

- Show options rather than making users remember them (recognition over recall).
- Smart defaults: pre-fill what you already know.
- Keep forms short; ask only for what is needed now.
- Remove anything that does not help the user's task (minimalist design).

## 7. Responsive

- Design mobile-first; check at 320px, 768px, and 1280px widths.
- Touch targets comfortably large; no hover-only features.

## Checklist before finishing

Report the result for each item in your answer:

- [ ] Main user task is stated and the primary action is obvious
- [ ] Loading, empty, error, and success states all exist
- [ ] Every action gives immediate visible feedback
- [ ] Error messages explain the problem and the fix, and keep user input
- [ ] Destructive actions can be undone or are confirmed
- [ ] Labels, icons, and placement are consistent across screens
- [ ] Works at mobile, tablet, and desktop widths
- [ ] Also applies the `accessibility` skill (good UX includes accessibility)

## Reference

Jakob Nielsen's 10 Usability Heuristics for User Interface Design (Nielsen Norman Group).
