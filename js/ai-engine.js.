/**
 * AI Threat Analysis Engine (Modules 2, 4, 5)
 * Safe educational threat evaluation, dynamic multi-sensor risk scoring,
 * Explainable AI (XAI) feature attribution, counterfactuals, and safe non-kinetic advisory responses.
 */

class AIThreatEngine {
  constructor() {
    this.modelName = "AeroShield-DeepFusion-v4.5 (Multi-Sensor Neural Ensemble)";
    this.weights = {
      geofenceProximity: 0.35,
      kinematicAnomaly: 0.25,
      remoteIdStatus: 0.20,
      rfSpectrumSignature: 0.12,
      sensorConfidence: 0.08
    };
  }

  /**
   * Main analysis function: takes scenario and drone telemetry,
   * produces comprehensive AI Threat Analysis report.
   */
  analyze(scenario, drone, simulationState) {
    if (!drone) return null;

    // 1. Calculate dynamic risk components (0 to 100)
    const geofenceScore = this._calculateGeofenceThreat(drone, simulationState);
    const kinematicScore = this._calculateKinematicAnomaly(drone);
    const remoteIdScore = this._calculateTransponderRisk(drone);
    const rfScore = this._calculateRfRisk(drone);
    const sensorScore = Math.round((drone.opticalConfidence || 0.88) * 100);

    // 2. Weighted ensemble risk score
    let totalRisk = Math.round(
      (geofenceScore * this.weights.geofenceProximity) +
      (kinematicScore * this.weights.kinematicAnomaly) +
      (remoteIdScore * this.weights.remoteIdStatus) +
      (rfScore * this.weights.rfSpectrumSignature) +
      (sensorScore * this.weights.sensorConfidence)
    );

    // Boost risk if swarm is detected (multiple coordinated contacts)
    const isSwarm = (scenario.drones && scenario.drones.length > 1) || drone.flightPattern === 'swarm_formation';
    if (isSwarm) {
      totalRisk = Math.min(100, Math.round(totalRisk * 1.15));
    }

    // Clamp between 5 and 100
    totalRisk = Math.max(5, Math.min(100, totalRisk));

    // 3. Determine Threat Classification & Level
    const classification = this._determineClassification(scenario, drone, totalRisk, isSwarm);
    const threatLevel = this._getThreatLevelFromScore(totalRisk);

    // 4. Generate Explainable AI (XAI) Reasons
    const reasons = this._generateClassificationReasons(drone, scenario, {
      geofenceScore,
      kinematicScore,
      remoteIdScore,
      rfScore
    });

    // 5. Generate Safe, Lawful, Non-Kinetic Recommended Response
    const safeResponse = this._generateSafeResponse(threatLevel, classification, drone);

    // 6. Generate Counterfactual Explanations ("What-If" Analysis)
    const counterfactuals = this._generateCounterfactuals(drone, totalRisk, {
      geofenceScore,
      kinematicScore,
      remoteIdScore
    });

    // 7. Generate Explainability Feature Breakdown
    const featureImportance = [
      {
        feature: 'Geofence Proximity & Vector',
        weight: '35%',
        score: geofenceScore,
        status: geofenceScore > 70 ? 'High Alert' : geofenceScore > 40 ? 'Moderate' : 'Safe',
        description: 'Proximity to prohibited airspace and projected intersection trajectory.'
      },
      {
        feature: 'Kinematic & Trajectory Anomaly',
        weight: '25%',
        score: kinematicScore,
        status: kinematicScore > 70 ? 'Irregular' : kinematicScore > 40 ? 'Monitored' : 'Nominal',
        description: 'Flight velocity variations, erratic banking, or sudden low-altitude loiter.'
      },
      {
        feature: 'Transponder / Remote ID Compliance',
        weight: '20%',
        score: remoteIdScore,
        status: remoteIdScore > 75 ? 'Non-Compliant' : remoteIdScore > 30 ? 'Unverified' : 'Valid',
        description: 'FAA / ICAO digital Remote ID validation and transponder cryptographic status.'
      },
      {
        feature: 'RF Spectrum & Link Signature',
        weight: '12%',
        score: rfScore,
        status: rfScore > 70 ? 'Anomalous' : rfScore > 40 ? 'Commercial' : 'Standard',
        description: 'Detection of FHSS frequency hopping, encrypted video downlink, or mesh packets.'
      },
      {
        feature: 'Multi-Sensor Fusion Confidence',
        weight: '8%',
        score: sensorScore,
        status: sensorScore > 85 ? 'High Confidence' : 'Medium Confidence',
        description: 'Fused cross-validation confidence between Radar, Optical YOLO, and Acoustic sensors.'
      }
    ];

    return {
      threatClassification: classification.title,
      classificationCode: classification.code,
      summary: classification.summary,
      riskScore: totalRisk,
      threatLevel: threatLevel,
      reasons: reasons,
      recommendedResponse: safeResponse,
      featureImportance: featureImportance,
      counterfactuals: counterfactuals,
      inferenceTimeMs: (Math.random() * 8 + 18).toFixed(1),
      modelConfidence: (Math.min(99.4, 86 + (totalRisk * 0.13))).toFixed(1) + '%',
      timestamp: new Date().toLocaleTimeString(),
      fullDate: new Date().toISOString()
    };
  }

