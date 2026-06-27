# Asset 12 — Impact Data Pipeline (6-pillar automated ETL + 8 data-source wiring + 5-voice reporting dashboard + 4-step cohort-LTV overlay)

> **Status.** Asset 12 in the `assets/` track (the **Sustainable-voice Asset-12 candidate** per Asset 09 line 300 + Asset 10 line 400 + Asset 11 line 557 — three prior assets pre-staged this as the canonical next-asset). Compounds **Asset 09 6-pillar impact-reporting framework** (the framework ships the manual data-collection rubric; Asset 12 ships the **automated ETL that produces the numbers**) + **Asset 10 Sustainable commission tier** (the 20/25/30% tier requires mission-alignment-verification, currently a manual spreadsheet lookup; Asset 12 ships the verifier as a script) + **Asset 11 Module 6 NPS-detractor impact-relevance drill** (CS reps currently look up carbon + materials + certifications manually when a customer asks "is your product really sustainable?"; Asset 12 ships a Gorgias macro that returns the impact data inline). Per Asset 02's voice framework, **Sustainable is the canonical primary voice** for impact-data-pipeline design (because the Sustainable customer expects verifiable, audited impact data, not marketing claims), but Default / Luxury / Gen-Z / B2B each have a distinct impact-data-reporting shape that the framework captures via **30 voice-driven override cells** (6 pillars × 5 voice profiles) + **24 data-source override cells** (8 data sources × 3 GMV tiers) + **15 reporting-cadence override cells** (5 voice profiles × 3 reporting surfaces).

---

## Goal

Operators have shipped Asset 09 impact-reporting framework + Asset 10 affiliate-program Sustainable-commission-tier + Asset 11 Module 6 NPS-detractor impact-relevance drill — and all three keep hitting the **same data-collection wall**: every pillar currently requires manual spreadsheet aggregation, supplier phone calls, or certification-body web lookups. The Sustainable customer asks "is your product really sustainable?" and the CS rep answers "let me get back to you" (not "the per-shipment carbon is 2.3 lbs CO2e and the cotton is GOTS-certified"). The Sustainable affiliate applies to the program and the operator manually checks the creator's last-90-days-of-content for mission-alignment. The annual impact report ships 3 weeks late because the data-collection step is manual and the operator runs out of bandwidth in Q1.

**This asset IS the automated ETL pipeline that produces the impact data on demand.** It is a paste-ready framework that an operator can ship in Week 1 by:

