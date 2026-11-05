---
name: accessibility
description: Use whenever building, changing, or reviewing any user interface (web pages, components, forms, buttons, links, images, colors, modals, menus) so it is usable by people with disabilities. Applies WCAG 2.2 Level AA. Also use when asked to "check accessibility", "a11y", "screen reader", or "keyboard support".
---

# Accessibility (WCAG 2.2 AA)

Goal: every person can perceive, operate, and understand the interface, including people who use a keyboard only, a screen reader, zoom, or have low vision or color blindness.

Treat these rules as requirements, not suggestions. If a rule cannot be met, say so explicitly and explain why.

## 1. Structure and semantics

- Use native HTML elements for their purpose: `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<ul>`/`<li>` for lists. Never use a clickable `<div>` or `<span>`.
- One `<h1>` per page; headings go in order (h1 → h2 → h3) without skipping levels.
- Set the page language (`<html lang="en">`) and a unique, descriptive `<title>`.
- Only add ARIA when no native element does the job. Wrong ARIA is worse than no ARIA.

## 2. Text alternatives

- Every meaningful image has `alt` text describing its purpose, not its appearance ("Submit order", not "green arrow").
- Decorative images use `alt=""` so screen readers skip them.
- Icon-only buttons need an accessible name (`aria-label="Close"` or visually hidden text).

## 3. Keyboard

- Everything clickable must work with Tab, Shift+Tab, Enter, Space, and Escape (to close dialogs and menus).
- Focus order follows the visual reading order. Avoid positive `tabindex` values.
- Focus must always be visible. Never remove the outline without a clear replacement style.
- Focused elements must not be hidden behind sticky headers, footers, or banners.
- No keyboard traps: the user can always Tab out of a component.
- When a dialog opens, move focus into it; when it closes, return focus to the button that opened it.

## 4. Color and visual design

- Text contrast: at least **4.5:1** for normal text, **3:1** for large text (24px, or 18.66px bold).
- Borders of inputs, icons, and focus indicators: at least **3:1** against the background.
- Never use color alone to convey meaning (for example, errors need an icon or text, not just red).
- The page must work at **200% zoom** and at **320px wide** without horizontal scrolling.
- Click/tap targets are at least **24×24 CSS pixels**.
- No content flashes more than three times per second.

## 5. Forms

- Every input has a visible `<label>` connected with `for`/`id`. Placeholders are not labels.
- Use correct `type` and `autocomplete` values (`type="email"`, `autocomplete="email"`).
- Errors are described in text, next to the field, and announced to screen readers (`aria-describedby`, `aria-invalid="true"`).
- Do not ask the user to re-enter information they already gave in the same process.
- Logins must not require solving puzzles or memorizing; allow password managers and paste.

## 6. Dynamic content

- Status messages ("Saved", "3 results found") use `role="status"` or `aria-live="polite"` so screen readers announce them.
- Moving or auto-updating content that lasts more than 5 seconds can be paused, stopped, or hidden.
- Respect `prefers-reduced-motion` for animations.

## Checklist before finishing

Run through this list and report the result for each item in your answer:

- [ ] Uses semantic HTML; no clickable `div`/`span`
- [ ] Headings in order; page has `lang` and `title`
- [ ] All images have correct `alt`
- [ ] Every interactive element works by keyboard, with visible focus
- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI parts)
- [ ] Meaning is never conveyed by color alone
- [ ] Every form field has a label; errors are in text and announced
- [ ] Works at 200% zoom and 320px width
- [ ] Recommend testing with an automated checker (axe DevTools or Lighthouse) plus a manual keyboard-only pass

## Reference

Standard: W3C Web Content Accessibility Guidelines (WCAG) 2.2, Level AA. Principles: Perceivable, Operable, Understandable, Robust.
