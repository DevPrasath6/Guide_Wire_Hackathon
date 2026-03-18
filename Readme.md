# Earnings Shield: AI‑Powered Parametric Income Protection for India’s Gig Economy

**Guidewire DEVTrails 2026 – University Hackathon**

---

## 🚀 Project Vision

India’s gig‑economy delivery partners (Zomato, Swiggy, Zepto, Blinkit, etc.) are the backbone of the on‑demand ecosystem, but they have no financial safety net when external disruptions hit. Extreme weather, pollution spikes, and sudden curfews can wipe out 20–30% of their monthly earnings in a matter of days.

**Earnings Shield** is an AI‑enabled parametric insurance platform that safeguards India’s gig workers against **loss of income** caused by uncontrollable external events. The system uses predictive risk modeling, real‑time triggers, and zero‑touch payouts to mimic how a real‑world gig‑income insurer would behave, while strictly adhering to the hackathon’s constraints.

---

## 🎯 Target Persona

### **Persona:** Q‑commerce / Quick‑Commerce Delivery Partners

_(e.g., Zepto, Blinkit, Swiggy Instamart riders)_

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

## 🧠 Core Disruptions & Parametric Triggers

For our Q‑commerce persona, we define the following **external disruption parameters** (must use own ideation):

| Trigger Type              | Example Event                               | Impact on Income                                                    |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Environmental – Rain      | Heavy rain / waterlogging (>x mm/hr)        | Riders cannot operate bikes; dark stores pause orders in that zone. |
| Environmental – Heat      | Extreme heat (>45°C)                        | Riders taken offline during peak hours due to health advisories.    |
| Environmental – Pollution | Severe air‑quality alerts (e.g., AQI > 400) | Riders asked to avoid working; platform restricts zones.            |
| Social – Curfew/Strike    | Local strike, protest, or curfew            | No access to pickup/drop locations; SLAs cannot be met.             |
| Social – Platform/Zone    | App shutdown, dark‑store closure            | Zero orders in that radius for a fixed duration.                    |

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

- `id` (UUID)
- `name`
- `mobile_number`
- `platform_type` (Zepto / Blinkit / etc.)
- `platform_worker_id`
- `zone_id`
- `hourly_wage`
- `work_schedule` (JSON)
- `created_at`

---

**2. Zones Table**

- `id`
- `city`
- `zone_name`
- `risk_level` (Low / Medium / High)
- `geo_coordinates`

---

**3. Policies Table**

- `id`
- `user_id`
- `weekly_premium`
- `coverage_limit`
- `start_date`
- `end_date`
- `status` (Active / Expired / Cancelled)
- `risk_score`
- `created_at`

---

**4. Triggers Table**

- `id`
- `trigger_type` (Rain / Heat / AQI / Curfew / Platform Down)
- `zone_id`
- `threshold_value`
- `current_value`
- `trigger_status` (Active / Inactive)
- `timestamp`

---

**5. Claims Table**

- `id`
- `user_id`
- `policy_id`
- `trigger_id`
- `hours_impacted`
- `estimated_loss`
- `approved_amount`
- `status` (Pending / Approved / Rejected)
- `created_at`

---

**6. Payouts Table**

- `id`
- `claim_id`
- `amount`
- `status` (Processing / Completed / Failed)
- `transaction_reference`
- `processed_at`

---

**7. Fraud Flags Table**

- `id`
- `user_id`
- `claim_id`
- `fraud_type` (GPS Spoof / Behavior Anomaly / Collusion)
- `confidence_score`
- `status` (Flagged / Reviewed / Cleared)
- `created_at`

---

### ⚙️ 2. Core Backend APIs

The backend is built using **FastAPI**, ensuring high performance and easy integration with AI models.

---

#### 🔐 Authentication & User APIs

- `POST /auth/login`
  - Mobile + OTP authentication (mock supported)

- `POST /users/create-profile`
  - Create user profile after onboarding

- `GET /users/{id}`
  - Fetch user details and profile

---

#### 📅 Policy Management APIs

- `POST /policies/create`
  - Generate weekly policy using AI risk score

- `GET /policies/{user_id}`
  - Retrieve active and past policies

- `POST /policies/renew`
  - Renew policy with updated premium

---

#### 🌩️ Trigger Monitoring APIs

- `GET /triggers/active`
  - Fetch all active disruption triggers in zones

- `POST /triggers/update`
  - Update trigger values from external APIs (weather, AQI, etc.)

---

#### ⚡ Claim Pipeline APIs (Zero-Touch)

- `POST /claims/auto-initiate`
  - Automatically create claim when trigger conditions are met

- `GET /claims/{user_id}`
  - Fetch all claims for a user

- `GET /claims/status/{claim_id}`
  - Track claim processing status

---

#### 💰 Payout APIs

- `POST /payouts/process`
  - Simulate instant payout via mock payment gateway

- `GET /payouts/{claim_id}`
  - Get payout details and transaction status

---

#### 🧠 Fraud Detection APIs