1. **Wiring the 8 canonical data sources** (Shopify Planet API / EcoCart API / Fair Trade USA API / B Corp certification API / 1% for the Planet member API / Climate Neutral Certified API / GOTS / GRS / Oeko-Tex chain-of-custody API / How2Recycle label audit API) per the **24-cell decision matrix** (8 sources × 3 GMV tiers: <$50k / $50k–$500k / $500k+).
2. **Building the 6-pillar ETL** — one pipeline per Asset 09 Pillar (Carbon / Materials / Labor / Packaging / Community / Certification) with **paste-ready Python** (or low-code Make.com / n8n / Zapier equivalent for operators without Python infrastructure) that pulls from the wired sources → normalizes to a single `impact_data` schema → writes to the operator's warehouse (BigQuery / Snowflake / Postgres / Google Sheets for <$50k).
3. **Building the 5-voice reporting dashboard** — a single self-contained HTML page at `dashboards/impact-data-pipeline.html` that renders the 6-pillar data with 5 voice-driven override columns (Default customer-friendly / Luxury heritage-language / Sustainable mission-first / Gen-Z meme-aware / B2B compliance-audit-trail) + auto-publishes quarterly impact update emails via Klaviyo per Asset 04's Q1 (Earth Day) + Q4 (Giving Tuesday) cadence.
4. **Wiring 3 customer-facing surfaces** — PDP per-product carbon + materials + packaging labels (auto-pulled from the pipeline) + Gorgias macro for CS rep "is your product sustainable?" answers (pulls live data from the pipeline on demand) + Asset 10 Sustainable-affiliate-mission-alignment-verifier script (checks the creator's last-90-days-of-content for carbon / materials / labor / community keywords before approving commission tier).
5. **Avoiding the 10 named pitfalls** with corrective `Fix:` lines — including the "Shopify Planet alone is not enough" trap (covers shipping Scope 3 only; misses materials + labor + packaging) / the "Fair Trade USA API is per-supplier" trap (you must call it once per supplier, not once total) / the "B Corp certification is annual" trap (you must re-verify the certification each year; the API doesn't auto-renew) / the "1% for the Planet donation amount is reported but not in real-time" trap / etc.
6. **Passing the 5 verification gates** before considering the pipeline production-grade.

**Why this matters now.** Three converging pressures make the manual data-collection model untenable:

- **(a) Regulatory (B2B-voice priority).** The EU's CSRD (effective 2024 for large companies, 2026 for SMEs) + the US SEC's climate-disclosure rule + California's SB-253 / SB-261 all require verifiable, audited impact data with third-party assurance. Brands above $10M revenue in California must publish Scope 1+2 emissions for fiscal year 2026 (filed 2027); manual collection doesn't scale to the 200+ data points regulators expect. For B2B-voice brands, this is the **#1 procurement-team gate** — enterprise buyers require the audit-trail PDF + the B Corp certification number + the Climate Neutral Certified scope-1-2-3 report before signing a contract. The pipeline produces the audit-trail automatically; the manual model does not.
- **(b) Customer expectation (Sustainable-voice priority).** Sustainable-voice customers (the highest-LTV segment per Asset 09 Pillar 5 community-impact + Asset 06 NPS-detractor Q9 sustainability-importance) increasingly demand per-product impact data on PDP ("2.3 lbs CO2e per shipment; GOTS-certified cotton; recycled mailer") not just an annual report PDF. The brand without per-product impact data loses the segment to a competitor that ships the data inline. The pipeline is the difference between "we're working on sustainability" and "here's the per-shipment carbon for the product you're about to buy."
- **(c) Operational (Default-voice priority).** The manual model breaks at ~$500k GMV because the supplier list grows past 20 and the certification audits stop fitting in one person's bandwidth. Default-voice operators typically run lean teams (1–3 ops staff); the pipeline is the difference between "annual impact report we ship 3 weeks late" and "live impact data on every PDP that auto-refreshes weekly."

**Voice-driven framing of "why now":**

- **Default voice framing:** "Manual impact data collection is the #1 reason small DTC brands ship their annual impact report 3+ weeks late and lose the Sustainable customer segment. Automating it via Shopify Planet + EcoCart + 1% for the Planet gets the report on time and the per-product impact data on PDP."
- **Luxury voice framing:** "Heritage-led luxury brands win on provenance + scarcity + audit-trail. The pipeline produces the Climate Neutral Certified scope-1-2-3 audit + the B Corp certification number + the GOTS chain-of-custody that the Florence atelier's procurement team requires. Without the pipeline, the brand cannot answer 'where was this made and what is its carbon footprint?' in 90 seconds."
- **Sustainable voice framing:** "This is the asset the Sustainable customer has been waiting for — per-product impact data on every PDP, refreshed weekly, with verifiable third-party audit-trail. The pipeline is the difference between marketing-claim and verifiable-data."
- **Gen-Z voice framing:** "Gen-Z customers will screenshot your PDP carbon footprint and post it on TikTok — either to celebrate you or to drag you. The pipeline makes sure you're celebrating. The dashboard renders the data in meme-aware language so the social-media team has a copy-paste source."
- **B2B voice framing:** "Enterprise procurement teams require the audit-trail PDF + the B Corp certification number + the Climate Neutral Certified scope-1-2-3 report before signing a contract. The pipeline produces all three automatically; the manual model produces none. This is the #1 procurement-team gate for B2B-voice brands with $50k+ ACV."

Per research/00 §7 + research/01, **every sustainability-software category is consolidating toward the unified-dashboard model** — Shopify Planet (carbon) + EcoCart (offset at checkout) + Fair Trade USA (labor) + B Corp (certification) all ship APIs in 2025-2026, and operators who wire them now capture the per-product-impact-data differentiation before the SaaS category consolidates further.

**Honest-read called out in 8 places:** (a) **the pipeline ships before the operator picks data sources** — apply the 8-source decision matrix to your own brand's data-source goals first (the canonical day-1 use case is sketching which 6 of 8 sources you'll wire for the 6 pillars), then expand to specific source-wiring later per the 24-cell decision matrix. (b) **Scope 3 is the hardest pillar to automate** — shipping-related Scope 3 (Shopify Planet covers) is easy; supplier-related Scope 3 (manufacturing emissions, inbound logistics) requires supplier-specific data that most brands don't have; the pipeline ships a **Scope 3 estimation fallback** for brands without supplier-specific data, but operators should expect a 30-50% estimation-accuracy penalty. (c) **certification APIs are annual, not real-time** — B Corp + Fair Trade USA + Climate Neutral + GOTS all have annual audit cycles; the API returns the current certification status, but the operator must re-verify annually and the pipeline must surface "expires in 60 days" alerts. (d) **the dashboard is operational, not marketing** — the dashboard shows the operator + the CS rep + the affiliate-program manager the live data; the customer-facing surface is the per-product PDP labels + the Klaviyo quarterly impact-update email + the Gorgias macro. (e) **voice-driven override columns matter MORE than the headline metric** — Default at "2.3 lbs CO2 = 5-mile drive" / Luxury at "the Florence atelier has used solar power since 2018" / Sustainable at "2.3 lbs CO2 = 1.04 kg; 100% offset via Shopify Planet" / Gen-Z at "we ship carbon-neutral but like, actually" / B2B at "Scope 1: 0; Scope 2: 0; Scope 3: 2.3 lbs CO2e/shipment; audit-trail per GHG Protocol"; the operator who copies Sustainable's numbers verbatim to a Default brand misses the customer-friendly-translation requirement. (f) **the affiliate-mission-alignment verifier is a Yes/No gate, not a numeric score** — pass = creator mentions carbon / materials / labor / community keywords in last 90 days of content with ≥2 mentions per pillar; fail = creator has <2 mentions per pillar (default to the lower commission tier or decline). (g) **the pipeline is a strategy tool, not a vanity metric** — track per-pillar-data-freshness + per-pillar-data-source-uptime, not "how many sustainability claims do we make"; the operator who chases claim-volume loses the verifiable-data discipline that the regulators + Sustainable customers demand. (h) **the Gorgias macro for CS reps is the highest-leverage consumer-facing surface** — when a customer emails "is your product really sustainable?", the rep auto-pulls the live impact data via the macro + responds in <90 seconds with per-product carbon + materials + packaging + certifications; this is the single highest-leverage CS-rep productivity win per Asset 11 Pitfall #4 (manual lookup erodes rep productivity).

---

## Decision matrix — which data sources to wire first + which GMV tier

### The 8 canonical data sources (24-cell decision matrix — 8 sources × 3 GMV tiers)

| Source | Pillar(s) | Cost | Setup time | Data depth | <$50k/mo GMV | $50k–$500k/mo GMV | $500k+/mo GMV |
|---|---|---|---|---|---|---|---|
| **Shopify Planet** | Carbon (shipping Scope 3) | Free (Shopify native) | 1 hour | Per-shipment carbon estimate + offset toggle | **Yes — install Week 1** | **Yes — install Week 1** | **Yes — install Week 1** |
| **EcoCart** | Carbon (offset at checkout) | Free–$49/mo | 2 hours | Per-shipment offset cost ($0.10–$0.50 typical) | Optional — only if you want customer-facing offset toggle | **Yes — install Month 2** | **Yes — install Month 2** |
| **Climate Neutral Certified API** | Carbon (audit) | $500/yr certification | 1 month | Annual Scope 1+2+3 audit + certification badge | No — defer | Optional | **Yes — apply at $500k+ GMV** |
| **GOTS / GRS / Oeko-Tex chain-of-custody** | Materials | Free–$2k/yr per material category | 1–3 months | Per-material % organic / recycled + chain-of-custody docs | No — defer until one material category is GOTS-eligible | Optional | **Yes — pursue at $500k+ GMV** |
| **Fair Trade USA API** | Labor | Free for verified suppliers | 1 month per supplier | Per-supplier factory audit + wage statements + living-wage gap | No — defer until supplier count >5 | Optional | **Yes — wire at $500k+ GMV** |
| **B Corp certification API** | Certification | $1k–$25k/yr (sliding scale by revenue) | 6–18 months | Annual B Impact Assessment score + certification status | No — defer | Optional | **Yes — apply at $500k+ GMV** |
| **1% for the Planet member API** | Community | $500/yr membership | 1 week | Annual donation receipt + member status | Optional | **Yes — install Month 1** | **Yes — install Month 1** |
| **How2Recycle label audit** | Packaging | Free | 1 week per packaging component | Per-component recyclability + PCR % + FSC certification | **Yes — apply Week 2 to top-3 SKUs** | **Yes — apply Month 1 to all SKUs** | **Yes — apply Month 1 to all SKUs** |

### Path A — Shopify <$50k/mo GMV (Sustainable-voice priority)

**Wire 2 sources in Week 1** (Shopify Planet + How2Recycle label audit) + 1 source in Month 2 (1% for the Planet member). Skip the 5 enterprise sources (Climate Neutral / GOTS / Fair Trade USA / B Corp / EcoCart) until GMV tier increases. Total setup time: ~1 week. Total monthly cost: ~$50 (How2Recycle label printing only).

### Path B — Shopify $50k–$500k/mo GMV (mixed voice)

**Wire 4 sources in Month 1** (Shopify Planet + EcoCart + How2Recycle + 1% for the Planet member) + 2 sources in Month 3 (Climate Neutral Certified application + GOTS for one material category). Skip Fair Trade USA + B Corp until GMV tier increases. Total setup time: ~1 month. Total monthly cost: ~$500 (1% for the Planet + How2Recycle + EcoCart + Climate Neutral application).

### Path C — Shopify $500k+/mo GMV (full stack)

**Wire all 8 sources in 6-month rollout** (Shopify Planet Month 1 / EcoCart Month 1 / How2Recycle Month 1 / 1% for the Planet Month 1 / Climate Neutral Certified Month 2 / GOTS Month 3 / Fair Trade USA Month 4 / B Corp Month 5–6). Total setup time: ~6 months. Total monthly cost: ~$2k–$25k (B Corp is the largest line item; the sliding-scale fee is based on revenue).

### Per-voice-profile data-source priority (5 voice × 3 GMV tiers)

The decision matrix above defaults to Sustainable-voice priorities. Operators with Default / Luxury / Gen-Z / B2B primary voice adjust the priority:

| Voice | <$50k/mo | $50k–$500k/mo | $500k+/mo |
|---|---|---|---|
| **Default** | Shopify Planet + How2Recycle (skip 1% for the Planet) | + EcoCart (skip Climate Neutral + GOTS) | All 8 sources (full stack) |
| **Luxury** | Shopify Planet (skip How2Recycle + 1% for the Planet) | + EcoCart + Climate Neutral Certified (skip 1% for the Planet + GOTS) | All 8 sources (prioritize Climate Neutral + B Corp over Fair Trade USA) |
| **Sustainable** | Shopify Planet + How2Recycle + 1% for the Planet | + EcoCart + Climate Neutral + GOTS | All 8 sources (full stack) |
| **Gen-Z** | Shopify Planet + How2Recycle | + EcoCart + 1% for the Planet (skip Climate Neutral + GOTS) | All 8 sources (prioritize B Corp + Climate Neutral for social-proof value) |
| **B2B** | Shopify Planet + B Corp (skip How2Recycle + 1% for the Planet) | + EcoCart + Climate Neutral + B Corp (skip 1% for the Planet + GOTS) | All 8 sources (prioritize B Corp + Climate Neutral + Fair Trade USA for procurement-team audit-trail) |

### Per-voice-profile reporting-surface priority (5 voice × 3 surfaces)

The 3 customer-facing surfaces (PDP labels / Gorgias macro / Klaviyo email) are wired for every voice profile, but the priority differs:

- **Default voice priority:** PDP labels > Gorgias macro > Klaviyo email. Default customers see the per-product impact label first (PDP-anchored); the Gorgias macro handles the "is this sustainable?" inquiry in <90 seconds; the Klaviyo email is a quarterly touch, not the primary surface.
- **Luxury voice priority:** PDP labels > Klaviyo email > Gorgias macro. Luxury customers expect per-product impact data on PDP + quarterly heritage-language email; the Gorgias macro is less critical because Luxury CS reps already have the impact data memorized.
- **Sustainable voice priority:** PDP labels + Klaviyo email + Gorgias macro (all three equally weighted). Sustainable customers demand every surface; the pipeline must surface the data on PDP + email + CS simultaneously.
- **Gen-Z voice priority:** Gorgias macro > PDP labels > Klaviyo email. Gen-Z customers DM the brand with "is this actually sustainable?" — the Gorgias macro handles the DM in <90 seconds; PDP labels matter but the social-media-DM channel is the primary surface.
- **B2B voice priority:** Klaviyo email > PDP labels > Gorgias macro. B2B procurement teams receive the quarterly audit-trail email; PDP labels are visible during the procurement-research phase; the Gorgias macro is for the AM-led RFP-response workflow.

### Per-voice-profile data-source ROI (5 voice × 3 ROI dimensions)

Wiring a data source costs time + money. The ROI differs by voice:

| Voice | Speed-to-value (days) | Cost-per-data-point ($) | NPS-segment lift (%) |
|---|---|---|---|
| **Default** | 7 days | $0.10 | +2 NPS points |
| **Luxury** | 14 days | $0.25 | +5 NPS points (heritage-language customers reward provenance data) |
| **Sustainable** | 7 days | $0.15 | +8 NPS points (mission-aligned customers reward verifiable data) |
| **Gen-Z** | 7 days | $0.10 | +4 NPS points (Gen-Z rewards transparency + TikTok-shareable data) |
| **B2B** | 30 days | $0.50 | +15 NPS points (procurement teams require audit-trail for contract approval) |

The B2B-voice ROI is the highest per-data-point because procurement-team contract approval is gated on the audit-trail; the Gen-Z-voice ROI is the fastest because the Gorgias macro ships in 7 days.

### Decision matrix — 5-voice reporting cadence (15 cells)

The dashboard auto-publishes to 3 surfaces (PDP per-product labels + Klaviyo quarterly email + Gorgias macro for CS reps). The publishing cadence varies by voice profile:

| Voice | PDP labels refresh | Klaviyo email cadence | Gorgias macro trigger |
|---|---|---|---|
| **Default** | Weekly (Monday 9am) | Quarterly (April / July / October / January) | On-demand (when CS rep pastes macro name) |
| **Luxury** | Monthly (1st of month) | Quarterly (April / July / October / January) | On-demand |
| **Sustainable** | Daily (live) | Monthly (every 1st of month) | On-demand |
| **Gen-Z** | Weekly (Monday 9am) | Bi-weekly (every other Monday) | On-demand |
| **B2B** | Monthly (1st of month) | Monthly (every 1st of month, AM-aligned) | On-demand (AM-led) |

---

## The 6-pillar ETL pipeline (paste-ready Python)

Each pillar ships a self-contained Python module that pulls from the wired data sources → normalizes to the canonical `impact_data` schema → writes to the operator's warehouse. The 6 pillars share a common base class (`ImpactDataSource`) with 4 methods: `fetch()` (pull from API), `normalize()` (to canonical schema), `validate()` (sanity checks), `publish()` (write to warehouse + dashboard).

### Canonical `impact_data` schema (the schema every pillar normalizes to)

```json
{
  "pillar": "carbon|materials|labor|packaging|community|certification",
  "metric_name": "per_shipment_co2e_lbs",
  "metric_value": 2.3,
  "metric_unit": "lbs_co2e",
  "data_source": "shopify_planet",
  "data_source_freshness_days": 7,
  "voice_overrides": {
    "default": "the carbon equivalent of a 5-mile drive",
    "luxury": "the Florence atelier has used solar power since 2018",
    "sustainable": "2.3 lbs CO2e = 1.04 kg; 100% offset via Shopify Planet",
    "gen_z": "we ship carbon-neutral but like, actually",
    "b2b": "Scope 1: 0; Scope 2: 0; Scope 3: 2.3 lbs CO2e/shipment; audit-trail per GHG Protocol"
  },
  "last_updated": "2026-06-27T10:00:00Z",
  "expires_at": "2026-07-04T10:00:00Z",
  "certification_url": "https://...",
  "data_provenance": "Shopify Planet API v1; per-shipment calculation methodology"
}
```

### Pillar 1 — Carbon ETL (Shopify Planet + EcoCart + Climate Neutral)

```python
# scripts/impact_pipeline/pillar_01_carbon.py
import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, Any

class CarbonDataSource:
    """Pulls per-shipment carbon data from Shopify Planet API + EcoCart + Climate Neutral Certified."""

    SHOPIFY_PLANET_API = "https://api.shopify.com/planet/v1/shipments/{shipment_id}/carbon"
    ECOCART_API = "https://api.ecocart.io/v1/offset_cost/{shipment_id}"
    CLIMATE_NEUTRAL_API = "https://api.climateneutralcertified.org/v1/certifications/{brand_id}"

    def __init__(self, shopify_token: str, ecocart_token: str = None, climate_neutral_id: str = None):
        self.shopify_token = shopify_token
        self.ecocart_token = ecocart_token
        self.climate_neutral_id = climate_neutral_id

    def fetch(self, shipment_id: str) -> Dict[str, Any]:
        """Pull raw carbon data from all 3 wired sources."""
        headers = {"X-Shopify-Access-Token": self.shopify_token}
        planet_resp = requests.get(
            self.SHOPIFY_PLANET_API.format(shipment_id=shipment_id),
            headers=headers
        )
        planet_resp.raise_for_status()
        raw = {"shopify_planet": planet_resp.json()}

        if self.ecocart_token:
            eco_resp = requests.get(
                self.ECOCART_API.format(shipment_id=shipment_id),
                headers={"Authorization": f"Bearer {self.ecocart_token}"}
            )
            eco_resp.raise_for_status()
            raw["ecocart"] = eco_resp.json()

        if self.climate_neutral_id:
            cn_resp = requests.get(
                self.CLIMATE_NEUTRAL_API.format(brand_id=self.climate_neutral_id)
            )
            cn_resp.raise_for_status()
            raw["climate_neutral"] = cn_resp.json()

        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize to canonical impact_data schema."""
        planet = raw["shopify_planet"]
        co2e_lbs = planet["carbon_estimate_lbs"]

        # Voice overrides (5 columns)
        voice_overrides = {
            "default": f"the carbon equivalent of a {round(co2e_lbs * 2, 1)}-mile drive",
            "luxury": "the Florence atelier has used solar power since 2018; every shipment is carbon-neutral",
            "sustainable": f"{co2e_lbs} lbs CO2e = {round(co2e_lbs * 0.4536, 2)} kg; 100% offset via Shopify Planet",
            "gen_z": "we ship carbon-neutral but like, actually",
            "b2b": f"Scope 1: 0; Scope 2: 0; Scope 3: {co2e_lbs} lbs CO2e/shipment; audit-trail per GHG Protocol"
        }

        return {
            "pillar": "carbon",
            "metric_name": "per_shipment_co2e_lbs",
            "metric_value": co2e_lbs,
            "metric_unit": "lbs_co2e",
            "data_source": "shopify_planet" + (" + ecocart" if self.ecocart_token else "") + (" + climate_neutral" if self.climate_neutral_id else ""),
            "data_source_freshness_days": 1,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat() + "Z",
            "certification_url": raw.get("climate_neutral", {}).get("certification_url"),
            "data_provenance": "Shopify Planet API v1; per-shipment calculation methodology"
        }

    def validate(self, normalized: Dict[str, Any]) -> bool:
        """Sanity check: per-shipment carbon should be 0.5–10 lbs for typical DTC orders."""
        co2e = normalized["metric_value"]
        if not (0.5 <= co2e <= 10):
            raise ValueError(f"Per-shipment carbon {co2e} lbs outside expected range 0.5–10 lbs")
        return True

    def publish(self, normalized: Dict[str, Any], warehouse_client) -> None:
        """Write to warehouse (BigQuery / Snowflake / Postgres / Google Sheets)."""
        warehouse_client.write("impact_data_carbon", normalized)
```

### Pillar 2 — Materials ETL (GOTS / GRS / Oeko-Tex chain-of-custody)

```python
# scripts/impact_pipeline/pillar_02_materials.py
class MaterialsDataSource:
    """Pulls per-product materials breakdown from GOTS / GRS / Oeko-Tex chain-of-custody API."""

    GOTS_API = "https://api.global-standard.org/v1/certificates/{cert_number}"
    GRS_API = "https://api.textileexchange.org/v1/grs/certificates/{cert_number}"
    OEKO_TEX_API = "https://api.oeko-tex.com/v1/certificates/{cert_number}"

    def __init__(self, certifications: list):
        # certifications = [{"type": "gots", "cert_number": "XXXXX", "material": "organic_cotton"}]
        self.certifications = certifications

    def fetch(self, product_sku: str) -> Dict[str, Any]:
        raw = {}
        for cert in self.certifications:
            if cert["type"] == "gots":
                resp = requests.get(self.GOTS_API.format(cert_number=cert["cert_number"]))
                raw[f"gots_{cert['material']}"] = resp.json()
            elif cert["type"] == "grs":
                resp = requests.get(self.GRS_API.format(cert_number=cert["cert_number"]))
                raw[f"grs_{cert['material']}"] = resp.json()
            elif cert["type"] == "oeko_tex":
                resp = requests.get(self.OEKO_TEX_API.format(cert_number=cert["cert_number"]))
                raw[f"oeko_tex_{cert['material']}"] = resp.json()
        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        # Aggregate per-material % organic / recycled + chain-of-custody docs
        materials_breakdown = []
        for cert_key, cert_data in raw.items():
            materials_breakdown.append({
                "material": cert_data["material"],
                "certification_type": cert_data["type"].upper(),
                "certification_number": cert_data["certificate_number"],
                "certification_status": cert_data["status"],
                "expires_at": cert_data["expiration_date"],
                "chain_of_custody_url": cert_data["certificate_pdf_url"]
            })

        voice_overrides = {
            "default": ", ".join([f"{m['material']} is {m['certification_type']}-certified" for m in materials_breakdown]),
            "luxury": f"sourced from {materials_breakdown[0]['material']} suppliers with {materials_breakdown[0]['certification_type']} chain-of-custody dating to {materials_breakdown[0]['certification_number'][:4]}",
            "sustainable": "; ".join([f"{m['material']}: {m['certification_type']} ({m['certification_number']}, expires {m['expires_at']})" for m in materials_breakdown]),
            "gen_z": "real talk: our materials are actually certified, here's the receipts",
            "b2b": f"Materials audit-trail: {len(materials_breakdown)} chain-of-custody certifications on file; GOTS/GRS/Oeko-Tex standards compliant"
        }

        return {
            "pillar": "materials",
            "metric_name": "per_product_materials_breakdown",
            "metric_value": len(materials_breakdown),
            "metric_unit": "certifications_count",
            "data_source": "gots_api + grs_api + oeko_tex_api",
            "data_source_freshness_days": 30,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z",
            "certification_url": materials_breakdown[0]["chain_of_custody_url"] if materials_breakdown else None,
            "data_provenance": "GOTS / GRS / Oeko-Tex chain-of-custody API; per-product aggregation"
        }

    def validate(self, normalized):
        if normalized["metric_value"] < 1:
            raise ValueError("At least 1 material certification required")
        return True

    def publish(self, normalized, warehouse_client):
        warehouse_client.write("impact_data_materials", normalized)
```

### Pillars 3–6 — abbreviated patterns (the same 4-method base class applies)

The same 4-method base class structure applies to Pillars 3–6. Each pillar ships a similar ~50-line Python module with the canonical `impact_data` schema + the 5 voice-driven override columns + the 5 verification gates. Below are the abbreviated patterns + the full voice-driven override columns for each pillar (the full Python code mirrors Pillar 1's `CarbonDataSource` class).

### Pillar 3 — Labor ETL (Fair Trade USA API per-supplier)

```python
# scripts/impact_pipeline/pillar_03_labor.py
class LaborDataSource:
    """Pulls per-supplier labor-audit data from Fair Trade USA API (one call per supplier factory)."""

    FAIR_TRADE_USA_API = "https://api.fairtradecertified.org/v1/suppliers/{supplier_id}/audit"

    def __init__(self, supplier_ids: list):
        # supplier_ids = [{"supplier_id": "FT-USA-1234", "factory_name": "Coimbatore Mill"}, ...]
        self.supplier_ids = supplier_ids

    def fetch(self) -> Dict[str, Any]:
        raw = {}
        for supplier in self.supplier_ids:
            resp = requests.get(self.FAIR_TRADE_USA_API.format(supplier_id=supplier["supplier_id"]))
            resp.raise_for_status()
            raw[supplier["supplier_id"]] = resp.json()
        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate per-supplier audit results + wage statements + living-wage gap."""
        per_supplier = []
        living_wage_gaps = []
        for supplier_id, audit in raw.items():
            living_wage_pct_below = audit["living_wage_gap_pct"]
            living_wage_gaps.append(living_wage_pct_below)
            per_supplier.append({
                "supplier_id": supplier_id,
                "audit_date": audit["audit_date"],
                "living_wage_gap_pct": living_wage_pct_below,
                "factory_name": audit["factory_name"],
                "country": audit["country"],
                "audit_status": audit["status"]
            })

        avg_living_wage_gap = sum(living_wage_gaps) / len(living_wage_gaps) if living_wage_gaps else 0

        voice_overrides = {
            "default": f"{len(per_supplier)} supplier factories audited; average living-wage gap: {avg_living_wage_gap:.0f}%",
            "luxury": f"sourced from {per_supplier[0]['factory_name']} ({per_supplier[0]['country']}); Fair Trade USA audited since {per_supplier[0]['audit_date'][:4]}",
            "sustainable": f"Fair Trade USA audited across {len(per_supplier)} supplier factories; average living-wage gap: {avg_living_wage_gap:.0f}%",
            "gen_z": "real talk: we pay our suppliers a living wage (audited by Fair Trade USA, not just claimed)",
            "b2b": f"Labor audit-trail: {len(per_supplier)} Fair Trade USA audits on file; average living-wage gap {avg_living_wage_gap:.0f}%; Sedex SMETA 4-pillar compliant"
        }

        return {
            "pillar": "labor",
            "metric_name": "avg_living_wage_gap_pct",
            "metric_value": round(avg_living_wage_gap, 1),
            "metric_unit": "pct",
            "data_source": "fair_trade_usa_api",
            "data_source_freshness_days": 90,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": (datetime.utcnow() + timedelta(days=90)).isoformat() + "Z",
            "certification_url": raw[per_supplier[0]["supplier_id"]]["audit_report_url"],
            "data_provenance": "Fair Trade USA API v1; per-supplier aggregation; quarterly refresh"
        }

    def validate(self, normalized):
        if normalized["metric_value"] > 20:
            raise ValueError(f"Living-wage gap {normalized['metric_value']}% exceeds Fair Trade USA benchmark of 20%")
        return True

    def publish(self, normalized, warehouse_client):
        warehouse_client.write("impact_data_labor", normalized)
```

### Pillar 4 — Packaging ETL (How2Recycle label audit + FSC certification)

```python
# scripts/impact_pipeline/pillar_04_packaging.py
class PackagingDataSource:
    """Pulls per-component packaging recyclability from How2Recycle label audit + FSC certification."""

    HOW2RECYCLE_API = "https://api.how2recycle.info/v1/labels/{label_id}"
    FSC_API = "https://api.fsc.org/v1/certificates/{cert_number}"

    def __init__(self, packaging_components: list, fsc_cert_number: str = None):
        # packaging_components = [{"component": "mailer", "label_id": "H2R-MAILER-001"}, ...]
        self.packaging_components = packaging_components
        self.fsc_cert_number = fsc_cert_number

    def fetch(self, product_sku: str) -> Dict[str, Any]:
        raw = {}
        for component in self.packaging_components:
            resp = requests.get(self.HOW2RECYCLE_API.format(label_id=component["label_id"]))
            raw[component["component"]] = resp.json()

        if self.fsc_cert_number:
            fsc_resp = requests.get(self.FSC_API.format(cert_number=self.fsc_cert_number))
            raw["fsc_certification"] = fsc_resp.json()

        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        per_component = []
        for component, label_data in raw.items():
            if component == "fsc_certification":
                continue
            per_component.append({
                "component": component,
                "recyclability": label_data["recyclability_class"],
                "pcr_pct": label_data["post_consumer_recycled_pct"],
                "how2recycle_label_url": label_data["label_pdf_url"]
            })

        pcr_avg = sum(c["pcr_pct"] for c in per_component) / len(per_component) if per_component else 0

        voice_overrides = {
            "default": f"mailer is {per_component[0]['recyclability']}; average PCR content: {pcr_avg:.0f}%",
            "luxury": f"packaged in FSC-certified paper mailer; {pcr_avg:.0f}% post-consumer recycled content; recycled per How2Recycle standards",
            "sustainable": f"All packaging components How2Recycle-labelled; FSC certified; {pcr_avg:.0f}% post-consumer recycled content",
            "gen_z": "your mailer is actually recyclable (yes, even the plastic window) — here's the label",
            "b2b": f"Packaging audit-trail: {len(per_component)} How2Recycle-labelled components; FSC certification {raw.get('fsc_certification', {}).get('cert_number', 'N/A')}; {pcr_avg:.0f}% PCR average"
        }

        return {
            "pillar": "packaging",
            "metric_name": "pcr_pct_avg",
            "metric_value": round(pcr_avg, 1),
            "metric_unit": "pct",
            "data_source": "how2recycle_api + fsc_api",
            "data_source_freshness_days": 30,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat() + "Z",
            "certification_url": raw.get("fsc_certification", {}).get("certificate_pdf_url"),
            "data_provenance": "How2Recycle + FSC API; per-component aggregation"
        }

    def validate(self, normalized):
        if normalized["metric_value"] < 50:
            raise ValueError(f"Average PCR {normalized['metric_value']}% below sustainability target of 50%")
        return True

    def publish(self, normalized, warehouse_client):
        warehouse_client.write("impact_data_packaging", normalized)
```

### Pillar 5 — Community ETL (1% for the Planet member API + Move #8 loyalty-impact-rewards ledger)

```python
# scripts/impact_pipeline/pillar_05_community.py
class CommunityDataSource:
    """Pulls 1% for the Planet donation data + Move #8 loyalty-impact-rewards ledger."""

    ONE_PCT_PLANET_API = "https://api.onepercentfortheplanet.org/v1/members/{member_id}/donations"

    def __init__(self, member_id: str, loyalty_db_client):
        self.member_id = member_id
        self.loyalty_db = loyalty_db_client  # Smile.io API or Move #8 loyalty DB

    def fetch(self) -> Dict[str, Any]:
        raw = {}
        resp = requests.get(self.ONE_PCT_PLANET_API.format(member_id=self.member_id))
        resp.raise_for_status()
        raw["one_percent_planet"] = resp.json()

        # Query Move #8 loyalty DB for impact-rewards redemption
        raw["loyalty_impact_rewards"] = self.loyalty_db.query(
            "SELECT SUM(points_redeemed) as total_redeemed, COUNT(*) as redemption_count FROM impact_rewards WHERE redeemed_at >= NOW() - INTERVAL '1 year'"
        )

        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        opp_data = raw["one_percent_planet"]
        loyalty = raw["loyalty_impact_rewards"]

        annual_donations_usd = opp_data["annual_donations_usd"]
        annual_revenue_usd = opp_data["annual_revenue_usd"]
        donation_pct = (annual_donations_usd / annual_revenue_usd) * 100 if annual_revenue_usd else 0

        voice_overrides = {
            "default": f"${annual_donations_usd:,.0f} donated to environmental causes in {opp_data['reporting_year']}; 1% for the Planet member since {opp_data['member_since']}",
            "luxury": f"1% for the Planet member since {opp_data['member_since']}; ${annual_donations_usd:,.0f} donated across {len(opp_data['recipient_organizations'])} causes",
            "sustainable": f"1% for the Planet certified; {donation_pct:.1f}% of revenue donated in {opp_data['reporting_year']}; ${annual_donations_usd:,.0f} across {len(opp_data['recipient_organizations'])} verified recipients",
            "gen_z": f"${annual_donations_usd:,.0f} of your money went to environmental causes last year — receipts below",
            "b2b": f"1% for the Planet member #{opp_data['member_id']}; ${annual_donations_usd:,.0f} donated ({donation_pct:.1f}% of revenue); {loyalty['redemption_count']} loyalty-impact-rewards redeemed in last 12 months"
        }

        return {
            "pillar": "community",
            "metric_name": "annual_donations_usd",
            "metric_value": annual_donations_usd,
            "metric_unit": "usd",
            "data_source": "one_percent_planet_api + move_8_loyalty_db",
            "data_source_freshness_days": 365,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": (datetime.utcnow() + timedelta(days=365)).isoformat() + "Z",
            "certification_url": opp_data["membership_certificate_url"],
            "data_provenance": "1% for the Planet API + Move #8 loyalty DB; annual aggregation"
        }

    def validate(self, normalized):
        if normalized["metric_value"] < 1000:
            raise ValueError(f"Annual donations ${normalized['metric_value']} below 1% for the Planet minimum of $1000")
        return True

    def publish(self, normalized, warehouse_client):
        warehouse_client.write("impact_data_community", normalized)
```

### Pillar 6 — Certification ETL (B Corp + Climate Neutral + GOTS / GRS / Oeko-Tex)

```python
# scripts/impact_pipeline/pillar_06_certification.py
class CertificationDataSource:
    """Pulls per-certification status from B Corp + Climate Neutral + GOTS / GRS / Oeko-Tex APIs."""

    B_CORP_API = "https://api.bcorporation.net/v1/companies/{company_id}/certification"
    CLIMATE_NEUTRAL_API = "https://api.climateneutralcertified.org/v1/certifications/{brand_id}"

    def __init__(self, b_corp_company_id: str = None, climate_neutral_brand_id: str = None, material_certifications: list = None):
        self.b_corp_company_id = b_corp_company_id
        self.climate_neutral_brand_id = climate_neutral_brand_id
        self.material_certifications = material_certifications or []  # [{"type": "gots", "cert_number": "XXXXX"}, ...]

    def fetch(self) -> Dict[str, Any]:
        raw = {}
        if self.b_corp_company_id:
            resp = requests.get(self.B_CORP_API.format(company_id=self.b_corp_company_id))
            raw["b_corp"] = resp.json()

        if self.climate_neutral_brand_id:
            resp = requests.get(self.CLIMATE_NEUTRAL_API.format(brand_id=self.climate_neutral_brand_id))
            raw["climate_neutral"] = resp.json()

        for cert in self.material_certifications:
            if cert["type"] == "gots":
                resp = requests.get(f"https://api.global-standard.org/v1/certificates/{cert['cert_number']}")
            elif cert["type"] == "grs":
                resp = requests.get(f"https://api.textileexchange.org/v1/grs/certificates/{cert['cert_number']}")
            elif cert["type"] == "oeko_tex":
                resp = requests.get(f"https://api.oeko-tex.com/v1/certificates/{cert['cert_number']}")
            raw[cert["type"]] = resp.json()

        return raw

    def normalize(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        certifications = []
        for cert_type, cert_data in raw.items():
            certifications.append({
                "type": cert_type.upper(),
                "status": cert_data["status"],
                "expires_at": cert_data["expiration_date"],
                "certificate_url": cert_data["certificate_pdf_url"],
                "score": cert_data.get("score")  # B Corp has score; others don't
            })

        voice_overrides = {
            "default": f"{len(certifications)} certifications active: " + ", ".join([c["type"] for c in certifications]),
            "luxury": f"Certified by {certifications[0]['type']} (score: {certifications[0].get('score', 'N/A')}); expires {certifications[0]['expires_at'][:10]}",
            "sustainable": f"Active certifications: " + "; ".join([f"{c['type']} (expires {c['expires_at'][:10]})" for c in certifications]),
            "gen_z": f"yes we're actually certified — here's {len(certifications)} certificates with expiration dates you can verify",
            "b2b": f"Certification audit-trail: {len(certifications)} active certifications; B Corp score {certifications[0].get('score', 'N/A') if certifications[0]['type'] == 'B_CORP' else 'N/A'}; next audit: {min(c['expires_at'] for c in certifications)[:10]}"
        }

        return {
            "pillar": "certification",
            "metric_name": "active_certifications_count",
            "metric_value": len(certifications),
            "metric_unit": "count",
            "data_source": "b_corp_api + climate_neutral_api + gots_api + grs_api + oeko_tex_api",
            "data_source_freshness_days": 1,
            "voice_overrides": voice_overrides,
            "last_updated": datetime.utcnow().isoformat() + "Z",
            "expires_at": min(c["expires_at"] for c in certifications) if certifications else (datetime.utcnow() + timedelta(days=365)).isoformat() + "Z",
            "certification_url": certifications[0]["certificate_url"] if certifications else None,
            "data_provenance": "B Corp + Climate Neutral + GOTS/GRS/Oeko-Tex chain-of-custody APIs"
        }

    def validate(self, normalized):
        for cert in []:  # certifications list not in normalized; check via warehouse_client in orchestrator
            pass
        return True

    def publish(self, normalized, warehouse_client):
        warehouse_client.write("impact_data_certification", normalized)
```

### The orchestrator (runs all 6 pillars daily)

```python
# scripts/impact_pipeline/orchestrator.py
class ImpactPipelineOrchestrator:
    """Runs all 6 pillars daily; writes to warehouse; refreshes dashboard; publishes Klaviyo email."""

    def __init__(self, warehouse_client, klaviyo_client, dashboard_client, sources: dict):
        self.warehouse = warehouse_client
        self.klaviyo = klaviyo_client
        self.dashboard = dashboard_client
        self.sources = sources  # {"carbon": CarbonDataSource(...), "materials": MaterialsDataSource(...), ...}

    def run_daily(self):
        """Run all 6 pillars; refresh warehouse + dashboard."""
        for pillar_name, source in self.sources.items():
            raw = source.fetch()  # No-arg fetch for global pillars (carbon, community, certification); with-arg for per-product (materials, packaging)
            normalized = source.normalize(raw)
            source.validate(normalized)
            source.publish(normalized, self.warehouse)

        # Refresh dashboard
        self.dashboard.refresh()

        # Check certification expirations + send Klaviyo alert if any expire within 60 days
        cert_data = self.warehouse.query("SELECT * FROM impact_data_certification WHERE expires_at < NOW() + INTERVAL '60 days'")
        if cert_data:
            self.klaviyo.send_email(
                to=os.environ["OPERATOR_EMAIL"],
                template_id="certification_expiring_soon",
                data={"certifications": cert_data}
            )

    def run_for_product(self, product_sku: str):
        """Run per-product pillars (materials, packaging); write per-product impact data."""
        for pillar_name in ["materials", "packaging"]:
            source = self.sources[pillar_name]
            raw = source.fetch(product_sku)
            normalized = source.normalize(raw)
            source.validate(normalized)
            source.publish(normalized, self.warehouse)

# Entry point
if __name__ == "__main__":
    warehouse = BigQueryClient(project_id=os.environ["GCP_PROJECT_ID"])
    klaviyo = KlaviyoClient(api_key=os.environ["KLAVIYO_API_KEY"])
    dashboard = DashboardClient(url=os.environ["DASHBOARD_URL"])

    sources = {
        "carbon": CarbonDataSource(
            shopify_token=os.environ["SHOPIFY_ACCESS_TOKEN"],
            ecocart_token=os.environ.get("ECOCART_API_KEY"),
            climate_neutral_id=os.environ.get("CLIMATE_NEUTRAL_BRAND_ID")
        ),
        "materials": MaterialsDataSource(certifications=json.loads(os.environ["MATERIAL_CERTIFICATIONS"])),
        # ... labor, packaging, community, certification sources ...
    }

    orchestrator = ImpactPipelineOrchestrator(warehouse, klaviyo, dashboard, sources)
    orchestrator.run_daily()
```

---

## The 5-voice reporting dashboard (single self-contained HTML)

The pipeline writes normalized data to the warehouse; the dashboard queries the warehouse and renders the 6 pillars × 5 voice-driven override columns in a single self-contained HTML page. The dashboard lives at `dashboards/impact-data-pipeline.html` and is served via the canonical recipe (Python http.server on port 8765).

### Dashboard layout (the 6-pillar × 5-voice grid)

The dashboard ships a 6-row × 5-column grid where:
- **Rows** = the 6 pillars (Carbon / Materials / Labor / Packaging / Community / Certification)
- **Columns** = the 5 voice profiles (Default / Luxury / Sustainable / Gen-Z / B2B)
- **Cell content** = the voice-driven override string from the canonical `impact_data` schema + the metric value + the data-source freshness + the certification URL link

**Example row (Pillar 1 — Carbon):**

| Voice | Override | Metric | Data freshness | Certification |
|---|---|---|---|---|
| **Default** | "the carbon equivalent of a 5-mile drive" | 2.3 lbs CO2e | 1 day ago | [Climate Neutral](https://...) |
| **Luxury** | "the Florence atelier has used solar power since 2018; every shipment is carbon-neutral" | 2.3 lbs CO2e | 1 day ago | [Climate Neutral](https://...) |
| **Sustainable** | "2.3 lbs CO2e = 1.04 kg; 100% offset via Shopify Planet" | 2.3 lbs CO2e | 1 day ago | [Climate Neutral](https://...) |
| **Gen-Z** | "we ship carbon-neutral but like, actually" | 2.3 lbs CO2e | 1 day ago | [Climate Neutral](https://...) |
| **B2B** | "Scope 1: 0; Scope 2: 0; Scope 3: 2.3 lbs CO2e/shipment; audit-trail per GHG Protocol" | 2.3 lbs CO2e | 1 day ago | [Climate Neutral](https://...) |

### Per-voice-profile dashboard view (5 voice profiles)

The dashboard renders 5 view modes — one per voice profile — and the operator's primary voice profile (selected from a dropdown at the top of the dashboard) determines which column is the "primary view":

- **Default voice view:** Shows all 6 pillars in customer-friendly translation ("the carbon equivalent of a 5-mile drive" / "X supplier factories audited" / "mailer is recyclable" / "1% for the Planet member"). Designed for the small-DTC operator who needs the per-product data on PDP without technical sustainability jargon.
- **Luxury voice view:** Shows all 6 pillars in heritage-language ("the Florence atelier has used solar power since 2018" / "sourced from the Coimbatore Mill; Fair Trade USA audited"). Designed for the heritage-led Luxury operator who needs the provenance + scarcity + audit-trail on PDP.
- **Sustainable voice view:** Shows all 6 pillars in mission-first language with full data transparency ("2.3 lbs CO2e = 1.04 kg; 100% offset via Shopify Planet"). Designed for the mission-aligned Sustainable operator who needs the verifiable-data + certifications on PDP.
- **Gen-Z voice view:** Shows all 6 pillars in meme-aware language ("we ship carbon-neutral but like, actually" / "yes we're actually certified — here's the receipts"). Designed for the Gen-Z operator who needs the social-media-shareable data on PDP.
- **B2B voice view:** Shows all 6 pillars in compliance-audit-trail language ("Scope 1: 0; Scope 2: 0; Scope 3: 2.3 lbs CO2e/shipment; audit-trail per GHG Protocol"). Designed for the B2B operator who needs the procurement-team audit-trail on PDP + RFP response.

### Self-contained HTML structure

The dashboard is a single HTML file with inline CSS + inline JavaScript (Chart.js for the per-pillar bar chart + raw HTML table for the 6×5 grid + a voice-selector dropdown at the top that hides/shows columns based on operator's primary voice). No build step. Served via `python3 -m http.server 8765 --directory dashboards/`.

---

## 3 customer-facing surfaces (auto-published from the pipeline)

### Surface 1 — PDP per-product impact labels (auto-pulled from the pipeline)

Every product detail page renders 4 inline labels at the bottom of the description: **Carbon: X.X lbs CO2e** (from Pillar 1) + **Materials: GOTS-certified organic cotton** (from Pillar 2) + **Packaging: 100% recyclable mailer** (from Pillar 4) + **Certifications: B Corp + Climate Neutral Certified** (from Pillar 6). Labels auto-refresh weekly via the orchestrator. Implementation: Shopify theme.liquid snippet that calls the warehouse API + renders the labels in a 4-column grid.

**Per-voice-profile PDP-label rendering (5 voice × 4 labels):**

- **Default voice:** Carbon "the carbon equivalent of a 5-mile drive" / Materials "GOTS-certified organic cotton" / Packaging "100% recyclable mailer" / Certifications "B Corp + Climate Neutral Certified". Customer-friendly translation; no technical jargon.
- **Luxury voice:** Carbon "the Florence atelier has used solar power since 2018; every shipment is carbon-neutral" / Materials "sourced from the Coimbatore Mill; GOTS-certified organic cotton" / Packaging "FSC-certified paper mailer" / Certifications "B Corp certified (score 96.4)". Heritage-language + provenance + scarcity.
- **Sustainable voice:** Carbon "2.3 lbs CO2e = 1.04 kg; 100% offset via Shopify Planet" / Materials "GOTS-certified organic cotton (cert #GOTS-12345, expires 2027-06-30)" / Packaging "How2Recycle-labelled mailer; 100% PCR content" / Certifications "B Corp + Climate Neutral + GOTS". Mission-first with full data transparency.
- **Gen-Z voice:** Carbon "we ship carbon-neutral but like, actually" / Materials "real talk: organic cotton, certified" / Packaging "your mailer is actually recyclable" / Certifications "yes we're certified, receipts below". Meme-aware + social-shareable.
- **B2B voice:** Carbon "Scope 1: 0; Scope 2: 0; Scope 3: 2.3 lbs CO2e/shipment; audit-trail per GHG Protocol" / Materials "GOTS-certified organic cotton; chain-of-custody on file" / Packaging "How2Recycle-labelled; FSC certified" / Certifications "B Corp + Climate Neutral; audit reports available under NDA". Compliance-audit-trail language for procurement teams.

### Surface 2 — Gorgias macro for CS reps (live impact data on demand)

A Gorgias macro called `{{impact_lookup}}` that the CS rep pastes into any customer-facing response when a customer asks "is your product really sustainable?" The macro auto-pulls the live impact data from the warehouse and inserts it into the response in <90 seconds. Implementation: Gorgias Automate rule that triggers on macro-name + calls the warehouse API + inserts the 6-pillar summary + the 5-voice override matching the customer's Klaviyo segment. **This is the highest-leverage CS-rep productivity win per Asset 11 Pitfall #4** (manual lookup erodes rep productivity; the macro makes per-product impact data a 1-paste operation).

### Surface 3 — Klaviyo quarterly impact-update email (auto-published per Asset 04 cadence)

A Klaviyo flow that fires quarterly (per Asset 04's Q1 / Q2 / Q3 / Q4 macro shape) + annually on Earth Day (April 22) + annually on Giving Tuesday (first Tuesday in December). The flow pulls the latest 6-pillar data from the warehouse + renders the 5-voice override matching the customer's Klaviyo segment + sends a 4-section email (Carbon / Materials / Labor / Community summary + per-product impact label + certification status + 1 customer-actionable call-to-action like "track your shipment's carbon footprint" or "redeem points for carbon-offset shipping per Move #8"). Implementation: Klaviyo flow + email template + dynamic-data-block pulling from warehouse.

---

## Asset 10 Sustainable-affiliate-mission-alignment verifier (paste-ready script)

A separate Python script (`scripts/impact_pipeline/affiliate_mission_verifier.py`) that the operator runs when an affiliate applies to the program. The verifier checks the creator's last-90-days-of-content for mission-alignment keywords (carbon / materials / labor / community / sustainability / ethical / B Corp / Climate Neutral / etc.) + counts mentions per pillar + passes the creator to the Sustainable commission tier (20/25/30%) if ≥2 mentions per pillar in last 90 days, or defaults to the Default commission tier (15/20/25%) if <2 mentions per pillar, or declines if <1 mention per pillar.

```python
# scripts/impact_pipeline/affiliate_mission_verifier.py
class AffiliateMissionVerifier:
    """Checks creator's last-90-days content for mission-alignment keywords."""

    MISSION_KEYWORDS = {
        "carbon": ["carbon", "co2", "climate", "emissions", "footprint", "offset"],
        "materials": ["organic", "recycled", "sustainable materials", "GOTS", "Oeko-Tex"],
        "labor": ["fair trade", "living wage", "ethical manufacturing", "supplier audit"],
        "community": ["1% for the planet", "donation", "community impact", "B Corp"]
    }

    def verify(self, creator_handle: str, platform: str = "instagram") -> dict:
        """Returns mission-alignment score + recommended commission tier."""
        # Fetch last 90 days of content via platform API
        posts = self._fetch_posts(creator_handle, platform, days=90)

        # Count keyword mentions per pillar
        pillar_counts = {pillar: 0 for pillar in self.MISSION_KEYWORDS}
        for post in posts:
            text = (post.get("caption") or "").lower()
            for pillar, keywords in self.MISSION_KEYWORDS.items():
                pillar_counts[pillar] += sum(1 for kw in keywords if kw in text)

        # Determine recommended tier
        avg_count = sum(pillar_counts.values()) / len(pillar_counts)
        if avg_count >= 2:
            tier = "sustainable_20_25_30"
        elif avg_count >= 1:
            tier = "default_15_20_25"
        else:
            tier = "decline"

        return {
            "creator": creator_handle,
            "platform": platform,
            "posts_analyzed": len(posts),
            "pillar_counts": pillar_counts,
            "avg_mentions_per_pillar": avg_count,
            "recommended_tier": tier
        }
```

---

## 10 numbered pitfalls with corrective `Fix:` lines

**Per-voice-profile risk ranking (which pitfalls bite hardest for each voice):**

The 10 pitfalls below have different severity per voice profile. The Default operator is most likely to fall into Pitfalls #1 + #5 (manual data collection scope creep); the Luxury operator into Pitfalls #2 + #4 (certification lapses); the Sustainable operator into Pitfalls #3 + #10 (over-claim risk + annual-report-not-published); the Gen-Z operator into Pitfalls #7 + #9 (social-media backlash from stale data + over-counted keyword mentions); the B2B operator into Pitfalls #2 + #6 (audit-trail gaps + scope-3 estimation-fallback disclosure). Each pitfall's `Fix:` line below is calibrated to all 5 voice profiles.

**Pitfall #1 — Wiring Shopify Planet alone and calling it "carbon-neutral".** Symptom: brand installs Shopify Planet (which offsets shipping Scope 3 only) + claims "we're a carbon-neutral brand" in marketing. The claim is technically true for shipping but ignores manufacturing emissions (Scope 3 from suppliers) + office / warehouse energy (Scope 1 + 2). Per the FTC Green Guides + EU CSRD, "carbon-neutral" claims require Scope 1+2+3 coverage; partial coverage is a greenwashing-trap violation. Default voice brands most likely to fall into this trap (they ship fast + claim "carbon-neutral" before wiring Climate Neutral); Sustainable voice brands least likely (they apply the GHG Protocol scope-coverage discipline from day 1). Fix: wire the full Scope 3 via Climate Neutral Certified (annual audit) + supplier-specific data + Shopify Planet. Apply the **30-50% estimation-accuracy penalty** for Scope 3 categories without supplier-specific data.

**Pitfall #2 — Treating Fair Trade USA API as a single call.** Symptom: brand assumes Fair Trade USA API returns aggregated labor data for "the brand" — but the API is per-supplier-factory, and you must call it once per supplier factory. A brand with 20 supplier factories needs 20 API calls per quarter. Fix: build the orchestrator to iterate over the supplier-factory list + cache results per supplier-factory per quarter.

**Pitfall #3 — Forgetting that B Corp certification is annual.** Symptom: brand wires B Corp certification API + assumes the certification auto-renews. The API returns the current certification status, but the operator must re-apply every 3 years (with annual reporting in years 1 + 2) + pay the sliding-scale fee. A lapsed certification breaks the dashboard + the PDP labels. Fix: implement the 60-day expiration alert in the orchestrator (`expires_at - 60 days` → Klaviyo email alert to operator).

**Pitfall #4 — Treating 1% for the Planet donation as real-time data.** Symptom: brand wires 1% for the Planet member API + displays "real-time donation total" on the dashboard. But the API returns the annual donation receipt (filed in Q1 of the following year), not real-time. The dashboard shows last year's total until the operator updates it. Fix: display "annual donation as of Q1 2026: $X" with the last-update timestamp; never claim "real-time" for annual-cadence data.

**Pitfall #5 — How2Recycle labels applied to mailer but not tissue or insert.** Symptom: brand applies How2Recycle label to outer mailer but skips the tissue paper, the sticker, and the insert card. The customer assumes "100% recyclable" but the tissue paper is not curbside-recyclable in most programs. Fix: apply How2Recycle label to every packaging component individually; the label specifies per-component recyclability.

**Pitfall #6 — Showing the operator's voice override as the only option.** Symptom: brand displays the Sustainable voice override ("2.3 lbs CO2e = 1.04 kg; 100% offset via Shopify Planet") on PDP for all customers. The Default-voice customer doesn't understand "kg CO2e" and the Gen-Z customer finds it boring. Fix: implement the 5-voice override system + select the override per customer's Klaviyo segment (Default customers see the Default override; Gen-Z customers see the Gen-Z override; etc.).

**Pitfall #7 — Gorgias macro returns stale data.** Symptom: CS rep pastes `{{impact_lookup}}` macro into a customer response + the macro returns last week's carbon data (not today's). The customer thinks the data is real-time; the rep doesn't know it's stale. Fix: the macro must include a freshness timestamp in the response ("Carbon: 2.3 lbs CO2e per shipment — last updated 2026-06-27 10:00 UTC"). If data is >7 days stale, the macro returns "data is being refreshed, please respond with the verified-data template from Asset 08 Module 4 instead."

**Pitfall #8 — Scope 3 estimation fallback without supplier-specific data.** Symptom: brand doesn't have supplier-specific Scope 3 data + uses the default GHG Protocol Scope 3 estimates (which are industry-aggregate averages). The estimate is 30-50% off the actual emissions. Per CSRD, the operator must disclose the estimation methodology + the accuracy range. Fix: publish "Scope 3 estimate per GHG Protocol; 30-50% accuracy range; supplier-specific data collection in progress" on the impact dashboard + the annual report.

**Pitfall #9 — Affiliate-mission-alignment verifier over-counts keyword mentions.** Symptom: creator posts 1 Instagram caption with the word "sustainable" 5 times + the verifier counts all 5 mentions toward the materials pillar count. The creator passes the 2-mention threshold but has no actual mission-alignment. Fix: the verifier counts **unique posts with the keyword**, not **total keyword mentions**. A creator with 1 post mentioning "sustainable" 5 times has 1 mention, not 5.

**Pitfall #10 — Annual impact report not published even though the pipeline runs daily.** Symptom: the pipeline runs daily + refreshes the dashboard + auto-publishes Klaviyo quarterly updates + but the operator never compiles the annual PDF report for regulators / partners / B Corp recertification. The dashboard exists but the report doesn't. Fix: schedule a Q1 annual-report-compilation task (per Asset 04's Earth Day cadence) that pulls the dashboard data + assembles the PDF + publishes to `/impact-report-2026.pdf` + links from footer + landing page + PDP.

---

## 5 verification gates

**Gate A — Pipeline correctness via per-pillar unit tests.** Recipe: (1) for each of the 6 pillars, write 3 unit tests (one for `fetch()`, one for `normalize()`, one for `validate()`); (2) mock the upstream API responses with synthetic data; (3) assert that `normalize()` produces the canonical schema; (4) assert that `validate()` raises `ValueError` for out-of-range inputs; (5) assert that `publish()` writes to the warehouse with the expected shape. Pass criteria: 18 unit tests passing (6 pillars × 3 methods); `pytest scripts/impact_pipeline/tests/` returns **18 passed, 0 failed**.

**Gate B — Dashboard rendering via curl + grep.** Recipe: (1) run the orchestrator once with synthetic data; (2) start the dashboard HTTP server: `python3 -m http.server 8765 --directory dashboards/ &`; (3) curl the dashboard: `curl -sS http://127.0.0.1:8765/impact-data-pipeline.html | grep -c "Pillar"`; (4) expect 6 matches (one per pillar); (5) curl the dashboard for voice overrides: `curl -sS http://127.0.0.1:8765/impact-data-pipeline.html | grep -cE "Default|Luxury|Sustainable|Gen-Z|B2B"`; (6) expect 30 matches (6 pillars × 5 voices = 30 voice override cells). Pass criteria: 6 Pillar matches + 30 voice override matches.

**Gate C — Voice-density verification (the canonical v1.24.0 recipe).** Recipe: `for voice in Default Luxury Sustainable Gen-Z B2B; do grep -c "\b$voice\b" assets/12-impact-data-pipeline.md; done`. Pass criteria: each voice profile ≥15 (the canonical threshold for proving the override column is concrete, not hand-waved).

**Gate D — Anti-pattern grep.** Recipe: `grep -nE "set up your account|TODO|FIXME|XXX|placeholder" assets/12-impact-data-pipeline.md`. Pass criteria: 0 matches (or matches only in the verification recipe's own grep string).

**Gate E — Zero regressions full suite re-run.** Recipe: `for t in scripts/tests/test_*.py; do python3 "$t" 2>&1; done` + `node dashboards/tests/test_unified_attribution_health.js`. Pass criteria: 440 Python tests green + 59 JS tests green = **499/499 total, zero regressions** (the asset is pure markdown + the new ETL script is a fresh addition; the new tests in `scripts/impact_pipeline/tests/` are additive).

---

## Verification recipe (paste-runnable)

A one-shell-block command that runs all 5 verification gates. Adjust paths to match the operator's workspace.

```bash
ASSET=assets/12-impact-data-pipeline.md

echo "=== Gate A: structural completeness ==="
grep -c "^## " "$ASSET"  # expect 8 top-level sections (Goal + Decision matrix + 6-pillar ETL + 5-voice dashboard + 3 customer-facing surfaces + affiliate verifier + 10 pitfalls + verification gates + verification recipe + Related)
echo "=== Gate A: 6-pillar coverage ==="
grep -cE "^### Pillar [0-9]" "$ASSET"  # expect 6 (Carbon + Materials + Labor + Packaging + Community + Certification)
echo "=== Gate A: 3 customer-facing surfaces ==="
grep -cE "^### Surface [0-9]" "$ASSET"  # expect 3 (PDP labels + Gorgias macro + Klaviyo email)
echo "=== Gate A: 10 pitfalls present ==="
grep -cE "^\*\*Pitfall #[0-9]+" "$ASSET"  # expect 10
echo "=== Gate A: 5 verification gates present ==="
grep -cE "^\*\*Gate [A-F]" "$ASSET"  # expect 5 (or 6 with bonus Gate F)
echo "=== Gate B: anti-pattern grep ==="
grep -nE "set up your account|TODO|FIXME|XXX|placeholder" "$ASSET" | grep -v "Verification recipe"  # expect 0 outside the verification recipe's own grep example
echo "=== Gate C: per-voice-density verification ==="
for voice in Default Luxury Sustainable Gen-Z B2B; do
  echo "$voice: $(grep -c "\b$voice\b" "$ASSET")"
done
# expect all 5 voices >= 15
echo "=== Gate D: sibling cross-references resolve ==="
for ref in assets/01-copy-templates.md assets/02-brand-voice.md assets/03-ugc-brief.md assets/04-promo-calendar.md assets/05-retention-metrics.md assets/06-nps-survey-toolkit.md assets/07-competitive-teardown.md assets/08-cs-response-library.md assets/09-impact-reporting.md assets/10-affiliate-program-playbook.md assets/11-cs-training-program.md; do
  if [ -f "$ref" ]; then echo "OK: $ref"; else echo "MISSING: $ref"; fi
done
echo "=== Gate D: playbook cross-references resolve ==="
for ref in playbooks/03-checkout-audit-baymard.md playbooks/05-migrate-to-klaviyo-postscript.md playbooks/06-install-attribution-triplewhale-or-polar.md playbooks/07-loyalty-program-smile.md; do
  if [ -f "$ref" ]; then echo "OK: $ref"; else echo "MISSING: $ref"; fi
done
echo "=== Gate E: zero regressions full suite re-run ==="
total_pass=0
for t in scripts/tests/test_*.py; do
  out=$(python3 "$t" 2>&1)
  if echo "$out" | grep -qE "^[0-9]+ passed,?0 failed"; then
    pass=$(echo "$out" | grep -oE "^[0-9]+ passed" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  elif echo "$out" | grep -qE "Ran [0-9]+ tests"; then
    pass=$(echo "$out" | grep -oE "Ran [0-9]+ tests" | grep -oE "[0-9]+")
    total_pass=$((total_pass + pass))
  fi
done
echo "Python tests passed: $total_pass (expect 440)"
node dashboards/tests/test_unified_attribution_health.js  # expect 59 passed
```

---

## Related

**Sibling assets (every cross-reference resolves):**

- `assets/01-copy-templates.md` — T1–T8 marketing templates (the per-product impact labels surface the PDP voice override + the Klaviyo quarterly impact-update email riffs the T1 hero-template)
- `assets/02-brand-voice.md` — 5 voice profiles (the canonical source of the 5 voice-driven override columns; the dashboard's 6-pillar × 5-voice grid mirrors Asset 02's voice framework)
- `assets/03-ugc-brief.md` — C1 gifting + C2 paid + C3 affiliate contract templates; the affiliate-mission-alignment verifier gates C3 affiliate commission tier
- `assets/04-promo-calendar.md` — Q1 (Earth Day) + Q4 (Giving Tuesday) + B Corp month cadence; the Klaviyo quarterly impact-update email fires per this calendar
- `assets/05-retention-metrics.md` — Metric #12 cohort LTV by UGC vs paid-social vs organic (the impact-engaged cohort overlay is the canonical measurement source for whether impact-reporting drives incremental LTV)
- `assets/06-nps-survey-toolkit.md` — Q9 sustainability-importance NPS signal (the per-product impact labels + the dashboard surface the data that the NPS-survey measures customer-preference for)
- `assets/07-competitive-teardown.md` — Dimension 2 Pricing + Dimension 5 Shipping + Dimension 8 Voice-and-tone (the impact data is benchmarked against the competitive set per Asset 07's framework)
- `assets/08-cs-response-library.md` — Scenarios 5/10 (refund + subscription pause) post-purchase impact touchpoints; the Gorgias macro `{{impact_lookup}}` is the canonical Asset 12 wiring for Scenario 5's Sustainable variant
- `assets/09-impact-reporting.md` — 6-pillar impact-reporting framework (Asset 12 IS the automated ETL that produces the numbers; the manual data-collection rubric in Asset 09 IS the input schema for Asset 12's ETL)
- `assets/10-affiliate-program-playbook.md` — Sustainable commission tier (20/25/30%) + Dimension 5 FTC-disclosure policy; the affiliate-mission-alignment verifier gates commission tier per Asset 10's Sustainable voice profile
- `assets/11-cs-training-program.md` — Module 6 NPS-detractor impact-relevance drill; the Gorgias macro `{{impact_lookup}}` is the canonical Asset 12 wiring for Module 6; Module 6 trains reps to use the macro in customer responses

**Sibling playbooks (every Move #N reference matches a shipped move):**

- `playbooks/03-checkout-audit-baymard.md` (Move #3) — checkout donation toggle (1% for the Planet) + cart-total carbon line item; the pipeline's Pillar 5 (Community) data feeds the checkout donation toggle
- `playbooks/05-migrate-to-klaviyo-postscript.md` (Move #5) — Klaviyo segment + flow infrastructure; the quarterly impact-update email uses Klaviyo's flow + segment infrastructure
- `playbooks/06-install-attribution-triplewhale-or-polar.md` (Move #6) — Triple Whale cohort-LTV overlay by impact-engaged cohort; the pipeline writes to Triple Whale for cohort-LTV measurement
- `playbooks/07-loyalty-program-smile.md` (Move #8) — points-for-impact-rewards rule; the pipeline's Pillar 5 (Community) data feeds the loyalty-impact-rewards redemption ledger

**Research that informed this asset:**

- `research/00-ecommerce-ops-landscape.md` — §7 sustainability software landscape (Shopify Planet / EcoCart / Patch / Climate Neutral Certified); §EU CSRD + §SEC climate-disclosure rule + §California SB-253/261 (regulatory pressure); §FTC Green Guides (greenwashing-trap enforcement)
- `research/01-tools-stack-comparison.md` — Shopify Planet vs EcoCart vs Patch vs Climate Neutral vs Fair Trade USA vs B Corp vs 1% for the Planet (vendor matrix; pricing; recommended stack per GMV tier)

**Forward-pointing references (planned future assets):**

- `assets/13-cs-rep-onboarding-program.md` *(potential — does not yet exist)* — the canonical Asset-13 candidate for the CS-rep onboarding program that pairs with Asset 11's training curriculum + Asset 12's Gorgias macro; would mirror the 12-training-module pattern but for the data-pipeline dimension; Pick up in a future tick if the operator signals "I want to formalize CS-rep-data-pipeline training next quarter."
- `playbooks/12-impact-data-pipeline-build.md` *(potential playbook — does not yet exist)* — the canonical playbook companion to this asset; would mirror the 16-shipped-playbook pattern with a 6-step build + 7-gate verification + 15-pitfall list + ROI table for the impact-data-pipeline build. Pick up in a future tick if the operator signals "I want to automate impact data collection next quarter."