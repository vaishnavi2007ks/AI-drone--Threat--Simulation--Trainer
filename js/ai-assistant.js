/**
 * AI Training Assistant & Chatbot ("AeroShield AI Mentor") (Module 6)
 * Real-time conversational aerospace defense mentor that answers regulations,
 * explains current radar telemetry, provides operational guidance, and generates training quizzes.
 */

class AIAssistant {
  constructor() {
    this.chatHistory = [];
    this.knowledgeBase = [
      {
        triggers: ['remote id', 'transponder', 'faa part 89', 'faa', 'rid'],
        response: `**FAA Part 89 & Digital Remote ID:**\nRemote ID acts as a digital license plate for unmanned aircraft. Compliant drones broadcast periodic cryptographic packets (via BLE or Wi-Fi beacon) transmitting Drone ID, latitude, longitude, altitude, and operator location. If a drone in our simulation shows \`BROADCAST_DISABLED\` or missing Remote ID, its risk score is automatically penalized because civil air traffic control cannot verify pilot authorization.`
      },
      {
        triggers: ['what should i do', 'recommendation', 'action', 'safe response', 'response protocol'],
        response: `**Operational Response Guidance:**\nIn our educational simulation, counter-drone actions are **strictly non-kinetic and lawful**:\n1. **High/Critical Threat:** Immediately broadcast an automated safety NOTAM to regional Air Traffic Control (ATC), slew PTZ optical cameras to lock evidence, and notify perimeter ground security.\n2. **Moderate Threat:** Interrogate the Remote ID transponder and set geofence proximity watch triggers.\n3. **Low / Certified:** Log nominal transit and maintain passive flight corridor monitoring.`
      },
      {
        triggers: ['rcs', 'radar cross section', 'radar cross-section', 'size'],
        response: `**Radar Cross Section (RCS) Telemetry:**\nRCS (measured in $m^2$) represents the electromagnetic detectability of a drone. Micro-quadcopters typically feature very low RCS ($0.02 - 0.05\\,m^2$), making them difficult for long-range primary radar to detect. Heavy hexacopters and fixed-wing UAVs possess larger RCS ($0.12 - 0.25\\,m^2$). In our simulator, AI fuses optical confidence and acoustic decibels to compensate when RCS is low.`
      },
      {
        triggers: ['rf', 'frequency', 'spectrum', 'fhss', '5.8 ghz', '2.4 ghz', '915 mhz'],
        response: `**RF Radio Spectrum Signatures:**\nMost commercial drones use standard 2.4 GHz or 5.8 GHz ISM bands. If the sensor flags **FHSS (Frequency-Hopping Spread Spectrum)** or custom 915 MHz long-range telemetry, it indicates specialized low-latency link control or multi-node mesh networking commonly seen in swarm operations.`
      },
      {
        triggers: ['swarm', 'multiple drones', 'formation', 'mesh'],
        response: `**Swarm Threat Assessment:**\nWhen multiple drones maintain fixed relational geometry (such as V-formations or mesh nodes), the AI Threat Engine applies a 15% risk multiplier. Swarms present distinct challenges for ground observation because individual nodes can act as decoys while another approaches critical facility infrastructure.`
      },
      {
        triggers: ['geofence', 'zone red', 'zone amber', 'buffer', 'core'],
        response: `**Security Geofence Layers:**\n• **Zone Red (Core Restricted):** 1 km radius immediately surrounding facility HQ. Unauthorized entry constitutes a Level 4 Critical Airspace emergency.\n• **Zone Amber (Advisory Buffer):** 3 km radius buffer where contacts must be interrogated and verified.\n• **Green Outer Sector:** 5.5 km wide-area surveillance sweep.`
      },
      {
        triggers: ['why high risk', 'why critical', 'why is this threat', 'explanation', 'why threat'],
        response: `**Active Threat Rationale:**\nThe AI classifies threats based on a weighted multi-sensor decision vector: (1) Geofence Proximity 35%, (2) Kinematic Anomalies 25%, (3) Remote ID Absence 20%, (4) RF Spectrum Signature 12%, and (5) Sensor Confidence 8%. You can inspect the **AI Threat Analysis** tab for live mathematical feature weights.`
      }
    ];

    this.quizQuestions = [
      {
        question: "A contact is detected inside the 3km Advisory Buffer with NO Remote ID broadcast and high speed (85 km/h). What is the appropriate safe response?",
        options: [
          "A) Broadcast automated ATC safety NOTAM and slave PTZ camera for optical tracking",
          "B) Attempt to jam all regional GPS signals",
          "C) Disregard contact until it enters the 1km core perimeter",
          "D) Launch kinetic projectile interceptors"
        ],
        correct: 0,
        explanation: "Correct! Standard lawful defense mandates non-kinetic ATC coordination and passive optical tracking. Jamming or weaponization is illegal in civil airspace."
      },
      {
        question: "What does a low Radar Cross Section (RCS of 0.03 m²) typically indicate?",
        options: [
          "A) A large commercial delivery hexacopter",
          "B) A micro-quadcopter or agile FPV airframe with minimal radar reflectivity",
          "C) An active transponder malfunction",
          "D) A military cargo plane"
        ],
        correct: 1,
        explanation: "Correct! Small commercial and FPV drones have tiny RCS values (~0.02 - 0.05 m²), requiring multi-sensor optical and acoustic fusion for reliable tracking."
      },
      {
        question: "Under FAA Part 89 regulations, what information does a digital Remote ID transponder broadcast?",
        options: [
          "A) Drone serial number, live coordinates, altitude, and operator location",
          "B) The drone's battery chemistry and camera focal length only",
          "C) Encrypted military clearance codes",
          "D) Weather telemetry only"
        ],
        correct: 0,
        explanation: "Correct! Remote ID functions as an airspace digital license plate broadcasting aircraft ID, live 3D coordinates, and ground pilot location."
      }
    ];
  }