- `POST /fraud/analyze`
  - Run anomaly detection on claim activity

- `GET /fraud/flags`
  - Fetch flagged suspicious claims

---

### 🔗 3. External Data Integration Layer

To support parametric triggers, the backend integrates with multiple external (or mocked) data sources:

- **Weather APIs**
  - Rainfall intensity, temperature, AQI levels

- **Traffic APIs**
  - Congestion levels, road closures

- **Platform APIs (Mock)**
  - Order volume per zone
  - Rider activity status

All data pipelines are:

- Cached using **Redis**
- Processed at regular intervals
- Mapped to trigger thresholds

---

### 🔄 4. Claim Processing Engine (Core Logic)

The backend includes an automated **event-driven claim engine**:

1. Trigger crosses threshold (e.g., heavy rain detected)
2. System checks:
   - Active users in affected zone
   - Drop in order volume

3. Eligible users identified
4. Claim auto-created
5. Fraud analysis executed
6. Approved claims sent to payout service

---

### 📄 5. API Documentation & Sample Payloads

All APIs are documented using:

- **Swagger UI (FastAPI built-in)**
- Example request/response payloads

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

- ✅ Fully functional **FastAPI backend**
- ✅ Structured **PostgreSQL schema + migrations**
- ✅ End-to-end **policy & claims engine**
- ✅ Integrated **trigger monitoring system**
- ✅ Mock-ready **payment and external APIs**
- ✅ Scalable architecture ready for frontend & AI modules

---

## 👨‍💻 Admin Dashboard and Analytics UI

To make the insurer-side experience execution-ready for demos, this section defines the **admin dashboard journey** in concrete UI and analytics terms.

### 1) Dashboard Layout (Insurer Control Center)

The admin dashboard is designed for **at-a-glance operational visibility** with fast drill-down into claims, fraud, and disruption trends.

#### Layout Structure

1. **Top Summary Row (KPI Cards)**

- Total active policies.
- Claims triggered today.
- Total payout amount (selected period).
- Fraud alerts count.

2. **Primary Analytics Area**

- Risk heatmap by city/zone.
- Disruption trend chart over time.

3. **Operations Panel Area**

- Claims monitoring table.
- Fraud alerts and flagged rider list.

4. **Persistent Filter Bar**

- Global filters applied across all widgets.
- Quick reset and preset date ranges.

---

### 2) Claims Monitoring Section (Status, Amount, Trigger Type, Zone)

The claims panel should support real-time operational review and quick exception detection.

#### Claims Table Requirements

Each claim record must show:

- Claim ID.
- Rider ID / rider name (masked if required for demo privacy).
- City and micro-zone.
- Trigger type (`Rain`, `Heat`, `AQI`, `Curfew`, `Platform-Down`).
- Claim status (`Triggered`, `Eligibility Check`, `Approved`, `Rejected`, `Paid`).
- Estimated loss amount.
- Approved payout amount.
- Last updated timestamp.

#### Claims Panel Actions

- Sort by status, amount, and latest update.
- Filter by city, zone, date range, and trigger type.
- Open claim detail drawer for timeline and reason log.
- Highlight claims stuck in non-terminal states beyond threshold SLA.

---

### 3) Risk Heatmap and Disruption Trend Visualization

This section provides predictive and historical risk visibility for planning underwriting and operations.

#### A. Risk Heatmap Widget

Must visualize:

- Zone-level risk intensity (`Low / Medium / High`) using AI risk score bands.
- City-to-zone drill-down (city overview → micro-zone detail).
- Hover/tooltip values:
  - Risk score.
  - Dominant trigger type.
  - Predicted disruption likelihood for next 7 days.

#### B. Disruption Trend Widget

Must visualize:

- Time-series trend of disruption events (daily/weekly view).
- Trigger-wise stacked trend (`Rain`, `Heat`, `AQI`, `Curfew`, `Platform-Down`).
- Overlay for claims triggered vs claims paid.
- Quick period switch (`7D`, `30D`, custom date range).

---

### 4) Fraud Alerts Section (Flagged Rider List)

The fraud panel should provide immediate visibility into suspicious behavior and risk clusters.

#### Fraud Alerts Table Requirements

Each flagged rider record must show:

- Rider ID.
- City and zone.
- Fraud risk score.
- Alert type (`GPS Spoofing`, `Suspicious Inactivity`, `Collusion Pattern`, `Repeat Trigger Abuse`).
- Linked claim IDs count.
- Current review state (`New`, `Under Review`, `Escalated`, `Cleared`).
- Last alert timestamp.

#### Fraud Panel Behaviors

- Severity color tags for quick triage.
- Sort by fraud score descending.
- Click-to-open rider fraud profile summary.
- Show related claims and anomaly reasons in one view.

---

### 5) Dashboard Filters (City, Zone, Date Range, Trigger Type)

Filters are global and must update all analytics and tables in sync.

#### Required Filters

