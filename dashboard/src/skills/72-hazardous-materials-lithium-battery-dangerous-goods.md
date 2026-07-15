---
name: hazardous-materials-lithium-battery-dangerous-goods
title: Hazardous materials + lithium-battery dangerous-goods ecommerce operations (Move #72, PHMSA/DOT 49 CFR + UN 38.3 + FAA + ICAO + IATA DGR + IMDG Code + USPS + carrier acceptance + classification + packaging + marks + documents + training + incident response)
category: dangerous-goods
tier: 1
priority: P0
default_move: 72
year_1_roi_band: "2:1–10:1"
sms_friendly: false
last_updated: 2026-07-15
sources: [dot-49-cfr-171-172-173 2026, phmsa-lithium-battery-guide 2026, faa-lithium-battery-resources 2026, faa-lithium-battery-incidents 2026, un-manual-tests-criteria 2023, icao-technical-instructions 2025-2026, iata-dgr-67th-edition 2026, iata-lithium-battery-guidance 2026, imo-imdg-amendment-42-24 2026, usps-publication-52 2026, epa-used-lithium-batteries 2026, osha-hazard-communication 2026, ups-battery-guide 2026, amazon-dangerous-goods 2026]
---

# Hazardous materials + lithium-battery dangerous-goods ecommerce operations (Move #72)

> Build one SKU-to-lane dangerous-goods control plane that proves classification, battery test status, package configuration, marks, labels, documents, training, carrier acceptance, and incident handling before a regulated parcel can be released.

## When to use this skill

Use this skill when the catalog contains—or might contain—lithium-ion or lithium-metal cells, power banks, rechargeable devices, aerosols, perfume, nail products, alcohol, paint, solvents, adhesives, cleaners, pool chemicals, compressed gas, dry ice, magnetized material, fuel-containing equipment, or another product that can become hazardous material in transport. A product can be legal to sell and still be illegal or unacceptable to ship in a chosen package, mode, service, or destination.

Start immediately if any of these are true:

- a supplier says “not dangerous goods” without providing classification evidence;
- the catalog stores one generic `hazmat=true/false` flag instead of a versioned lane decision;
- lithium products lack a model-matched UN Manual of Tests and Criteria subsection 38.3 test summary;
- fulfillment can route a regulated SKU to any carrier service without checking mode and account acceptance;
- marketplace or carrier dangerous-goods reviews are handled only after a listing or parcel is blocked;
- returned, swollen, leaking, hot, crushed, recalled, or counterfeit batteries enter the ordinary returns stream;
- nobody can name the trained employee who approved the last dangerous-goods shipment;
- the operator cannot reconstruct the exact product, battery, package, mark, label, document, service, and ruleset used for a shipment.

This runbook controls **transport**, not product-market safety certification, workplace chemical exposure, waste disposal, or legal advice. Connect it to those programs, but do not collapse them:

| Control plane | Primary question | Typical owner |
|---|---|---|
| Product safety | May this product be sold and used in the market? | Compliance / quality |
| Workplace safety | How are employees informed and protected where chemicals are used? | EHS / operations |
| Dangerous-goods transport | May this exact article be offered in this exact package, mode, service, and lane? | Hazmat employer / shipper |
| Waste and recycling | How must used or end-of-life material be collected and processed? | EHS / reverse logistics |
| Carrier acceptance | Will this carrier and account accept the compliant shipment under its tariff and operating rules? | Transportation |

### Entry evidence

Do not release a regulated SKU until the minimum evidence is complete.

| Evidence object | Required fields |
|---|---|
| Product identity | SKU, GTIN, model, variant, revision, manufacturer, photos, bill of materials |
| Substance/article data | Composition, concentration, physical form, flash point or other relevant properties, quantity per inner and outer package |
| Battery identity | Chemistry, cell and battery model, configuration, Wh or lithium content, mass, standalone/packed-with/contained-in-equipment state |
| Supplier evidence | Current SDS where applicable, technical data, classification statement, UN 38.3 test summary where applicable, change-control commitment |
| Lane | Origin, destination, domestic/international, air/ground/rail/vessel/mail, carrier, service, passenger/cargo-aircraft constraint |
| Package recipe | Inner/outer packaging, closures, cushioning, terminal protection, activation protection, orientation, absorbent, quantity limits |
| Communication | Proper shipping name, UN/NA/ID number, class/division, subsidiary risk, packing group where assigned, marks, labels, shipping paper, emergency number |
| Authorization | Ruleset edition/date, trained approver, carrier/account acceptance, exceptions or special permits, release timestamp |

## What "best in class" looks like

Best in class is not a “hazmat shipping app” or a warehouse poster. It is an auditable decision system in which a product is classified once by competent people, transformed into controlled package recipes, and re-evaluated whenever the product, package, rule edition, carrier, service, or destination changes.

| Control | Weak operation | Best-in-class operation | Proof |
|---|---|---|---|
| Discovery | Supplier checkbox | Ingredient/article/battery intake plus keyword and catalog scans | 100% of active SKUs screened |
| Classification | Copy SDS Section 14 | Authorized classifier uses current 49 CFR/ICAO/IATA/IMDG/postal rules and records rationale | Signed classification record |
| Lithium evidence | “Battery certified” PDF | Model-matched UN 38.3 test summary with manufacturer, lab, report ID, date, description, tests/results, edition, responsible person | Evidence resolves from live SKU |
| Lane decision | One global hazmat flag | SKU × package × quantity × origin × destination × mode × carrier × service decision | Versioned lane matrix |
| Packaging | Operator memory | Locked recipe/BOM, photos, quantity gates, closure method, terminal and activation protection | First-article and periodic audit |
| Communication | Generic sticker | Generated marks, labels, documents, emergency information, and phone number from approved decision | Scan-to-record before manifest |
| Training | Annual slide deck | Role-specific matrix, direct supervision until trained, test/assessment, recurrent clock, records | No expired worker can release |
| Carrier | Label API returns a label | Contract/account authorization and service compatibility checked before rate shopping | Acceptance registry plus test parcel |
| Returns | All returns use same label | Battery condition triage; ordinary, used, damaged/defective/recalled, waste, and incident paths separated | Dangerous return never enters parcel automation |
| Incidents | Call carrier later | Immediate life-safety actions, carrier/facility escalation, evidence preservation, NRC/Form F 5800.1 decision tree, regulator/customer workflow | Timed exercise and incident file |
| Change control | Revisit after rejection | Supplier, model, chemistry, Wh, packaging, quantity, destination, carrier, and ruleset changes automatically block release | Reclassification event log |

### Canonical data contract

Store a **decision**, not just a label image:

```text
classification_id, sku_revision, battery_model, proper_shipping_name,
un_number, hazard_class, subsidiary_risk, packing_group, special_provisions,
wh_or_lithium_content, package_configuration, quantity_per_package,
origin, destination, mode, carrier, service, aircraft_restriction,
packaging_instruction_or_cfr_basis, marks, labels, document_recipe,
emergency_contact, test_summary_id, trained_approver, ruleset_edition,
carrier_acceptance_id, effective_at, expires_or_review_at, supersedes
```

### Non-negotiable lithium decision tree

1. Identify chemistry and configuration. Lithium-ion batteries alone are generally associated with **UN3480**; lithium-ion batteries packed with or contained in equipment with **UN3481**. Lithium-metal batteries alone are generally associated with **UN3090**; lithium-metal batteries packed with or contained in equipment with **UN3091**. The actual entry and conditions must be confirmed against the current applicable rules.
2. Match the exact cell/battery/product model to a UN 38.3 test summary. Under 49 CFR 173.185, lithium cells and batteries must be of a type proven to meet UN Manual subsection 38.3 criteria, subject to stated provisions; manufacturers and subsequent distributors must make the specified summary available for covered products.
3. Record rating and threshold facts. Current US small-cell/battery provisions use limits such as 20 Wh per lithium-ion cell, 100 Wh per lithium-ion battery, 1 g lithium per metal cell, and 2 g per metal battery; do not treat those thresholds as a blanket exemption.
4. Prevent short circuit, movement damage, and accidental activation. Use a controlled recipe; “original retail box” is not automatically transport packaging.
5. Separate normal new product from used, damaged, defective, recalled, prototype/low-production, and waste/recycling flows. These are different rule paths.
6. Resolve mode and operator variation. Air, vessel, highway, rail, postal, and individual carriers can impose different or stricter conditions. A compliant highway parcel is not automatically acceptable by air.

## Dangerous-goods operations benchmarks (2026)

These are **internal control targets**, not legal safe harbors, carrier promises, or industry averages. The regulatory requirement is the current applicable text and approval for the exact shipment. A metric can be green while one misclassified parcel remains a stop-the-line event.

| Metric | Green target | Amber | Red / stop release | Definition |
|---|---:|---:|---:|---|
| Active-SKU screening coverage | 100% | 99.0–99.9% | <99.0% | Active SKUs with current discovery disposition |
| Regulated-SKU classification completeness | 100% | Any evidence expiring <30 days | Missing/ambiguous field | Current signed classification and rationale |
| Covered lithium model UN 38.3 summary resolution | 100% | Supplier remediation open | Any unresolved model | Live sellable model resolves to summary |
| Approved-lane coverage | 100% before offer | N/A | Unapproved lane offered | SKU-package-quantity-lane has active decision |
| Package recipe adherence | 100% audited | 99.5–99.9% | <99.5% or critical miss | Sampled parcels exactly match recipe |
| Mark/label/document accuracy | 100% | N/A | Any error | Pre-manifest scan and record check |
| Expired-training release attempts | 0 | Attempt blocked | Shipment released | Release by expired/unqualified role |
| Carrier/service mismatch | 0 | Attempt blocked | Tendered parcel | Disallowed service selected or manifested |
| Dangerous-return automation escape | 0 | Attempt quarantined | Entered ordinary network | DDR/hot/leaking/swollen/unknown battery on normal label |
| Undeclared or misdeclared rejection | 0 | 1 contained near miss | Any tender/transport event | Carrier or authority rejection for declaration error |
| Classification change latency | ≤1 business day | 2–3 days | >3 days or stock still releasable | Supplier/rule change → blocked/reapproved state |
| Incident initial internal escalation | ≤15 min | 16–30 min | >30 min | Discovery → EHS/compliance command owner |
| Required immediate federal notice decision | ≤60 min | 61–180 min | Missed applicable 12-hour maximum | Decision/evidence for 49 CFR 171.15 path |
| Required written incident report | Filed well before deadline | Due within 5 days | Missed applicable 30-day requirement | DOT Form F 5800.1 path under 49 CFR 171.16 |
| Evidence retrieval drill | ≤5 min per shipment | 5–15 min | >15 min or incomplete | Retrieve full classification-to-tender record |
| Quarterly ruleset review | 100% on time | <14 days late | >14 days late | Mode/carrier/postal editions and addenda reviewed |

As of this update, IATA says the **IATA DGR 67th Edition** changes took effect on **1 January 2026**. IMO says **IMDG Code Amendment 42-24**, incorporated into the IMDG Code 2024 Edition, is mandatory from **1 January 2026**. Rule editions, corrigenda, addenda, operator variations, state variations, and carrier tariffs change; record the edition and re-check before relying on this runbook.

### Business-case model

Dangerous-goods work primarily protects contribution margin and continuity; it should not be sold as invented conversion uplift.

| Benefit lane | Conservative formula |
|---|---|
| Avoided parcel rework | Avoided rejected/intercepted parcels × actual labor, freight, disposal, and reship cost |
| Avoided listing downtime | Measured contribution margin during historical dangerous-goods listing blocks, capped by demonstrated preventable hours |
| Reduced manual classification | Approved repeat decisions × minutes avoided × fully loaded labor rate |
| Reduced packaging variance | Avoided exception parcels × measured remediation cost |
| Incident loss reduction | Only insured/finance-approved expected loss reduction; never count maximum statutory penalties as “revenue” |
| Carrier continuity | Contribution margin protected during a measured service/account suspension avoided by valid controls |

Use a planning band of **2:1–10:1 Year-1 ROI**. Cost includes competent classification support, current regulatory publications, training, packaging tests/materials, system work, carrier onboarding, audits, and incident readiness. Benefits use avoided cost and contribution margin at risk, not gross GMV and not hypothetical fines. Legal compliance is mandatory even when modeled ROI is below 1:1.

## The build (30-day dangerous-goods control launch)

### Phase 0 — Freeze unknowns and name accountable people (Days 0–2)

1. Stop air and international release for every SKU with unknown battery/chemical status; route known nonregulated products normally.
2. Name the hazmat employer, executive owner, competent classifier, packaging owner, training administrator, transportation owner, warehouse lead, returns lead, EHS contact, and after-hours incident commander.
3. Acquire current rules needed for actual lanes: US HMR, ICAO Technical Instructions/IATA DGR for air as applicable, IMDG Code for vessel, postal rules, carrier tariffs, state/operator variations, and special permits.
4. Create stop rules: unknown classification, missing evidence, unapproved package, expired training, unapproved carrier/service, damaged battery, or ruleset mismatch blocks tender.

**Exit gate:** owners and stop rules are signed; unknown regulated inventory cannot generate a transport label.

### Phase 1 — Discover and triage the catalog (Days 3–6)

Export every active, draft, bundle, replacement, sample, gift, subscription, and return SKU. Scan title, description, ingredients, SDS, BOM, tariff text, supplier declarations, return reasons, support tickets, and product images for batteries, aerosols, gases, flammables, oxidizers, corrosives, toxics, dry ice, magnetized materials, fuel, chemicals, and disposal language.

Assign one state: `not-regulated-with-rationale`, `classification-required`, `regulated`, `forbidden-by-policy`, or `quarantine`. A blank is never equivalent to not regulated. Expand bundles: one compliant component can become a different combination package decision when bundled with another product.

**Exit gate:** 100% of active SKUs have a disposition, evidence owner, and review date.

### Phase 2 — Classify and build the evidence vault (Days 7–11)

1. Begin with the current 49 CFR 172.101 Hazardous Materials Table for US transport and the mode-specific list/instructions for international air or vessel lanes.
2. Determine proper shipping name, identification number, class/division, subsidiary risk, packing group where assigned, special provisions, quantity/package conditions, and mode limitations.
3. Treat an SDS—especially Section 14—as evidence input, not an automatic legal determination for every mode and package. Resolve conflicts with the supplier and a competent classifier.
4. For lithium products, record chemistry, configuration, Wh/lithium content, count, mass, equipment relationship, UN 38.3 evidence, and normal versus used/DDR/prototype status.
5. Validate that the test summary describes the actual model. 49 CFR 173.185 specifies summary elements including manufacturer and lab identity/contact, report ID/date, cell or battery description, tests/results, applicable UN Manual edition/amendments, and responsible person.
6. Store source document, ruleset edition, classifier, rationale, effective date, and superseded versions. Supplier evidence never silently overwrites an approved decision.

**Exit gate:** every regulated SKU has a signed classification packet and every covered lithium model resolves to a model-matched UN 38.3 test summary.

### Phase 3 — Convert classifications into controlled package recipes (Days 12–16)

Create a recipe per SKU/package/quantity/mode. Include approved inner and outer packaging, maximum counts and net quantity, closure torque/tape pattern, cushioning, separation, absorbent/orientation where required, terminal protection, accidental-activation prevention, marks, labels, overpack handling, and document output.

For lithium cells and batteries, the US rule expressly requires packaging that prevents short circuits, shifting/placement damage, and accidental equipment activation. Do a photographed first-article pack and destructive handling simulation appropriate to the recipe. Restrict packaging substitutions by item number; a warehouse employee cannot replace an approved box, bag, closure, or cushioning material because it “looks equivalent.”

**Exit gate:** an untrained packer following the visual work instruction can build five consecutive conforming first articles, then a qualified employee verifies them.

### Phase 4 — Compile lane, mode, postal, and carrier acceptance (Days 17–20)

Build the approval key:

`classification + package recipe + quantity + origin + destination + mode + carrier + service + account + ruleset edition`

- Verify that the carrier account is enabled for the dangerous-goods service; a rate or label API response alone is not acceptance.
- Resolve passenger-aircraft versus cargo-aircraft restrictions and current packing-instruction/state/operator variations before air release.
- Check USPS Publication 52 independently. Postal mailability is not identical to private-carrier acceptance; international mail is particularly restrictive. USPS states that small consumer-type lithium batteries in international mail are generally limited to permitted batteries installed in the equipment they operate, subject to its conditions.
- Check Amazon and other marketplace dangerous-goods evidence separately. Marketplace listing status neither creates nor removes the shipper's transport obligations.
- For ocean shipments, use the current mandatory IMDG edition and carrier/port requirements. For road outside the US, use the applicable national/regional regime such as ADR where relevant.

**Exit gate:** no checkout promise, routing result, or warehouse wave can select a lane absent from the active acceptance registry.

### Phase 5 — Generate, inspect, and retain hazard communication (Days 21–23)

Generate shipping descriptions and communication only from approved data. Under the US HMR, the basic description generally sequences identification number, proper shipping name, hazard class/division, and packing group where assigned, with additional required information. Determine whether an exception changes shipping-paper, marking, labeling, emergency-information, or telephone requirements; never assume “limited quantity” means “no rules.”

The release station must:

1. scan SKU revision, battery/component lot where used, package recipe, packaging materials, gross/net quantity, and service;
2. print the approved marks/labels/documents for that decision only;
3. machine- or human-verify presence, legibility, placement, orientation, and package condition;
4. retain a shipment snapshot, label/mark image, shipping paper, emergency response record, approver, ruleset, and carrier acceptance ID.

Under 49 CFR 172.201, offerors must retain shipping-paper copies for two years after initial-carrier acceptance for hazardous materials other than hazardous waste, and three years for hazardous waste; apply longer legal, special-permit, carrier, or company retention where required.

**Exit gate:** ten scenario shipments produce correct, reproducible communication and a five-minute evidence retrieval.

### Phase 6 — Train, test, and permission the workforce (Days 24–26)

Map functions, not job titles: classifying, selecting packaging, packing, marking, labeling, preparing/reviewing documents, loading, tendering, maintaining emergency information, operating label software, supervising, and handling returns can all be regulated functions.

For US HMR work, cover general awareness/familiarization, function-specific, safety, and security awareness, plus in-depth security where applicable. 49 CFR 172.704 allows direct supervised work while initial/new-function training is completed within **90 days** and requires recurrent training at least once every **three years**; training records must be maintained as specified. Air, vessel, carrier, and non-US programs can require additional competence and different recurrent intervals. Use the shortest applicable clock.

Issue system permissions by completed function. Test with realistic scenarios, not attendance alone. Block label generation/release automatically at expiry, role change, or failed assessment.

**Exit gate:** 100% of regulated functions map to qualified people; an expired or unqualified user cannot approve or release a shipment.

### Phase 7 — Build returns, DDR, waste, and incident paths (Days 27–28)

At return authorization, ask condition questions: damaged/crushed/punctured, swollen, hot, leaking, smoking, unusual odor/noise, exposed terminals, water/fire involvement, recall reason, unknown/counterfeit replacement battery, or prior repair. Any positive or uncertain result blocks the ordinary return label and sends the customer to a trained safety flow. Do not instruct a customer to mail a hot, smoking, leaking, or swollen device.

49 CFR 173.185 creates a distinct path for **damaged, defective, or recalled** cells or batteries with dangerous heat/fire/short-circuit potential and restricts such transport to highway, rail, or vessel under specified packaging; FAA also says never ship, load, or transport a damaged package containing lithium batteries by air. Used and end-of-life batteries require recycling/waste decisions; EPA advises consumers not to put lithium-ion batteries in trash or municipal recycling bins and points commercial shippers back to HMR requirements.

Create an incident card: protect life, call emergency services, isolate only if safe and trained, stop handling/tender, notify facility/carrier/EHS/compliance, preserve package/device/video/documents, identify other affected lots, and decide regulatory notices. Under 49 CFR 171.15, covered incidents require notice to the National Response Center as soon as practical and no later than **12 hours**. Under 49 CFR 171.16, covered incidents require **DOT Form F 5800.1** within **30 days** of discovery. Applicability must be decided from current text by competent personnel.

**Exit gate:** a live drill routes a simulated smoking return safely and produces the notice/report decision record within target time.

### Phase 8 — Shadow, canary, reconcile, and govern (Days 29–30, then ongoing)

Replay 90 days of regulated orders against the new rules without tendering. Investigate every difference. Canary one trained station, one approved recipe, and one ground lane before air or international expansion. Audit the first 25 parcels at 100%, then risk-based samples only after zero critical errors.

Daily, reconcile regulated orders to decisions, labels, manifests, carrier acceptance scans, exceptions, returns, and incidents. Monthly, sample physical packages and retrieve evidence. Quarterly, review rule editions/addenda, operator variations, carrier tariffs, supplier changes, recalls, incidents, and training clocks. Annually, run an external or independent competent-person audit.

**Exit gate:** 30 consecutive operating days show zero undeclared/misdeclared tenders, zero recipe-critical misses, zero unqualified releases, complete records, and a tested stop/recall path.

## Common pitfalls (18 from real builds)

1. **Trusting a supplier's “non-hazardous” checkbox.** The statement may cover product use, not transport, or a different formulation/package. **Fix:** require underlying technical evidence and record a competent, mode-specific classification rationale for the exact SKU revision.
2. **Copying SDS Section 14 directly into the label system.** SDS transport data can be incomplete, stale, market-specific, or inconsistent with package quantity and mode. **Fix:** use the SDS as an input; reconcile it against current transport rules, supplier evidence, and the actual shipment configuration.
3. **Using one global `hazmat` Boolean.** The same product may be allowed by US highway, restricted by air, prohibited in international mail, and refused by a carrier account. **Fix:** key approvals by SKU, revision, package, quantity, lane, mode, carrier, service, account, and ruleset edition.
4. **Accepting a generic UN 38.3 certificate.** It names a battery family or supplier but not the model inside the live SKU. **Fix:** match product model → battery model → test-summary identity and required elements; block unresolved substitutions.
5. **Assuming a tested cell makes the assembled battery compliant.** 49 CFR 173.185 states cells and batteries are subject to the tests even when tested cells are used to construct the battery. **Fix:** obtain evidence for the offered cell/battery type and document assembled-battery applicability.
6. **Treating small-battery thresholds as a total exemption.** A ≤20 Wh cell or ≤100 Wh battery still has classification, packaging, communication, quantity, and mode conditions. **Fix:** encode each applicable relief and its remaining obligations; never output simply “exempt.”
7. **Shipping power banks as equipment-contained batteries.** A power bank's primary function is providing power; misconfiguration can choose the wrong UN entry and instruction. **Fix:** classify the actual article and function with current rules, then test the carrier configuration with a competent reviewer.
8. **Believing retail packaging is transport packaging.** Terminals can short, devices activate, bottles leak, or inner packs move inside a fulfillment carton. **Fix:** approve a complete transport recipe with terminal/activation protection, movement control, closures, quantities, materials, and first-article evidence.
9. **Letting warehouse staff substitute packaging.** A slightly different carton, tape, bag, absorbent, or orientation can invalidate the recipe. **Fix:** lock packaging material IDs in WMS, scan them at packout, and require change-control reapproval before substitution.
10. **Assuming label-API success equals carrier acceptance.** The account may lack a dangerous-goods contract, the service may be wrong, or the package may be rejected downstream. **Fix:** maintain carrier/account/service authorization evidence and validate with acceptance scans and controlled test shipments.
11. **Applying ground approval to an air-routed parcel.** Rate shopping or peak rerouting silently changes the mode. **Fix:** make mode a hard input; forbid fallback to any mode/service without an active decision and block hidden air uplift in postal/carrier products.
12. **Treating “limited quantity” as “undeclared.”** Relief can remove some requirements while leaving packaging, marks, documents, training, or carrier rules. **Fix:** store the exact exception basis and generate a checklist of obligations retained and relieved.
13. **Training only warehouse packers.** Merchandisers, procurement, developers, customer service, returns staff, and supervisors make regulated decisions too. **Fix:** map every function under 49 CFR 172.704 and applicable mode rules; train, assess, record, permission, and supervise by function.
14. **Allowing a normal return label for an unknown battery condition.** A swollen or recalled battery enters air or an automated parcel network. **Fix:** ask condition questions before label generation and create separate normal, used, DDR, waste, recall, and emergency paths.
15. **Telling customers to ship a hot or smoking device.** Movement and packaging activity can worsen thermal runaway. **Fix:** show immediate life-safety instructions approved by EHS/emergency professionals, block shipment, and escalate locally; never improvise remote packing advice.
16. **Reporting incidents from memory after cleanup.** Package, label, device, CCTV, shipment, training, and carrier evidence disappears. **Fix:** put evidence preservation and the 49 CFR 171.15/171.16 decision tree on the incident card; assign clocks and backup owners.
17. **Failing to reclassify after a silent supplier change.** New cell, chemistry, Wh rating, propellant, concentration, closure, or factory ships under the old approval. **Fix:** contract for advance change notice, compare receiving evidence, quarantine mismatches, and trigger automated reclassification.
18. **Using hypothetical penalties as ROI.** An enormous “fine avoided” makes any tool appear profitable and hides operating cost. **Fix:** model measured rework, rejection, downtime, and contribution-margin protection separately; treat compliance as a release condition, not optional growth spend.

## Verification (this skill is "shipped" when...)

1. **Gate A — Ownership and current rules:** accountable employer/shipper roles are named; applicable 49 CFR, air, vessel, postal, carrier, state/operator variations, addenda, and special permits are available and edition-controlled.
2. **Gate B — Discovery:** every live, bundle, sample, replacement, gift, and return SKU has a current disposition; blanks cannot publish or ship.
3. **Gate C — Classification:** every regulated SKU has a signed, versioned proper-shipping-name/UN-number/class/packing-group/special-provision rationale for each applicable mode.
4. **Gate D — Lithium evidence:** every covered lithium model resolves to its chemistry, configuration, Wh/lithium content, battery identity, and model-matched UN 38.3 test summary.
5. **Gate E — Packaging:** approved recipes, materials, quantities, closures, terminal/activation controls, marks, labels, photos, and first-article checks are locked in WMS.
6. **Gate F — Lane acceptance:** SKU-package-quantity-origin-destination-mode-carrier-service-account combinations are approved; unapproved routing and hidden mode changes are blocked.
7. **Gate G — Communication:** ten scenario shipments generate correct marks, labels, basic descriptions, documents, emergency information, telephone data, and retained shipment snapshots.
8. **Gate H — Training:** all regulated functions are mapped; initial, recurrent, assessment, supervision, and record requirements are current; expired permissions fail closed.
9. **Gate I — Returns:** normal, used, damaged/defective/recalled, waste/recycling, recall, and active-emergency battery paths are separate and tested.
10. **Gate J — Incident response:** smoke/fire/release drills preserve evidence, stop affected lots, contact proper parties, and correctly decide the 12-hour NRC and 30-day Form F 5800.1 paths.
11. **Gate K — Reconciliation:** regulated order → decision → package recipe → marks/labels/documents → manifest → carrier acceptance → return/incident records reconcile daily.
12. **Gate L — Steady state:** 30 days run with zero undeclared/misdeclared tenders, critical recipe misses, unqualified releases, or dangerous-return escapes; independent review signs the release.

## How to extend this skill

- Add category modules for aerosols, fragrance/cosmetics, alcohol, paints/adhesives, cleaning chemicals, pool products, compressed gas, dry ice, magnetized material, biological material, and fuel-containing equipment.
- Add sodium-ion battery entries and rules only after the actual lanes and current editions support them; do not generalize lithium recipes.
- Add EU road/rail ADR/RID, UK, Canada TDG, Australia, Japan, and other national adapters with local competent-person review.
- Add a PIM policy engine that blocks product publication until transport discovery and evidence are complete.
- Add carrier APIs only behind the internal decision service; a carrier response is a downstream check, not the source of classification truth.
- Add a supplier portal for SDS, UN 38.3 summaries, declarations, package data, expiry, and controlled change notification.
- Add computer-vision pack-station checks for label/mark presence and orientation, but retain qualified human inspection for high-risk decisions.
- Add reverse-logistics partners and approved recycling endpoints by geography; never reuse outbound labels for end-of-life batteries.

## Cross-references

- `skills/25-international-expansion.md` — destination and cross-border lane design.
- `skills/39-catalog-pim-dam-operations.md` — SKU revision, evidence, and publish-block master data.
- `skills/45-warehouse-management-fulfillment-orchestration.md` — controlled package recipes and pack-station execution.
- `skills/55-packaging-engineering-dimensional-weight-unboxing.md` — packaging BOM, testing, and dimensional design beneath regulated recipes.
- `skills/59-shipping-carrier-mix-parcel-routing-engine.md` — carrier/service routing after dangerous-goods eligibility.
- `skills/67-ecommerce-insurance-operations.md` — cargo, product-liability, pollution, and incident evidence interfaces.
- `skills/69-product-safety-compliance-recall-operations.md` — product safety, supplier change control, recall, and stop-sale.
- `skills/71-order-management-distributed-order-orchestration.md` — route eligibility and shipment holds in the order control plane.

## Sources

Regulatory and operator pages were checked on 2026-07-15 where this environment allowed access. PHMSA and UNECE pages intermittently returned HTTP 403 from this server, and the eCFR web interface redirected to a bot-block page; Cornell LII mirrors are linked for readable section text, but operators must verify against the current official eCFR and incorporated publications before shipment. IATA/ICAO/IMO publications, addenda, state/operator variations, carrier tariffs, and postal rules may change independently.

- [eCFR — Title 49, Subtitle B](https://www.ecfr.gov/current/title-49/subtitle-B) — official current US transportation regulations; verify live text here despite this server's bot-block redirect.
- [49 CFR 171.8](https://www.law.cornell.edu/cfr/text/49/171.8) — definitions used throughout the US Hazardous Materials Regulations.
- [49 CFR 171.15](https://www.law.cornell.edu/cfr/text/49/171.15) — immediate notice for specified incidents, as soon as practical and no later than 12 hours.
- [49 CFR 171.16](https://www.law.cornell.edu/cfr/text/49/171.16) — written incident reporting and DOT Form F 5800.1 within 30 days for covered incidents.
- [49 CFR 172.101](https://www.law.cornell.edu/cfr/text/49/172.101) — Hazardous Materials Table and column logic.
- [49 CFR 172.200](https://www.law.cornell.edu/cfr/text/49/172.200) — shipping-paper applicability.
- [49 CFR 172.201](https://www.law.cornell.edu/cfr/text/49/172.201) — shipping-paper preparation and retention.
- [49 CFR 172.202](https://www.law.cornell.edu/cfr/text/49/172.202) — hazardous-material description and basic-description sequence.
- [49 CFR 172.400](https://www.law.cornell.edu/cfr/text/49/172.400) — labeling applicability.
- [49 CFR 172.602](https://www.law.cornell.edu/cfr/text/49/172.602) — emergency response information requirements and availability.
- [49 CFR 172.604](https://www.law.cornell.edu/cfr/text/49/172.604) — emergency response telephone number requirements.
- [49 CFR 172.704](https://www.law.cornell.edu/cfr/text/49/172.704) — general, function-specific, safety, security, initial/recurrent, and recordkeeping training requirements.
- [49 CFR 173.22](https://www.law.cornell.edu/cfr/text/49/173.22) — shipper responsibility for classifying and preparing hazardous material.
- [49 CFR 173.185](https://www.law.cornell.edu/cfr/text/49/173.185) — lithium cells/batteries, UN 38.3 basis, packaging, hazard communication, test summaries, prototypes, and DDR provisions.
- [PHMSA — Lithium Batteries](https://www.phmsa.dot.gov/lithiumbatteries) — regulator entry point, guides, and campaign resources; access was blocked from this server, so re-open directly.
- [FAA — Lithium Battery Resources](https://www.faa.gov/hazmat/resources/lithium_batteries) — air-safety, SafeCargo, thermal-runaway, and damaged-battery resources.
- [FAA — Lithium Battery Incidents](https://www.faa.gov/hazmat/resources/lithium_batteries/incidents) — reported smoke, fire, and extreme-heat event dataset; occurrence is not proof of causation or regulatory breach.
- [UN Manual of Tests and Criteria, Revision 8](https://unece.org/transport/dangerous-goods/rev8-files) — source publication containing subsection 38.3; UNECE blocked this server, so obtain the official current files directly.
- [ICAO — Dangerous Goods](https://www.icao.int/dangerous-goods) — Technical Instructions and international civil-aviation dangerous-goods program entry point.
- [IATA — Dangerous Goods Regulations](https://www.iata.org/en/programs/cargo/dgr/) — current DGR edition, significant changes, addenda, operator/state variations, and training entry point.
- [IATA — Batteries](https://www.iata.org/en/programs/cargo/dgr/lithium-batteries/) — battery guidance and current packing-instruction interpretations; page notes the additional 3 m stack-test packaging provision introduced in 2025 for specified equipment configurations.
- [IMO — IMDG Code](https://www.imo.org/en/publications/pages/imdg%20code.aspx) — 2024 Edition with Amendment 42-24, mandatory from 1 January 2026.
- [USPS Publication 52](https://pe.usps.com/text/pub52/welcome.htm) — hazardous, restricted, and perishable mail rules.
- [USPS Publication 52 §349](https://pe.usps.com/text/pub52/pub52c3_028.htm) — Class 9 and lithium-battery domestic/international mail conditions.
- [US EPA — Used Lithium-Ion Batteries](https://www.epa.gov/recycle/used-lithium-ion-batteries) — disposal/recycling safety and transport-resource bridge; updated 20 March 2026.
- [OSHA — Hazard Communication](https://www.osha.gov/hazcom) — workplace labels, safety data sheets, and worker-information program; distinct from transport classification.
- [UPS — How to safely pack and ship batteries](https://www.ups.com/assets/resources/webcontent/en_CA/pack_ship_batteries.pdf) — carrier guidance; carrier documents do not replace legal classification or account acceptance.
- [Amazon Seller Central — Dangerous goods review](https://sellercentral.amazon.com/help/hub/reference/external/G200164080) — marketplace evidence and listing review entry point; authentication/market versions may vary.