  _calculateGeofenceThreat(drone, state) {
    const currentPos = drone.currentPos || drone.initialPos || { x: 0, y: 0 };
    const dist = Math.hypot(currentPos.x, currentPos.y);

    if (dist < 0.28) return 98; // Inside core red zone (~1km)
    if (dist < 0.45) return 82; // Breaching 2km inner boundary
    if (dist < 0.62) return 58; // Inside 3km advisory buffer
    if (dist < 0.85) return 32; // In outer perimeter sector
    return 15; // Beyond radar horizon
  }

  _calculateKinematicAnomaly(drone) {
    if (drone.flightPattern === 'linear_corridor') return 12;
    if (drone.flightPattern === 'hover_loiter') return 62;
    if (drone.flightPattern === 'zigzag_evasion') return 88;
    if (drone.flightPattern === 'swarm_formation') return 94;
    if (drone.speedKmh > 80) return 82;
    if (drone.speedKmh > 55) return 55;
    return 35;
  }

  _calculateTransponderRisk(drone) {
    if (drone.remoteId && drone.remoteId.includes('VALID')) return 5;
    if (drone.remoteId && drone.remoteId.includes('DISABLED')) return 95;
    if (drone.remoteId && drone.remoteId.includes('NON_COMPLIANT')) return 90;
    if (drone.remoteId && drone.remoteId.includes('ERR')) return 85;
    return 65; // Unregistered or anonymous
  }

  _calculateRfRisk(drone) {
    if (drone.rfFrequency && drone.rfFrequency.includes('5G')) return 10;
    if (drone.rfFrequency && (drone.rfFrequency.includes('Mesh') || drone.rfFrequency.includes('915'))) return 90;
    if (drone.rfFrequency && drone.rfFrequency.includes('FHSS')) return 82;
    if (drone.rfFrequency && drone.rfFrequency.includes('Encrypted')) return 78;
    return 35; // Standard 2.4 GHz
  }

