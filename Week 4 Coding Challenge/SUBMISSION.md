# Week 4 Coding Challenge: Submission

**Student:** Preeti Anubolu · Premium Residency, Advanced homework
**App:** FirstStep, a guided onboarding chat that helps new Tech Fleet members find a first step that fits their goals, experience and time, using only approved Tech Fleet information, with a real person one click away.

> The app's code is in the `Week 3 Coding Challenge` folder of this repository. This folder holds only the submission, kept separate from the code as the homework asks.

## Links

1. My GitHub repository: https://github.com/panubolu/Week-3-Web-App
2. My live app on Vercel: https://firststep-app-nine.vercel.app
3. My database diagram: https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/database-diagram.md (full design: [docs/database-design.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/database-design.md))
4. My ADR folder: https://github.com/panubolu/Week-3-Web-App/tree/main/Week%203%20Coding%20Challenge/docs/adr (17 ADRs)

## Documents

1. My Notion links:
   - Week 4 FirstStep Technical Architecture: https://app.notion.com/p/40f360ed631c81ba9de5cafbf7a8f070
   - Week 2 FirstStep specifications (vision, requirements, build plan, updated for Week 4): https://app.notion.com/p/255360ed631c83c49349013d275f7e13
   - Backlog Kanban Board: https://app.notion.com/p/9a0360ed631c835a9f92811df487d498
   - Build and Launch Templates, filled in (checklists, ADR and database templates): https://app.notion.com/p/2b1360ed631c829c9d95012fb7443cb3
   - Usability Test Plan and Script (Advanced): https://app.notion.com/p/230360ed631c8283888d8155a01f8fe2
   - Usability Test Results and Analysis, the research report (Advanced): https://app.notion.com/p/517360ed631c826f964281e3c4384399
   - Fleety Onboarding Audit: https://app.notion.com/p/415360ed631c81bf83e1ef40ad189ad6
2. Any other document links (in the repository):
   - Technical architecture: [docs/technical-architecture.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/technical-architecture.md)
   - Security checks: [docs/security-checks.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/security-checks.md)
   - Accessibility checks: [docs/accessibility-checks.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/accessibility-checks.md)
   - Sample dialogues: [docs/sample-dialogues.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/sample-dialogues.md)
   - Content sources: [docs/content-sources.md](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/content-sources.md)
   - Database migrations: [supabase/migrations](https://github.com/panubolu/Week-3-Web-App/tree/main/Week%203%20Coding%20Challenge/supabase/migrations)

## What I Did

Following the completion of the product requirements in Week 2, I designed the technical architecture utilizing Supabase for the database, Vercel for prototyping, and GitHub for repository management. The architecture was built upon functional and non-functional requirements, vision boards, epics, features, and tasks, with acceptance criteria playing a critical role in establishing the non-functional requirements.

During Week 4, the Minimum Viable Product (MVP) was successfully developed and deployed on Vercel. Testing was conducted from the perspective of a new guest user utilizing dummy data to validate the four defined core epics. This process successfully verified guided conversation flows across both button selections and typed inputs.

The web application was developed using Next.js and Material UI for the front end, Supabase for the database, and GitHub as the repository, with Vercel handling deployment. Throughout the process, Claude 5.5 Opus served as an AI coach and assistant.

Managing the deployment checks on Vercel proved challenging, as every modification required pulling, merging, and redeploying the updates.

Although building this for the first time presented a challenge, having clear instructions and a defined outcome made it manageable to construct incrementally, step by step.

Following deployment, I conducted comprehensive usability and accessibility testing. This evaluation revealed several usability problems , which were documented in a research report. These findings were then used to refine and rebuild key areas of the application in version 2 to ensure all identified issues were resolved.

Building Kanban boards, defining acceptance criteria, and detailing use cases significantly deepened my understanding of project workflows. This experience equipped me with the skills to draft and organize Kanban boards more effectively for future projects.

## What I Learned

Working on technical architecture for the first time initially felt overwhelming, and I felt anxious about whether I could finish this week's project work. However, taking small steps, reviewing class lecture notes, and watching recordings helped me become comfortable using Claude to ask for the right information with effective prompts.

Collaborating with Claude to develop this app on Vercel was an engaging experience. By leveraging Claude's guidance and drawing upon lecture notes, homework, and example resources, I was able to make steady, incremental progress every day.

For next steps if I had been given additional time, I would initiate deeper research and conduct upfront usability testing to evaluate and refine features, ensuring tighter alignment with the product's MVP.

Overall, examining this tech stack provided a comprehensive overview of the technical build, highlighting the specific roles of GitHub, Vercel, Supabase, and Next.js, and demonstrating how these components work together to translate product requirements into a functional web application.
