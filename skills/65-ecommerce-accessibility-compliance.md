---
name: ecommerce-accessibility-compliance
title: Ecommerce accessibility compliance + inclusive conversion operations (WCAG 2.2 AA + European Accessibility Act + EN 301 549 mapping + ADA risk controls + Shopify storefront/checkout/apps/email/PDF accessibility) (Move #65)
category: accessibility
tier: 1
priority: P0
default_move: 65
year_1_roi_band: "3:1–14:1"
sms_friendly: false
last_updated: 2026-07-14
sources: [w3c-wcag-2.2-2023, w3c-understanding-wcag-2.2, w3c-wcag-em-1.0, w3c-easy-checks, w3c-aria-apg, w3c-wai-business-case, w3c-low-vision, ec-european-accessibility-act-2025, eurlex-directive-2019-882, eu-harmonised-standards-accessibility-2025, etsi-en-301-549-v3.2.1-2021, ada-dot-gov-web-guidance-2022, section508-ict-testing-baseline, shopify-theme-accessibility, axe-core, pa11y, lighthouse-accessibility, webaim-screen-reader-survey-10, microsoft-inclusive-design, apple-accessibility, android-accessibility, deque-axe-conformance, tpgi-arc, siteimprove-accessibility, level-access]
---

# Ecommerce accessibility compliance + inclusive conversion operations (Move #65)

> Make the entire buying journey—discovery, product evaluation, cart, checkout, payment, account, service, email, and documents—independently usable by disabled customers, using WCAG 2.2 AA as the engineering baseline and jurisdiction-specific legal review rather than an accessibility overlay or a one-time scanner score.

## When to use this skill

Use this skill when any of these conditions is true:

1. **The storefront has never had a manual accessibility audit.** A green Lighthouse badge is not proof that a keyboard-only shopper can select a variant, understand an error, enter payment details, or finish checkout.
2. **The brand sells to EU consumers.** The European Accessibility Act's service requirements have applied since **28 June 2025** to covered services, including e-commerce services, subject to national implementation, transition rules, exemptions, and enforcement.
3. **The brand serves US consumers and has unmanaged ADA exposure.** The US Department of Justice says the ADA applies to businesses open to the public and their web content, but its web guidance **does not establish a private-sector Title III technical standard**. Counsel must determine obligations and risk; WCAG 2.2 AA is the operational target, not a legal conclusion.
4. **A replatform, redesign, theme upgrade, checkout extension, consent manager, review widget, quiz, support chat, BNPL widget, or subscription portal is launching.** Accessibility must be a release gate because third-party code can break a previously usable journey.
5. **Support receives "I cannot complete checkout" reports with assistive technology.** Treat these as severity-one conversion defects, not edge-case feedback.
6. **The organization needs procurement criteria, an accessibility statement, a documented audit trail, or evidence for an enterprise buyer.** This runbook turns accessibility into repeatable product operations.

This is not legal advice and is not a conformance certificate. Involve qualified accessibility specialists and legal counsel for jurisdiction, exemption, enforcement, and contract questions.

## What "best in class" looks like

A best-in-class accessible commerce program combines five operating layers:

| Layer | Best-in-class operating state | Evidence |
|---|---|---|
| Governance | Named executive owner, product accessibility owner, engineering owner, support escalation owner, and quarterly steering review | RACI, risk register, remediation SLA, release policy |
| Design system | Components have keyboard, focus, zoom, contrast, error, reduced-motion, and screen-reader acceptance criteria before teams reuse them | Storybook/component tests plus design annotations |
| Full-journey engineering | Home → search → collection → PDP → cart → checkout → payment → confirmation → account/returns/support works without a mouse and without vision | Recorded task scripts across desktop and mobile assistive technology |
| Continuous assurance | Automated rules run in pull requests; manual regression runs before release; representative disabled-user research runs at least twice yearly | CI reports, issue tickets, audit log, user-research findings |
| Supplier control | Apps and vendors provide an Accessibility Conformance Report or equivalent evidence, contract remediation SLAs, and allow pre-production testing | Procurement questionnaire, contract clause, exception record |

### Scope the customer journey, not just templates

Inventory every customer-facing surface and owner:

- Header, navigation, search/autocomplete, filters, collections, PDP media, variants, quantity, add-to-cart, mini-cart, cart, promotions.
- Checkout contact, delivery, address validation, shipping, payment, wallet, BNPL, gift cards, error recovery, confirmation.
- Authentication, account, subscriptions, returns, order tracking, loyalty, reviews, quizzes, wishlists, store locator.
- Cookie consent, support chat, help center, contact forms, accessibility feedback mechanism.
- Transactional and marketing email, invoices, return labels, user guides, video, audio, downloadable PDF.

### Severity and remediation SLA

| Severity | Commerce example | Target SLA |
|---|---|---:|
| S0 release blocker | Cannot complete payment with keyboard or screen reader; keyboard trap; inaccessible legal consent | Before release / same-day rollback |
| S1 critical | Variant state not announced; required checkout errors unidentified; focus lost after cart update | 3 business days |
| S2 major | Low text contrast; missing visible focus; zoom/reflow loss; unlabeled secondary controls | 10 business days |
| S3 moderate | Redundant alt text; heading inconsistency; nonessential document issue | 30 business days |

## Ecommerce accessibility benchmarks (2026)

These are engineering targets derived from WCAG 2.2 Level A/AA success criteria, not a promise of legal compliance.

| Control | Operational benchmark | Test |
|---|---|---|
| Text contrast | **4.5:1** for normal text; **3:1** for large text (at least 18 pt or 14 pt bold equivalents) | Computed foreground/background state-by-state |
| Non-text contrast | **3:1** for meaningful UI components, states, and graphical objects | Inputs, focus indicator, icons, charts |
| Keyboard | Every interactive function operable; no trap; logical focus order; skip mechanism available | Tab, Shift+Tab, Enter, Space, arrows, Escape |
| Focus | Focus visible and not entirely hidden by sticky UI; WCAG 2.2 focus-appearance AA requirements assessed | Desktop and mobile layouts, modals, drawers |
| Reflow | No loss of information/function and no two-dimensional scrolling at **320 CSS px** except legitimate exceptions | Browser zoom/reflow test |
| Text resize | Content and controls remain usable at **200%** text resize | Browser settings and responsive states |
| Target size | Pointer targets meet **24 by 24 CSS pixels** minimum or a WCAG exception | Filters, swatches, close icons, quantity controls |
| Input help | Labels/instructions identify required data; errors identify the field and explain correction; redundant entry is reduced | Checkout form task and invalid submissions |
| Authentication | Do not require a cognitive-function test without an accessible alternative; password managers and paste work | Sign-in, OTP, CAPTCHA, account recovery |
| Media | Captions for prerecorded synchronized media; audio description or equivalent where needed; no autoplay surprise | PDP video and marketing content |
| Language/structure | Page language, descriptive title, headings, landmarks, lists, tables, and names/roles/values are programmatic | Accessibility-tree inspection |
| Status messages | Cart added, validation, stock, loading, and order updates are announced without moving focus unnecessarily | Screen-reader live-region test |

### Program metrics

Track these monthly; do not use a single scanner score as the goal.

| Metric | Launch gate | Steady-state target |
|---|---:|---:|
| S0/S1 open defects on purchase path | 0 | 0 |
| Critical customer journeys passing keyboard test | 100% | 100% |
| Critical journeys passing screen-reader task test | 100% | 100% |
| New/changed components with accessibility acceptance criteria | 100% | 100% |
| Automated checks in CI | Required | Required on every pull request |
| Third-party tools with evidence and tested fallback | 100% of critical tools | Reassess every renewal |
| Accessibility feedback acknowledged | ≤2 business days | ≤2 business days |
| Critical accessibility defect mean time to remediate | ≤3 business days | Downward trend |

## The build (14-day launch, then continuous monitoring)

### Days 1–2 — Establish scope, obligations, and ownership

1. Appoint executive, product, engineering, content, procurement, support, and legal owners.
2. Map countries served, establishment locations, channels, contracts, and products. Ask counsel to determine applicable law and exemptions.
3. For the EAA, document whether the service is covered and whether the service-provider microenterprise exemption may apply. EU guidance defines microenterprises as employing **fewer than 10 persons** and having annual turnover and/or balance-sheet total not exceeding **EUR 2 million**; do not self-certify without reviewing national implementation and facts.
4. Freeze destructive redesign work until the full purchase-path baseline is captured.
5. Publish an internal policy: WCAG 2.2 AA is the engineering baseline; law-specific review remains separate.

### Days 2–4 — Inventory and baseline

1. Export representative URLs/states: homepage, search, collection, 10 PDP archetypes, empty/full cart, each checkout step, confirmation, sign-in, account, returns, support, legal pages.
2. Include mobile, logged-out/in, sale, out-of-stock, subscription, gift-card, discount-error, address-error, payment-error, and localization states.
3. Run axe-core, Pa11y, or equivalent automated checks. Store raw results with timestamp, URL, viewport, rule, DOM selector, and screenshot.
4. Manually run W3C Easy Checks: title, alt text, headings, contrast, resize, keyboard, forms, and media.
5. Record the assurance rule explicitly: **automated testing cannot prove conformance**; it catches a subset of issues and must not replace human judgment, manual testing, assistive-technology testing, or disabled-user research.
6. Build one deduplicated defect backlog. Automated findings that share one component root cause should become one component ticket with every affected route attached.

### Days 4–7 — Fix the design system and shared shell first

1. Correct semantic HTML before adding ARIA. Use buttons for actions, links for navigation, native labels for fields, fieldsets/legends for related choices.
2. Repair header, navigation, skip link, search autocomplete, modal, drawer, toast, tabs, accordion, carousel, tooltip, form fields, alerts, and loading states.
3. Define focus restoration: after a modal/drawer closes, focus returns to the invoking control; after a failed submit, focus moves to the error summary or first invalid field according to the tested pattern.
4. Define visual tokens that meet contrast in default, hover, focus, disabled, selected, error, high-contrast, and forced-colors states.
5. Stop motion when the user prefers reduced motion. Never make essential content dependent on animation, hover, color, drag, or fine pointer precision.

### Days 7–10 — Repair commerce-critical flows

1. **Search/filter:** announce result counts; expose selected filters; preserve focus when results update; provide a non-drag alternative for price sliders.
2. **PDP:** give product images purposeful alt text; make thumbnails/buttons named; expose price, sale price, stock, selected variant, size information, delivery promise, and validation programmatically.
3. **Cart:** announce quantity/removal changes; preserve focus; expose discount status and totals; do not communicate errors by color alone.
4. **Checkout:** use persistent visible labels and correct autocomplete tokens; allow paste and password managers; provide an error summary linked to fields; avoid timeouts or permit extension; verify address suggestions, wallets, payment iframes, BNPL, and 3-D Secure.
5. **Confirmation/account:** announce completion; provide accessible order details, invoice, return label, tracking, cancellation, and support paths.
6. **Content:** caption video, transcribe audio, remediate essential PDFs, and make email templates readable at zoom with meaningful links and alt text.

### Days 10–12 — Test with assistive technology

Run task-based scripts rather than reading pages linearly:

| Environment | Minimum task suite |
|---|---|
| Windows + Chrome/Firefox + **NVDA** | Find product, filter, select variant, add, apply discount, checkout, recover from errors |
| macOS + Safari + **VoiceOver** | Same critical purchase path plus account and returns |
| iOS + Safari + **VoiceOver** | Mobile navigation, search, PDP media, wallet/checkout, support |
| Android + Chrome + **TalkBack** | Mobile navigation, filters, cart, checkout, authentication |
| Keyboard only | Entire task suite with visible focus and no trap |
| Zoom/reflow/contrast preferences | 200% text, 320 CSS px reflow, dark/high-contrast/forced-colors, reduced motion |

Use experienced testers, and include disabled users in representative usability research. Log task completion, blockers, confusion, time, severity, browser/AT version, and evidence.

### Days 12–14 — Release, disclose, and operationalize

1. Re-test all S0/S1 fixes and adjacent regression paths.
2. Publish an accessibility statement that accurately describes scope, target standard, known limitations, date, and a monitored feedback channel. Do not claim "fully compliant" from automated scans.
3. Train support to capture assistive technology, browser/device, task, URL, observed result, expected result, and safe contact details without demanding disability proof.
4. Add accessibility to definition-of-done, pull-request template, QA test plans, vendor procurement, incident response, and release go/no-go.
5. Store evidence: versions, test scripts, results, defects, decisions, exceptions, vendor evidence, remediation and re-tests.

### Continuous controls

- **Every pull request:** lint semantic issues; component tests; axe-core rules; keyboard smoke test for changed interactive flows.
- **Every release:** manual changed-flow regression and third-party widget check.
- **Monthly:** automated crawl plus top-task manual sample; review support feedback and SLA.
- **Quarterly:** full purchase-path keyboard/screen-reader regression; vendor review; statement update if scope changes.
- **At least twice yearly:** representative disabled-user research and independent risk-based review.
- **After any major replatform or checkout change:** repeat the conformance evaluation using a documented methodology such as WCAG-EM.

## Common pitfalls (18 from real builds)

1. **Pitfall #1 — Treating an accessibility overlay as remediation.** Overlays can interfere with assistive technology, cannot repair inaccessible source workflows, and may create false assurance. **Fix:** remediate the theme, components, content, checkout, and third-party integrations at source; offer user preferences only as additive features.
2. **Pitfall #2 — Declaring compliance from an automated score.** Rule engines cannot determine whether alt text is meaningful, focus order is logical, instructions are understandable, or checkout is usable. **Fix:** use automation as a regression layer and require keyboard, screen-reader, zoom, and human task testing.
3. **Pitfall #3 — Auditing only the homepage.** Most conversion blockers live in variants, filters, carts, error states, payment, authentication, and account tools. **Fix:** test complete journeys and every high-risk state, including failed submissions and third-party redirects.
4. **Pitfall #4 — Adding ARIA instead of fixing HTML.** Incorrect roles and states can make a custom control less usable than a native element. **Fix:** prefer native HTML; use WAI-ARIA Authoring Practices only when a native pattern cannot satisfy the requirement; test the accessibility tree.
5. **Pitfall #5 — Removing focus outlines for visual polish.** Keyboard users lose location and can no longer navigate safely. **Fix:** ship a visible, high-contrast focus treatment in every interactive state and check that sticky headers, cookie banners, and drawers do not obscure it.
6. **Pitfall #6 — Color-only sale, error, stock, or selection states.** A shopper who cannot distinguish color misses essential information. **Fix:** add text, iconography with accessible names, patterns, or programmatic state; meet contrast requirements in every state.
7. **Pitfall #7 — Unlabeled icon buttons and swatches.** "Button" or "red circle" does not tell the shopper "Remove item" or "Select color: Burgundy." **Fix:** provide concise accessible names and expose selected/unavailable state; verify with the accessibility tree and speech output.
8. **Pitfall #8 — Dynamic cart updates that are silent or steal focus.** The user cannot tell whether an item was added, or lands unpredictably elsewhere. **Fix:** announce status with an appropriate live region, preserve focus for passive updates, and deliberately restore focus when dialogs close.
9. **Pitfall #9 — Checkout errors that reset data or say only "invalid."** Shoppers cannot locate or correct the problem. **Fix:** preserve valid data; show an error summary; link errors to fields; describe the correction in text; set `aria-invalid` and an associated message.
10. **Pitfall #10 — Blocking paste, password managers, or accessible authentication.** Cognitive and motor-disabled users lose essential assistance. **Fix:** allow paste, browser/password-manager autofill, correct autocomplete tokens, and an alternative to puzzles or memorization tests.
11. **Pitfall #11 — Inaccessible third-party widgets.** Cookie consent, reviews, chat, quiz, subscription, BNPL, and payment components can block the journey. **Fix:** test third-party components before procurement and every upgrade; contract an SLA; provide an accessible fallback; replace vendors that cannot remediate.
12. **Pitfall #12 — Infinite carousels, autoplay, and motion without controls.** Content changes before it can be read and may cause vestibular harm. **Fix:** pause autoplay, expose controls, honor reduced-motion preferences, preserve reading/focus order, and never hide essential content in auto-advancing slides.
13. **Pitfall #13 — Writing alt text from filenames or keyword stuffing.** Screen-reader output becomes noise and search copy replaces the image's purpose. **Fix:** write context-specific alt text; use empty alt for decorative images; describe functional images by action; provide longer descriptions for essential complex visuals.
14. **Pitfall #14 — PDFs, invoices, and return labels left outside scope.** The website works but post-purchase self-service fails. **Fix:** generate tagged, logically ordered documents with meaningful headings/links/tables, or provide an equivalent accessible HTML version; test download and print flows.
15. **Pitfall #15 — Claiming EAA exemption without a documented analysis.** Employee count or turnover alone may be misread, and national implementation matters. **Fix:** have counsel document service scope, establishment, microenterprise facts, disproportionate-burden or fundamental-alteration analysis, transition rules, and review dates.
16. **Pitfall #16 — Assuming WCAG conformance alone resolves legal risk everywhere.** Legal obligations, remedies, monitoring, documentation, and sector rules vary. **Fix:** separate the engineering standard from the legal matrix; have counsel map countries, entities, services, exemptions, contracts, and enforcement.
17. **Pitfall #17 — Fixing production once and letting regressions return.** Theme updates, campaigns, app releases, and content edits silently reintroduce blockers. **Fix:** enforce accessibility in component governance, CI, manual release QA, vendor renewals, and quarterly full-journey regression.
18. **Pitfall #18 — Testing without disabled users or ignoring feedback.** Technical conformance can still leave confusing, inefficient tasks. **Fix:** pay representative disabled participants, protect privacy, publish a monitored contact channel, acknowledge feedback within two business days, and tie findings to the defect SLA.

## Verification (this skill is "shipped" when...)

- **Gate A — Governance and legal matrix:** owners, WCAG 2.2 AA engineering baseline, jurisdiction matrix, EAA analysis, US ADA counsel review, exemptions/transition decisions, and review dates are documented.
- **Gate B — Scope:** every customer-facing template, state, checkout/payment path, app, email, PDF, and support channel has an owner and test status.
- **Gate C — Automated baseline:** repeatable scans are stored, deduplicated, triaged, and run in CI; no critical automated violations remain on the purchase path.
- **Gate D — Keyboard:** all critical tasks pass with keyboard only; focus is visible, ordered, unobscured, restored correctly, and never trapped.
- **Gate E — Assistive technology:** the critical task suite passes with NVDA, desktop VoiceOver, iOS VoiceOver, and TalkBack on the supported browser matrix.
- **Gate F — Visual adaptability:** contrast, 200% text resize, 320 CSS px reflow, 24 by 24 CSS pixels target size, forced-colors/high-contrast, and reduced-motion tests pass or have documented WCAG exceptions.
- **Gate G — Forms and checkout:** labels, instructions, autocomplete, error summary, field errors, status messages, timeout handling, authentication, wallets, payment iframes, BNPL, and confirmation all pass.
- **Gate H — Content and post-purchase:** images, media, email, essential PDFs, invoices, labels, tracking, returns, and help content pass their applicable checks.
- **Gate I — Third parties:** critical vendors have current evidence, contract remediation terms, tested integrations, and an accessible fallback or approved replacement plan.
- **Gate J — Operations:** accessibility statement and feedback channel are live; support is trained; S0/S1 backlog is zero; release and quarterly regression calendars are active.

## How to extend this skill

- **Platform extension:** add Shopify Liquid/theme and checkout-extension patterns; Hydrogen/React component tests; Adobe Commerce/WooCommerce/BigCommerce equivalents; native-app WCAG2ICT/platform guidance.
- **Market extension:** maintain country-specific EAA implementation, UK Equality Act, Canada ACA/AODA, Australia DDA, and public-sector procurement matrices with counsel.
- **Content extension:** create role-specific authoring checklists for merchandising, lifecycle email, paid social, video, PDF, and customer support.
- **Procurement extension:** require accessibility conformance evidence, issue disclosure, roadmaps, testing access, indemnity/legal review, and remediation SLAs for every customer-facing vendor.
- **Measurement extension:** segment accessibility feedback and blocked-task incidents, but do not infer disability from behavior or create sensitive profiles without a valid privacy basis.
- **Maturity extension:** move from issue counts to task-success and defect-escape metrics; publish an internal accessibility scorecard tied to release governance rather than vanity scores.

## Cross-references

- **Move #6 — Mobile PDP redesign:** apply target-size, reflow, focus, variant-state, image, zoom, and mobile screen-reader acceptance criteria.
- **Move #22 — Checkout audit:** make keyboard, forms, error recovery, authentication, payment, and confirmation accessibility hard conversion gates.
- **Move #34 — CX customer-service operations:** create the accessibility feedback escalation and accessible alternative-service path.
- **Move #42 — Composable/headless commerce:** enforce semantic component contracts and automated/manual regression across independently deployed frontends.
- **Move #48 — Privacy and consent management:** ensure cookie consent is operable, understandable, focus-safe, and not an accessibility blocker.
- **Move #55 — Packaging engineering:** include accessible digital instructions and equivalent product/safety information where packaging relies on small print or QR codes.
- **Move #64 — AI search visibility:** structured data and machine-readable content do not replace accessible visible content or semantic interaction.

## Sources

Authoritative sources should be rechecked at each quarterly legal and standards review:

1. W3C, **Web Content Accessibility Guidelines (WCAG) 2.2**, W3C Recommendation, 5 October 2023 — https://www.w3.org/TR/WCAG22/
2. W3C WAI, **Understanding WCAG 2.2** — https://www.w3.org/WAI/WCAG22/Understanding/
3. W3C WAI, **WCAG-EM 1.0: Website Accessibility Conformance Evaluation Methodology** — https://www.w3.org/TR/WCAG-EM/
4. W3C WAI, **Easy Checks – A First Review of Web Accessibility** — https://www.w3.org/WAI/test-evaluate/preliminary/
5. W3C WAI, **ARIA Authoring Practices Guide** — https://www.w3.org/WAI/ARIA/apg/
6. European Commission, **European Accessibility Act** — https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act-eaa_en
7. EUR-Lex, **Directive (EU) 2019/882 on the accessibility requirements for products and services** — https://eur-lex.europa.eu/eli/dir/2019/882/oj
8. European Commission, **Harmonised Standards – Accessibility requirements for products and services** — https://single-market-economy.ec.europa.eu/single-market/european-standards/harmonised-standards/accessibility-requirements-products-and-services_en
9. ETSI, **EN 301 549 V3.2.1 (2021-03), Accessibility requirements for ICT products and services** — https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf
10. US Department of Justice, Civil Rights Division, **Guidance on Web Accessibility and the ADA** — https://www.ada.gov/resources/web-guidance/
11. US Access Board, **ICT Testing Baseline for Web** — https://ictbaseline.access-board.gov/
12. Shopify Help Center, **Accessibility for themes** — https://help.shopify.com/en/manual/online-store/themes/customizing-themes/accessibility
13. Deque, **axe-core** — https://github.com/dequelabs/axe-core
14. Pa11y, **Automated accessibility testing** — https://pa11y.org/
15. Google Chrome Developers, **Lighthouse accessibility audits** — https://developer.chrome.com/docs/lighthouse/accessibility/
16. WebAIM, **Screen Reader User Survey #10 Results** — https://webaim.org/projects/screenreadersurvey10/
17. W3C WAI, **The Business Case for Digital Accessibility** — https://www.w3.org/WAI/business-case/
18. Apple, **Accessibility** — https://developer.apple.com/accessibility/
19. Android Developers, **Build accessible apps** — https://developer.android.com/guide/topics/ui/accessibility
20. Microsoft, **Inclusive Design** — https://inclusive.microsoft.design/
