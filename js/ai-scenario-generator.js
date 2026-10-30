/**
 * AI Scenario Generation Engine (Modules 1 & 10)
 * Generates endless, procedurally realistic, or LLM-synthesized training scenarios
 * complete with multi-drone formations, telemetry, and specific training objectives.
 */

class AIScenarioGenerator {
  constructor() {
    this.scenarioThemes = [
      {
        id: 'airport_perimeter',
        title: 'Commercial Runway Approach Violation',
        category: 'Perimeter Breach',
        baseThreat: 'High',
        dronesCount: 1,
        promptTemplate: 'A commercial cargo drone drifting off assigned flight corridor toward active civilian runway approach sector.'
      },
      {
        id: 'vip_summit',
        title: 'VIP Diplomatic Summit Overflight Probe',
        category: 'Targeted Surveillance',
        baseThreat: 'Critical',
        dronesCount: 2,
        promptTemplate: 'Two synchronized unidentified quadcopters hovering above perimeter security security fence during high-level summit.'
      },
      {
        id: 'power_grid',
        title: 'Critical Energy Substation Incursion',
        category: 'Infrastructure Protection',
        baseThreat: 'High',
        dronesCount: 1,
        promptTemplate: 'High-speed fixed-wing UAV conducting low-altitude reconnaissance over high-voltage electrical substation.'
      },
      {
        id: 'harbor_shipping',
        title: 'Maritime Port Container Terminal Swarm',
        category: 'Swarm / Multi-Vector',
        baseThreat: 'Critical',
        dronesCount: 3,
        promptTemplate: 'Three micro-FPV drones executing synchronized distributed flight paths over deep-water container terminal.'
      },
      {
        id: 'medical_corridor',
        title: 'Emergency Medical Transit (Compliance Test)',
        category: 'Authorized / Friendly',
        baseThreat: 'Low',
        dronesCount: 1,
        promptTemplate: 'Certified urgent medical organ delivery drone navigating along designated emergency corridor with valid Remote ID.'
      }
    ];

    this.airframeTypes = [
      { type: 'Quadcopter Tactical', baseSpeed: 45, altitude: 85, rcs: 0.04, rf: '2.4 GHz ISM' },
      { type: 'Fixed-Wing Talon', baseSpeed: 95, altitude: 160, rcs: 0.14, rf: '5.8 GHz Encrypted' },
      { type: 'Hexacopter Heavy', baseSpeed: 55, altitude: 110, rcs: 0.18, rf: '915 MHz Long-Range' },
      { type: 'Micro-FPV Agile', baseSpeed: 110, altitude: 45, rcs: 0.02, rf: '5.8 GHz Analog / FHSS' }
    ];
  }

  /**
   * Generates a scenario based on user input or automated training requirements.
   * Uses Gemini API via aiService if available, otherwise procedural synthesis.
   */
  async generate(options = {}) {
    const difficulty = options.difficulty || 'High Risk';
    const customPrompt = options.prompt || '';
    const category = options.category || 'Dynamic Training';
    const targetedWeakness = options.targetedWeakness || null;

    // Check if Live AI is available
    if (window.aiService && window.aiService.isLiveAIAvailable() && customPrompt) {
      try {
        const generated = await this._generateWithGemini(customPrompt, difficulty, category);
        if (generated) return generated;
      } catch (err) {
        console.warn('AI Scenario Generator: Gemini generation error, using procedural engine:', err);
      }
    }

    // Built-in intelligent procedural generation
    return this._generateProcedural(options);
  }