- **City** (single-select or multi-select).
- **Zone** (dependent on selected city).
- **Date Range** (`Today`, `Last 7 Days`, `Last 30 Days`, `Custom`).
- **Trigger Type** (`All`, `Rain`, `Heat`, `AQI`, `Curfew`, `Platform-Down`).

#### Filter UX Rules

- Applied filters are visible as removable chips.
- “Reset All” restores default dashboard state.
- Empty-state messages appear when no records match.
- Filter state persists during in-dashboard navigation.

---

### 6) Admin Demo Walkthrough Script

Use this flow during demo to present insurer-grade visibility clearly.

1. **Open Dashboard Overview**

- Show KPI cards for policies, claims, payouts, and fraud alerts.

2. **Inspect Claims Monitoring**

- Filter by city/zone and demonstrate status progression.
- Open one claim timeline.

3. **Review Risk Widgets**

- Show heatmap hotspots.
- Switch trend view from `7D` to `30D`.

4. **Investigate Fraud Alerts**

- Sort flagged riders by fraud score.
- Open one rider’s alert detail with linked claims.

5. **Demonstrate Filtered Analytics View**

- Apply `Date + Trigger Type` filters.
- Show synchronized updates across all widgets and panels.

---

### 7) Admin Dashboard Deliverables Checklist

This checklist maps directly to the requested admin scope.

- ✅ **Admin dashboard v1 complete**
  - Core layout, KPI row, analytics area, operations panels, and filter bar.

- ✅ **Claims and fraud visibility panels**
  - Claims monitoring table with status and amount tracking.
  - Fraud alerts table with flagged rider list and severity signals.

- ✅ **Risk trend widgets**
  - Zone-level risk heatmap and disruption trend visualization.

- ✅ **Filtered analytics view**
  - Global filters for city, zone, date range, and trigger type with synced updates.

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

| Requirement                     | How Earnings Shield Addresses It                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| **Optimized onboarding**        | Mobile‑first app with quick onboarding for Q‑commerce riders, linked to their platform ID. |
| **Risk profiling using AI/ML**  | XGBoost/LightGBM model for zone‑based risk and dynamic weekly premiums.                    |
| **Weekly pricing model**        | Strictly weekly micro‑premium; no hourly or long‑term plans.                               |
| **Parametric triggers**         | Weather, traffic, and platform‑API events automatically trigger loss‑of‑income checks.     |
| **Zero‑touch claim initiation** | System auto‑detects disruptions and initiates claims without rider input.                  |
| **Instant payout processing**   | Mock payment gateway (Razorpay / Stripe / UPI) simulates instant wage recovery.            |
| **Fraud detection**             | Isolation Forest + Graph ML for GPS spoofing, fake inactivity, collusion.                  |
| **Analytics dashboard**         | Worker and insurer dashboards showing coverage, protected earnings, and risk metrics.      |

---

## 👨‍💻 Member 4: AI/ML, Trigger Engine, and Fraud Detection

This section details the core AI/ML implementation responsibilities for risk modeling, parametric trigger evaluation, and fraud detection systems.

### Overview

Member 4 owns the **intelligence layer** of Earnings Shield, responsible for:

1. Building and training the **dynamic premium model** (XGBoost/LightGBM).
2. Implementing the **parametric trigger evaluation engine** with real-time event monitoring.
3. Designing and deploying **fraud detection modules** (anomaly detection + collusion detection).
4. Publishing model outputs to backend APIs and dashboard visualization modules.
5. Documenting model metrics, validation results, and deployment guidelines.

---

### 1. Dynamic Risk Scoring Model (Weekly Premium Calculation)

#### Objective

Build a **predictive risk-scoring model** that generates personalized, data-driven weekly premiums for each Q-commerce delivery partner based on zone characteristics, historical disruption patterns, and rider behavior.

#### Model Architecture

**Algorithm:** **XGBoost** or **LightGBM** (gradient boosted decision trees)

- Chosen for fast inference, interpretability, and handling mixed feature types.
- Suitable for tabular data with non-linear relationships.

#### Feature Engineering

**Zone-Level Features:**

- `zone_id`: Encoded ID of the delivery zone.
- `avg_rainfall_mm`: Historical average rainfall in zone (last 5 years).
- `flood_risk_score`: Zone vulnerability to waterlogging (0–1 scale).
- `avg_max_temp`: Historical average max temperature (°C).
- `avg_aqi`: Historical average Air Quality Index.
- `infrastructure_density`: Dark stores, pickup points per sq. km.
- `traffic_congestion_index`: Historical traffic congestion during peak hours.

**Rider-Level Features:**

- `years_on_platform`: Tenure on delivery platform.
- `avg_weekly_earnings`: Baseline income from last 12 weeks.
- `avg_orders_per_shift`: Historical order volume per shift.
- `avg_shift_duration`: Typical shift length in hours.
- `shifts_per_week`: Number of working days/shifts.
- `cancellation_rate`: Percentage of accepted orders not completed.
- `avg_delivery_time`: Average time from pickup to drop (correlates with disruption exposure).
- `sla_breach_rate`: Percentage of SLA breaches (SLA = 10–15 min for Q-commerce).

