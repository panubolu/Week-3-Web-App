# Security (Week 6)

Week 6 Coding Challenge, **Security Test a Code Base**, for FirstStep (the Week 4 application). This folder holds the reports; the app's code is in `Week 3 Coding Challenge/`.

| File | What it is |
|---|---|
| [pentest-report.md](pentest-report.md) | Full penetration test of FirstStep: background, scope, threat model, 54 audit results across all 5 software layers and 3 network tiers, 17 findings with proof, recommendations, key inventory |
| [research-report-service-layer.md](research-report-service-layer.md) | Research report on one software layer, the **Service layer**: what it does, its vulnerabilities, the challenges of securing it, and the OWASP fixes |
| [service-layer-slides.pdf](service-layer-slides.pdf) | Slide deck for the research report (14 slides) |
| [security-scenarios.feature](security-scenarios.feature) | One `@security` BDD scenario per recommended fix (SEC-01 to SEC-14) |

**Also in Notion:** the PenTest Report Template (with the PenTest Audit and PenTest Findings tables) and the FirstStep Security Requirement Specs (Week 6), one spec per fix.

**At a glance:** 0 critical, 0 high, 4 medium and 13 low findings. The code's defences held (Row Level Security 26/26, prompt injection 13/13, forged tokens rejected); most findings were platform settings and design around the code. One medium finding was partly fixed during the test.