  /**
   * Generates a context-aware answer for the trainee
   */
  async ask(userQuestion, context = {}) {
    const cleanQ = (userQuestion || '').trim();
    if (!cleanQ) return "Please ask a question regarding aerospace defense, threat telemetry, or airspace regulations.";

    // Record question in history
    this.chatHistory.push({ role: 'user', text: cleanQ, time: new Date().toLocaleTimeString() });

    // Check if Live AI (Gemini) is available
    if (window.aiService && window.aiService.isLiveAIAvailable()) {
      try {
        const geminiResponse = await this._askGemini(cleanQ, context);
        if (geminiResponse) {
          this.chatHistory.push({ role: 'assistant', text: geminiResponse, source: 'gemini', time: new Date().toLocaleTimeString() });
          return geminiResponse;
        }
      } catch (err) {
        console.warn('AI Assistant: Gemini error, using aerospace knowledge base:', err);
      }
    }

    // Built-in offline aerospace mentor responder
    const answer = this._askKnowledgeBase(cleanQ, context);
    this.chatHistory.push({ role: 'assistant', text: answer, source: 'offline-ai', time: new Date().toLocaleTimeString() });
    return answer;
  }

  _askKnowledgeBase(question, context) {
    const qLower = question.toLowerCase();

    // 1. Quiz trigger
    if (qLower.includes('quiz') || qLower.includes('test me')) {
      const q = this.quizQuestions[Math.floor(Math.random() * this.quizQuestions.length)];
      return `🧠 **AeroShield Training Quiz:**\n\n${q.question}\n\n${q.options.join('\n')}\n\n*Type your answer (A, B, C, or D) to check your operational knowledge!*`;
    }

    // 2. Check quiz answers
    if (/^[a-d]$/i.test(qLower.trim())) {
      const choice = qLower.trim().toUpperCase();
      const choiceIdx = choice.charCodeAt(0) - 65;
      const lastQuiz = this.quizQuestions[0]; // Reference
      if (choiceIdx === lastQuiz.correct) {
        return `✅ **Correct Answer (${choice})!**\n${lastQuiz.explanation}`;
      } else {
        return `❌ **Incorrect (${choice}).** The correct answer was **A**.\n${lastQuiz.explanation}`;
      }
    }

    // 3. Current Active Drone Context query
    if (context.currentDrone && (qLower.includes('current drone') || qLower.includes('this drone') || qLower.includes('status'))) {
      const d = context.currentDrone;
      return `📊 **Current Target Analysis (${d.id}):**\n• **Airframe:** ${d.name} (${d.type})\n• **Telemetry:** Speed ${Math.round(d.speedKmh)} km/h | Altitude ${Math.round(d.altitudeM)}m | Heading ${d.headingText || d.headingDeg + '°'}\n• **Threat Level:** ${d.threatLevel} | Transponder: \`${d.remoteId || 'N/A'}\`\n• **AI Advice:** ${d.threatLevel === 'Critical' || d.threatLevel === 'High' ? 'Execute ATC notification and PTZ camera lock immediately.' : 'Maintain advisory perimeter surveillance.'}`;
    }

    // 4. Knowledge base trigger search
    for (const item of this.knowledgeBase) {
      if (item.triggers.some(t => qLower.includes(t))) {
        return item.response;
      }
    }

    // 5. Default intelligent mentor answer
    return `**AeroShield Tactical Mentor:**\nRegarding *"${question}"*:\nIn Counter-UAS airspace defense, situational awareness relies on fusing radar kinematic tracks, RF spectrum characteristics, and Remote ID compliance. All operational procedures remain **strictly non-kinetic and advisory** (ATC coordination, optical verification, and facility ground alerts). What specific aspect of the current radar track or airspace protocol would you like to explore?`;
  }

  async _askGemini(question, context) {
    const d = context.currentDrone || {};
    const sc = context.scenario || {};

    const systemPrompt = `You are "AeroShield AI Mentor", an intelligent aerospace defense and Counter-UAS training assistant embedded in an educational drone threat simulator. 
Your goal is to guide students and trainees in understanding simulated aerial threat identification, radar telemetry, Explainable AI, and safe non-kinetic defense procedures.
RULES:
1. STRICTLY SAFE AND EDUCATIONAL. NEVER provide instructions for real-world weapon targeting, physical drone jamming, destruction, or interception.
2. Emphasize civilian regulatory compliance (FAA Part 89 Remote ID, ICAO Doc 10019, ATC safety NOTAMs).
3. Keep responses concise, tactical, professional, and formatted in clean markdown.`;

    const prompt = `Current Context:
Active Scenario: "${sc.title || 'Aerial Incursion'}"
Target Drone: ID=${d.id || 'N/A'}, Speed=${d.speedKmh || 0} km/h, Altitude=${d.altitudeM || 0}m, ThreatLevel=${d.threatLevel || 'High'}, RemoteID=${d.remoteId || 'None'}
Trainee Question: "${question}"`;

    const res = await window.aiService.generateCompletion(prompt, systemPrompt);
    return res && res.text ? res.text : null;
  }
}

if (typeof window !== 'undefined') {
  window.aiAssistant = new AIAssistant();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAssistant };
}