**Environmental Forecast Features (Dynamic):**

- `rain_forecast_next_week`: Predicted rainfall for upcoming week (mm).
- `heat_alert_forecast`: Boolean for heat advisory in next week.
- `aqi_forecast`: Forecasted AQI for next week.
- `expected_curfew_hours`: Flagged if local events (strikes, curfews) are scheduled.
- `platform_downtime_risk`: Estimated server/app uptime risk for that zone.

#### Target Variable

- `premium_base` (₹/week): Historical baseline premium derived from:
  - Historical loss ratio = (claims paid / premiums collected) for similar riders.
  - Adjusted by zone and rider risk tiers.

#### Model Training Pipeline

```
1. Data Collection
   ├─ Zone-level weather, traffic, and platform data (12 months historical).
   ├─ Rider earnings and behavior data (transaction logs).
   └─ Past claims data and loss amounts.

2. Feature Processing
   ├─ Handle missing values (imputation by zone median).
   ├─ Normalize continuous features (StandardScaler).
   ├─ Encode categorical features (Label Encoding for zone_id).
   └─ Create polynomial/interaction features if needed.

3. Train-Test Split
   ├─ 80% training (randomly sampled across zones and timeframes).
   ├─ 10% validation (temporal holdout: last 2 weeks of data).
   └─ 10% test (unseen zone or future period).

4. Model Training
   ├─ XGBoost / LightGBM hyperparameter tuning via GridSearchCV.
   │  ├─ max_depth: 5–10
   │  ├─ learning_rate: 0.01–0.1
   │  ├─ n_estimators: 100–500
   │  └─ subsample: 0.7–1.0
   ├─ Cross-validation: 5-fold stratified by zone.
   └─ Optimize for MSE or MAE (regression loss).

5. Model Evaluation
   ├─ R² score (explained variance).
   ├─ RMSE (root mean squared error).
   ├─ Feature importance (XGBoost's built-in SHAP values).
   └─ Zone-level residual analysis for bias.

6. Deployment
   ├─ Save model as .pkl or .joblib.
   ├─ Version control in Git (model artifacts in /models/).
   └─ Serve via FastAPI endpoint: POST /api/risk/score.
```

#### Inference Pipeline (Weekly Premium Generation)

```
Input: Rider ID + Zone ID → Output: Weekly Premium (₹)

Steps:
1. Fetch rider profile → extract rider-level features.
2. Fetch zone + latest weather/forecast data → extract zone and environment features.
3. Concatenate all features → preprocess (standardize, encode).
4. Pass through trained XGBoost model → get risk_score (0–1 scale).
5. Convert risk_score to premium:
   premium = base_price * (1 + risk_score * multiplier)
   Example: base = ₹20, risk_score = 0.6, multiplier = 2.0 → premium = ₹20 * 2.2 = ₹44.
6. Apply caps (min ₹15/week, max ₹100/week) to ensure affordability.
7. Return premium + confidence interval to backend.
```

#### Model Validation & Documentation

**Metrics to Publish:**

- Overall R² and RMSE.
- Zone-wise RMSE (to identify zones with high model error).
- Top 10 feature importances (SHAP values).
- Confusion matrix for premium tier accuracy (if discretized into Low/Medium/High tiers).

**Validation Notes:**

- Document any data gaps or anomalies during training.
- Flag if specific zones have insufficient training data.
- Cross-validate against business logic (e.g., premium should increase with rainfall risk).

---

### 2. Parametric Trigger Evaluation Engine

#### Objective

Build an **event-driven trigger evaluation service** that monitors real-time disruption events, validates rider eligibility, determines event duration and severity, and auto-initiates claims in zero-touch fashion.

#### Trigger Definitions & Thresholds

A trigger is a **parametric event** that, when detected and validated, automatically initiates a claim without manual rider input.

**Trigger 1: Heavy Rain / Waterlogging**

- **Metric:** Rainfall amount (mm/hour) from OpenWeatherMap or weather API.
- **Threshold:** ≥ 15 mm/hour in a specific zone.
- **Duration Rule:** Event persists for ≥ 30 minutes.
- **Rider Eligibility:**
  - Rider is active in the affected zone.
  - Rider's work hours overlap with the event window.
  - No active orders being delivered at trigger time (safe-off check).
- **Claim Trigger:** If all conditions met, flag for auto-claim initiation.

**Trigger 2: Extreme Heat / Heat Advisory**

- **Metric:** Temperature (°C) from weather API.
- **Threshold:** ≥ 45°C for ≥ 2 hours, OR government heat health advisory issued.
- **Duration Rule:** Event lasts ≥ 2 consecutive hours.
- **Rider Eligibility:**
  - Rider typically works during peak heat hours (10 AM – 3 PM).
  - Rider is registered in the affected city/region.
  - Rider's shift profile includes those hours.
- **Claim Trigger:** Auto-claim after eligibility check.

**Trigger 3: Severe Air Quality (AQI > 400)**

