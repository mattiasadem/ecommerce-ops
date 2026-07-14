---
name: product-safety-compliance-recall-operations
title: Product safety compliance + recall operations (Move #69, CPSC + CPSIA + GCC/CPC + EU GPSR + EU Responsible Person + UK product safety + California Proposition 65 + FDA MoCRA + lot traceability + marketplace takedown + incident triage + recall command center)
category: product-compliance
tier: 1
priority: P0
default_move: 69
year_1_roi_band: "3:1–15:1"
sms_friendly: false
last_updated: 2026-07-14
sources: [cpsc-gcc-2026, cpsc-cpc-2026, cpsc-section-15-reporting-2026, cpsc-recall-handbook-2026, cpsc-saferproducts-2026, cpsia-15-usc-2063, cpsa-15-usc-2064, ecfr-16-cfr-1107, ecfr-16-cfr-1110, ecfr-16-cfr-1115, eu-gpsr-2023-988, eu-safety-gate-2026, uk-opss-product-safety-2026, california-oehha-proposition-65-2026, fda-mocra-2026, fda-cosmetic-complaints-2026, fda-recall-policy-21-cfr-7, fda-dietary-supplements-2026, fcc-equipment-authorization-2026, eu-reach-2026, eu-rohs-2026, gs1-global-traceability-standard-2026, iso-10377-product-safety-2013, iso-10393-product-recall-2013]
---

# Product safety compliance + recall operations (Move #69)

> Build one SKU-level compliance control plane that blocks unsafe launches, preserves evidence, detects incidents early, and can identify, stop, notify, refund, and reconcile every affected unit without guessing.

## When to use this skill

Use this skill when a physical-product brand sells or imports into the United States, European Union, Northern Ireland, or Great Britain and any of these are true:

- You are the importer of record, private-label manufacturer, marketplace seller, or distributor whose name appears on the product.
- You sell children's products, toys, electronics, batteries, cosmetics, food, supplements, apparel, furniture, kitchenware, or another regulated category.
- A SKU launches before Legal/Quality can produce its applicable-standard matrix, test report, certificate, label proof, supplier declaration, and traceability record.
- Customer-service tickets mention injury, burn, fire, choking, poisoning, allergic reaction, contamination, electric shock, tip-over, laceration, or unexpected product failure.
- The EU storefront cannot show manufacturer details and, where required, an EU-based responsible economic operator before purchase.
- Amazon, TikTok Shop, Walmart, or another marketplace requests compliance documents and the team assembles them from email.
- A recall drill cannot answer within four hours: **which lots, how many units, which customers, which countries, which channels, which inventory locations, and who owns the regulator report?**

Do **not** use this runbook as a substitute for product-specific legal advice, laboratory scoping, or regulator instructions. Product rules are category-, claim-, material-, age-grade-, voltage-, chemistry-, and destination-specific. The operating system below makes those decisions explicit and auditable; qualified counsel and accredited labs still validate the decision.

### Entry criteria

| Requirement | Minimum evidence before starting |
|---|---|
| Product master | SKU, variant, GTIN, intended use, foreseeable misuse, age grade, materials, components, batteries, claims, countries, importer/manufacturer |
| Supplier control | Signed specification, bill of materials, change-notification clause, defect escalation SLA, audit right, indemnity, insurance evidence |
| Incident feed | Gorgias/Zendesk, reviews, returns, warranty, marketplace notices, lab failures, supplier deviations, insurer claims |
| Traceability | Purchase order → production lot/batch → inbound receipt → inventory location → order/customer linkage |
| Decision owners | Accountable product-safety lead, Quality, Legal, Operations, CX, Finance, Communications, executive incident commander |
| Budget | Testing and counsel priced per risk and SKU; do not force a universal per-SKU budget |

## What "best in class" looks like

Best in class is not “we have certificates.” It is a closed-loop safety management system.

| Control | Floor | Best in class | Proof |
|---|---|---|---|
| SKU regulatory matrix | Top sellers only | 100% of active and prelaunch SKUs × destination × claim × age grade | Versioned matrix with owner and review date |
| Prelaunch release | Email approval | System block until required evidence is approved | PLM/PIM release state + immutable approval log |
| Certificate coverage | Folder of PDFs | GCC/CPC/other declaration mapped to exact SKU, lot, rule, lab report, importer | Certificate registry with expiry/change triggers |
| Supplier change control | Supplier “usually tells us” | No material/component/factory/process/label change without written approval and re-assessment | Contract clause + approved deviation record |
| Incident detection | Monthly complaint review | Daily severity classifier with immediate human escalation for safety signals | Ticket tags, review alerts, case log |
| Reportability decision | Ad hoc counsel call | Clock starts at first credible signal; documented fact pattern, legal assessment, owner, submission decision | Timestamped incident file |
| Unit traceability | PO-level only | Lot/batch to order/customer/channel/location; reverse trace completed in ≤4 hours | Quarterly mock-recall evidence |
| Stop-sale | Manual channel emails | Single command center disables PDPs, marketplaces, ads, subscriptions, pick/pack, transfers, and replenishment | Channel acknowledgements + inventory quarantine |
| Recall execution | Press release and refund | Regulator-coordinated notice, direct customer outreach, remedy, response tracking, disposal/return controls, effectiveness checks | Recall dashboard and closure packet |
| Online disclosures | Packaging only | Required identity, warning, traceability, and responsible-person information is visible at the digital point of sale where applicable | Archived PDP screenshots by locale |
| Record retention | Individual inboxes | Policy keyed to each governing rule; longer contractual retention where risk warrants | Searchable repository + access log |
| Governance | Annual review | Quarterly risk council, monthly incident review, annual counsel/lab refresh | Minutes, action register, signed exceptions |

### Non-negotiable operating principles

1. **Classify before testing.** The applicable rule matrix determines the test plan; a generic “full compliance test” is not a legal category.
2. **Test the production configuration.** Golden samples, packaging, firmware, charger, accessories, colorants, and coatings must match what ships.
3. **Certificates are outputs, not evidence by themselves.** Tie every declaration to standards, reports, lot/factory, dates, and responsible party.
4. **Treat complaints as safety telemetry.** Low-frequency, high-severity signals outrank aggregate return rate.
5. **Reportability is a legal decision, not a PR decision.** Escalate promptly; do not wait for certainty or completed root-cause analysis when a reporting clock may already be running.
6. **Recall the smallest defensible population, never an artificially narrow one.** Scope follows evidence and traceability, not margin pressure.

## Product safety compliance benchmarks (2026)

These are operational control targets, not claims that a regulator guarantees safety or accepts the file. Statutory deadlines and applicability always override internal targets.

| Metric | Green | Amber | Red | Measurement |
|---|---:|---:|---:|---|
| Active SKUs with approved rule matrix | 100% | 95–99% | <95% | Approved SKUs / active SKUs |
| Prelaunch SKUs with complete evidence pack | 100% | 98–99% | <98% | Complete packs / launch candidates |
| Production changes assessed before use | 100% | 95–99% | <95% | Approved changes / material changes |
| Safety-critical complaints triaged | <4 hours | Same business day | >1 business day | First signal → human safety review |
| Critical stop-sale execution | <2 hours | 2–4 hours | >4 hours | Incident command → all-channel confirmation |
| Lot-to-customer reverse trace drill | ≤4 hours | 4–8 hours | >8 hours or incomplete | Drill start → reconciled population |
| Inventory quarantine reconciliation | 100% within 24 hours | 95–99% | <95% | Quarantined / on-hand affected units |
| Direct customer reachability | ≥98% orders have usable contact route | 95–97.9% | <95% | Reachable affected orders / affected orders |
| Recall response accounting | ≥95% of affected units disposition-known by campaign close | 80–94.9% | <80% | Returned/refunded/destroyed/confirmed safe / affected |
| Marketplace compliance-document SLA | <1 business day | 1–3 days | >3 days | Request → complete submission |
| Quarterly mock recall | 100% on schedule | One late quarter | Missing or failed without remediation | Completed drills / planned drills |
| False certification or stale-report rate | 0% | N/A | Any | Sample audits of certificate-to-SKU linkage |

### Regulatory facts that set the control design

- **United States — general-use consumer products:** where a CPSC-enforced rule requires certification, domestic manufacturers and importers issue a General Certificate of Conformity based on testing or a reasonable testing program. Children's products subject to a children's product safety rule require a Children's Product Certificate based on testing by a CPSC-accepted third-party laboratory. Applicability must be determined rule by rule.
- **CPSC incident reporting:** Section 15(b) of the Consumer Product Safety Act creates reporting duties for manufacturers, importers, distributors, and retailers that obtain information which reasonably supports the conclusion that a product may contain a reportable defect or risk. Use CPSC's current guidance and counsel; do not turn “immediately” into an invented internal grace period.
- **EU:** Regulation (EU) 2023/988, the General Product Safety Regulation, applies from **13 December 2024**. It expands traceability, distance-sales information, marketplace cooperation, accident reporting, recall, and responsible-economic-operator controls for covered non-food consumer products. Sector-specific harmonized rules can supersede or supplement GPSR.
- **Northern Ireland vs Great Britain:** GPSR applies in Northern Ireland from 13 December 2024. Great Britain operates under its own product-safety framework. Maintain separate destination logic; “UK” is not one rule flag.
- **California Proposition 65:** exposure warnings are chemical-, exposure-, route-, and safe-harbor-specific. A supplier declaration or lab result can inform the assessment but does not automatically decide whether a warning is required.
- **US cosmetics:** MoCRA added facility registration, product listing, safety substantiation, serious adverse event, records, labeling, and FDA authority requirements with exemptions and implementation details. Cosmetic claims can also make a product a drug; do not classify from packaging category alone.
- **FDA-regulated recalls:** 21 CFR Part 7 Subpart C provides FDA recall policy and industry responsibilities. Food, supplements, cosmetics, drugs, and devices have different mandatory-reporting and recall authorities; map the product category before acting.

## The build (45-day control-plane launch)

### Phase 0 — Freeze unknown-risk launches (Day 0–2)

1. Name an accountable product-safety lead and executive incident commander.
2. Create severity levels: **S0 information**, **S1 quality**, **S2 potential safety**, **S3 serious injury/fire/poisoning**, **S4 fatality/multiple serious incidents/regulator action**.
3. Freeze prelaunch SKUs that lack a completed jurisdiction-and-standard matrix.
4. Create a safety keyword route in CX, reviews, returns, warranty, marketplace, social listening, and supplier-quality feeds.
5. Publish a 24/7 escalation tree for S3/S4 cases; include counsel, insurer, lab, 3PL, marketplace, and communications contacts.

**Exit gate:** every new safety signal creates one case ID, timestamps the first-known facts, preserves the product/unit, and assigns a human within the internal SLA.

### Phase 1 — Build the SKU compliance matrix (Day 3–10)

For every SKU/variant, capture:

| Field group | Required fields |
|---|---|
| Identity | SKU, GTIN, model, variant, photo, product family, lifecycle status |
| Intended use | User, age grade, environment, foreseeable misuse, instructions |
| Composition | BOM, substances, coatings, textiles, food-contact parts, battery chemistry, radio modules |
| Claims | Cosmetic, therapeutic, antimicrobial, child-development, protective, sustainability, food/supplement claims |
| Supply chain | Legal manufacturer, factories, importer, EU/NI economic operator, GB responsible party where applicable |
| Destinations | US federal, states, EU/EEA, Northern Ireland, Great Britain, marketplaces |
| Rule outputs | Applicable laws/standards, test plan, certification/declaration, labels/warnings, registrations/listings, technical file, retention period |
| Change triggers | Material, component, supplier, factory, process, firmware, colorant, packaging, label, claim, age grade |

Apply a category router:

- **Children/toys:** age determination, small parts, lead/phthalates, mechanical/physical, flammability, tracking labels, CPC and CPSC-accepted lab requirements as applicable.
- **Electronics/radio/batteries:** electrical/fire, EMC/radio authorization, battery transport, chargers, firmware, RoHS/REACH and waste obligations by destination.
- **Cosmetics:** ingredient restrictions, safety substantiation, adverse-event and records workflow, MoCRA facility/product obligations, claims and label review.
- **Food/supplements:** facility and product-category rules, allergen/ingredient/claim controls, adverse-event/complaint routing, lot coding, FDA recall readiness.
- **Apparel/textiles:** fiber/care/country-of-origin labels, flammability, drawstrings/small parts for children's products, chemical restrictions.
- **Furniture/home/kitchen:** stability, entrapment, tip-over, food-contact, flammability, electrical components, warnings and assembly instructions.

**Exit gate:** Legal/Quality signs the matrix, and the PIM/PLM blocks `approved_for_sale=true` until all required artifacts pass.

### Phase 2 — Evidence, testing, labels, and supplier controls (Day 8–20)

1. Write a test request from the matrix; never ask a lab to “test for everything.”
2. Select the lab based on scope and required accreditation/acceptance. For a US children's-product rule, verify CPSC acceptance for the exact scope.
3. Issue controlled samples from production-equivalent goods and preserve sample chain of custody.
4. Create the technical file: risk assessment, specifications, BOM, drawings, instructions, label artwork, reports, certificates/declarations, supplier evidence, photos, and approvals.
5. Generate GCC/CPC/declaration only after confirming required data and evidence. Make certificates accessible to required downstream parties; electronic access may be permitted where rules allow.
6. Run label-and-PDP parity review: model/lot identity, manufacturer/importer, responsible economic operator, warnings, age grade, ingredients/materials, claims, instructions, and destination language.
7. Amend supplier contracts with pre-approval for safety-relevant changes, notice timing, audit rights, record access, corrective action, recall cooperation, cost allocation, insurance, and survival after termination.
8. Schedule periodic and change-triggered reassessment. For children's products, incorporate the continuing/periodic testing and material-change requirements applicable to the certification program.

**Exit gate:** a randomly selected SKU can be traced from live PDP and warehouse unit to current label proof, test evidence, certificate, factory, production lot, and approving owner.

### Phase 3 — Incident detection and reportability workflow (Day 15–25)

Create one intake form with:

- reporter and contact route;
- product/SKU/model/lot/order;
- incident date/location;
- injury or medical treatment;
- fire, smoke, overheating, shock, choking, ingestion, contamination, allergic response, collapse, tip-over, entrapment, cut, or near miss;
- photos/video/product preservation;
- product use, modifications, accessories, charger, environment;
- similar cases and marketplace/supplier/regulator contact.

Run this decision flow:

1. **Protect people:** give safe, non-leading instructions; for urgent hazards advise discontinuing use and emergency care/services as appropriate.
2. **Preserve evidence:** do not destroy, alter, repair, or coach the customer's account. Arrange safe collection where justified.
3. **Search for pattern:** complaints, returns reasons, reviews, warranty claims, lab deviations, supplier CAPAs, insurance, marketplaces, Safety Gate/CPSC/FDA databases.
4. **Convene S2+ review:** Safety, Quality, Legal, Operations, CX. Record knowns, unknowns, assumptions, exposure population, severity, and next decision time.
5. **Assess reporting:** use current CPSC/FDA/EU/UK/state/category rules. Where the law says report promptly or immediately, escalate rather than waiting for root cause or a management meeting.
6. **Control exposure:** stop shipment or sale when risk warrants; do not wait for the regulator to order it.
7. **Document privilege carefully:** counsel decides privilege; operational facts and regulator submissions must remain accurate and complete.

**Exit gate:** each S2+ case has a documented reportability decision, responsible lawyer/owner, regulator/channel actions, and a next review timestamp.

### Phase 4 — Traceability and mock recall (Day 20–32)

Build these joins:

`supplier material/component lot → factory production lot → finished SKU/serial/lot → PO/ASN → inbound receipt → warehouse/bin → transfer → order → customer/channel/country → return/disposal`

Quarterly mock recall drill:

1. Select one finished-goods lot without warning the operations team.
2. Identify all components and supplier lots used in it.
3. Identify all units manufactured, sampled, scrapped, on hand, transferred, sold, returned, replaced, and unaccounted for.
4. Produce customer lists by country/channel with consent-independent transactional contact routes where legally permitted for safety notices.
5. Generate a stop-sale package for Shopify, Amazon, TikTok Shop, Walmart, 3PL/WMS, wholesale, subscription, ads, and affiliates.
6. Reconcile the population to 100%; document gaps, owner, due date, and containment.
7. Test one outbound notice and one remedy workflow in a non-production environment.

**Exit gate:** reverse trace ≤4 hours, 100% quantity reconciliation or a formally escalated discrepancy, all-channel stop-sale acknowledgements ≤2 hours.

### Phase 5 — Recall command center (Day 25–38)

When recall or field corrective action is approved:

1. Follow regulator direction on scope, notice, remedy, and communications. Coordinate before publishing where required.
2. Freeze affected PDPs/listings, paid media, influencer briefs, wholesale replenishment, subscriptions, fulfillment, returns-to-stock, transfers, and liquidation.
3. Quarantine inventory physically and digitally. Use a non-sellable disposition code and dual authorization for movement.
4. Lock the affected-population query and version every scope change with rationale.
5. Prepare regulator- and counsel-reviewed notices: hazard, incidents/injuries, affected identifiers, stop-use instructions, remedy, contact routes, and photos.
6. Notify direct customers in appropriate language through email, SMS where lawful, in-app/account, phone/mail for highest-risk gaps, and marketplace channels. Safety notices must not be promotional.
7. Provide remedy without unnecessary friction: refund, replacement, repair, disposal, or return per approved plan. Do not require irrelevant data or suppress claims through releases.
8. Measure notice delivery, opens, customer contact, remedy completion, units recovered, inventory quarantined, residual exposure, and repeated contact effectiveness.
9. Maintain one fact sheet for CX and spokespersons. Ban speculation, blame, minimization, and unapproved root-cause statements.
10. Report progress and effectiveness as regulators require; close only after approved completion and records retention.

### Phase 6 — Marketplace and digital-shelf compliance (Day 30–42)

1. Create a channel document pack per SKU: reports, GCC/CPC/declarations, labels, product photos, manufacturer/importer/economic-operator data, instructions, SDS where applicable, and insurer evidence.
2. Render required product identification, warnings, manufacturer contact, and EU economic-operator information on the online offer where applicable—not only on packaging.
3. Monitor marketplace policy and regulator-notice inboxes daily with named backup owners.
4. Use one canonical product identity. Model, brand, label, certificate, GTIN, report, PDP, and invoice must match.
5. For a takedown, preserve the notice, stop all affected channels, assess whether the signal creates a regulatory reporting duty, and submit only authentic, SKU-matched evidence.
6. Prevent relisting through duplicate ASIN/SKU, international storefront, bundle, subscription, or affiliate feed while a safety hold is active.

### Phase 7 — Governance, cost, and launch (Day 38–45)

| Path | Fit | One-time implementation | Ongoing | Default risk-control value |
|---|---|---:|---:|---|
| A — Focused | <25 low-risk SKUs, one market | 80–160 operator hours + testing/counsel | 8–16 hr/month | Avoids missing files and failed drills |
| B — Multi-market default | 25–500 SKUs, US + EU/UK, multiple channels | 200–500 operator hours + category testing/counsel | 20–50 hr/month | Default; prevents blocked launches and reduces incident/recall loss severity |
| C — High-regulation | Children's, electronics, cosmetics, food/supplements | Dedicated Quality/Safety lead + specialist counsel/labs | 0.5–2 FTE plus vendors | Mandatory depth; do not compress into Path B budget |
| D — Enterprise | 500+ SKUs, many entities/factories/markets | QMS/PLM integration, supplier portal, global counsel | Dedicated team | Automated evidence and global incident command |

**ROI discipline:** calculate value as avoided launch delay, marketplace downtime, scrap, logistics, refunds, chargebacks, injuries, claims, legal defense, regulator penalties, and brand loss—weighted by probability and confidence. Do not book the full theoretical loss as “revenue generated.” The quoted 3:1–15:1 band is a planning hypothesis for brands with material exposure; replace it with your own incident history, insurance data, SKU risk, and counsel-reviewed scenario model before approving budget.

## Common pitfalls (18 from real builds)

1. **Treating one lab report as global approval.** A passed US test does not establish EU, GB, California, FDA, radio, chemical, or marketplace compliance. **Fix:** maintain a SKU × destination × rule matrix and map each report to exact clauses, configuration, lab scope, and market.
2. **Certifying the sample while shipping a changed product.** Supplier swaps resin, pigment, adhesive, charger, battery, coating, factory, firmware, or packaging after test. **Fix:** contractually define material changes, require approval before production, quarantine unapproved changes, and trigger documented re-assessment/retest.
3. **Using a generic test package.** Over-testing wastes budget; under-testing misses the actual hazard. **Fix:** classify intended use, age grade, claims, materials, power/radio, foreseeable misuse, and markets before writing the lab scope.
4. **Assuming a certificate proves compliance.** A copied GCC/CPC or declaration may reference the wrong model, factory, date, rule, or report. **Fix:** validate certificate fields and evidence linkage automatically; sample-audit certificate → report → lot → live unit each quarter.
5. **Choosing a lab by logo instead of scope.** Accreditation or CPSC acceptance is test-specific, not a blanket quality badge. **Fix:** verify current scope for each required method, location, and legal acceptance before issuing the PO.
6. **Calling an adult collectible a children's product—or the reverse—based only on marketing copy.** Age determination considers design, packaging, representation, use, and other evidence. **Fix:** document the age-grade decision with product factors and counsel/lab review; keep PDP, package, instructions, and ads consistent.
7. **Hiding required safety information inside packaging.** Distance-sales rules and marketplace policies can require information on the online offer. **Fix:** add destination-aware PDP fields for identity, warnings, manufacturer/economic operator, model, and instructions; archive rendered screenshots.
8. **Using “UK compliant” as one status.** GPSR applies in Northern Ireland while Great Britain follows a different framework. **Fix:** split `GB` and `NI` in the product master, rules engine, labels, responsible-party data, and channel eligibility.
9. **Appointing an EU responsible person as a mailbox.** The named economic operator needs required information and operational ability to cooperate. **Fix:** execute a written mandate, grant technical-file access, define incident/authority SLAs, test escalation, and keep contact details aligned across product, packaging, and PDP.
10. **Waiting for confirmed root cause before considering a regulator report.** Reportability can arise from information reasonably supporting a conclusion; investigation may continue after reporting. **Fix:** timestamp first credible notice, involve counsel immediately, document the decision, and use current regulator guidance—never an invented “wait 10 days” policy.
11. **Letting CX close injury tickets as refunds.** Refund completion can erase the safety signal and product evidence. **Fix:** lock safety-tagged tickets, preserve original narrative/media, trigger human triage, and separate remedy from incident investigation.
12. **Averaging away severe signals.** One fire in 10,000 units can matter more than a 4% cosmetic-return rate. **Fix:** score severity and plausible worst case separately from frequency; S3/S4 cases bypass aggregate dashboards.
13. **Tracing only to purchase order.** A PO may contain multiple component and production lots across warehouses and channels. **Fix:** capture supplier/component lot, finished lot/serial, receipt, transfer, order, return, and disposition joins; drill quarterly.
14. **Stopping only the primary Shopify PDP.** Affected units keep selling through bundles, subscriptions, marketplaces, wholesale, feeds, resellers, ads, and returns-to-stock. **Fix:** maintain a channel kill-switch checklist with API/manual owner, acknowledgement, and duplicate-listing search.
15. **Writing a recall notice like marketing copy.** Vague language, promotional CTAs, softened hazard, or missing identifiers reduces response and may conflict with regulator direction. **Fix:** use approved factual language, clear photos/identifiers, direct stop-use and remedy steps, accessible translations, and no cross-sell.
16. **Treating Proposition 65 as a universal label sticker.** Blanket warnings can be inaccurate, commercially damaging, or noncompliant; no warning can also create exposure. **Fix:** perform chemical/exposure/route analysis, use current OEHHA rules and counsel, document the decision, and re-evaluate formula/material changes.
17. **Confusing cosmetic, drug, supplement, and medical-device claims.** “Heals,” “treats,” structure/function, antimicrobial, SPF, and disease claims can change the regulatory path. **Fix:** route every product and marketing claim through category/claims review before artwork, influencer briefs, PDP publication, or listing submission.
18. **Closing the incident after refunds are issued.** Financial closure does not prove risk removal or recall effectiveness. **Fix:** close only when affected population, inventory, customer remedies, regulator obligations, root cause, CAPA, supplier recovery, insurance notice, and preventive controls are documented and approved.

## Verification (this skill is "shipped" when...)

**Gate A — Governance and escalation.** Accountable safety lead, executive incident commander, counsel, lab, insurer, 3PL, marketplace, CX, Quality, Operations, Finance, and Communications contacts are current; S0–S4 severity and 24/7 S3/S4 escalation are tested.

**Gate B — SKU rules matrix.** Every active/prelaunch SKU has approved identity, intended use, age grade, materials/components, claims, destinations, responsible entities, applicable rules/standards, evidence, label/PDP obligations, retention, and change triggers.

**Gate C — Evidence integrity.** A sample of ten SKUs—or all SKUs if fewer than ten—links live unit and PDP to current BOM, factory/lot, report, certificate/declaration, label artwork, instructions, approvals, and supplier evidence with zero critical mismatch.

**Gate D — US consumer-product controls.** Applicable GCC/CPC logic is documented; children's-product lab acceptance/scope is verified where required; continuing/material-change controls are defined; Section 15(b) escalation uses current CPSC guidance and counsel.

**Gate E — EU/UK digital-shelf controls.** GPSR applicability from 13 December 2024 is implemented for covered EU/NI offers; manufacturer/economic-operator, product identification, warnings, languages, traceability, Safety Gate/authority cooperation, and distance-sales information are tested. GB is separately classified.

**Gate F — Category-specific controls.** Cosmetic/MoCRA, food/supplement, electronics/radio/battery, textile/apparel, children's/toy, chemical/Prop 65/REACH/RoHS, and other category routes are either complete or explicitly marked not applicable with approver evidence.

**Gate G — Incident telemetry.** CX, reviews, returns, warranty, social, marketplaces, suppliers, labs, 3PL, insurer, CPSC/FDA/Safety Gate/OPSS signals feed one case register. Safety keywords and S2+ routing pass synthetic tests without false closure.

**Gate H — Reportability.** Three tabletop cases—single severe event, repeated lower-severity defect, and regulator/marketplace notice—produce timestamped facts, reportability decision, owner, containment, next-review time, and regulator/channel action without waiting for root cause.

**Gate I — Traceability and stop-sale.** Quarterly mock recall identifies and reconciles the affected population within four hours and confirms all-channel stop-sale/quarantine within two hours. Unaccounted units are escalated, not rounded away.

**Gate J — Recall execution.** Approved templates exist for regulator package, customer notice, PDP banner, marketplace response, CX script, remedy, translations, inventory disposition, effectiveness check, supplier recovery, insurer notice, and closure packet.

**Gate K — Supplier and change control.** Top-risk suppliers have signed specifications, change-notification and recall-cooperation clauses, audit rights, evidence access, CAPA SLA, cost allocation, and current insurance. One synthetic material change correctly blocks sale and triggers re-assessment.

**Gate L — Operating cadence.** Daily high-severity queue, weekly open-S2+ review, monthly complaint trend, quarterly mock recall and certificate sample audit, semiannual supplier risk review, and annual counsel/lab/rule refresh are assigned and evidenced.

## How to extend this skill

- Add category modules rather than weakening the core: children's/toys, lithium batteries, cosmetics/MoCRA, supplements, food/contact materials, furniture/tip-over, textiles, PPE, medical devices, radio equipment.
- Add a destination adapter for Canada, Australia/New Zealand, Japan, GCC countries, or another market with local counsel and regulator sources.
- Add PLM/PIM/QMS enforcement so a failed evidence gate blocks publishing and purchase orders, not just a spreadsheet status.
- Add automated certificate-field validation and report-to-SKU matching, but preserve human review for applicability and legal conclusions.
- Add NLP-assisted safety-signal triage only after testing recall and precision on real tickets. Never allow the model to close S2+ cases autonomously.
- Add supplier risk scoring from audit findings, defect severity, change discipline, test failure, CAPA aging, country/factory, and recall history.
- Add a recall economics model with probability ranges and confidence labels; keep safety and reporting decisions independent of ROI.
- Add accessible, locale-specific notice templates and direct-mail/phone fallback for high-risk unreachable customers.
- Add regulator and marketplace webhook/email ingestion with a durable case ID, original-message preservation, and escalation SLA.

## Cross-references

- `skills/39-catalog-pim-dam-operations.md` — canonical product identity, attributes, label assets, and publication gates.
- `skills/57-procurement-supplier-portal-cogs-engineering.md` — supplier contracts, audits, specifications, change control, and CAPA substrate.
- `skills/29-inventory-forecasting-stockout-prevention.md` — inventory ledger and location data used for containment.
- `skills/45-warehouse-management-fulfillment-orchestration.md` — WMS quarantine, transfer lock, pick/pack stop, and disposition.
- `skills/59-shipping-carrier-mix-parcel-routing-engine.md` — reverse logistics and controlled recall returns.
- `skills/28-returns-portal-orchestration.md` — customer remedy intake without returns-to-stock leakage.
- `skills/34-cx-customer-service-operations-platform.md` — safety-signal routing, evidence preservation, and customer contact.
- `skills/41-data-warehouse-cdp-operations.md` — durable lot/order/customer joins and recall dashboards.
- `skills/15-marketplace-expansion.md` + `skills/23-tiktok-shop-live-commerce.md` — channel-specific evidence requests and listing control.
- `skills/25-international-expansion.md` + `skills/26-native-language-voice-profiles.md` — destination classification and translated notices.
- `skills/48-privacy-consent-management.md` — lawful customer-data handling; safety transactional notices remain purpose-limited.
- `skills/67-ecommerce-insurance-operations.md` — product liability/recall coverage, timely notice, evidence, subrogation, and claim preservation.
- `skills/58-brand-protection-counterfeit-enforcement.md` — counterfeit products can create a parallel safety incident and must be separated from authentic lots.
- `skills/60-product-launch-engine.md` — insert Gate B–F before launch readiness can become green.

## Sources

### United States — consumer products and recalls

- U.S. Consumer Product Safety Commission — General Certificate of Conformity (GCC): https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/General-Certificate-of-Conformity-GCC
- U.S. Consumer Product Safety Commission — Children's Product Certificate: https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Childrens-Product-Certificate
- U.S. Consumer Product Safety Commission — Section 15 reporting requirements: https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Section-15-Reporting-Requirements
- U.S. Consumer Product Safety Commission — Recall Guidance: https://www.cpsc.gov/Business--Manufacturing/Recall-Guidance
- SaferProducts.gov — Business portal: https://www.saferproducts.gov/Business
- 15 U.S.C. § 2063 — product certification and labeling: https://www.law.cornell.edu/uscode/text/15/2063
- 15 U.S.C. § 2064 — substantial product hazards and reporting: https://www.law.cornell.edu/uscode/text/15/2064
- 16 CFR Part 1107 — testing and labeling pertaining to product certification: https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1107
- 16 CFR Part 1110 — certificates of compliance: https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1110
- 16 CFR Part 1115 — substantial product hazard reports: https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115

### European Union and United Kingdom

- Regulation (EU) 2023/988 — General Product Safety Regulation, official text: https://eur-lex.europa.eu/eli/reg/2023/988/oj
- European Commission Safety Gate — product-safety legislation and alerts: https://ec.europa.eu/safety-gate/
- European Commission — RoHS Directive: https://environment.ec.europa.eu/topics/waste-and-recycling/rohs-directive_en
- European Chemicals Agency — understanding REACH: https://echa.europa.eu/regulations/reach/understanding-reach
- UK Office for Product Safety and Standards — product safety advice for businesses: https://www.gov.uk/guidance/product-safety-advice-for-businesses
- UK Product Safety Database — recalls and alerts search: https://www.gov.uk/product-safety-alerts-reports-recalls

### California and FDA-regulated categories

- California OEHHA — Proposition 65 for businesses: https://oehha.ca.gov/proposition-65/businesses-and-proposition-65
- California OEHHA — Proposition 65 overview: https://oehha.ca.gov/proposition-65/about-proposition-65
- FDA — Modernization of Cosmetics Regulation Act of 2022 (MoCRA): https://www.fda.gov/cosmetics/cosmetics-laws-regulations/modernization-cosmetics-regulation-act-2022-mocra
- FDA — How to Report a Cosmetic Product Related Complaint: https://www.fda.gov/cosmetics/cosmetics-compliance-enforcement/how-report-cosmetic-product-related-complaint
- FDA — Information for Industry on Dietary Supplements: https://www.fda.gov/food/dietary-supplements/information-industry-dietary-supplements
- 21 CFR Part 7 Subpart C — recalls, removals, and corrections: https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-7/subpart-C

### Electronics, traceability, and management-system references

- FCC — Radio Frequency Devices / equipment authorization: https://www.fcc.gov/oet/ea/rfdevice
- GS1 — Global Traceability Standard: https://www.gs1.org/standards/traceability
- ISO 10377:2013 — consumer product safety guidelines for suppliers: https://www.iso.org/standard/45967.html
- ISO 10393:2013 — consumer product recall guidelines for suppliers: https://www.iso.org/standard/45968.html

**Source verification note:** EUR-Lex GPSR, GOV.UK product-safety guidance, FDA MoCRA, FDA dietary-supplement guidance, FDA cosmetic complaint guidance, eCFR Parts 7/1107/1110, Cornell's U.S. Code mirrors, and the European Commission RoHS page were fetched successfully on 2026-07-14. CPSC, ECHA, GS1, OEHHA, and FCC endpoints were intermittently blocked, sparse, or timed out from this server; their URLs are canonical agency references, but operators must re-open the current page and confirm current text before relying on it. Vendor examples and internal SLA targets are operational recommendations, not regulator endorsements.
