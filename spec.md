# Cancer Matching Engine

Total votes: 0
Created by: Royce Sun
AI summary: NSCLC patients struggle to find relevant clinical trials due to scattered data. An AI-driven platform aims to match patients to trials in 3 minutes through a user-friendly quiz. Key data points include age, disease stage, biomarkers, prior treatments, and ECOG status. The platform features a mobile-first design, a clear user interface, and a robust tech stack for trial matching, ensuring security and compliance. Success metrics focus on match accuracy, speed, and user engagement.

## 1. Problem & Motivation

NSCLC patients face a critical information gap: hundreds of targeted therapy trials exist, but the data is scattered across unstructured registries.

- **The Gap:** Doctors lack time to search; patients lack expertise; researchers have no real-time visibility into eligible populations.
- **Why NSCLC First:** Most common lung cancer (85% of cases), well-defined biomarker trials (EGFR, ALK, KRAS), large addressable market.

---

## 2. Solution: The Clinical Intelligence Layer

A centralized, AI-driven platform that translates complex patient biomarkers into a ranked roadmap of trial eligibility. It doesn't replace the doctor; it provides the **"Navigator Map"** that makes the doctor's job possible.

### 2a. For Patients (The Navigator)

- **Need:** Empowerment and actionable options.
- **Solution Flow:** User completes a 3-minute "Match Quiz" → Receives a ranked list of 3–5 trials → Downloads a "Physician Brief" to take to their clinic.

### 2b. For Doctors/Providers (The Decision Support)

- **Need:** Speed and accuracy.
- **Solution Flow:** Receives the "Physician Brief" from the patient → Brief highlights pre-verified inclusion/exclusion matches → Doctor makes the final clinical referral in seconds.

### 2c. For Researchers (The Scout)

- **Need:** Competitive Intelligence and recruitment.
- **Solution Flow:** Researcher monitors their disease niche → Platform alerts them when a competitor opens a new site or when a cluster of 50+ eligible patients appears in a specific region.

---

## 3. Core Questions (NSCLC MVP)

**Required Data Points:**

| Variable | Question | Why It Matters |
| --- | --- | --- |
| **Age** | "How old are you?" | Universal criterion. Most trials require ≥18 years. |
| **Disease Stage** | "What stage is your NSCLC?" | Stage IV/Metastatic vs. Stage III vs. Early Stage. Most trials focus on metastatic. |
| **Biomarkers** | "Which mutations are in your pathology report?" | EGFR (exon 19 del, L858R, T790M), ALK, ROS1, KRAS G12C, MET, RET, BRAF, PD-L1 levels. |
| **Prior Treatments** | "What treatments have you tried?" | First-line, second-line, post-TKI, or treatment-refractory. |
| **ECOG Status** | "How would you describe your daily activity?" | ECOG 0-1 = most trials. ECOG ≥2 = excluded from aggressive trials. |

**Conditional Follow-ups:**

- Brain metastases status (common in NSCLC)
- Histology type (squamous vs. non-squamous)
- Smoking history
- ZIP code (for site matching)

---

## 4. User Flow

**Step 1: Basic Info**

- Age, disease stage, histology type

**Step 2: Medical History**

- Biomarkers (NSCLC-specific: EGFR subtypes, ALK, ROS1, KRAS, PD-L1)
- Prior treatments (checkboxes: chemo, immunotherapy, TKI, radiation)
- ECOG status (illustrated icons with plain language)

**Step 3: Follow-ups**

- Brain mets, smoking history, ZIP code

**Step 4: Results**

- Ranked list of 3-5 trials
- Download "Physician Brief" PDF

---

## 5. UI/UX Principles

**Design Philosophy:** "3-second clarity test" — every screen is instantly understandable.

**Landing Page:**

- Headline: "Find NSCLC Clinical Trials You Qualify For"
- Subheadline: "Get a personalized list of lung cancer trials in 3 minutes—no medical degree required."
- Trust signals: "We never store your medical data" + "Matches verified against [X] active trials"

**Quiz Interface:**

- One question at a time, full-screen
- Progress bar at top
- Visual icons for all options (not just text)
- ECOG shown as illustrated figures (running = fully active, walking = some limitations, sitting = need help)
- Biomarkers organized by category: Driver Mutations (EGFR, ALK, ROS1, KRAS) + PD-L1 Expression levels

**Results Page:**

- Big bold number: "We found 5 trials you may be eligible for"
- Trial cards show: Name, sponsor, match criteria (✓), nearby sites with distance, match confidence (●●●●○)
- Primary CTA: "Download Your Physician Brief"

**Physician Brief (PDF):**

- One-page, professional layout
- Patient summary (de-identified)
- Top 3 matched trials with NCT numbers, match criteria, site contacts
- QR code linking back to results

**Mobile-First:**

- 70%+ of users on mobile
- 44px minimum touch targets
- Vertical scrolling only
- <2 second load on 3G

---

## 6. Tech Stack

**Frontend:**

- Next.js + Shadcn/UI
- react-pdf for PDF generation
- Multi-step form with temporary state (no persistence)

**Backend:**

- [ClinicalTrials.gov](http://ClinicalTrials.gov) API (daily sync)
- Filter: NSCLC-only trials at ingestion
- Structured filters first (age, stage, histology)
- Optional vector embeddings for semantic matching

**Matching Algorithm:**

```
1. Hard filters: age, stage, histology
2. For each NSCLC trial:
   - Check biomarkers (exact match or "not specified")
   - Check prior treatments
   - Check ECOG status
   - Calculate distance to sites
3. Score: Biomarker +50, Treatment line +30, ECOG +20, <25mi +15, <50mi +10, Active +10
4. Return top 5, sorted by score
5. LLM generates plain-language match explanations
```

**Security:**

- No-persistence model (in-memory only, deleted after session)
- Secure session tokens (1 hour expiry)
- Vanta/Drata for SOC2/HIPAA readiness
- Clear disclaimers: not medical advice