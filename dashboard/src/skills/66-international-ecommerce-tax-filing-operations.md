---
name: international-ecommerce-tax-filing-operations
title: International ecommerce tax filing operations (EU OSS/IOSS + UK VAT/MTD + Canada GST/HST + Australia/NZ GST + US marketplace reconciliation) (Move #66)
category: global-tax-filing
tier: 1
priority: P0
default_move: 66
year_1_roi_band: "3:1–12:1"
sms_friendly: false
last_updated: 2026-07-14
sources: [eu-vat-one-stop-shop, eu-oss-record-keeping, eu-vat-rates, hmrc-submit-vat-return, hmrc-charge-reclaim-record-vat, hmrc-overseas-goods-uk, hmrc-vat-notice-700-22, cra-gst-hst-returns, cra-gst-hst-deadlines, cra-digital-economy, ato-non-resident-gst, ato-bas, ato-gst-records, nz-ird-overseas-business-gst, streamlined-sales-tax, california-cdtfa, new-york-tax, avalara, taxjar, stripe-tax, vertex, sovos, taxually, numerals, sphere]
---

# International ecommerce tax filing operations (Move #66)

> Turn collected indirect tax into filed, paid, traceable returns by running a controlled monthly close that reconciles storefronts, marketplaces, refunds, payment processors, tax engines, ledgers, registrations, returns, bank payments, and retained evidence—without pretending a tax-calculation tool replaces local advice.

## When to use this skill

Use this skill after nexus and tax calculation are live, but before registrations and filings multiply beyond spreadsheet control. It is especially valuable when:

1. The business has two or more active indirect-tax registrations, or files EU OSS/IOSS, UK VAT, Canada GST/HST, Australia/NZ GST, or several US state returns.
2. Shopify, Amazon, eBay, Etsy, Walmart, TikTok Shop, wholesale, subscriptions, returns, and payment processors report different gross sales and tax totals.
3. A marketplace collects tax, yet the seller still has local registration, reporting, accounting, or evidence obligations.
4. Finance cannot trace a filed return from box totals back to source transactions, exchange rates, refund documents, and payment confirmation.
5. Return due dates, nil returns, amendments, registrations, direct debits, or portal credentials depend on one person’s memory.
6. Tax payable is mixed into operating cash and a filing deadline creates a liquidity surprise.
7. A tax engine calculates rates correctly but accounting posts tax to revenue, merges marketplace-collected tax with merchant liability, or loses refund adjustments.
8. The brand is entering another country and needs a repeatable filing-control template rather than a new ad hoc spreadsheet.

This runbook does **not** determine whether the business must register, which scheme applies, whether a supply is taxable, the correct rate, permanent-establishment status, customs liability, input-tax eligibility, or how a specific correction must be made. Those are fact- and jurisdiction-dependent decisions for qualified local tax advisers. The operator owns data, evidence, controls, calendars, approvals, payments, and auditability.

## What "best in class" looks like

A best-in-class filing operation has one transaction ledger, one obligations register, one close calendar, and explicit separation between calculation, accounting, filing, and payment.

| Control layer | Best-in-class state | Evidence |
|---|---|---|
| Obligations | Every registration has entity, jurisdiction, scheme, tax ID, period, due date, filing frequency, payment method, owner, adviser, portal, and status | Versioned obligations register reviewed monthly |
| Source data | Storefront, marketplace, subscription, refund, gift-card, shipping, tax-engine, processor, ERP, and bank exports land in a locked period folder | Raw immutable exports with hashes and extraction timestamps |
| Canonical ledger | One row per economic event with order, line, tax jurisdiction, channel, seller/marketplace liability, tax amount, currency, FX rate, refund link, and evidence pointer | Reproducible tax subledger |
| Reconciliation | Gross-to-net sales, tax collected, marketplace-collected tax, refunds, chargebacks, fees, and cash settle through documented bridges | Signed reconciliation workbook and exceptions log |
| Filing | Draft return is prepared from the approved ledger, independently reviewed, submitted before an internal deadline, and receipt archived | Maker/checker sign-off, portal receipt, return copy |
| Remittance | Tax liability is reserved, approved, paid from the correct entity/account, and matched to the authority reference | Bank proof and cleared tax-payable entry |
| Audit trail | A reviewer can reproduce every box without relying on the preparer’s laptop or memory | Period evidence pack with retention policy |

### Canonical data model

Use these minimum fields in the tax subledger:

| Field group | Required fields |
|---|---|
| Identity | `legal_entity`, `registration_id`, `source_system`, `channel`, `order_id`, `line_id`, `event_id`, `original_event_id` |
| Timing | order, payment, supply, invoice, shipment, refund, and settlement timestamps; reporting period; timezone |
| Supply | ship-from/to country and region, customer tax status, SKU/tax category, goods/services flag, marketplace-facilitated flag |
| Money | transaction currency, gross, discount, shipping, duty, net taxable amount, tax, refund, functional currency, authority currency |
| FX | rate, rate date, source, conversion policy, rounded values |
| Evidence | invoice/credit-note ID, marketplace statement, tax-engine response, customs/IOSS evidence, exemption evidence, refund evidence |
| Control | mapping version, preparer, reviewer, exception status, filing box, return ID, payment ID |

### Responsibilities that cannot be merged

- **Commerce/engineering:** stable transaction IDs, complete events, tax-engine integration, immutable history.
- **Finance:** ledger mappings, close, FX, cash reserve, tax-payable accounts, payment proof.
- **Tax adviser:** registration/scheme/rate/return-position decisions and review of exceptions.
- **Operator:** calendar, access, evidence, maker/checker workflow, escalation, and on-time execution.
- **Executive approver:** material positions, late/amended returns, reserves, disclosures, and remediation funding.

## International ecommerce tax filing benchmarks (2026)

These are operational control targets. Statutory rules vary by registration and can change; the obligations register and local advice override generic benchmarks.

| Metric | Launch threshold | Steady-state target |
|---|---:|---:|
| Registrations with verified frequency/due date/payment instruction | 100% | 100% monthly revalidation |
| Filing calendar coverage | Next 13 months | Rolling 13 months |
| Source systems landed by internal close | 100% | T+2 business days |
| Transactions mapped to one liability owner | ≥99.9% | 100%; exceptions documented |
| Return-to-ledger variance | ≤0.5% before investigation | 0 unexplained variance |
| Tax-payable-to-bank variance | ≤0.5% before investigation | 0 unexplained variance |
| High-value/manual transactions reviewed | 100% | 100% |
| Returns submitted before statutory deadline | ≥3 business days | ≥5 business days |
| Payments initiated before clearance deadline | Authority-specific buffer | ≥3 business days unless instant |
| Filing receipts/payment proofs archived | 100% | Within 1 business day |
| Open critical exceptions at approval | 0 | 0 |
| Period close reproducible by independent reviewer | 100% | ≤60 minutes to trace a sampled box |

### Scheme facts that belong in the calendar

- The European Commission states that **Union and non-Union OSS returns are quarterly**, while the **IOSS return is monthly**. IOSS covers qualifying imported goods in consignments with intrinsic value not exceeding **EUR 150** and excludes excise goods. OSS/IOSS records must be retained for **10 years from the end of the year in which the transaction was made**.
- HMRC says a UK VAT Return is generally due **one calendar month and seven days after the accounting period**, and payment must reach HMRC by the deadline. VAT-registered businesses must submit a return even when there is no VAT to pay or reclaim. The calendar must use the account’s actual period and deadline rather than assuming every entity is quarterly.
- HMRC guidance for overseas goods sold directly to Great Britain distinguishes consignments of **GBP 135 or less** and says the threshold applies to the total consignment, not each item. Marketplace, Northern Ireland, excise, B2B, goods already in the UK, and higher-value flows need separate rule mapping.
- Canada GST/HST, Australia GST/BAS, New Zealand GST, and US state sales-tax reporting periods depend on registration facts and authority assignment. Do not hard-code a generic monthly or quarterly rule: store the portal-confirmed frequency and due date for each registration.

### Economic guardrail

At a $3M GMV brand, the return engine usually pays back through avoided duplicate remittance, missed credits/refunds, late penalties, adviser rework, and internal close time—not new revenue. A Path-B operation spending $15k–$40k in setup/advice and $1k–$4k monthly can justify a 3:1–12:1 Year-1 band when it prevents one material filing error and reduces a fragmented 5–10 day close to 2–4 days. Build the ROI from the brand’s own exposure; never invent “tax recovered” as revenue.

### Terminology sentinels

- **Marketplace facilitator:** use this US term in the obligations matrix alongside marketplace/deemed-supplier terminology used elsewhere; never infer the filing presentation from the label alone.
- **Tax liability clearing account:** maintain a registration-level clearing account linking the tax subledger, filed return, remittance, and bank settlement.
- **Foreign exchange:** document the authority-approved source, rate date, currency conversion, and rounding policy for sales, refunds, and payments.
- **Counsel:** route legal classification, registration, scheme, permanent-establishment, exemption, disclosure, and material correction questions to qualified local counsel or tax advisers.

## The build (30-day filing-control launch)

### Days 1–3 — Freeze the scope and prove the obligation register

1. Export every active, pending, dormant, and cancelled registration from portals and adviser records.
2. Create one row per entity + jurisdiction + scheme. Record tax ID, effective date, frequency, period dates, filing/payment deadlines, currency, payment reference, bank account, portal, agent, and required nil return.
3. Add non-return obligations: annual reconciliations, marketplace statements, statistical/customs reports, invoices, SAF-T/e-invoicing where applicable, and evidence retention.
4. Ask local advisers to approve the scope and flag registrations that should be added, changed, or cancelled. Do not let the software vendor make legal determinations by default.
5. Set internal deadlines: source lock T+2, reconciliation T+5, reviewer approval at least five business days before statutory due date, payment initiation with authority-specific clearing buffer.

### Days 3–7 — Define source ownership and the canonical ledger

1. Inventory Shopify/commerce platform, tax engine, ERP, payment processor, marketplaces, subscriptions, gift cards, returns, 3PL, customs, and bank sources.
2. Capture raw exports before transforming them. Store extraction timestamp, timezone, API filters, report version, row count, control totals, and file hash.
3. Normalize orders at line/event level. Never use payout deposits as sales; processors net fees, reserves, refunds, disputes, and timing differences.
4. Classify liability owner per event: merchant-collected, marketplace-collected/remitted, import/customer liability, or unresolved.
5. Link refunds and credit notes to original events; preserve partial quantities, shipping, discounts, tax, and FX.
6. Version mappings for SKU tax category, channel, jurisdiction, filing box, entity, and general-ledger account. Never overwrite the mapping used for a filed period.

### Days 8–12 — Build the monthly close and reconciliations

Run this control sequence for every period:

1. **Completeness:** opening order/event sequence → closing sequence; source row count → ledger row count; missing/duplicate IDs reported.
2. **Commerce bridge:** gross sales − discounts − refunds + shipping + tax = order total, with documented platform-specific treatment.
3. **Channel bridge:** DTC + each marketplace + wholesale + subscription totals = consolidated ledger; intercompany eliminated separately.
4. **Marketplace bridge:** marketplace gross and marketplace-collected tax reconcile to marketplace tax/settlement reports; marketplace liability does not post to merchant tax payable unless local filing instructions require a reporting presentation.
5. **Processor bridge:** expected receivables − fees − refunds − disputes − reserves = payouts, adjusted for settlement timing.
6. **Tax-engine bridge:** calculated/committed tax → order tax → tax subledger; investigate voided, uncommitted, timeout, override, and fallback transactions.
7. **Refund bridge:** returns/credit notes → original sales/tax; isolate cross-period claims and authority-specific adjustment treatment.
8. **FX bridge:** transaction currency → authority-return currency → functional currency using an approved source/date policy; post rounding separately.
9. **GL bridge:** tax subledger liability → jurisdiction-specific tax-payable control account; tax is not gross revenue.
10. **Cash bridge:** prior payable + current liability − credits − remittance = closing payable; every bank payment has the correct entity, period, registration, and reference.

### Days 13–16 — Configure scheme-specific workpapers

#### EU OSS/IOSS

- Split Union OSS, non-Union OSS, IOSS, domestic registrations, marketplace-deemed-supplier flows, and imports outside IOSS.
- Aggregate by Member State of consumption and applicable rate while preserving transaction evidence.
- Treat IOSS consignments above EUR 150, excise goods, B2B, returns, cancellations, and bad debt as exception paths for adviser review.
- Retain the detailed records required to substantiate Member State, type/date of supply, taxable amount, VAT, payments, and corrections for the official retention period.

#### UK VAT and Making Tax Digital

- Map output tax, input tax, imports/postponed accounting, reverse charge, exports/zero-rated evidence, credit notes, and overseas-goods rules to reviewed workpapers.
- Preserve digital records and digital links required by the applicable Making Tax Digital rules; do not rekey totals between disconnected spreadsheets without an approved compliant method.
- Separate Great Britain, Northern Ireland/EU movements, marketplace sales, direct low-value consignments, goods stored in the UK, and higher-value imports.
- Verify the actual HMRC account deadline and payment clearing requirement each period.

#### Canada, Australia, and New Zealand GST

- Store the exact authority-assigned reporting period, deadline, currency, and method per registration.
- Separate domestic/standard systems, simplified nonresident regimes, digital products/services, low-value imported goods, platform-operator transactions, and imports at border.
- Reconcile input-tax credits only where evidence and eligibility have been reviewed; do not net assumed credits into the liability.
- Preserve authority-required records and conversion evidence under the locally applicable retention rule.

#### US sales tax

- Maintain a jurisdiction matrix for state/local registration, frequency, marketplace treatment, origin/destination sourcing, product exemptions, deductions, and prepayments.
- Use portal-confirmed dates. “Quarterly sales tax” is not one universal schedule.
- Reconcile gross receipts, exempt/deducted sales, marketplace-facilitated sales, taxable sales, tax collected, prior credits, prepayments, and payment.
- Keep exemption certificates, resale certificates, marketplace statements, return/refund evidence, and tax-engine transaction logs linked to filed amounts.

### Days 17–21 — Establish maker/checker filing and payment

1. The preparer signs the close checklist and produces a locked draft return pack.
2. The reviewer samples source-to-return and return-to-source transactions, recalculates key boxes, checks exception resolution, compares prior periods, and challenges unusual rate/channel/jurisdiction changes.
3. Material unexplained variances block submission. Time pressure is not a control exception.
4. Submit from a named portal account with MFA and a controlled credential owner; never use a departed employee’s login.
5. Archive rendered return, submission receipt, confirmation number, timestamp, portal messages, and adviser approval.
6. A separate approver releases payment. Archive bank instruction, authority reference, value date, debit proof, and cleared status.
7. Post payment against the correct tax-payable account and period. Investigate residual balances instead of sweeping them to expense.

### Days 22–26 — Build correction, notice, and incident paths

Create runbooks for:

- Late source data discovered before submission.
- Error discovered after submission but before payment.
- Error discovered after both filing and payment.
- Rejected return or payment, portal outage, expired direct debit, or bank-limit failure.
- Tax-authority notice, audit request, refund hold, deregistration, or missing filing.
- Marketplace corrected statement, chargeback, partial refund, cancellation, and cross-period credit.
- Data corruption, tax-engine outage, duplicate event, wrong FX source, or wrong legal entity.

Every correction ticket must record original position, corrected position, cause, affected periods/jurisdictions, materiality, adviser instruction, authority method, payment/refund consequence, approval, and preventive fix. Never silently edit a filed workbook.

### Days 27–30 — Parallel run and release

1. Reproduce the prior filed period with the new ledger and explain every difference.
2. Run the current period in parallel with the existing process.
3. Sample at least: DTC sale, marketplace sale, subscription renewal, partial refund, full refund, chargeback, discount, shipping tax, gift card, cross-border order, IOSS/low-value flow, exempt/zero-rated flow, and manual override.
4. Test nil-return, amended-return, portal outage, payment rejection, and authority-notice tabletop scenarios.
5. Obtain tax, finance, engineering, and executive sign-off; then retire only the duplicated spreadsheet steps proven unnecessary.

## Common pitfalls (18 from real builds)

1. **Pitfall #1 — Assuming the tax engine files and pays every obligation.** Calculation, registration, filing, remittance, notice handling, and accounting are separate services. **Fix:** maintain a responsibility matrix per registration and require named owner/evidence for every step.
2. **Pitfall #2 — Filing from payout deposits.** Payouts are net of fees, refunds, reserves, disputes, and timing, so they cannot prove taxable sales. **Fix:** file from line-level economic events and use payouts only as a cash reconciliation.
3. **Pitfall #3 — Double-remitting marketplace tax.** Marketplace-collected tax is posted into merchant tax payable and paid again. **Fix:** classify liability owner per transaction, reconcile marketplace tax statements, and use jurisdiction-specific reporting presentation reviewed by an adviser.
4. **Pitfall #4 — Excluding marketplace sales entirely.** Some returns, thresholds, deductions, or disclosures still require marketplace gross activity even when the marketplace remits. **Fix:** preserve marketplace gross, tax, deductions, and evidence; map each registration’s reporting treatment explicitly.
5. **Pitfall #5 — Treating every country as quarterly.** EU IOSS is monthly, OSS is quarterly, and other authorities assign different periods. **Fix:** use a portal-verified obligations register, never a global “quarterly tax” calendar.
6. **Pitfall #6 — Missing nil returns.** No payable tax is mistaken for no filing obligation. **Fix:** record whether a nil return is required and keep the filing task open until a receipt exists.
7. **Pitfall #7 — Mixing tax with revenue or operating cash.** Reported margin is overstated and cash is unavailable at remittance. **Fix:** post jurisdiction-specific tax-payable accounts and reserve cash based on reconciled liability.
8. **Pitfall #8 — Applying current FX to historical transactions.** Return and ledger values drift, especially for refunds in a later period. **Fix:** approve a jurisdiction-specific FX source/date policy, store rate evidence, and link refund conversion to the required treatment.
9. **Pitfall #9 — Netting refunds without original-event linkage.** Tax credits are claimed in the wrong country, rate, or period. **Fix:** require original order/line/tax IDs and credit-note evidence for every refund adjustment.
10. **Pitfall #10 — Overwriting filed workpapers.** A later mapping or corrected export destroys the audit trail. **Fix:** lock period packs, version transformations, and process corrections through append-only tickets and amended/subsequent-return procedures.
11. **Pitfall #11 — Rekeying totals into portals and spreadsheets.** Manual copy/paste creates transposition errors and may break digital-link requirements. **Fix:** produce return boxes from the approved ledger, use compliant integrations, and independently verify portal totals before submission.
12. **Pitfall #12 — Using one login or one employee’s MFA.** Departure, leave, or lost phone can block filing. **Fix:** use named access, backup administrators, credential inventory, quarterly access review, and a tested recovery path.
13. **Pitfall #13 — Treating the EUR 150 or GBP 135 limit as an item limit.** Splitting or evaluating individual lines instead of the consignment misclassifies low-value imports. **Fix:** calculate the relevant consignment value under official rules and route exceptions, excise, marketplace, B2B, Northern Ireland, and higher-value flows to reviewed mappings.
14. **Pitfall #14 — Taking input-tax credits without valid evidence.** An ERP balance is not proof of entitlement. **Fix:** require invoice/import/evidence controls, legal-entity match, business-purpose review, and adviser-approved eligibility rules before claiming.
15. **Pitfall #15 — Ignoring chargebacks, failed payments, gifts, store credit, and discounts.** Gross-to-net and tax bases no longer reconcile. **Fix:** define event-specific accounting/tax treatment and include every event type in regression samples.
16. **Pitfall #16 — Submitting at the statutory deadline.** Portal, adviser, bank, or data failure becomes a late filing/payment. **Fix:** enforce an internal deadline at least five business days early and authority-specific bank-clearing buffers.
17. **Pitfall #17 — Silently fixing post-file errors.** The current ledger looks right but the authority and prior return remain wrong. **Fix:** open a correction ticket, preserve original evidence, obtain local advice, use the prescribed correction route, and link the outcome to the affected return/payment.
18. **Pitfall #18 — Treating tax rules as static software configuration.** Registration facts, rates, marketplace roles, products, warehouses, entities, and authority guidance change. **Fix:** run monthly obligation/mapping review, quarterly adviser review, release tests after commerce changes, and annual end-to-end control testing.

## Verification (this skill is "shipped" when...)

- **Gate A — Scope:** every legal entity, registration, scheme, frequency, period, deadline, nil-return rule, payment route, portal, adviser, and owner is present in the approved obligations register.
- **Gate B — Access:** named users, MFA, backup administrators, agent authority, bank limits, and recovery procedures are tested; departed users are removed.
- **Gate C — Data completeness:** all source systems land with extraction controls, hashes, row counts, timezones, immutable raw files, and no unexplained missing/duplicate economic events.
- **Gate D — Canonical ledger:** each event has entity, jurisdiction, channel, liability owner, tax, currency/FX, original/refund link, evidence, filing box, and versioned mapping.
- **Gate E — Reconciliations:** commerce, channel, marketplace, processor, tax engine, refund, FX, GL, tax payable, and bank bridges have zero unexplained variance.
- **Gate F — Scheme workpapers:** EU OSS/IOSS, UK VAT/MTD, Canada GST/HST, Australia/NZ GST, and US state workpapers used by the brand are reviewed and tied to the ledger.
- **Gate G — Maker/checker:** preparer and independent reviewer sign-offs exist; sampled transactions trace both directions; material exceptions block filing.
- **Gate H — Filing:** every due return—including nil returns—is submitted before the internal deadline, and the return, receipt, confirmation, timestamp, and portal messages are archived.
- **Gate I — Payment:** an independent approver releases funds from the correct entity/account; authority reference, value date, debit proof, cleared status, and GL clearing match.
- **Gate J — Corrections/notices:** amendment, late filing, rejected payment, outage, notice, and audit procedures are tested; original filed evidence is immutable.
- **Gate K — Retention:** period packs meet the longest applicable reviewed retention rule, including the EU OSS/IOSS 10-year requirement where used, with searchable transaction-level support.
- **Gate L — Parallel run:** one historical reproduction and one current parallel close pass; DTC, marketplace, subscription, refund, chargeback, discount, gift card, cross-border, low-value-import, exempt, and override samples all trace correctly.

## How to extend this skill

- **E-invoicing and digital reporting:** add Peppol, country continuous-transaction-control, SAF-T, real-time invoice clearance, and local archiving by market.
- **Customs:** connect HS classification, country of origin, customs value, duty, importer of record, DDP/DDU, IOSS identifier transmission, and broker statement reconciliation.
- **Income/franchise taxes:** keep separate from indirect tax; add entity-specific estimated payments and returns only with qualified advisers.
- **Transfer pricing/intercompany:** add seller-of-record, inventory ownership, intercompany invoices, permanent-establishment review, and elimination controls.
- **Automation:** schedule API extracts, schema tests, duplicate/missing-ID tests, FX validation, materiality alerts, portal status checks, and evidence-pack generation without automating legal judgment.
- **Vendor layer:** evaluate Avalara, TaxJar, Stripe Tax, Vertex, Sovos, Taxually, Numeral, Sphere, local advisers, and managed filing providers against jurisdiction coverage, data ownership, notice handling, SLAs, exportability, and audit evidence—not logo count.
- **Forecasting:** project liabilities and cash reserves from current-period sales while preserving the filed ledger as the final source of truth.

## Cross-references

- **Move #25 — International expansion:** defines market entry, entity, localization, logistics, and go/no-go context that determines filing scope.
- **Move #32 — Sales tax + VAT automation:** handles nexus monitoring, calculation, registrations, and product-taxability configuration; this Move #66 begins where calculation ends and governs close, filing, payment, correction, and evidence.
- **Move #15 — Marketplace expansion:** supplies seller-of-record, marketplace-facilitator, channel statement, and payout data.
- **Move #38 — Checkout payments:** supplies processor, chargeback, wallet, settlement, and payment-method events.
- **Move #53 — Financial operations:** owns close calendar, chart of accounts, tax-payable controls, cash reserve, approvals, and management reporting.
- **Move #57 — Procurement:** governs tax-provider/adviser selection, data-processing terms, service levels, exit exports, and liability allocation.
- **Move #59 — Shipping carrier mix:** supplies customs, ship-from/to, consignment, delivery, and broker evidence.
- **Move #48 — Privacy and consent:** applies data minimization, access, transfer, and retention controls to customer-level tax evidence.

## Sources

Authoritative requirements should be rechecked before every filing cycle and whenever a registration, entity, channel, product, warehouse, or scheme changes.

1. European Commission, **VAT One Stop Shop** — https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en
2. European Commission, **Record Keeping and Audits in OSS** — https://vat-one-stop-shop.ec.europa.eu/one-stop-shop/record-keeping-and-audits-oss_en
3. European Commission, **VAT rates** — https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-rates_en
4. EUR-Lex, **Council Directive 2006/112/EC on the common system of VAT** — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02006L0112-20240101
5. EUR-Lex, **Council Implementing Regulation (EU) No 282/2011** — https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011R0282-20220701
6. HM Revenue & Customs, **Submit your VAT Return** — https://www.gov.uk/submit-vat-return
7. HM Revenue & Customs, **Charge, reclaim and record VAT** — https://www.gov.uk/charge-reclaim-record-vat
8. HM Revenue & Customs, **VAT and overseas goods sold directly to customers in the UK** — https://www.gov.uk/guidance/vat-and-overseas-goods-sold-directly-to-customers-in-the-uk
9. HM Revenue & Customs, **VAT Notice 700/22: Making Tax Digital for VAT** — https://www.gov.uk/government/publications/vat-notice-70022-making-tax-digital-for-vat
10. Canada Revenue Agency, **File a GST/HST return** — https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/file-a-gst-hst-return.html
11. Canada Revenue Agency, **GST/HST returns and deadlines** — https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/gst-hst-returns-deadlines.html
12. Canada Revenue Agency, **GST/HST for digital economy businesses** — https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html
13. Australian Taxation Office, **Non-resident businesses and GST** — https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/non-resident-businesses-and-gst
14. Australian Taxation Office, **Lodging your business activity statement** — https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/lodging-your-bas
15. Australian Taxation Office, **GST record keeping** — https://www.ato.gov.au/businesses-and-organisations/preparing-lodging-and-paying/record-keeping-for-business/detailed-business-record-keeping-requirements/gst-record-keeping
16. New Zealand Inland Revenue, **GST for overseas businesses** — https://www.ird.govt.nz/gst/gst-for-overseas-businesses
17. Streamlined Sales Tax Governing Board, **State resources and registration system** — https://www.streamlinedsalestax.org/
18. California Department of Tax and Fee Administration, **Sales and Use Tax** — https://www.cdtfa.ca.gov/taxes-and-fees/sutprograms.htm
19. New York State Department of Taxation and Finance, **Sales and use tax** — https://www.tax.ny.gov/bus/st/stidx.htm
20. Avalara, **Tax compliance and returns** — https://www.avalara.com/us/en/products/returns.html
21. TaxJar, **Sales tax filing** — https://www.taxjar.com/sales-tax-filing
22. Stripe, **Stripe Tax** — https://stripe.com/tax
23. Vertex, **Indirect tax solutions** — https://www.vertexinc.com/solutions/indirect-tax
24. Sovos, **VAT compliance** — https://sovos.com/vat/
25. Taxually, **Global VAT compliance** — https://www.taxually.com/
26. Numeral, **Sales tax compliance** — https://www.numeralhq.com/
27. Sphere, **Global tax compliance** — https://www.getsphere.com/