- **Metric:** AQI from weather API (e.g., OpenWeatherMap).
- **Threshold:** AQI ≥ 400 (Severe, hazardous).
- **Duration Rule:** Event lasts ≥ 1 hour.
- **Rider Eligibility:**
  - Rider's zone overlaps with high-AQI region (within metro district).
  - Rider has work hours scheduled during AQI alert.
  - Platform health data shows no operational restrictions (platform may preempt issues).
- **Claim Trigger:** Auto-claim if eligibility and platform status confirmed.

**Trigger 4: Curfew / Strike / Social Disruption**

- **Metric:** Manual data entry or third-party event API (e.g., GoogleMaps alerts, location-services).
- **Threshold:** Curfew or strike declared in specific zone.
- **Duration Rule:** Event marked as active for declared duration.
- **Rider Eligibility:**
  - Rider's home or primary working zone intersects with curfew zone.
  - Rider's typical shift window falls within curfew hours.
  - Rider was logged-in when curfew started (to avoid spurious claims).
- **Claim Trigger:** Auto-claim if all conditions met.

**Trigger 5: Platform Downtime / Zone Closure**

- **Metric:** Platform API health status or order volume anomaly detection.
- **Threshold:**
  - Reported API downtime > 15 minutes, OR
  - Order volume in zone drops to < 5% of hourly baseline for ≥ 30 minutes.
- **Duration Rule:** > 30 minutes of continuous downtime or low traffic.
- **Rider Eligibility:**
  - Rider is active (logged-in, app open) during downtime.
  - Rider is in the affected zone (verified by GPS).
  - No orders in flight at downtime start (safe exit condition).
- **Claim Trigger:** Auto-claim once downtime resolved or threshold exceeded.

#### Trigger Evaluation Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Real-Time Event Stream (Message Queue: Redis / Kafka)          │
│  Ingests: Weather events, Traffic updates, Platform status
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Event Normalizer (FastAPI Background Task / Apache Airflow)    │
│  - Reconcile event timestamp, zone, severity                    │
│  - Check if event is "new" or continuation of prior event       │
│  - De-duplicate redundant events                                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Trigger Evaluation Engine (Python Service)                     │
│                                                                  │
│  for each event:                                               │
│    ├─ Match event type to trigger definition                   │
│    ├─ Check if magnitude/duration thresholds met                │
│    ├─ Fetch affected zone/radius (e.g., 2–5 km radius)         │
│    └─ Queue trigger for rider eligibility check                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Rider Eligibility Filter (Database Queries + Real-Time Checks) │
│                                                                  │
│  for each rider in affected zone:                              │
│    ├─ Is rider active (logged-in, app open)?                   │
│    ├─ Does rider's shift window overlap event time?            │
│    ├─ GPS verification: rider in affected zone?                │
│    ├─ Does rider have active policy for this week?             │
│    └─ No active fraud flags or recent false-claim history?     │
│                                                                  │
│  Output: List of [eligible_rider_id, event_id, timestamp]      │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Claim Initiation Service (FastAPI endpoint)                    │
│                                                                  │
│  for each eligible rider:                                       │
│    ├─ Create claim: {rider_id, event_id, auto_initiated}       │
│    ├─ Estimate lost income:                                     │
│    │  loss = event_duration_hours * rider_hourly_baseline      │
│    ├─ Cap claim payout (e.g., ≤ ₹500/week max)                │
│    ├─ Save claim to DB with status "approved"                  │
│    └─ Enqueue payout to Mock Payment Gateway                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Instant Payout Service (Async Task)                            │
│                                                                  │
│  for each approved claim:                                       │
│    ├─ Validate claim amt, rider wallet status                   │
│    ├─ Call Mock Razorpay / Stripe / UPI API                    │
│    ├─ LOG payout reference ID                                  │
│    ├─ Update claim status to "paid"                            │
│    └─ Notify rider via in-app + SMS                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Implementation Checklist

- [ ] Create trigger definition config (YAML or JSON file in `/config/triggers.json`).
- [ ] Implement event normalizer (FastAPI background task or Celery task).
- [ ] Build trigger matcher function (event type → trigger rules).
- [ ] Implement threshold checker (duration, severity, zone boundaries).
- [ ] Build rider eligibility filter (DB queries + GPS validation).
- [ ] Integrate with production weather/traffic/platform APIs (or mocks).
- [ ] Implement auto-claim initiation logic (create claim object in DB).
- [ ] Write payout estimation formula (hours × hourly baseline, with caps).
- [ ] Set up mock Razorpay/Stripe/UPI integration for payout simulation.
- [ ] Log all trigger events and eligibility checks for audit trail.
- [ ] Add monitoring/alerting for missed or delayed claims.

---

### 3. Fraud Detection & Anomaly Detection

#### Objective

Detect suspicious behavior, GPS spoofing, fake inactivity claims, and collusion patterns to prevent fraudulent claims while maintaining system trust.

#### 3A. Anomaly Detection in Location & Activity (Isolation Forest)

