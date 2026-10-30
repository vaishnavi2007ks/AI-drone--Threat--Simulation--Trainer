/**
 * AI Threat Prediction Engine
 * Kinematic trajectory forecasting, Estimated Time to Breach (ETB) computation,
 * arrival probability cones, and evasive maneuver prediction.
 */

class AIThreatPredictor {
  constructor() {
    this.forecastHorizonsSec = [5, 15, 30]; // Time horizons in seconds
    this.corePerimeterRadius = 0.28; // Normalized radar radius for Zone Red (~1km)
    this.advisoryRadius = 0.62;      // Normalized radar radius for Zone Amber (~3km)
  }

  /**
   * Forecasts the future kinematic state and breach timeline for a drone.
   * @param {Object} drone - Current active drone telemetry object
   * @param {Object} scenario - Current scenario context
   * @param {Number} simProgress - Simulation progress (0 to 1)
   * @param {Number} simDuration - Scenario duration in seconds
   * @returns {Object} Comprehensive predictive threat assessment
   */
  predict(drone, scenario, simProgress, simDuration = 60) {
    if (!drone) return null;

    const currentPos = drone.currentPos || drone.initialPos || { x: 0, y: 0 };
    const currentDist = Math.hypot(currentPos.x, currentPos.y);
    const speedKmh = drone.speedKmh || 50;
    const headingDeg = drone.headingDeg || 0;
    const headingRad = (headingDeg * Math.PI) / 180;

    // Convert speed km/h to normalized radar units per second
    // Radar radius = 5.5 km. Speed in km/s = speedKmh / 3600
    // Normalized velocity = (speedKmh / 3600) / 5.5 = speedKmh / 19800
    const speedNormPerSec = speedKmh / 19800;

    // Velocity vector components (Cartesian, North is -Y in screen canvas, East is +X)
    const vx = Math.sin(headingRad) * speedNormPerSec;
    const vy = -Math.cos(headingRad) * speedNormPerSec;

    // 1. Compute multi-horizon future points
    const forecastPoints = this.forecastHorizonsSec.map(sec => {
      // Interpolate along remaining trajectory if waypoints exist, else extrapolate by velocity vector
      let futureX, futureY;

      if (drone.trajectory && drone.trajectory.length > 1) {
        const remainingTimeSec = Math.max(0.1, simDuration * (1 - simProgress));
        const futureProgress = Math.min(1, simProgress + (sec / simDuration));
        const trajPoint = this._interpolateFromTrajectory(drone.trajectory, futureProgress);
        futureX = trajPoint.x;
        futureY = trajPoint.y;
      } else {
        futureX = currentPos.x + vx * sec;
        futureY = currentPos.y + vy * sec;
      }

      const distFromHQ = Math.hypot(futureX, futureY);
      return {
        secondsAhead: sec,
        x: futureX,
        y: futureY,
        distanceKm: (distFromHQ * 5.5).toFixed(2),
        isInsideCore: distFromHQ <= this.corePerimeterRadius,
        isInsideAdvisory: distFromHQ <= this.advisoryRadius
      };
    });

    // 2. Compute Estimated Time to Breach (ETB)
    const etbAdvisorySec = this._calculateTimeToRadius(currentPos, vx, vy, currentDist, this.advisoryRadius, speedNormPerSec);
    const etbCoreSec = this._calculateTimeToRadius(currentPos, vx, vy, currentDist, this.corePerimeterRadius, speedNormPerSec);

    // 3. Breach Probability Calculation (0 to 100%)
    let coreBreachProb = 0;
    let advisoryBreachProb = 0;

    if (currentDist <= this.corePerimeterRadius) {
      coreBreachProb = 100;
      advisoryBreachProb = 100;
    } else if (currentDist <= this.advisoryRadius) {
      advisoryBreachProb = 100;
      // Probability based on convergence vector
      const convergence = this._calculateConvergence(currentPos, vx, vy);
      coreBreachProb = Math.min(99, Math.max(10, Math.round(convergence * 100)));
    } else {
      const convergence = this._calculateConvergence(currentPos, vx, vy);
      advisoryBreachProb = Math.min(99, Math.max(15, Math.round(convergence * 95)));
      coreBreachProb = Math.min(95, Math.max(5, Math.round(convergence * 75)));
    }

    if (drone.flightPattern === 'linear_corridor') {
      coreBreachProb = Math.min(12, coreBreachProb);
      advisoryBreachProb = Math.min(25, advisoryBreachProb);
    }

    // 4. Evasive Maneuver Anomaly Index
    const evasiveIndex = this._calculateEvasiveIndex(drone);

    // 5. Projected Breach Sector Label
    const bearingToHQ = (Math.atan2(-currentPos.y, -currentPos.x) * 180 / Math.PI + 360) % 360;
    const projectedSector = this._getSectorLabel(bearingToHQ);

    return {
      droneId: drone.id,
      currentDistKm: (currentDist * 5.5).toFixed(2),
      speedKmh: speedKmh,
      headingDeg: headingDeg,
      forecastPoints: forecastPoints,
      etbAdvisorySec: etbAdvisorySec !== null ? Math.round(etbAdvisorySec) : null,
      etbCoreSec: etbCoreSec !== null ? Math.round(etbCoreSec) : null,
      coreBreachProb: coreBreachProb,
      advisoryBreachProb: advisoryBreachProb,
      evasiveIndex: evasiveIndex,
      projectedSector: projectedSector,
      summaryText: this._generatePredictionSummary(etbCoreSec, etbAdvisorySec, coreBreachProb, projectedSector, drone)
    };
  }

