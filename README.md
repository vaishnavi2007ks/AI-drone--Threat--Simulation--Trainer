# AI-Enabled Drone & Counter-Drone Threat Simulation Trainer

[![Platform](https://img.shields.io/badge/Platform-Web%20Application-cyan.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Safety-Non--Kinetic%20Educational%20Only-emerald.svg)](https://github.com)
[![AI Architecture](https://img.shields.io/badge/AI%20Workflow-10%20Integrated%20Modules-purple.svg)](https://github.com)
[![Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Ready-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

An educational aerospace defense and Counter-UAS simulation platform engineered for college project demonstrations, academic defense evaluations, and cybersecurity training. 

> **Strict Academic Safety & Compliance Notice:**  
> This simulation platform uses 100% simulated, synthetic data models for educational and academic evaluation. It **does not connect to, track, or control real-world drones**, nor does it provide instructions or mechanisms for kinetic interception, RF jamming, weaponization, or aircraft damage. All counter-drone recommendations strictly follow **lawful, non-kinetic situational awareness and civil regulatory reporting procedures (ICAO Doc 10019 / FAA Part 89 compliant)**.

---

## 🤖 The 10 AI Modules Throughout the Training Workflow

The simulator integrates AI across the entire training lifecycle:

```
[1. AI Scenario Generation] ──> [2. AI Threat Analysis] ──> [3. AI Threat Prediction]
              │                                                        │
              ▼                                                        ▼
[10. AI Training Scenarios & Debrief] <── [9. AI Adaptive Difficulty] <── [4. AI Response Recommendation]
              ▲                                                        │
              │                                                        ▼
[8. AI Personalized Feedback] <── [7. AI Trainee Evaluation] <── [5. AI XAI Decision Explanation]
                                              ▲
                                              │ (Guided by)
                                  [6. AI Training Assistant / Chatbot]
```

### Module Breakdown:
1. **AI Scenario Generation (`js/ai-scenario-generator.js`):** Generates endless realistic training drills from natural language prompts or procedural objectives, synthesizing multi-drone formations, evasive waypoints, and sensor noise.
2. **AI Simulated Threat Analysis (`js/ai-engine.js`):** Dynamic multi-sensor fusion evaluating spatial velocity vectors, geofence breaches, RF radio frequency hopping, and digital Remote ID cryptographic tokens.
3. **AI Threat Prediction (`js/ai-predictor.js`):** Kinematic trajectory extrapolation calculating **Estimated Time to Breach (ETB)**, core/advisory penetration probabilities, and arrival sectors at $t+5\text{s}, t+15\text{s}, t+30\text{s}$.
4. **AI Response Recommendation (`js/ai-engine.js`):** Context-aware, safe, non-kinetic defensive checklists tailored to specific perimeter breaches (civil ATC NOTAM alerts, PTZ optical camera slaving, ground security patrols).
5. **AI Explanation of Decisions - XAI (`js/ai-engine.js`):** Feature attribution weights, plain-language reasoning, and **Counterfactual "What-If" Sensitivity Reasoning** (e.g., *"If target broadcast valid Remote ID, risk score would drop by 32%"*).
6. **AI Training Assistant & Chatbot (`js/ai-assistant.js`):** The floating **"AeroShield AI Mentor"** answers aerospace defense questions, explains live radar blips, quizzes trainees, and guides procedural compliance.
7. **AI Trainee Performance Analysis (`js/ai-evaluator.js`):** Interactive Trainee Command Console tracking operator Decision Latency (seconds to react), Protocol Correctness, and Regulatory Compliance (grading from A+ to D).
8. **AI-Generated Personalized Feedback (`js/ai-evaluator.js`):** Structured After-Action Review (AAR) debriefing dossiers highlighting trainee strengths, tactical oversights, and personalized remediation tips.
9. **AI Adaptive Difficulty (`js/ai-adaptive.js`):** Profiles trainee competency over time, manages rank levels (*Cadet Trainee &rarr; Defense Operator &rarr; Senior Tactical Specialist*), and scales challenge factors dynamically.
10. **AI-Generated Training Scenarios & Debriefs (`js/ai-scenario-generator.js` & `js/ai-evaluator.js`):** Automatically synthesizes targeted remediation drills focused on the trainee's specific observed weaknesses.

---

## ⚡ Dual-Mode AI Architecture (Zero Cost + Optional Gemini LLM)

Built with a flexible **Dual-Mode Gateway (`js/ai-service.js`)**:
- **Mode 1: Built-in Offline Intelligence (Default)**
  - Works 100% out-of-the-box in any browser with zero setup, zero cost, and zero API keys.
  - Generates procedural scenarios, predicts trajectories, evaluates trainee latency, quizzes users, and writes structured After-Action Reviews entirely client-side.
- **Mode 2: Google Gemini Live AI Acceleration (Optional)**
  - Click **AI Settings** (gear icon in header) to input an optional Gemini API Key.
  - Unlocks live LLM-powered scenario generation, organic conversational mentoring, and nuanced instructor-grade debriefs.

---

## 🎯 Key Application Sections

### 1. Home Dashboard
* **Overview & KPIs**: Live telemetry indicators, Geofence sectors, AI model benchmark (**97.4% mAP** ensemble), Latency (~21 ms), and Safe Non-Kinetic status.
* **Architecture Flowchart**: 4-stage processing pipeline from telemetry ingestion to safe escalation.
* **Quick Scenario Launch**: 1-click access to presets or AI generation.
* **Tactical Audio Synthesizer**: Procedural Web Audio radar sweeps and alert chimes with instant mute toggle.

### 2. Threat Simulation
* **Scenario Presets**:
  * *Drone Entering Restricted Airspace* (High Risk Fixed-Wing)
  * *Unknown Drone Detected* (Moderate Loitering Quad)
  * *Multiple Drones Detected - Coordinated Swarm* (Critical 3-element mesh)
  * *Suspicious Flight Pattern* (High Risk Evasive Zigzag)
  * *Authorized Commercial Delivery* (Safe Civil Control)
* **AI Scenario Generator Modal**: Create dynamic custom drills by typing any prompt (e.g., *"Cargo drone lost communication near runway"*).
* **Live Telemetry Stream**: Drone ID, 3D Coordinates, Speed (km/h), Altitude (m AGL), Heading, Radar Cross Section ($m^2$), and Remote ID status.

### 3. AI Threat Analysis (XAI)
* **Threat Classification & Risk Gauge (0–100)**: Real-time dynamic gauge with severity color tiers.
* **Multi-Sensor Feature Weights**: Geofence Proximity (35%), Kinematics (25%), Remote ID (20%), RF Spectrum (12%), Sensor Confidence (8%).
* **Counterfactual Sensitivity Reasoning ("What-If" Analysis)**: Demonstrates how behavioral changes affect the threat score.
* **Recommended Non-Kinetic Response**: Step-by-step lawful coordination checklist.

### 4. Live Tactical Radar & Trainee Defense Console
* **Interactive Canvas 2D Radar**:
  * Polar radar sweep beam with phosphor fade
  * Concentric range rings (1.0 to 5.5 km) and color-coded geofences (Red 1km Core, Amber 3km Buffer, Green Sector)
  * Motion trails and directional heading vectors
  * **AI Predictive Trajectory Layer**: Dashed forecast lines indicating projected positions at $t+5\text{s}, t+15\text{s}, t+30\text{s}$ with Estimated Time to Breach (ETB).
* **Interactive Trainee Defense Console**:
  * Button 01: `Broadcast ATC Safety NOTAM`
  * Button 02: `Slew PTZ Optical Camera`
  * Button 03: `Interrogate Remote ID`
  * Button 04: `Alert Security Patrol`
* **Real-time Trainee HUD**: Displays live latency stopwatch, actions count, rank indicator, and estimated breach countdown.

### 5. Incident Reports & Forensics
* **Table & Card Views**: Historical incident archives stored in browser `localStorage`.
* **Trainee Performance Dossier**: Records overall trainee score, letter grade (A+, A, B, C, D), latency, and instructor debrief.
* **Export Options**: One-click **Export to CSV**, **Export to JSON**, and **Print / PDF Summary**.

### 6. AeroShield AI Mentor (Chatbot)
* Accessible via the **AI Mentor** header button or floating bottom-right launcher.
* Provides real-time guidance on active radar contacts, aerospace regulations (FAA Part 89 Remote ID, ICAO Doc 10019), and interactive quiz testing.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Markup & Structure** | Semantic HTML5, Canvas 2D API |
| **Styling & Theme** | Tailwind CSS (CDN), Custom Cyber-Tactical CSS (`css/styles.css`) |
| **Client-Side AI Engine** | Vanilla ES6+ Modular JavaScript (10 Integrated Modules) |
| **Audio Synthesizer** | HTML5 Web Audio API (Zero external MP3 dependencies) |
| **Persistence & State** | Browser `localStorage` API |
| **Optional LLM Acceleration** | Google Gemini API (`v1beta` models) |
| **Deployment** | 100% Static Web — Instant 1-click **GitHub Pages** deployment |

---

## 🚀 Running the Project

### Option 1: Direct Browser Launch
Simply double-click [`index.html`](index.html) in any browser (Chrome, Edge, Firefox, Safari).

### Option 2: Python Local Server
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

---

## 🌐 Deploying to GitHub Pages

1. Push your project files to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: AI Drone Threat Simulation Trainer with 10 AI Modules"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** &rarr; **Pages**.
3. Under **Branch**, select `main` and root `/ (root)`. Click **Save**.
4. Your application will be live at `https://<your-username>.github.io/<your-repo-name>/`!

---

## 📄 License
This project is open-source under the MIT License for educational and academic demonstration purposes.