**Problem:**
Some riders may claim disruption events but fabricate their location or activity state to fraudulently collect payouts.

**Anomalies to Detect:**

- **GPS Jump Anomaly:** Rider teleports 10+ km in 2 minutes (impossible by bike).
- **Fake Inactivity:** Rider claims inactive due to disruption, but GPS shows movement in safe zones.
- **Shift Pattern Anomaly:** Rider suddenly works 22 hours/day (unrealistic).
- **Order-to-Earnings Mismatch:** Claims huge income loss, but order history shows low activity.

**Model: Isolation Forest**

- Unsupervised anomaly detection.
- Separates normal behavior from outliers via random isolation trees.
- Lightweight and fast for streaming data.

**Features for Isolation Forest:**

```
1. Location Features
   - gps_lat, gps_lon: Current position.
   - prev_lat, prev_lon: Previous position (1 min prior).
   - km_moved_per_min: Distance (km) / time (min).
   - zone_change_frequency: How often rider switches zone (anomaly if frequent).

2. Temporal Features
   - hour_of_day: Shift time.
   - days_active_this_week: Total activity days.
   - consecutive_active_hours: How long shifted without break.
   - time_since_last_order: Minutes since last order (anomaly if idle > 30 min).

3. Activity Features
   - orders_per_hour: Current rate.
   - avg_orders_per_hour: Historical average.
   - order_deviation_ratio: current / historical (anomaly if > 3x or < 0.3x).
   - cancellation_rate_this_shift: % of accepted orders not completed.
   - delivery_time_variance: High variance = suspicious pattern.

4. Engagement Features
   - app_logout_frequency: How often rider logs out/in (anomaly if frequent).
   - api_request_rate: How many requests/min (anomaly if unusually high).
   - location_permission_changes: App permission re-grants (suspicious).
```

**Training:**

- Use 3–6 months of historical rider data (GPS, orders, timings).
- Mark known fraud cases as "anomaly = 1" for validation.
- Train Isolation Forest with `contamination=0.05` (assume 5% anomaly rate).

**Inference (Real-Time):**

```
On each claim auto-initiated:
1. Extract rider's 1-hour activity window before disruption event.
2. Compute anomaly score via Isolation Forest.
3. If anomaly_score > threshold (e.g., 0.7):
   ├─ Flag claim for manual review.
   ├─ Deduct points from rider trust score.
   └─ Log fraudulent behavior alert.
4. If anomaly_score ≤ threshold:
   └─ Proceed with claim initialization.
```

**Output:**

- `anomaly_score` (0–1): Higher = more suspicious.
- `flagged_features`: List of features that contributed to anomaly (interpretability).
- `recommendation`: "Approve", "Review Manually", or "Reject".

---

#### 3B. Collusion Detection (Graph-Based Patterns)

**Problem:**
Multiple riders in the same zone may collude to claim fake disruptions simultaneously, inflating loss ratios and defrauding the insurer.

**Collusion Patterns:**

- **Synchronized Offline Events:** 10+ riders in zone claim inactivity at same time, but zone traffic is normal.
- **Fake Mutual Help:** Riders trade orders to inflate individual claim amounts.
- **Reverse SLA:** Riders deliberately breach SLA to avoid being forced offline (suspicious).

**Model: Graph-Based Collusion Detection**

Build a **rider network graph** where:

- **Nodes:** Rider IDs.
- **Edges:** Weighted by:
  - `co_occurrence_count`: Times they're active in same zone at same time.
  - `claimed_loss_correlation`: Correlation of claimed loss amounts.
  - `dispute_rate`: Reverse correlation (claim together, but different stories).

**Algorithm:**

1. **Community Detection (Louvain Method):**
   - Identify clusters of riders who frequently interact/claim together.
   - Retrieve highly connected communities.

2. **Anomalous Community Scoring:**

   ```
   For each detected community:
   ├─ Calculate avg loss ratio for that community.
   ├─ Compare vs platform avg loss ratio.
   ├─ If community_loss_ratio >> platform_avg:
   │  └─ Flag entire community as suspicious.
   ├─ Calculate pairwise temporal correlation of claim times.
   └─ If correlation > 0.8 (claims always together):
      └─ Boost suspicion score.
   ```

3. **Linkage to Triggers:**
   ```
   When claim auto-initiated:
   ├─ Fetch rider's community.
   ├─ Count how many others in community filed same claim.
   ├─ If count > threshold (e.g., >20% of community):
   │  ├─ Calculate "collusion suspicion score".
   │  └─ Flag claim for review if score > threshold.
   └─ Log claim for audit + later batch analysis.
   ```

**Graph Construction (Batch Job):**

- Run weekly on historical claim data.
- Rank all rider communities by collusion risk.
- Store results in /outputs/fraud_detection/community_graph.json.

**Output:**

- `collusion_score` (0–1): Higher = more likely fraudulent ring.
- `community_id`: Rider cluster ID.
- `community_size`: Number of riders in cluster.
- `avg_loss_ratio`: Community's average loss ratio.
- `recommendation`: "Healthy", "Monitor", or "Investigate".

