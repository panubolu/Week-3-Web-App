# Accessibility checks (T-29, T-30)

Checked on November 10, 2026, against WCAG 2.2 AA and the project accessibility skill. Pages checked: `/`, `/browse`, `/privacy`, `/sign-in`, `/talk-to-a-person`, and the not-found page.

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

## Still to do, by a person

### 1. NVDA screen reader pass (about 15 minutes)
NVDA is free: https://www.nvaccess.org/download/. Start it, then use only the keyboard on https://firststep-app-nine.vercel.app:
1. Press Tab until you reach "Project experience". NVDA should say "Step 1 of 3" and the question once.
2. Press Enter. NVDA should read your answer and the next question **once**, not twice.
3. Type "Is Tech Fleet free?" in the text box and press Enter. The reply should be read once.
4. Finish all three questions. "Here are N options that fit you" should be read, and the cards should have readable headings (press H to jump between them).
5. Press Tab to "Talk to a person" and Enter. Then Tab to "Copy summary" and Enter. NVDA should say "Summary copied".

Note anything read twice, missed, or confusing.

### 2. Lighthouse on mobile (about 2 minutes)
In Chrome, open https://firststep-app-nine.vercel.app, then press F12, open the **Lighthouse** tab, choose **Mobile** with Performance, Accessibility and Best practices, and click **Analyze page load**. The target is 90+ for Performance, with LCP 2.5 s or less, TBT under 200 ms, and CLS 0.1 or less. (Running Lighthouse from the build tools was blocked by this session's permissions, so this one is done by hand.)

### 3. Full conversation with only a keyboard
The browser pane couldn't receive real key presses during this check. Repeat steps 1 to 5 above without NVDA, and confirm the focus ring is visible at every step.
