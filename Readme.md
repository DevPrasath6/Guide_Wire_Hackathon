# Earnings Shield: AI‑Powered Parametric Income Protection for India’s Gig Economy
**Guidewire DEVTrails 2026 – University Hackathon**

---

## 📚 Quick Navigation

- [Project Vision](#-project-vision)
- [Target Persona](#-target-persona)
- [Core Problem Statement](#-core-problem-statement)
- [Golden Rules (Constraints)](#-the-golden-rules-constraints)
- [Key Innovations & Novelty](#-key-innovations--novelty)
- [Market Crash Scenario Defense](#-market-crash-scenario-adversarial-defense--anti-spoofing)
- [Core Disruptions & Parametric Triggers](#-core-disruptions--parametric-triggers)
- [Solution Architecture](#-solution-architecture)
- [AI-ML Models & Components](#-ai-ml-models--components)
- [Analytics Dashboard](#-analytics-dashboard)
- [Tech Stack Summary](#-tech-stack-summary)
- [6-Week Project Roadmap](#-6-week-project-roadmap-devtrails-2026)
- [Requirement Mapping](#-how-this-meets-the-must-have-features)

---

## 🚀 Project Vision

India’s gig‑economy delivery partners (Zomato, Swiggy, Zepto, Blinkit, etc.) are the backbone of the on‑demand ecosystem, but they have no financial safety net when external disruptions hit. Extreme weather, pollution spikes, and sudden curfews can wipe out 20–30% of their monthly earnings in a matter of days.

**Earnings Shield** is an AI‑enabled parametric insurance platform that safeguards India’s gig workers against **loss of income** caused by uncontrollable external events. The system uses predictive risk modeling, real‑time triggers, and zero‑touch payouts to mimic how a real‑world gig‑income insurer would behave, while strictly adhering to the hackathon’s constraints.

---

## 🎯 Target Persona

### **Persona:** Q‑commerce / Quick‑Commerce Delivery Partners
*(e.g., Zepto, Blinkit, Swiggy Instamart riders)*

- Operate in tight 2–3 km dark‑store zones.
- Work under strict 10–15 minute SLAs.
- Highly vulnerable to localized disruptions (waterlogging, sudden traffic jams, curfews, platform shutdowns).
- No protection today when storms, pollution alerts, or local shutdowns force them offline.

We chose **Q‑commerce** because:
- Disruptions are **hyper‑local** and **instantly visible** in platform logs.
- Lost income is easy to quantify (orders per hour, hourly wage).
- This makes parametric triggers and AI‑based risk profiling very clean and demo‑friendly.

---

## 🌩️ Core Problem Statement

India’s gig‑economy delivery partners bear 100% of the financial risk when external disruptions occur:
- Extreme heat, heavy rain, floods, or pollution spikes.
- Local strikes, curfews, or sudden market/zone closures.
- Platform outages or app‑level shutdowns in a specific area.

During these events, riders:
- Cannot work outdoors.
- Cannot access pickup/drop locations.
- Lose 20–30% of their monthly earnings with no safety net.

**Earnings Shield** turns this from a raw risk into a **managed, AI‑driven, parametric insurance product**.

---

## 🎯 The Golden Rules (Constraints)

Earnings Shield strictly complies with the hackathon’s non‑negotiables:

1. **Persona Focus**
   - Only **delivery partners** (here: **Q‑commerce riders**).
2. **Coverage Scope**
   - Covers **Loss of Income only**.
   - No coverage for health, life, accidents, or vehicle repairs.
3. **Weekly Pricing Model**
   - Premiums are structured on a **weekly basis**, aligned with gig‑worker payout cycles.
   - No hourly or long‑term insurance models.

---

## 🚀 Key Innovations & Novelty

Earnings Shield goes beyond standard parametric insurance by introducing the following innovations:

### 1. Hyper-Local Risk Modeling (2–3 km Zones)

Unlike traditional insurance models that operate at city or regional levels, our system calculates risk at micro-zone (dark-store radius) level, enabling highly precise premium pricing and disruption detection.

### 2. Income-Aware Parametric Triggers

Instead of relying only on environmental triggers (like rain or heat), Earnings Shield combines:

- External events (weather, AQI, curfew)
- Platform-level signals (order volume drop)

This ensures claims are triggered based on actual income loss, not just environmental conditions.

### 3. Fully Autonomous (Zero-Touch) Insurance Engine

Our system does not require manual claim filing. It:

- Detects disruptions in real time
- Verifies worker activity and income drop
- Automatically initiates and approves claims

This creates a self-operating insurance system.

### 4. AI-Driven Personalized Weekly Micro-Pricing

Premiums are dynamically calculated every week based on:

- Zone risk
- Worker schedule
- Historical disruption patterns

This enables personalized micro-insurance, instead of one-size-fits-all pricing.

### 5. Graph-Based Fraud Ring Detection

Beyond standard anomaly detection, the system uses graph-based models to:

- Identify collusion between multiple riders
- Detect coordinated fraudulent behavior at zone level

This brings insurance-grade fraud intelligence into gig economy protection.

### 6. Income Protection (Not Asset Protection)

Unlike traditional insurance products that cover physical damage or health, Earnings Shield focuses purely on:

- Protecting earning capacity (lost working hours)

This represents a shift toward future-of-work insurance models.

---

## 🔐 Market Crash Scenario: Adversarial Defense & Anti-Spoofing

To address the Guidewire challenge around a **Market Crash Scenario**, Earnings Shield adds a system-level defense that does more than detect bad claims. It actively reduces fraud profitability during coordinated attacks and protects platform liquidity in real time.

### 🧠 Core Pivot: Proof of Work, Not Proof of Location

Instead of only asking whether GPS points match a place, we verify whether a rider can demonstrate **real-world work patterns** that are hard to fake at scale.

This shifts fraud control from:
- Passive validation

to:
- Active verification under stress conditions.

### 🎯 Reality Anchors (Hard-to-Fake Signals)

#### 1) Motion + Effort Signature

Real riders produce noisy operational traces:
- Micro-stops from traffic signals and pickup delays.
- Irregular speed transitions.
- Device vibration signatures from road texture.

Spoof traces are usually too clean:
- Unrealistically smooth paths.
- Low variance movement curves.
- Missing vibration/noise profile.

#### 2) Environmental Fingerprinting

We score context consistency using lightweight ambient signals:
- Network jitter and handoff patterns.
- Light variation and indoor/outdoor transitions.
- Ambient acoustic signatures (traffic/rain intensity bands).

Example:
- A real heavy-rain window tends to show slower mobility plus network instability.
- A home-based spoof setup often shows stable Wi-Fi and weak environmental variance.

#### 3) Platform-Driven Liveness Checks

The system injects rare, low-friction liveness prompts:
- Pickup-zone confirmation ping.
- Route consistency micro-challenge.

Legitimate riders pass naturally in context; scripted spoof behavior shows timing and interaction inconsistencies.

### 🧬 Behavioral DNA Layer

Each rider gets a longitudinal behavioral profile:
- Typical working windows.
- Route and stop style.
- Order handling cadence.
- Zone familiarity and adaptation patterns.

Fraud risk rises when we observe abrupt and unexplained "personality shifts" in this profile.

### 🔍 Non-Obvious Fraud Features

- Speed entropy.
- Stop-frequency distribution.
- Order-to-movement correlation.
- Battery-drain realism versus idle-spoof signatures.
- Touch interaction cadence (human app usage vs passive emulator patterns).

### 🕸️ Swarm Detection Before Individual Detection

Fraud is often coordinated. We therefore monitor group anomalies first:
- Sudden synchronized claims across many riders.
- Similar movement signatures without matching environment stress.
- Cross-zone timing patterns that do not match weather or platform outages.

Even if a single rider appears normal, the **swarm pattern** exposes coordination.

### 💡 Confidence-Based Payout Splitting

To protect honest workers while reducing fraud extraction:

- High confidence: 100% instant payout.
- Medium confidence: 60% instant + 40% delayed.
- Low confidence: small advance + investigation flow.

This preserves rider trust and simultaneously limits immediate fraud liquidity drain.

### 💰 Fraud-Resistant Liquidity Design (Circuit Breaker)

When the system detects a potential market-crash-like fraud wave:
- Temporarily reduce instant payout ratio.
- Raise verification thresholds.
- Slow high-risk batch disbursements.

This acts as an insurance liquidity circuit breaker, buying verification time while keeping partial support active for genuine users.

### One-Liner for Pitch

> We do not try to catch fake locations. We make fake work economically useless.

---

## 🧠 Core Disruptions & Parametric Triggers

For our Q‑commerce persona, we define the following **external disruption parameters** (must use own ideation):

| Trigger Type            | Example Event                                 | Impact on Income                                                                 |
|-------------------------|-----------------------------------------------|-----------------------------------------------------------------------------------|
| Environmental – Rain    | Heavy rain / waterlogging (>x mm/hr)          | Riders cannot operate bikes; dark stores pause orders in that zone.              |
| Environmental – Heat    | Extreme heat (>45°C)                          | Riders taken offline during peak hours due to health advisories.                 |
| Environmental – Pollution | Severe air‑quality alerts (e.g., AQI > 400) | Riders asked to avoid working; platform restricts zones.                         |
| Social – Curfew/Strike  | Local strike, protest, or curfew              | No access to pickup/drop locations; SLAs cannot be met.                         |
| Social – Platform/Zone  | App shutdown, dark‑store closure              | Zero orders in that radius for a fixed duration.                               |

**Important:**
- Triggers are **parametric** (data‑based), not based on claims filed by riders.
- We **insure lost income**, not vehicle damage or bodily injury.

---

## 🧩 Solution Architecture

Earnings Shield is an AI‑enabled, mobile‑first platform that:

1. **Onboards** Q‑commerce riders quickly.
2. **Creates weekly policies** with dynamic AI‑based premiums.
3. **Monitors** real‑time triggers (weather, traffic, platform status).
4. **Automatically initiates claims** when a disruption hits.
5. **Instantly pays** an estimated lost‑income amount.
6. **Detects fraud** using AI‑powered behavior analysis.

### High‑Level Flow

1. **Worker Onboarding**
   - Rider logs in via mobile app (or mock web UI).
   - Connects with their gig‑platform ID (mock API).
   - Selects Q‑commerce zone and working hours.

2. **Weekly Policy Creation**
   - System calculates **Dynamic Weekly Premium** using AI.
   - Rider confirms purchase; premium auto‑deducted from linked wallet.

3. **Risk Monitoring**
   - Weather API, traffic API, and platform API are polled continuously.
   - When a disruption crosses thresholds, an **automated event** is raised.

4. **Zero‑Touch Claim Initiation**
   - System checks if:
     - Rider is active in that zone.
     - Orders have dropped below a threshold.
   - If yes → **automatic claim initiation**.

5. **Instant Payout**
   - Estimated lost income = `hours impacted × hourly wage`.
   - Payout is credited to rider’s wallet (mock payment gateway).

6. **Fraud Detection & Analytics**
   - AI models flag suspicious patterns (GPS spoofing, fake inactivity).
   - Dashboards show coverage, claims, and risk‑metrics for both riders and insurers.

---

## 🧠 AI‑ ML Models & Components

### 1. **AI‑Powered Risk Assessment (Dynamic Weekly Premium)**

**Goal:**
Calculate a **personalized weekly premium** for each rider based on:
- Operating zone (flood‑prone, traffic‑dense, etc.).
- Historical disruption data (rain, heat, AQI).
- Typical working hours and days.

**Model:**
- Use **XGBoost or LightGBM** for tabular risk‑scoring.
- Inputs:
  - Historical weather data per zone.
  - Past income loss during similar events.
  - Rider attributes (zone, hours, SLA type).
- Output:
  - A **risk score** → mapped to weekly premium (e.g., ₹18 vs ₹35/week).

**Why this wins:**
- True **predictive risk modeling** for the persona.
- Matches the “dynamic premium calculation” requirement.

---

### 2. **Intelligent Fraud Detection**

**Goal:**
Catch delivery‑specific fraud such as:
- GPS spoofing (sudden jumps).
- Fake inactivity or collusion to fake disruption claims.

**Components:**

#### a) **Anomaly Detection in Location & Activity**

- **Model:** **Isolation Forest** for outlier detection.
- Detects:
  - GPS jumps of 10+ km in 2 minutes.
  - Suspicious inactivity patterns during “claimed” disruptions.

#### b) **Behavior Graph / Fraud‑Ring Detection**

- **Model:** **Graph Neural Networks (GNNs)** or **NetworkX‑based graphs**.
- Builds a network of riders in the same zone.
- Flags:
  - Large clusters going “offline” at the same time when weather is normal.
  - Collusive patterns across multiple riders.

**Impact:**
- Meets the “intellectual fraud detection” requirement.
- Combines anomaly detection, location validation, and duplicate‑claim prevention.

---

### 3. **Parametric Automation (Zero‑Touch Claims)**

**Goal:**
- No manual claim filing.
- Automatic claim initiation and payout based on triggers.

**Process:**

1. **Real‑Time Trigger Monitoring**
   - Poll external APIs:
     - Weather API (OpenWeatherMap / AccuWeather).
     - Traffic API (Mapbox).
     - Platform API (mock Zomato/Blinkit‑style data).

2. **Trigger Conditions**
   - Rain threshold crossed in a specific zone.
   - AQI > 400 in a city block.
   - Local curfew or strike announced.
   - Platform API shows zero orders in that zone for ≥ x minutes.

3. **Automatic Claim Initiation**
   - If rider is active in that zone and logged‑in, but orders drop sharply → trigger claim.

4. **Instant Payout**
   - Use a **mock payment gateway** (Razorpay test mode, Stripe sandbox, or UPI simulator) to credit the estimated loss.

---

## 📊 Analytics Dashboard

Two dashboards are planned:

### 1. **Worker Dashboard**

- Active weekly coverage.
- Earnings protected vs. actual loss in recent disruptions.
- Historical disruption patterns in their zone.
- Weekly premium breakdown.

### 2. **Insurer / Admin Dashboard**

- Loss ratios by zone and disruption type.
- Predictive risk heatmaps for next week’s weather.
- Fraud‑detection alerts and flagged claims.

This directly satisfies the **“Analytics dashboard showing relevant metrics”** requirement.

---

## 📱 Worker App & User Experience (Demo Scope)

To make the solution execution‑ready for hackathon demos, this section defines the **worker-facing app journey** in concrete UI terms.

### 1) Worker Onboarding Flow (Login → Profile → Zone → Work Hours)

The onboarding experience is designed to complete in **under 2 minutes** for first‑time users.

#### Screen Sequence

1. **Login / OTP Verification**
   - Mobile number entry.
   - OTP verify (mock allowed for demo).
   - Consent checkbox for policy terms + data usage.

2. **Profile Setup**
   - Full name.
   - Platform type (Zepto/Blinkit/Swiggy Instamart style).
   - Platform worker ID (or mock ID).
   - Preferred payout method (UPI ID / wallet).

3. **Zone Selection**
   - City → micro‑zone selection (dark store radius).
   - “High risk / Medium risk / Low risk” visual tag from AI risk score.
   - Suggested weekly premium preview for selected zone.

4. **Work Hours Setup**
   - Usual shift windows (e.g., 8AM–1PM, 6PM–11PM).
   - Working days per week.
   - Estimated hourly earning input (or fetched from mock platform API).

5. **Onboarding Confirmation**
   - Summary card: profile, zone, hours, estimated premium range.
   - CTA: **“Activate Weekly Protection”**.

#### Onboarding Output Data

At completion, the app must store:
- Worker identity + platform ID.
- Zone and shift profile.
- Baseline income assumptions.
- Risk score inputs for premium generation.

---

### 2) Policy Screens (Weekly Premium, Active Coverage, Renewal Status)

Policy UX should be simple enough for a rider to understand in a 10–15 second glance.

#### A. Policy Purchase Screen

Must show:
- Suggested **weekly premium** (AI generated).
- Coverage amount cap (weekly protected income limit).
- Trigger types covered in current zone (rain, heat, AQI, curfew, platform-down).
- Effective period (`start date → end date`).
- CTA: **“Buy Weekly Plan”**.

#### B. Active Policy Screen

Must show:
- Current policy status: `Active / Expiring Soon / Inactive`.
- Days left in weekly cycle.
- Total earnings protected this week.
- Trigger monitor badge: `Live Monitoring Enabled`.

#### C. Renewal Screen

Must show:
- Renewal due date.
- New premium suggestion for next week (based on updated risk).
- Change summary (`premium ↑/↓` + reason such as weather forecast risk).
- CTA: **“Renew Now”**.

---

### 3) Claim Screens (Auto‑Claim Status, Payout Status, Claim History)

Claims are designed as **zero‑touch first**, with full transparency to the worker.

#### A. Auto‑Claim Status Screen

When trigger event occurs, worker sees:
- Event detected (e.g., heavy rain threshold crossed in Zone A).
- Claim state timeline:
  - `Trigger Detected`
  - `Eligibility Check`
  - `Claim Approved / Rejected`
- Reason log (short text, rider friendly).

#### B. Payout Status Screen

Must show:
- Estimated income loss formula result (`impacted hours × hourly baseline`).
- Approved payout amount.
- Transfer status: `Processing / Sent / Settled`.
- Payout reference ID.

#### C. Claim History Screen

Must show a filterable list by:
- Week.
- Trigger type.
- Status.

Each claim record includes:
- Date/time.
- Trigger event type.
- Claimed amount.
- Paid amount.
- Final status.

---

### 4) Mobile‑First UX Standards for Delivery Partners

Since riders operate in high-motion, low-attention environments, UX must prioritize speed and readability.

#### Usability Rules

- **One‑hand friendly UI:** large tap targets, bottom‑anchored CTAs.
- **Low text density:** key metrics in cards, not long paragraphs.
- **High visibility states:** clear status chips (`Active`, `Claim Processing`, `Paid`).
- **Fast load-first experience:** policy summary and claim status visible within first fold.
- **Low network resilience:** graceful retry states for API fetch failures.
- **Language-ready architecture:** labels structured to support future multilingual rollout.

#### Accessibility & Clarity

- Strong contrast for outdoor daylight readability.
- Icons + text pairing for all critical states.
- Avoid deep navigation; keep core journey within 3 primary tabs:
  - `Home`
  - `Policy`
  - `Claims`

---

### 5) Demo Walkthrough Script (Worker Journey)

Use this flow for a clean, judge-friendly narrative during the product demo.

1. **Onboard Worker**
   - Login with mobile + OTP.
   - Complete profile, zone, and work hour setup.

2. **Generate & Purchase Weekly Policy**
   - Show AI-generated premium for selected zone.
   - Tap “Buy Weekly Plan”.
   - Display active coverage card.

3. **Simulate Disruption Trigger**
   - Inject mock heavy-rain event for that zone.
   - Show auto-claim status progressing in timeline.

4. **Show Instant Payout Progress**
   - Claim approved.
   - Payout status moves from `Processing` to `Settled`.

5. **Show Claim History & Renewal Prompt**
   - Demonstrate historical claim entry.
   - Show weekly renewal recommendation.

---

### 6) Worker App Deliverables Checklist

This is the implementation checklist mapped to your requested outputs.

- ✅ **Onboarding UI complete**
  - Login, profile setup, zone selection, work-hour setup, confirmation.

- ✅ **Policy purchase and view screens**
  - Weekly premium display, buy flow, active policy card, renewal status.

- ✅ **Claim tracking screen**
  - Auto-claim timeline, payout status, claim history list.

- ✅ **Demo-ready worker flow**
  - End-to-end walkthrough from onboarding to payout and renewal.

---

## 🗄️ Backend APIs & Database Architecture

The backend of **Earnings Shield** is designed as a scalable, modular, and API-first system that powers policy management, real-time trigger monitoring, automated claims, and fraud detection.

It acts as the **core intelligence layer** connecting frontend apps, AI/ML models, and external data sources.

---

### 🧩 1. Database Schema Design

The system uses **PostgreSQL** as the primary relational database to ensure consistency, reliability, and structured querying.

#### Key Entities

**1. Users Table**

* `id` (UUID)
* `name`
* `mobile_number`
* `platform_type` (Zepto / Blinkit / etc.)
* `platform_worker_id`
* `zone_id`
* `hourly_wage`
* `work_schedule` (JSON)
* `created_at`

---

**2. Zones Table**

* `id`
* `city`
* `zone_name`
* `risk_level` (Low / Medium / High)
* `geo_coordinates`

---

**3. Policies Table**

* `id`
* `user_id`
* `weekly_premium`
* `coverage_limit`
* `start_date`
* `end_date`
* `status` (Active / Expired / Cancelled)
* `risk_score`
* `created_at`

---

**4. Triggers Table**

* `id`
* `trigger_type` (Rain / Heat / AQI / Curfew / Platform Down)
* `zone_id`
* `threshold_value`
* `current_value`
* `trigger_status` (Active / Inactive)
* `timestamp`

---

**5. Claims Table**

* `id`
* `user_id`
* `policy_id`
* `trigger_id`
* `hours_impacted`
* `estimated_loss`
* `approved_amount`
* `status` (Pending / Approved / Rejected)
* `created_at`

---

**6. Payouts Table**

* `id`
* `claim_id`
* `amount`
* `status` (Processing / Completed / Failed)
* `transaction_reference`
* `processed_at`

---

**7. Fraud Flags Table**

* `id`
* `user_id`
* `claim_id`
* `fraud_type` (GPS Spoof / Behavior Anomaly / Collusion)
* `confidence_score`
* `status` (Flagged / Reviewed / Cleared)
* `created_at`

---

### ⚙️ 2. Core Backend APIs

The backend is built using **FastAPI**, ensuring high performance and easy integration with AI models.

---

#### 🔐 Authentication & User APIs

* `POST /auth/login`

  * Mobile + OTP authentication (mock supported)

* `POST /users/create-profile`

  * Create user profile after onboarding

* `GET /users/{id}`

  * Fetch user details and profile

---

#### 📅 Policy Management APIs

* `POST /policies/create`

  * Generate weekly policy using AI risk score

* `GET /policies/{user_id}`

  * Retrieve active and past policies

* `POST /policies/renew`

  * Renew policy with updated premium

---

#### 🌩️ Trigger Monitoring APIs

* `GET /triggers/active`

  * Fetch all active disruption triggers in zones

* `POST /triggers/update`

  * Update trigger values from external APIs (weather, AQI, etc.)

---

#### ⚡ Claim Pipeline APIs (Zero-Touch)

* `POST /claims/auto-initiate`

  * Automatically create claim when trigger conditions are met

* `GET /claims/{user_id}`

  * Fetch all claims for a user

* `GET /claims/status/{claim_id}`

  * Track claim processing status

---

#### 💰 Payout APIs

* `POST /payouts/process`

  * Simulate instant payout via mock payment gateway

* `GET /payouts/{claim_id}`

  * Get payout details and transaction status

---

#### 🧠 Fraud Detection APIs

* `POST /fraud/analyze`

  * Run anomaly detection on claim activity

* `GET /fraud/flags`

  * Fetch flagged suspicious claims

---

### 🔗 3. External Data Integration Layer

To support parametric triggers, the backend integrates with multiple external (or mocked) data sources:

* **Weather APIs**

  * Rainfall intensity, temperature, AQI levels

* **Traffic APIs**

  * Congestion levels, road closures

* **Platform APIs (Mock)**

  * Order volume per zone
  * Rider activity status

All data pipelines are:

* Cached using **Redis**
* Processed at regular intervals
* Mapped to trigger thresholds

---

### 🔄 4. Claim Processing Engine (Core Logic)

The backend includes an automated **event-driven claim engine**:

1. Trigger crosses threshold (e.g., heavy rain detected)
2. System checks:

   * Active users in affected zone
   * Drop in order volume
3. Eligible users identified
4. Claim auto-created
5. Fraud analysis executed
6. Approved claims sent to payout service

---

### 📄 5. API Documentation & Sample Payloads

All APIs are documented using:

* **Swagger UI (FastAPI built-in)**
* Example request/response payloads

#### Example: Policy Creation Request

```json
{
  "user_id": "123",
  "zone_id": "Z45",
  "weekly_hours": 40,
  "hourly_wage": 120
}
```

#### Example: Claim Response

```json
{
  "claim_id": "C789",
  "status": "Approved",
  "estimated_loss": 480,
  "payout_amount": 450
}
```

---

### 🚀 Backend Deliverables

* ✅ Fully functional **FastAPI backend**
* ✅ Structured **PostgreSQL schema + migrations**
* ✅ End-to-end **policy & claims engine**
* ✅ Integrated **trigger monitoring system**
* ✅ Mock-ready **payment and external APIs**
* ✅ Scalable architecture ready for frontend & AI modules

---

## 🛠️ Tech Stack Summary

### Frontend
- **Primary:** **React Native** (mobile‑first for gig‑workers).
- **Admin:** **React.js** web dashboard.

### Backend
- **Language:** **Python** (FastAPI) for clean API layer and ML integration.
- **Database:** **PostgreSQL** (users, policies, claims) + **Redis** (real‑time caching).

### AI / ML
- **Risk & Pricing:**
  - `scikit‑learn`, **XGBoost**, **LightGBM**.
- **Fraud Detection:**
  - **Isolation Forest** (anomaly detection).
  - **NetworkX** / **PyTorch Geometric** (Graph ML).

### APIs & Integrations
- **Weather API:** OpenWeatherMap / AccuWeather (free tier / mocks).
- **Traffic / Location:** Mapbox / Google Maps.
- **Platform API:** Mock JSON endpoints simulating Zomato/Blinkit‑style data.
- **Payments:** Razorpay test mode / Stripe sandbox / UPI simulator for instant‑payout demo.

### Other Tools
- **Git** + **GitHub** for version control and Phase‑1 Readme.
- **Python virtual env** / **Docker** for reproducible setup (optional but recommended).

---

## 🗺️ 6‑Week Project Roadmap (DEVTrails 2026)

### **Phase 1: Ideation & Foundation (March 4 – March 20)**
**Theme:** “Ideate & Know Your Delivery Worker”

**Deliverables:**
- GitHub repo with this `README.md` as the **Idea Document**.
- 2‑minute video link (public) outlining strategy, persona, and prototype scope.

**Key Tasks:**
- Lock target persona: **Q‑commerce delivery partners**.
- Define 3–5 **parametric triggers** (rain, heat, pollution, curfew, platform‑down).
- Finalize **weekly premium model** and AI‑stack.
- Sketch **user flows** for registration, policy‑management, and zero‑touch claims.
- Start basic mock API design (weather, traffic, platform).

---

### **Phase 2: Automation & Protection (March 21 – April 4)**
**Theme:** “Protect Your Worker”

**Deliverables:**
- Executable source code (backend + frontend starter).
- 2‑minute demo video of core flows.

**Key Tasks:**
- Build **registration and onboarding UI**.
- Implement **weekly policy management** (create, view, renew).
- Train **XGBoost model** for dynamic weekly pricing based on mock data.
- Connect **weather and traffic APIs** (or mocks) to build 3–5 automated triggers.
- Implement **zero‑touch claim initiation** logic (no manual claim filing).
- Set up **mock payment gateway** to simulate instant payouts.

---

### **Phase 3: Scale & Optimise (April 5 – April 17)**
**Theme:** “Perfect for Your Worker”

**Deliverables:**
- Advanced fraud‑detection implementation.
- Instant payout simulation integrated.
- Intelligent analytics dashboards.
- 5‑minute demo video and final pitch deck (PDF).

**Key Tasks:**
- Implement **Isolation Forest** and **Graph ML** for fraud detection.
- Fine‑tune fraud rules to catch GPS spoofing, fake inactivity, and collusion.
- Polish **worker dashboard** (active coverage, protected earnings).
- Build **insurer dashboard** (loss ratios, risk heatmaps, predictive analytics).
- Record a **5‑minute screen‑capture demo** showing:
  - Fake rainstorm → disruption trigger → automatic claim → instant payout.
- Prepare a **pitch deck** explaining persona, AI‑architecture, and business viability of the weekly model.

---

## ✅ How This Meets the Must‑Have Features

| Requirement                          | How Earnings Shield Addresses It                                                                 |
|--------------------------------------|---------------------------------------------------------------------------------------------------|
| **Optimized onboarding**            | Mobile‑first app with quick onboarding for Q‑commerce riders, linked to their platform ID.      |
| **Risk profiling using AI/ML**      | XGBoost/LightGBM model for zone‑based risk and dynamic weekly premiums.                         |
| **Weekly pricing model**            | Strictly weekly micro‑premium; no hourly or long‑term plans.                                     |
| **Parametric triggers**             | Weather, traffic, and platform‑API events automatically trigger loss‑of‑income checks.          |
| **Zero‑touch claim initiation**     | System auto‑detects disruptions and initiates claims without rider input.                        |
| **Instant payout processing**       | Mock payment gateway (Razorpay / Stripe / UPI) simulates instant wage recovery.                 |
| **Fraud detection**                 | Isolation Forest + Graph ML for GPS spoofing, fake inactivity, collusion.                      |
| **Analytics dashboard**             | Worker and insurer dashboards showing coverage, protected earnings, and risk metrics.          |

---


**Built for the Guidewire DEVTrails 2026 – AI‑Powered Insurance for India’s Gig Economy**
🚀 Let’s build a safety net for the invisible backbone of India’s on‑demand economy.
