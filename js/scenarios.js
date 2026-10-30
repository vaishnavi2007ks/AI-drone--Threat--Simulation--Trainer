/**
 * Scenario Definitions and Simulation Presets
 * Safe educational data models for aerial threat simulation.
 */

const SCENARIOS = [
  {
    id: 'restricted-area',
    title: 'Drone Entering Restricted Airspace',
    subtitle: 'Direct high-speed vector toward no-fly government sector',
    category: 'Perimeter Breach',
    difficulty: 'High Risk',
    baseThreatLevel: 'High',
    description: 'A commercial-class fixed-wing UAV has breached the outer 3km security buffer and is maintaining a direct velocity vector toward the primary restricted no-fly zone without transponder broadcast.',
    duration: 60, // seconds
    primaryZone: 'Zone Red (Restricted Core)',
    initialRiskScore: 82,
    drones: [
      {
        id: 'UAV-INTRUDER-91',
        name: 'Fixed-Wing Talon X',
        type: 'Fixed-Wing UAV',
        threatLevel: 'High',
        initialPos: { x: -0.85, y: -0.7 }, // Normalized radar coordinates (-1 to 1)
        speedKmh: 84.5,
        altitudeM: 145,
        headingDeg: 135,
        headingText: '135° SE',
        rfFrequency: '5.8 GHz (Encrypted Video Link)',
        rcsM2: 0.12,
        remoteId: 'BROADCAST_DISABLED',
        opticalConfidence: 0.94,
        acousticDb: 54,
        flightPattern: 'direct_incursion',
        trajectory: [
          { x: -0.85, y: -0.7 },
          { x: -0.55, y: -0.45 },
          { x: -0.25, y: -0.2 },
          { x: -0.05, y: -0.05 }
        ],
        aiContext: {
          geofenceBreach: true,
          vectorThreat: 'Direct approach to high-security perimeter',
          transponderAnomaly: 'Missing FAA Remote ID broadcast',
          kinematicAssessment: 'Non-standard steady descent profile at 85 km/h'
        }
      }
    ]
  },
  {
    id: 'unknown-drone',
    title: 'Unknown Drone Detected',
    subtitle: 'Unregistered transponder hovering near outer boundary',
    category: 'Unidentified Contact',
    difficulty: 'Moderate Risk',
    baseThreatLevel: 'Moderate',
    description: 'An unidentified multirotor drone has appeared at the radar horizon. It has no valid Remote ID certificate and is hovering intermittently just outside the facility advisory boundary.',
    duration: 60,
    primaryZone: 'Zone Amber (Advisory Perimeter)',
    initialRiskScore: 58,
    drones: [
      {
        id: 'GHOST-UAV-04',
        name: 'Commercial Quadcopter',
        type: 'Quadcopter',
        threatLevel: 'Moderate',
        initialPos: { x: 0.65, y: -0.65 },
        speedKmh: 28.0,
        altitudeM: 88,
        headingDeg: 220,
        headingText: '220° SW',
        rfFrequency: '2.4 GHz (Standard ISM Band)',
        rcsM2: 0.04,
        remoteId: 'UNREGISTERED_HEX_NIL',
        opticalConfidence: 0.88,
        acousticDb: 42,
        flightPattern: 'hover_loiter',
        trajectory: [
          { x: 0.65, y: -0.65 },
          { x: 0.55, y: -0.58 },
          { x: 0.50, y: -0.62 },
          { x: 0.45, y: -0.50 }
        ],
        aiContext: {
          geofenceBreach: false,
          vectorThreat: 'Loitering on peripheral advisory perimeter line',
          transponderAnomaly: 'Anonymous RF controller handshake',
          kinematicAssessment: 'Stationary hover followed by micro-adjustments'
        }
      }
    ]
  },
  {
    id: 'multiple-drones',
    title: 'Multiple Drones Detected (Coordinated Swarm)',
    subtitle: 'Multi-vector synchronous formation approaching compound',
    category: 'Swarm / Multi-Vector',
    difficulty: 'Critical Threat',
    baseThreatLevel: 'Critical',
    description: 'Three synchronized micro-UAVs flying in tactical V-formation have been detected entering from the eastern sector. Coordinated swarm telemetry suggests synchronized autonomous waypoint routing.',
    duration: 75,
    primaryZone: 'Multiple Sectors (East / North-East)',
    initialRiskScore: 94,
    drones: [
      {
        id: 'SWARM-LEAD-01',
        name: 'Swarm Lead Micro-UAV',
        type: 'Hexacopter Heavy',
        threatLevel: 'Critical',
        initialPos: { x: 0.9, y: 0.1 },
        speedKmh: 62.0,
        altitudeM: 110,
        headingDeg: 270,
        headingText: '270° W',
        rfFrequency: '915 MHz (Mesh Radio Link)',
        rcsM2: 0.08,
        remoteId: 'NON_COMPLIANT_SWARM_SIG',
        opticalConfidence: 0.96,
        acousticDb: 68,
        flightPattern: 'swarm_formation',
        trajectory: [
          { x: 0.9, y: 0.1 },
          { x: 0.6, y: 0.08 },
          { x: 0.3, y: 0.05 },
          { x: 0.05, y: 0.02 }
        ],
        aiContext: {
          geofenceBreach: true,
          vectorThreat: 'Lead node of 3-element coordinated aerial mesh',
          transponderAnomaly: 'Custom ad-hoc packet communication detected',
          kinematicAssessment: 'Coordinated heading and velocity lock across nodes'
        }
      },
      {
        id: 'SWARM-WING-02',
        name: 'Swarm Wing Alpha',
        type: 'Micro-FPV Quad',
        threatLevel: 'Critical',
        initialPos: { x: 0.95, y: 0.28 },
        speedKmh: 62.5,
        altitudeM: 115,
        headingDeg: 270,
        headingText: '270° W',
        rfFrequency: '915 MHz (Mesh Radio Link)',
        rcsM2: 0.03,
        remoteId: 'NON_COMPLIANT_SWARM_SIG',
        opticalConfidence: 0.91,
        acousticDb: 64,
        flightPattern: 'swarm_formation',
        trajectory: [
          { x: 0.95, y: 0.28 },
          { x: 0.65, y: 0.26 },
          { x: 0.35, y: 0.22 },
          { x: 0.1, y: 0.18 }
        ],
        aiContext: {
          geofenceBreach: true,
          vectorThreat: 'Right flank escort node maintaining 45m separation',
          transponderAnomaly: 'Co-channel synchronization signature',
          kinematicAssessment: 'Constant offset trajectory relative to lead unit'
        }
      },
      {
        id: 'SWARM-WING-03',
        name: 'Swarm Wing Beta',
        type: 'Micro-FPV Quad',
        threatLevel: 'Critical',
        initialPos: { x: 0.95, y: -0.08 },
        speedKmh: 61.8,
        altitudeM: 105,
        headingDeg: 270,
        headingText: '270° W',
        rfFrequency: '915 MHz (Mesh Radio Link)',
        rcsM2: 0.03,
        remoteId: 'NON_COMPLIANT_SWARM_SIG',
        opticalConfidence: 0.89,
        acousticDb: 63,
        flightPattern: 'swarm_formation',
        trajectory: [
          { x: 0.95, y: -0.08 },
          { x: 0.65, y: -0.1 },
          { x: 0.35, y: -0.12 },
          { x: 0.1, y: -0.14 }
        ],
        aiContext: {
          geofenceBreach: true,
          vectorThreat: 'Left flank escort node maintaining 45m separation',
          transponderAnomaly: 'Co-channel synchronization signature',
          kinematicAssessment: 'Constant offset trajectory relative to lead unit'
        }
      }
    ]
  },
  {
    id: 'suspicious-pattern',
    title: 'Suspicious Flight Pattern',
    subtitle: 'Zigzag perimeter reconnaissance and sudden erratic descent',
    category: 'Behavioral Anomaly',
    difficulty: 'High Risk',
    baseThreatLevel: 'High',
    description: 'An agile UAV is executing a deliberate zig-zag reconnaissance pattern along the north-western perimeter fence, repeatedly altering altitude between 30m and 180m to evade radar lock.',
    duration: 60,
    primaryZone: 'Zone Northwest (Perimeter)',
    initialRiskScore: 78,
    drones: [
      {
        id: 'RECON-ZIGZAG-19',
        name: 'Custom Agile Quad',
        type: 'Agile Quadrotor',
        threatLevel: 'High',
        initialPos: { x: -0.7, y: 0.6 },
        speedKmh: 52.0,
        altitudeM: 65,
        headingDeg: 45,
        headingText: '045° NE',
        rfFrequency: '2.4 GHz FHSS (Frequency Hopping)',
        rcsM2: 0.05,
        remoteId: 'ID_TRANSPONDER_ERR_CHECKSUM',
        opticalConfidence: 0.92,
        acousticDb: 58,
        flightPattern: 'zigzag_evasion',
        trajectory: [
          { x: -0.7, y: 0.6 },
          { x: -0.4, y: 0.8 },
          { x: -0.3, y: 0.4 },
          { x: 0.0, y: 0.6 },
          { x: 0.1, y: 0.2 }
        ],
        aiContext: {
          geofenceBreach: false,
          vectorThreat: 'Multi-point surveillance raster scan over perimeter',
          transponderAnomaly: 'Spoofed checksum header in broadcast payload',
          kinematicAssessment: 'High-G lateral turns and erratic altitude variations'
        }
      }
    ]
  },
  {
    id: 'authorized-transit',
    title: 'Authorized Commercial Delivery (Control Test)',
    subtitle: 'Registered delivery UAV operating inside designated safe flight corridor',
    category: 'Authorized / Friendly',
    difficulty: 'Safe / Low',
    baseThreatLevel: 'Low',
    description: 'A certified commercial medical/package transport drone operating in compliant airspace with broadcast Remote ID, validated flight plan, and active beacon transponder.',
    duration: 60,
    primaryZone: 'Transit Corridor Charlie',
    initialRiskScore: 12,
    drones: [
      {
        id: 'AERO-LOGIX-402',
        name: 'Civilian Delivery Hexacopter',
        type: 'Certified Delivery Drone',
        threatLevel: 'Low',
        initialPos: { x: -0.8, y: 0.8 },
        speedKmh: 45.0,
        altitudeM: 120,
        headingDeg: 315,
        headingText: '315° NW',
        rfFrequency: 'LTE / 5G C-V2X Telemetry',
        rcsM2: 0.18,
        remoteId: 'FAA-RID-VALID-0982-CERT',
        opticalConfidence: 0.98,
        acousticDb: 40,
        flightPattern: 'linear_corridor',
        trajectory: [
          { x: -0.8, y: 0.8 },
          { x: -0.4, y: 0.4 },
          { x: 0.1, y: -0.1 },
          { x: 0.6, y: -0.6 }
        ],
        aiContext: {
          geofenceBreach: false,
          vectorThreat: 'None. Aligned with authorized civil transit corridor',
          transponderAnomaly: 'Fully validated FAA Remote ID cryptographic signature',
          kinematicAssessment: 'Smooth constant-velocity transit at assigned cruise altitude'
        }
      }
    ]
  }
];