  _generateProcedural(options = {}) {
    const difficulty = options.difficulty || 'High Risk';
    const userPrompt = options.prompt ? options.prompt.trim() : '';
    const theme = this.scenarioThemes[Math.floor(Math.random() * this.scenarioThemes.length)];
    const airframe = this.airframeTypes[Math.floor(Math.random() * this.airframeTypes.length)];

    const idSuffix = Math.floor(100 + Math.random() * 900);
    const scenarioId = `ai-gen-${Date.now().toString(36)}-${idSuffix}`;

    let droneCount = options.droneCount || (difficulty === 'Critical Threat' ? 3 : difficulty === 'High Risk' ? (Math.random() > 0.5 ? 2 : 1) : 1);
    if (options.targetedWeakness === 'Swarm Identification') droneCount = 3;

    // Determine threat level from difficulty
    let threatLevel = 'High';
    if (difficulty === 'Critical Threat' || droneCount > 2) threatLevel = 'Critical';
    else if (difficulty === 'Moderate Risk') threatLevel = 'Moderate';
    else if (difficulty === 'Low / Safe') threatLevel = 'Low';

    const startBearingDeg = Math.floor(Math.random() * 360);
    const startBearingRad = (startBearingDeg * Math.PI) / 180;
    const distanceNorm = 0.82 + Math.random() * 0.12;

    const startX = Math.sin(startBearingRad) * distanceNorm;
    const startY = -Math.cos(startBearingRad) * distanceNorm;

    // Calculate heading toward center with slight variance
    const angleToCenterDeg = (Math.atan2(-startY, -startX) * 180 / Math.PI + 360) % 360;

    const drones = [];
    for (let i = 0; i < droneCount; i++) {
      const droneId = `AI-UAV-${Math.floor(100 + Math.random() * 900)}${droneCount > 1 ? `-${String.fromCharCode(65 + i)}` : ''}`;
      const offsetDist = i * 0.08;
      const dX = startX + (i % 2 === 0 ? offsetDist : -offsetDist);
      const dY = startY + (i * 0.06);

      const speed = Math.round(airframe.baseSpeed * (0.85 + Math.random() * 0.35));
      const altitude = Math.round(airframe.altitude * (0.8 + Math.random() * 0.4));

      let pattern = 'direct_incursion';
      if (threatLevel === 'Critical' && droneCount > 1) pattern = 'swarm_formation';
      else if (Math.random() > 0.5) pattern = 'zigzag_evasion';
      else if (threatLevel === 'Moderate') pattern = 'hover_loiter';
      else if (threatLevel === 'Low') pattern = 'linear_corridor';

      const trajectory = this._synthesizeTrajectory(dX, dY, pattern);

      const remoteId = threatLevel === 'Low'
        ? `FAA-RID-VALID-${Math.floor(1000 + Math.random() * 9000)}-CERT`
        : Math.random() > 0.5 ? 'BROADCAST_DISABLED' : 'UNREGISTERED_ANON_HEX';

      drones.push({
        id: droneId,
        name: `${airframe.type} (${droneId})`,
        type: airframe.type,
        threatLevel: threatLevel,
        initialPos: { x: dX, y: dY },
        speedKmh: speed,
        altitudeM: altitude,
        headingDeg: Math.round(angleToCenterDeg),
        headingText: `${Math.round(angleToCenterDeg)}°`,
        rfFrequency: airframe.rf,
        rcsM2: parseFloat((airframe.rcs * (0.9 + Math.random() * 0.3)).toFixed(3)),
        remoteId: remoteId,
        opticalConfidence: parseFloat((0.88 + Math.random() * 0.1).toFixed(2)),
        acousticDb: Math.round(45 + Math.random() * 25),
        flightPattern: pattern,
        trajectory: trajectory,
        aiContext: {
          geofenceBreach: threatLevel !== 'Low',
          vectorThreat: `Procedurally generated vector approaching via ${Math.round(angleToCenterDeg)}° bearing.`,
          transponderAnomaly: remoteId.includes('VALID') ? 'Validated remote ID certificate.' : 'Non-compliant or absent remote ID broadcast.',
          kinematicAssessment: `Evaluated at ${speed} km/h and ${altitude}m AGL.`
        }
      });
    }

    const title = userPrompt
      ? `AI Drill: ${userPrompt.slice(0, 42)}...`
      : `AI Simulation: ${theme.title} [${idSuffix}]`;

    return {
      id: scenarioId,
      title: title,
      subtitle: `AI synthesized ${threatLevel.toLowerCase()} threat drill with ${droneCount} contact(s)`,
      category: options.category || theme.category,
      difficulty: difficulty,
      baseThreatLevel: threatLevel,
      description: userPrompt || theme.promptTemplate,
      duration: 60,
      primaryZone: threatLevel === 'Critical' ? 'Multi-Sector Incursion' : 'Perimeter Defense Zone',
      initialRiskScore: threatLevel === 'Critical' ? 92 : threatLevel === 'High' ? 76 : threatLevel === 'Moderate' ? 52 : 18,
      drones: drones,
      generatedBy: 'AeroShield Procedural Generator',
      generationTime: new Date().toLocaleTimeString()
    };
  }