---

#### 3C. Fraud Scoring Aggregation

Combine Isolation Forest anomaly score + Graph-based collusion score into a **unified fraud alert**:

```python
def compute_fraud_score(rider_id, claim_id):
    anomaly_score = isolation_forest_predict(rider_id)
    community = graph_db.get_rider_community(rider_id)
    collusion_score = compute_community_anomaly(community)

    # Weighted combination
    fraud_score = (0.6 * anomaly_score) + (0.4 * collusion_score)

    if fraud_score > 0.75:
        return "REJECT"  # High confidence fraud
    elif fraud_score > 0.50:
        return "REVIEW"  # Manual intervention needed
    else:
        return "APPROVE"  # Low fraud risk
```

---

#### Fraud Detection Deliverables

- [ ] **Anomaly Detection Module**
  - Trained Isolation Forest model (saved as .pkl).
  - Feature extraction pipeline (code in `/models/anomaly_detector.py`).
  - Real-time inference endpoint: `POST /api/fraud/anomaly_score`.
  - Validation metrics (precision, recall, F1 on test set).

- [ ] **Collusion Detection Module**
  - Community detection algorithm (NetworkX-based code).
  - Weekly batch job (Apache Airflow or Celery task).
  - Output: Community graph JSON + collusion scores per community.
  - Validation: Manual review of top-10 flagged communities.

- [ ] **Unified Fraud Alert System**
  - Combined fraud score logic (code in `/models/fraud_aggregator.py`).
  - Decision matrix (APPROVE / REVIEW / REJECT rules).
  - Alert routing to backend and dashboard.

- [ ] **Fraud Monitoring Dashboard**
  - Real-time fraud flags and anomaly counts.
  - Community risk leaderboard.
  - Manual review queue and resolutions log.

---

### 4. Model Outputs & API Integrations

#### 4A. Risk Scoring API

**Endpoint:** `POST /api/risk/score`

**Request:**

```json
{
  "rider_id": "R12345",
  "zone_id": "Z001",
  "force_recompute": false
}
```

**Response:**

```json
{
  "rider_id": "R12345",
  "risk_score": 0.62,
  "weekly_premium": 42.5,
  "premium_range": [38.0, 48.0],
  "risk_tier": "MEDIUM",
  "top_features": [
    { "feature": "avg_rainfall_mm", "importance": 0.18 },
    { "feature": "flood_risk_score", "importance": 0.15 },
    { "feature": "years_on_platform", "importance": 0.12 }
  ],
  "confidence": 0.87,
  "generated_at": "2026-03-18T10:30:00Z"
}
```

---

#### 4B. Trigger Evaluation API

**Endpoint:** `POST /api/triggers/evaluate`

**Request:**

```json
{
  "event_type": "heavy_rain",
  "zone_id": "Z001",
  "severity": 0.85,
  "duration_minutes": 35,
  "start_time": "2026-03-18T14:00:00Z"
}
```

**Response:**

```json
{
  "event_id": "EVT_67890",
  "zone_id": "Z001",
  "trigger_matched": "heavy_rain",
  "threshold_met": true,
  "eligible_riders": [
    {
      "rider_id": "R12345",
      "active": true,
      "in_zone": true,
      "shift_overlap": true,
      "claim_auto_initiated": true,
      "claim_id": "CLM_11111"
    },
    {
      "rider_id": "R67890",
      "active": false,
      "claim_auto_initiated": false,
      "reason": "not_logged_in"
    }
  ],
  "claims_initiated": 12,
  "total_payout_estimated": 3450.0,
  "processed_at": "2026-03-18T14:05:00Z"
}
```

---

#### 4C. Fraud Detection API

**Endpoint:** `POST /api/fraud/check`

**Request:**

```json
{
  "claim_id": "CLM_11111",
  "rider_id": "R12345"
}
```

**Response:**

```json
{
  "claim_id": "CLM_11111",
  "rider_id": "R12345",
  "anomaly_score": 0.42,
  "collusion_score": 0.12,
  "fraud_score": 0.35,
  "recommendation": "APPROVE",
  "flagged_features": ["zone_change_frequency", "time_since_last_order"],
  "community_info": {
    "community_id": "C001",
    "community_size": 45,
    "avg_loss_ratio": 0.18,
    "collusion_risk": "LOW"
  },
  "checked_at": "2026-03-18T14:06:00Z"
}
```

---

### 5. Model Validation & Documentation

#### Validation Checklist

- [ ] **Risk Scoring Model**
  - [ ] R² score ≥ 0.7 on test set.
  - [ ] RMSE within ±15% of mean premium.
  - [ ] Zone-wise residuals analyzed (no systematic bias).
  - [ ] Feature importances make business sense.
  - [ ] Premium ranges (₹15–100/week) are realistic.

