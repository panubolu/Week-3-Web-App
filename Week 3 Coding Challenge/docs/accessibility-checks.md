# Accessibility checks (T-29, T-30)

Checked on November 10, 2026, against WCAG 2.2 AA and the project accessibility skill. Pages checked: `/`, `/browse`, `/privacy`, `/sign-in`, `/talk-to-a-person`, and the not-found page. The checks done by a person followed on November 11 (see "Checks by a person" below).

## Found and fixed in this change

| Problem | WCAG | Fix |
|---|---|---|
| Keyboard focus on Material UI buttons was nearly invisible: no outline, only a faint ripple | 2.4.7 Focus Visible, 2.4.13 Focus Appearance | A 3px dark-teal outline with a 2px gap on every focused element, set once in `src/theme.ts`. Dark teal is 7.6:1 on white and 6.6:1 on the chat bubbles. |
| Animations ignored the "reduce motion" setting | 2.3.3 Animation from Interactions | A `prefers-reduced-motion` rule in the theme stops ripples and transitions for people who ask for less motion. |

## Results

| Check | Result |
|---|---|
| axe (WCAG 2.0–2.2 A/AA and best practice) on all 6 pages at 320, 768 and 1280px | **0 violations** (18 runs). One run caught the talk page mid-reload during the theme change; 6 reruns were clean. Also clean in earlier states: edit panel, typed-answer error, delete dialog, no-match, honest reply, and two-miss help. |
| Text contrast | Lowest text pair 5.47:1 (teal on white). Body text 14.7:1, muted text 7.6:1, "No experience needed" (ink on yellow) 9.3:1, member bubble 14.6:1. |
| Borders, icons, focus ring at least 3:1 | Input borders 4.8:1, focus ring 7.6:1 |
| Color never the only signal | Labels are text ("No experience needed"), errors are text with an icon, and the progress bar is paired with "Step X of 3" text |
| 320px wide, no sideways scrolling | Pass on all pages |
| 200% text size | Pass on all pages: no sideways scrolling and no cut-off visible text. (Two hidden helper elements report as cut off by design: the screen-reader-only "Step 1 of 3." and Material UI's invisible label copy in the text box border.) |
| 768px and 1280px | Pass on all pages |
| Tap targets at least 24×24px | Pass on all pages (0 smaller controls) |
| One `h1` per page, headings in order | Pass on all pages |
| Unique page titles | FirstStep · Browse opportunities · Privacy · Save my progress · Talk to a person · Page not found (each ending "\| FirstStep") |
| Tab order follows reading order, no positive tabindex, no fake buttons | Pass. Home order: logo, Talk to a person, Browse all, Save my progress, the 4 answers, text box, Send, Privacy. |
| Every control has a name | Pass (0 unnamed) |
| New messages in a polite live region | Pass. The conversation is `role="log"` with `aria-live="polite"`. Copy confirmations and counts use `role="status"`. |
| Dialogs: Escape closes, focus returns | Pass on the delete dialog (real keyboard, T-32) |
| Real keyboard passes | Done during earlier work: browse filters and Clear filters, the delete dialog, the talk page, editing answers with Escape. |
| Loading speed in the browser pane (fast network, phone size) | Home: LCP 0.7 s, CLS 0.03. Browse: LCP 2.1 s, CLS 0. Both within the targets (LCP 2.5 s or less, CLS 0.1 or less). |

## Checks by a person (November 11, 2026)

Done by Preeti on the live app, https://firststep-app-nine.vercel.app.

| Check | Result |
|---|---|
| Lighthouse, Mobile, home page (Edge DevTools, InPrivate window) | **Pass.** Performance 96, Accessibility 100, Best practices 100, SEO 100. LCP 2.4 s, TBT 130 ms, CLS 0.029, First Contentful Paint 0.8 s, Speed Index 3.3 s. LCP is just inside the 2.5 s target on Lighthouse's simulated slow phone network; watch it if the home page grows. |
| Full conversation with only a keyboard (Edge InPrivate) | **Pass.** Using only Tab, Shift+Tab and Enter: answered all three questions, changed an answer with Edit, opened Talk to a person, and used Copy summary (the copied text matched the answers). The focus outline was visible at every step. |
| Copy summary in a real browser | **Pass.** The summary copied and pasted correctly, both on its own and at the end of the keyboard-only run. |
| NVDA screen reader, reading order | **Pass.** On the results page NVDA read the navigation links, then the cards, in order, with nothing skipped. |
| NVDA screen reader, each new message read once | **Not done.** The question steps below were skipped by choice. The conversation is a polite live region (`role="log"`, `aria-live="polite"`) and axe finds no issues, but nobody has listened to a reply with a screen reader yet. Do this with a usability tester who uses one, or in version 2. |

## Still to do, by a person

### 1. NVDA screen reader pass, question steps (about 15 minutes)
NVDA is free: https://www.nvaccess.org/download/. Start it, then use only the keyboard on https://firststep-app-nine.vercel.app:
1. Press Tab until you reach "Project experience". NVDA should say "Step 1 of 3" and the question once.
2. Press Enter. NVDA should read your answer and the next question **once**, not twice.
3. Type "Is Tech Fleet free?" in the text box and press Enter. The reply should be read once.
4. Finish all three questions. "Here are N options that fit you" should be read, and the cards should have readable headings (press H to jump between them).
5. Press Tab to "Talk to a person" and Enter. Then Tab to "Copy summary" and Enter. NVDA should say "Summary copied".

Note anything read twice, missed, or confusing.

Lighthouse on mobile and the keyboard-only conversation were done on November 11 (results above).

**How to start NVDA's Speech viewer** (it shows everything NVDA says as text): right-click the NVDA icon near the clock, then choose Tools, then Speech viewer. Use a fresh InPrivate or Incognito window so the app starts at Step 1, not at saved results.