  async _generateWithGemini(userPrompt, difficulty, category) {
    const systemPrompt = `You are an aerospace defense simulation scenario architect. Generate a realistic, educational, safe simulated drone threat scenario. Return ONLY valid JSON adhering to the specified schema. NEVER include weapon targeting, real kinetic attacks, or instructions for harming real drones. Non-kinetic civil airspace defense only.`;

    const userInstruction = `Generate a realistic simulated drone threat training scenario based on this premise: "${userPrompt}". Difficulty: ${difficulty}, Category: ${category}. Return JSON format with fields: title (string), description (string), threatLevel ('Critical'|'High'|'Moderate'|'Low'), airframeType ('Quadcopter Tactical'|'Fixed-Wing Talon'|'Hexacopter Heavy'|'Micro-FPV Agile'), speedKmh (number 30-130), altitudeM (number 30-250), flightPattern ('direct_incursion'|'zigzag_evasion'|'hover_loiter'|'swarm_formation'|'linear_corridor').`;

    const result = await window.aiService.generateCompletion(userInstruction, systemPrompt);
    if (!result || !result.text) return null;

    try {
      // Clean JSON formatting
      const cleanJson = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const scenarioId = `ai-llm-${Date.now().toString(36)}`;
      const startX = -0.75;
      const startY = -0.65;

      return {
        id: scenarioId,
        title: parsed.title || `AI Scenario: ${userPrompt.slice(0, 36)}`,
        subtitle: `Gemini AI generated ${parsed.threatLevel || 'High'} threat drill`,
        category: category,
        difficulty: difficulty,
        baseThreatLevel: parsed.threatLevel || 'High',
        description: parsed.description || userPrompt,
        duration: 60,
        primaryZone: 'Configured Sector',
        initialRiskScore: parsed.threatLevel === 'Critical' ? 94 : parsed.threatLevel === 'High' ? 78 : 45,
        drones: [
          {
            id: `UAV-AI-${Math.floor(100 + Math.random() * 900)}`,
            name: parsed.airframeType || 'Quadcopter Tactical',
            type: parsed.airframeType || 'Quadcopter Tactical',
            threatLevel: parsed.threatLevel || 'High',
            initialPos: { x: startX, y: startY },
            speedKmh: parseFloat(parsed.speedKmh || 65),
            altitudeM: parseFloat(parsed.altitudeM || 110),
            headingDeg: 135,
            headingText: '135° SE',
            rfFrequency: '5.8 GHz Encrypted',
            rcsM2: 0.08,
            remoteId: parsed.threatLevel === 'Low' ? 'FAA-RID-VALID' : 'BROADCAST_DISABLED',
            opticalConfidence: 0.94,
            acousticDb: 52,
            flightPattern: parsed.flightPattern || 'direct_incursion',
            trajectory: this._synthesizeTrajectory(startX, startY, parsed.flightPattern || 'direct_incursion'),
            aiContext: {
              geofenceBreach: true,
              vectorThreat: 'LLM generated vector targeting security buffer.',
              transponderAnomaly: 'Evaluated by neural synthesis.',
              kinematicAssessment: `${parsed.speedKmh || 65} km/h at ${parsed.altitudeM || 110}m.`
            }
          }
        ],
        generatedBy: `Google Gemini (${result.model})`,
        generationTime: new Date().toLocaleTimeString()
      };
    } catch (e) {
      console.warn('Failed to parse Gemini scenario JSON, falling back to procedural:', e);
      return null;
    }
  }

  _synthesizeTrajectory(startX, startY, pattern) {
    if (pattern === 'linear_corridor') {
      return [
        { x: startX, y: startY },
        { x: startX * 0.5, y: startY * 0.5 },
        { x: -startX * 0.2, y: -startY * 0.2 },
        { x: -startX * 0.8, y: -startY * 0.8 }
      ];
    }
    if (pattern === 'hover_loiter') {
      return [
        { x: startX, y: startY },
        { x: startX * 0.9, y: startY * 0.85 },
        { x: startX * 0.85, y: startY * 0.95 },
        { x: startX * 0.8, y: startY * 0.8 }
      ];
    }
    if (pattern === 'zigzag_evasion') {
      return [
        { x: startX, y: startY },
        { x: startX * 0.7 + 0.15, y: startY * 0.7 - 0.15 },
        { x: startX * 0.45 - 0.15, y: startY * 0.45 + 0.15 },
        { x: startX * 0.2 + 0.1, y: startY * 0.2 - 0.1 },
        { x: 0.04, y: 0.04 }
      ];
    }
    // Default direct incursion
    return [
      { x: startX, y: startY },
      { x: startX * 0.65, y: startY * 0.65 },
      { x: startX * 0.35, y: startY * 0.35 },
      { x: 0.03, y: 0.03 }
    ];
  }
}

if (typeof window !== 'undefined') {
  window.aiScenarioGenerator = new AIScenarioGenerator();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIScenarioGenerator };
}