- [ ] **Trigger Evaluation Engine**
  - [ ] All 5 trigger types correctly threshold-matched.
  - [ ] Eligibility filter catches inactive riders (0 false positives).
  - [ ] End-to-end latency: < 10 seconds from event to claim initiation.
  - [ ] Zone boundary logic tested for edge cases (zone borders).

- [ ] **Isolation Forest (Anomaly Detection)**
  - [ ] Precision ≥ 0.80 (low false-alarm rate).
  - [ ] Recall ≥ 0.70 (catches most fraud).
  - [ ] Validation on held-out fraud cases.
  - [ ] Feature ablation: which features matter most?

- [ ] **Community Detection (Collusion)**
  - [ ] Manual audit of top-10 flagged communities.
  - [ ] No false positives (legitimate rider groups not flagged).
  - [ ] Collusion score correlates with re-flagged claims.

---

#### Documentation Deliverables

**1. Model Cards (per model):**

```markdown
# Risk Scoring Model Card

## Model Details

- **Algorithm:** XGBoost
- **Training Date:** 2026-03-18
- **Data Cutoff:** 2025-09-18 (6 months historical)
- **Version:** 1.0

## Performance

- **R² Score:** 0.82
- **RMSE:** ₹8.40 (mean premium ₹48)
- **MAE:** ₹6.20

## Limitations

- Insufficient training data for zones with < 50 riders.
- Model trained on 2024–2025 data; may not generalize to 2026 climate anomalies.

## Recommendations

- Retrain quarterly with fresh data.
- Monitor zone-level residuals for concept drift.
```

**2. Trigger Evaluation Documentation:**

```markdown
# Parametric Trigger Definitions

## Trigger 1: Heavy Rain

- **Threshold:** ≥ 15 mm/hour
- **Duration:** ≥ 30 minutes
- **Data Source:** OpenWeatherMap API
- **Zone Radius:** 2 km

## Trigger 2: Extreme Heat

...
```

**3. Fraud Detection Report:**

```markdown
# Fraud Detection Validation Report

## Anomaly Detection (Isolation Forest)

- **Test Set Precision:** 0.82
- **Test Set Recall:** 0.71
- **Top Anomalies Detected:** GPS jumps, shift-time outliers

## Collusion Detection (Graph)

- **Communities Found:** 47
- **High-Risk Communities:** 3
- **Manual Validation Rate:** 100% (all 3 validated as legitimate activity)

## Recommendations

- Increase anomaly threshold to reduce false alarms.
- Monitor top-5 communities monthly.
```

---

### 6. Deployment & Monitoring

#### Model Deployment

- **Risk Scoring Model:** Deployed on FastAPI server, cached in Redis for performance.
- **Trigger Evaluation Engine:** Runs as background worker (Celery/Airflow), triggered by event stream.
- **Fraud Detection Models:** Real-time inference via API endpoints; batch community detection runs weekly.

#### Monitoring & Alerting

- **Model Drift Detection:**
  - Weekly check: Is test-set performance still ≥ baseline?
  - Alert if R² drops > 5% or fraud precision < 0.75.

- **Claim Processing SLA:**
  - Alert if auto-claim initiation latency > 15 seconds.

- **Fraud Alerts:**
  - Daily summary: # of anomalies flagged, # of collusion alerts.
  - Manual review queue dashboard (priority by fraud score).

---

### 7. Deliverables Checklist

**By End of Phase 2 (April 4, 2026):**

- [ ] Dynamic premium model trained, validated, documented.
- [ ] Trigger evaluation engine fully integrated with event stream.
- [ ] Mock triggers firing correctly in demo environment.
- [ ] Basic fraud detection module (Isolation Forest) trained and tested.

**By End of Phase 3 (April 17, 2026):**

- [ ] All fraud detection modules (anomaly + collusion) production-ready.
- [ ] APIs fully documented with example requests/responses.
- [ ] Validation report with metrics and recommendations.
- [ ] Model cards and deployment guidelines finalized.
- [ ] Integration with backend APIs and dashboard visualizations complete.
- [ ] Monitoring dashboard live with fraud/claim alerts.

---

**Expected Outputs for Backend & Dashboard Integration:**

1. **Risk Scoring Model Output:**
   - Weekly premium (₹) per rider per week.
   - Risk tier (LOW / MEDIUM / HIGH).
   - Feature importance breakdown for explainability.

2. **Trigger Decision Engine Output:**
   - Auto-claimed event ID.
   - Eligible riders list.
   - Estimated total payout.
   - Claim initiation timestamp.

3. **Fraud Scoring Output:**
   - Fraud flag (APPROVE / REVIEW / REJECT).
   - Anomaly and collusion scores.
   - Flagged features for investigator review.
   - Community risk assessment.

4. **Model Validation & Metrics:**
   - Performance metrics (R², precision, recall).
   - Feature importance and model cards.
   - Deployment guidelines and monitoring rules.

---

**Built for the Guidewire DEVTrails 2026 – AI‑Powered Insurance for India’s Gig Economy**
🚀 Let’s build a safety net for the invisible backbone of India’s on‑demand economy.
