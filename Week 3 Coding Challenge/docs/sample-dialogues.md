# Sample dialogues (T-39)

Three example conversations that define how FirstStep should behave. Use them as test scripts for checking the live app (T-34). The happy path and handoff were run on the live app on November 10, 2026, and FirstStep's lines below are copied from its real replies. The member's lines are made-up examples.

**Version 2 (November 12, 2026):** the welcome and "Talk to a person" wording below were updated after the first usability test. "Talk to a person" is now "Email a person" (ADR-0017), and the page address is unchanged.

How to read them: **FirstStep** lines are fixed wording from the app. Claude never writes them (ADR-0016). **Buttons** are what's tappable at that moment. The server decides every step (ADR-0005), and each turn asks one question.

---

## 1. Happy path: a career changer with a little time

| # | Who | What happens |
|---|---|---|
| 1 | FirstStep | "Hi! I'm FirstStep, an AI guide. I'll ask three short questions, which takes about 2 minutes, and suggest first steps that fit you, each with a link to the official Tech Fleet page." |
| 2 | FirstStep | "Tech Fleet is a nonprofit that helps trainees build their skills at no cost. Joining, onboarding calls, observing teams and project training are free; some masterclasses have a small fee." Then: "I only use approved Tech Fleet information. If you'd like help from a real person, choose "Email a person" at any time." |
| 3 | FirstStep | *Step 1 of 3: Goal.* "What are you looking for?" Buttons: Project experience · Learning · Community involvement · Not sure yet. Text box: "Or type your answer". Below it: "Prefer to look around first? Browse all opportunities" and "Need help from a real person? Email a person". |
| 4 | Member | types "I want to learn new skills" |
| 5 | FirstStep | Saves **Learning**. *Step 2 of 3: Experience.* "How much tech experience do you have?" Buttons: New to tech (No tech job or team project yet) · Some experience (A course, bootcamp, or side project) · Experienced in tech (Worked in a tech role before). |
| 6 | Member | types "total beginner, I teach high school" |
| 7 | FirstStep | Saves **New to tech**. *Step 3 of 3: Time.* "About how many hours a week can you give?" Buttons: Under 5 hours · 5 to 10 hours · 10 to 20 hours · More than 20 hours. |
| 8 | Member | types "about 3 hours a week" |
| 9 | FirstStep | Saves **Under 5 hours**. "Here are 3 options that fit you:" |
| 10 | Cards | **Join a community onboarding call.** About 1–2 hours a week · No experience needed · Why it fits: "It's open to people new to tech, and it fits your under 5 hours a week." |
|  |  | **Observe a project team.** About 1–3 hours a week · No experience needed · same reason |
|  |  | **Read the handbooks and core courses.** About 1–3 hours a week · No experience needed · same reason |
| 11 | FirstStep | "Was this helpful?" Buttons: Yes · Not really. Text box: "Change an answer or ask a question". |

**What to check:**
- Three questions, one at a time, with "Step X of 3" shown.
- Each card links to its official Tech Fleet page and says "From approved Tech Fleet content, last checked Nov 2026".
- No card promises a place.
- People new to tech are never shown project training.

---

## 2. No match: nothing fits yet

> **Not reachable with the current content.** The 6 approved opportunities cover every combination of answers (a test checks this). This dialogue uses the app's exact no-match wording. Automated tests with made-up content cover the screen. It becomes testable on the live app if the content file ever leaves a combination uncovered.

Example with made-up content where nothing fits project experience, new to tech and under 5 hours:

| # | Who | What happens |
|---|---|---|
| 1–7 | | Same opening and questions as the happy path. The member answers Project experience, then New to tech. |
| 8 | Member | taps **Under 5 hours** |
| 9 | FirstStep | "Nothing in project experience fits under 5 hours a week at your experience level right now." |
| 10 | FirstStep | If an approved opportunity fits the member's level and hours in another area: "Here's a way to start with less commitment:" followed by that one card, labelled as an alternative, never as a match. |
| 11 | FirstStep | Three next steps: **Change your hours** (the hour buttons, without restarting), **browse all opportunities**, or **email a person**. |

**What to check:**
- The reason is kind and in plain language.
- An alternative is never shown as a match.
- Changing the hours brings back results without restarting.
- Browse and Email a person both work.

---

## 3. Handoff: a question FirstStep can't answer, then a person

| # | Who | What happens |
|---|---|---|
| 1–3 | | Same opening as the happy path. |
| 4 | Member | types "I want real team experience" |
| 5 | FirstStep | Saves **Project experience**. *Step 2 of 3.* "How much tech experience do you have?" |
| 6 | Member | types "Do I need my own laptop?" |
| 7 | FirstStep | "I don't have approved information on that, so I don't want to guess. A person can help: **Email a person**." The step doesn't change, and the question is saved (contact details removed) for the coordinator to review. |
| 8 | Member | types "I did a bootcamp last year" |
| 9 | FirstStep | Saves **Some experience**. *Step 3 of 3.* "About how many hours a week can you give?" |
| 10 | Member | chooses **Email a person**, in the header or below the question |
| 11 | Email a person page | Preeti Anubolu, Tech Fleet member and former project coordinator. **Email Preeti** · "Or copy the address" · "You can also contact the Tech Fleet team." |
| 12 | Summary | Pre-filled in the email and shown with **Copy summary**:<br />"Hi Preeti,<br /><br />I used FirstStep and would like help finding my first step in Tech Fleet.<br /><br />My answers so far:<br />- What I'm looking for: Project experience<br />- My tech experience: Some experience<br />- Hours a week: not answered yet<br /><br />I was on the third question." |
| 13 | Member | chooses **Keep chatting** and returns to step 3 with their answers kept |

**What to check:**
- The honest reply uses the exact approved wording.
- Nothing is invented.
- The summary has no personal details and no typed text.
- Copy summary is announced.
- Keep chatting returns to the same step.

---

## Other behaviors covered by the rule tests
`npm run rule-tests` has 36 more scripted cases. They include:
- questions with approved answers ("Is Tech Fleet free?");
- typed changes ("Actually I have 5 hours" changes the hours and the results);
- help after two misunderstood messages (rephrase first, then offer browse or a person);
- four attempts to break the rules, all of which change nothing.