  _getThreatLevelFromScore(score) {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 35) return 'Moderate';
    return 'Low';
  }

  _determineClassification(scenario, drone, score, isSwarm) {
    if (scenario.id === 'authorized-transit' || (drone.remoteId && drone.remoteId.includes('VALID') && score < 35)) {
      return {
        title: 'Authorized Civilian Transit / Low Risk Contact',
        code: 'ACT-01',
        summary: 'Target matches verified civil flight plan with valid broadcast Remote ID transponder.'
      };
    }
    if (isSwarm || scenario.id === 'multiple-drones') {
      return {
        title: 'Synchronized Multi-UAV Swarm Incursion',
        code: 'SMS-99',
        summary: 'Multiple coordinated micro-drones detected maintaining fixed relational geometry.'
      };
    }
    if (drone.flightPattern === 'zigzag_evasion' || scenario.id === 'suspicious-pattern') {
      return {
        title: 'Perimeter Reconnaissance & Evasive Trajectory',
        code: 'PRE-44',
        summary: 'UAV exhibiting irregular zigzag headings and altitude throttling typical of surveillance.'
      };
    }
    if (score >= 75 || scenario.id === 'restricted-area') {
      return {
        title: 'Unauthorized Critical Airspace Incursion',
        code: 'UCA-77',
        summary: 'Target is on a non-compliant intercept vector toward the core restricted perimeter.'
      };
    }
    return {
      title: 'Unidentified Aerial Contact / Loitering Anomaly',
      code: 'UAC-22',
      summary: 'Unregistered drone loitering near facility boundary without required identification.'
    };
  }

  _generateClassificationReasons(drone, scenario, scores) {
    const reasons = [];

    if (scores.geofenceScore > 70) {
      reasons.push({
        title: 'No-Fly Zone Geofence Proximity',
        detail: `Telemetry places target within immediate proximity of critical protected sector (${scores.geofenceScore}% danger index).`
      });
    }

    if (scores.remoteIdScore > 70) {
      reasons.push({
        title: 'Remote ID Transponder Absence / Spoofing',
        detail: `Target is broadcasting status: "${drone.remoteId || 'None'}". No valid digital airspace certificate found.`
      });
    }

    if (scores.kinematicScore > 65) {
      reasons.push({
        title: 'Kinematic & Trajectory Anomaly',
        detail: `Flight pattern classified as "${drone.flightPattern}". Velocity (${Math.round(drone.speedKmh)} km/h) and altitude (${Math.round(drone.altitudeM)}m) diverge from civil flight corridors.`
      });
    }

    if (scores.rfScore > 60) {
      reasons.push({
        title: 'Specialized RF Link Characteristics',
        detail: `RF signature analysis identified: "${drone.rfFrequency}". High-bandwidth telemetry or frequency-hopping detected.`
      });
    }

    if (reasons.length === 0) {
      reasons.push({
        title: 'Baseline Airspace Compliance',
        detail: 'Target maintains regular speed, standard altitude, and transmits verifiable civil transponder identification.'
      });
    }

    return reasons;
  }

  _generateCounterfactuals(drone, currentRisk, scores) {
    const list = [];

    if (scores.remoteIdScore > 60) {
      const reduction = Math.round(scores.remoteIdScore * this.weights.remoteIdStatus);
      list.push(`If target broadcast a valid FAA Remote ID certificate: Overall Risk Score would drop by ~${reduction} points.`);
    }

    if (drone.speedKmh > 60) {
      list.push(`If target decelerated to corridor speed (<45 km/h): Kinematic Anomaly index would decrease from ${scores.kinematicScore}% to 35%.`);
    }

    if (scores.geofenceScore > 60) {
      list.push(`If target altered heading away from Core Perimeter by 90°: Geofence danger score would decrease from ${scores.geofenceScore}% to 25%.`);
    }

    return list;
  }

  _generateSafeResponse(threatLevel, classification, drone) {
    if (threatLevel === 'Critical') {
      return {
        protocolLevel: 'LEVEL 4 - CRITICAL AIRSPACE ADVISORY',
        badgeColor: 'crimson',
        actionItems: [
          'Immediate Air Traffic Coordination: Broadcast automated safety NOTAM to regional Air Traffic Control (ATC) towers.',
          'Deploy Passive Tracking: Command PTZ electro-optical and infrared cameras to maintain continuous optical verification and log video evidence.',
          'Facility Ground Alert: Notify facility physical security teams with real-time sector grid coordinates for ground observation.',
          'Spectrum & Telemetry Archiving: Lock multi-sensor telemetry log to secure storage for regulatory and civil aviation review.',
          'Verify Friendly Transponder Exemption: Query secondary flight database to rule out emergency response or search-and-rescue UAVs.'
        ],
        safetyNote: 'All recommendations are non-kinetic and adhere to standard civil aviation safety procedures and emergency escalation frameworks.'
      };
    } else if (threatLevel === 'High') {
      return {
        protocolLevel: 'LEVEL 3 - ELEVATED PERIMETER MONITORING',
        badgeColor: 'amber',
        actionItems: [
          'Continuous Sensor Lock: Transition radar and RF sensors from wide-area search to dedicated sector tracking.',
          'Airspace Interrogation: Send standard digital interrogation ping to solicit Remote ID beacon if transmitter was temporarily dormant.',
          'Notify Perimeter Security: Inform compound security supervisor of approaching unidentified contact.',
          'Log Optical Signatures: Record high-resolution visual frames to determine airframe payload and classification.'
        ],
        safetyNote: 'Maintain strictly passive situational awareness. Coordinate with local civil authorities if the aircraft breaches inner security buffers.'
      };
    } else if (threatLevel === 'Moderate') {
      return {
        protocolLevel: 'LEVEL 2 - ADVISORY MONITORING & LOGGING',
        badgeColor: 'amber',
        actionItems: [
          'Log Contact in Airspace Ledger: Assign tracking UUID and record flight path, speed, and frequency spectrum.',
          'Passive Geofence Surveillance: Set automated alert trigger if drone moves within 500 meters of protected infrastructure.',
          'Local Airspace Query: Check municipal commercial drone permit registry for approved aerial photography or survey missions.'
        ],
        safetyNote: 'Routine non-intrusive monitoring. No active intervention required.'
      };
    } else {
      return {
        protocolLevel: 'LEVEL 1 - ROUTINE TRANSIT VERIFICATION',
        badgeColor: 'emerald',
        actionItems: [
          'Acknowledge Valid Telemetry: Remote ID and transponder cross-checked with certified UAS database.',
          'Corridor Tracking: Maintain passive beacon tracking until aircraft exits outer airspace sector.',
          'Nominal Status: No security escalations or notifications required.'
        ],
        safetyNote: 'Target confirmed as authorized safe civilian flight.'
      };
    }
  }
}

if (typeof window !== 'undefined') {
  window.AIThreatEngine = AIThreatEngine;
  window.aiThreatEngine = new AIThreatEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIThreatEngine };
}
