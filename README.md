# Campfire — Campus360 Student Companion

> **GENESIS 2.0 Hackathon Entry**
> **Problem Statement PS-02:** Campus360 — One Companion for Every First-Year Need
> *Tagline: Your campus. Your people. Your place.*

Campfire is an all-in-one campus operating system built specifically for first-year college students (benchmarked against VESIT Chembur, Mumbai). It brings together academics, campus navigation, peer carpools, class challenges, events, and a study time-credit ledger into one cohesive experience.

---

## Key Modules & Capabilities

1. **Dashboard (Campus Home Screen):**
   - Contextual morning briefing with lecture timetable, "Your Next Move" recommendations, and real-time activity feed.
   - Live synchronization across all sub-modules.

2. **Academics & SGPA What-If Planner:**
   - Mathematically verified Mumbai University credit-weighted SGPA formula: $\text{SGPA} = \frac{\sum (\text{Credits} \times \text{Grade Points})}{\sum \text{Credits}}$.
   - Required marks calculator: Visibly locks impossible grades with clear mathematical warnings.
   - What-If simulator with interactive sliders and target presets (7.0, 8.0, 8.5, 9.0).
   - Recharts visual percentage projection.

3. **Student Carpool Discovery:**
   - Real interactive OpenStreetMap (React Leaflet) centered around VESIT Chembur.
   - Filter by direction (*To Campus* / *From Campus*) and verified student status.
   - Anti-overbooking concurrency protection: Prevents multiple passengers from claiming the last seat.
   - Host approval workflow for seat requests.

4. **Peer Challenges & Live Leaderboard:**
   - Categories: Coding, Academics, Campus Exploration, Streaks, Peer Learning.
   - Idempotent reward model: Strictly prevents duplicate points on repeated button clicks or page reloads.
   - Dynamic class leaderboard with weekly, monthly, and overall timeframes.

5. **Interactive Campus Directory:**
   - Floor-by-floor navigation for classrooms (Classroom 302, 304), laboratories (Lab 402, Physics Lab), library, canteen, SAC, and first aid clinic.
   - Direct link from Today's Lectures to room coordinates and walking instructions.

6. **Campus Events & Hackathons:**
   - Technical fests (Genesis 2.0), workshops, robotics showcases, and cultural nights.
   - 1-click RSVP with real venue capacity constraints.

7. **Peer Learning Time-Credits:**
   - Double-entry time credit ledger: Students earn credits by tutoring classmates and spend credits to receive help on difficult engineering concepts.
   - Scheduling interface for study circles.

---

## Technical Stack & Architecture

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **State Architecture:** Unified React Context with cross-feature state propagation and LocalStorage persistence
- **Backend & Persistence:** Google Cloud Firebase Firestore with Attribute-Based Access Control (ABAC) rules
- **Maps:** Leaflet & React Leaflet with OpenStreetMap
- **Data Visualizations:** Recharts
- **Authentication:** MiniMoth Phone OTP Adapter with fallback simulation and student verification state machine

---

## MiniMoth Authentication & Firebase Architecture

### Mandatory MiniMoth Phone OTP Compliance
Per PS-02 requirements, the mandatory authentication provider is MiniMoth. Campfire implements a dedicated adapter (`src/services/authAdapter.ts`):
- When MiniMoth production credentials (`VITE_MINIMOTH_CLIENT_ID` and `VITE_MINIMOTH_APP_SECRET`) are provided, requests hit the documented endpoint.
- For local development and hackathon evaluation without production credentials, the adapter provides a clean simulation flow using code `654321`.
- Firebase phone auth is **not** falsely substituted for MiniMoth.

### Student Verification Lifecycle
1. `phone_verified`: Completed MiniMoth phone OTP verification.
2. `pending_review`: Student ID uploaded and awaiting college administration check.
3. `verified`: Full verified student status with permission to host carpools and study circles.

---

## Quick Start & Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd campfire

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## Environment Variables (`.env`)

See `.env.example` for details:

```env
VITE_FIREBASE_API_KEY="AIzaSyBneH4tKC6MoXHwSnuYnyfv2VVXdBfAk1Q"
VITE_FIREBASE_AUTH_DOMAIN="hip-sanctuary-1k7s0.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="hip-sanctuary-1k7s0"
VITE_FIREBASE_APP_ID="1:27717480851:web:4f084745fa40fc6a407866"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="ai-studio-232219a3-139f-40bb-8d6d-fa499d643a14"

VITE_MINIMOTH_API_ENDPOINT="https://api.minimoth.example.com/v1"
VITE_MINIMOTH_CLIENT_ID="minimoth_client_placeholder"
VITE_MINIMOTH_APP_SECRET=""
```

---

## Testing & Demonstration Guide

Click the **"Hackathon Judge Guide"** pill at the bottom-left of the application to run through the 8 evaluative steps and test cross-feature data synchronizations with one-click actions.