  _interpolateFromTrajectory(traj, progress) {
    if (!traj || traj.length === 0) return { x: 0, y: 0 };
    if (traj.length === 1) return traj[0];
    const segmentCount = traj.length - 1;
    const scaledProgress = Math.min(0.9999, Math.max(0, progress)) * segmentCount;
    const index = Math.floor(scaledProgress);
    const segmentT = scaledProgress - index;

    const p0 = traj[index];
    const p1 = traj[Math.min(index + 1, traj.length - 1)];

    return {
      x: p0.x + (p1.x - p0.x) * segmentT,
      y: p0.y + (p1.y - p0.y) * segmentT
    };
  }

  _calculateTimeToRadius(pos, vx, vy, currentDist, targetRadius, speedNorm) {
    if (currentDist <= targetRadius) return 0; // Already inside
    if (speedNorm <= 0.00001) return null;

    // Vector from drone toward HQ center (0,0) is (-pos.x, -pos.y)
    // Dot product with velocity gives closing speed
    const dx = -pos.x / currentDist;
    const dy = -pos.y / currentDist;
    const closingSpeed = (vx * dx + vy * dy);

    if (closingSpeed <= 0) return null; // Flying away from center

    const distToBoundary = (currentDist - targetRadius);
    const timeSec = distToBoundary / closingSpeed;
    return timeSec > 0 && timeSec < 300 ? timeSec : null;
  }

  _calculateConvergence(pos, vx, vy) {
    const dist = Math.hypot(pos.x, pos.y);
    if (dist <= 0.001) return 1;
    const dirX = -pos.x / dist;
    const dirY = -pos.y / dist;
    const vMag = Math.hypot(vx, vy);
    if (vMag <= 0.00001) return 0.5;

    const normVx = vx / vMag;
    const normVy = vy / vMag;
    const dot = normVx * dirX + normVy * dirY; // Range -1 (away) to +1 (direct center)
    return Math.max(0, (dot + 1) / 2); // 0 to 1
  }

  _calculateEvasiveIndex(drone) {
    if (drone.flightPattern === 'zigzag_evasion') return 88;
    if (drone.flightPattern === 'hover_loiter') return 62;
    if (drone.flightPattern === 'swarm_formation') return 74;
    return 15;
  }

  _getSectorLabel(deg) {
    if (deg >= 337.5 || deg < 22.5) return 'Sector North (000°)';
    if (deg >= 22.5 && deg < 67.5) return 'Sector North-East (045°)';
    if (deg >= 67.5 && deg < 112.5) return 'Sector East (090°)';
    if (deg >= 112.5 && deg < 157.5) return 'Sector South-East (135°)';
    if (deg >= 157.5 && deg < 202.5) return 'Sector South (180°)';
    if (deg >= 202.5 && deg < 247.5) return 'Sector South-West (225°)';
    if (deg >= 247.5 && deg < 292.5) return 'Sector West (270°)';
    return 'Sector North-West (315°)';
  }

  _generatePredictionSummary(etbCore, etbAdvisory, coreProb, sector, drone) {
    if (coreProb <= 15) {
      return `Target trajectory bypasses restricted core perimeter. Nominal civil transit projected along ${sector}.`;
    }
    if (etbCore !== null && etbCore <= 20) {
      return `CRITICAL VECTOR LOCK: Projected Core No-Fly Zone breach in ~${etbCore}s (${coreProb}% confidence) via ${sector}. Immediate escalation recommended.`;
    }
    if (etbAdvisory !== null && etbAdvisory <= 30) {
      return `Target tracking toward 3km Advisory perimeter with breach in ~${etbAdvisory}s. Projected intercept: ${sector}.`;
    }
    return `Active trajectory vector indicates ${coreProb}% probability of entering protected buffer. Monitored along ${sector}.`;
  }
}

if (typeof window !== 'undefined') {
  window.aiPredictor = new AIThreatPredictor();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIThreatPredictor };
}