/**
 * Helper to build custom scenario on the fly from user inputs
 */
function createCustomScenario(params) {
  const heading = parseInt(params.heading || 90);
  const rad = (heading * Math.PI) / 180;
  const startDist = 0.85;
  const startX = -Math.cos(rad) * startDist;
  const startY = -Math.sin(rad) * startDist;

  return {
    id: 'custom-' + Date.now(),
    title: params.title || 'User Defined Simulation Scenario',
    subtitle: 'Customized drone parameters for testing AI response',
    category: 'Custom Evaluation',
    difficulty: params.threatLevel === 'Critical' ? 'Critical Threat' : params.threatLevel === 'High' ? 'High Risk' : 'Custom',
    baseThreatLevel: params.threatLevel || 'High',
    description: params.description || `Simulated UAV ${params.droneId} with speed ${params.speed} km/h and altitude ${params.altitude}m.`,
    duration: 60,
    primaryZone: 'Configured Sector',
    initialRiskScore: params.threatLevel === 'Critical' ? 90 : params.threatLevel === 'High' ? 75 : 45,
    drones: [
      {
        id: params.droneId || 'CUSTOM-UAV-01',
        name: params.droneName || 'Custom Evaluation Unit',
        type: params.droneType || 'Quadcopter',
        threatLevel: params.threatLevel || 'High',
        initialPos: { x: startX, y: startY },
        speedKmh: parseFloat(params.speed || 60),
        altitudeM: parseFloat(params.altitude || 100),
        headingDeg: heading,
        headingText: `${heading}°`,
        rfFrequency: params.rf || '2.4 GHz ISM',
        rcsM2: parseFloat(params.rcs || 0.06),
        remoteId: params.remoteId || 'UNKNOWN_OR_ABSENT',
        opticalConfidence: 0.91,
        acousticDb: 50,
        flightPattern: params.pattern || 'direct_incursion',
        trajectory: [
          { x: startX, y: startY },
          { x: startX * 0.6, y: startY * 0.6 },
          { x: startX * 0.2, y: startY * 0.2 },
          { x: 0.05, y: 0.05 }
        ],
        aiContext: {
          geofenceBreach: true,
          vectorThreat: 'User defined test trajectory toward protected sector',
          transponderAnomaly: params.remoteId ? 'User provided transponder string' : 'Missing standard broadcast signature',
          kinematicAssessment: `Evaluated at ${params.speed} km/h and ${params.altitude}m altitude`
        }
      }
    ]
  };
}

if (typeof window !== 'undefined') {
  window.SCENARIOS = SCENARIOS;
  window.createCustomScenario = createCustomScenario;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCENARIOS, createCustomScenario };
}
