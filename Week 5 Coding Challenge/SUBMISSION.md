# Week 5 Coding Challenge: Submission

**Student:** Preeti Anubolu · Premium Residency
**App:** FirstStep, a guided onboarding chat that helps new Tech Fleet members find a first step that fits their goals, experience and time, using only approved Tech Fleet information, with a real person one click away.

> The app's code is in the `Week 3 Coding Challenge` folder of this repository, and the CI pipeline is in `.github/workflows/ci.yml`. This folder holds only the submission, kept separate from the code as the homework asks.

## Links

1. My GitHub repository: https://github.com/panubolu/Week-3-Web-App
2. My live app on Vercel: https://firststep-app-nine.vercel.app
3. My database diagram: https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/database-diagram.md

## Documents

1. My Notion links:
   - Manual test case scenarios with results (TC-01, TC-02 and TC-03; 22 of 22 steps passed): https://app.notion.com/p/419360ed631c81f59f07d2b4740c8a47
   - Week 2 FirstStep specifications (use cases and BDD scenarios the checks come from): https://app.notion.com/p/255360ed631c83c49349013d275f7e13
2. Any other document links:
   - The CI/CD pipeline (GitHub Actions workflow, 6 checks): [.github/workflows/ci.yml](https://github.com/panubolu/Week-3-Web-App/blob/main/.github/workflows/ci.yml)
   - Every pipeline run (Actions tab): https://github.com/panubolu/Week-3-Web-App/actions
   - Proof a broken change is caught: red run after breaking the UX skill on purpose: https://github.com/panubolu/Week-3-Web-App/actions/runs/43769865348, and green again after undoing it: https://github.com/panubolu/Week-3-Web-App/actions/runs/43770055893
   - Pull requests that built it: [#35 CI pipeline](https://github.com/panubolu/Week-3-Web-App/pull/35) and [#37 test coverage gate](https://github.com/panubolu/Week-3-Web-App/pull/37)
   - Decision record: [ADR-0018: A CI pipeline on GitHub Actions](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/docs/adr/0018-ci-pipeline-on-github-actions.md)
   - Week 2 BDD scenarios as automatic tests: [src/bdd/week2-scenarios.test.ts](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/src/bdd/week2-scenarios.test.ts)
   - Claude Skills gate: [src/quality/skills-check.ts](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/src/quality/skills-check.ts) and [scripts/check-skills.ts](https://github.com/panubolu/Week-3-Web-App/blob/main/Week%203%20Coding%20Challenge/scripts/check-skills.ts)

## What I Did

This week's homework centered on creating test cases for our application. After providing Claude with the assignment link, lecture notes, and week 4 product requirements, it suggested the initial two test cases. Implementing these CI/CD checks allows us to verify app features and detect functional bugs, ultimately minimizing human error and accelerating bug fixes throughout the software development lifecycle.

- **Continuous Deployment**: Ship single features incrementally and continuously.
- **Quality Assurance**: Decrease the overall number of bugs over time.
- **Process Efficiency**: Minimize human error within the software release cycle.
- **Rapid Resolution**: Resolve software issues and bugs faster.

I decided to move forward with the first two test cases recommended by Claude because they effectively emphasize what distinguishes this application from Fleety, the current Tech Fleet chatbot. In particular, these test cases evaluate how well the platform guides community members based on their specific skills and available time.

- **Test Case 1:** Helping a career changer with limited availability find an appropriate starting point.
- **Test Case 2:** Connecting a user to a human representative when their inquiry exceeds FirstStep's capabilities.

To gain hands-on practice in writing and running test cases independently, I authored the third test case without relying on Claude. This scenario focuses on enabling users to seamlessly resume their FirstStep experience if they need to pause unexpectedly or take a break before completing all three steps.

## What I Learned

Test case scenarios and BDD scenarios allow us to thoroughly evaluate variations within a single use case. This ensures the application fulfills all project requirements while providing a smooth user experience with minimal friction.

I really enjoyed learning how to craft test cases and BDD scenarios. It was great to see how my classmates developed their own versions during class discussions.

### Next Steps & Future Impact

- **Earlier Testing Integration**: Moving forward, I plan to start creating test cases earlier in the development lifecycle, alongside app construction, so we can continuously validate and refine features and functionality.
- **Long-Term Practical Application**: The experience gained from this assignment will serve as a strong foundation for designing comprehensive test cases and BDD scenarios in future project work.
