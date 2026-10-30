/**
 * AI Adaptive Difficulty & Progression Engine (Module 9)
 * Profiles trainee competency over time, manages rank levels, and dynamically
 * scales challenge factors (speed, decoys, sensor noise) to match skill growth.
 */

class AIAdaptiveDifficulty {
  constructor() {
    this.storageKey = 'aeroshield_trainee_profile_v1';
    this.profile = this._loadProfile();
  }

  _loadProfile() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Adaptive difficulty: Storage load error', e);
    }

    return {
      traineeName: 'Operator-101',
      experiencePoints: 320,
      simulationsCompleted: 5,
      currentRank: 'Defense Operator', // 'Cadet Trainee' | 'Defense Operator' | 'Senior Tactical Specialist'
      rankLevel: 2,
      averageScore: 82,
      weaknesses: ['Swarm Identification'],
      recentScores: [78, 85, 80, 92, 75]
    };
  }

  saveProfile() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Adaptive difficulty: Storage save error', e);
    }
  }

  /**
   * Updates trainee stats following a completed simulation.
   */
  recordSimulationResult(evalReport) {
    const score = evalReport.overallScore || 75;
    this.profile.simulationsCompleted += 1;
    this.profile.recentScores.unshift(score);
    if (this.profile.recentScores.length > 10) this.profile.recentScores.pop();

    // Recompute average
    const sum = this.profile.recentScores.reduce((a, b) => a + b, 0);
    this.profile.averageScore = Math.round(sum / this.profile.recentScores.length);

    // XP calculation
    const xpGained = Math.round(score * 1.5);
    this.profile.experiencePoints += xpGained;

    // Track weakness
    if (evalReport.targetedWeakness) {
      if (!this.profile.weaknesses.includes(evalReport.targetedWeakness)) {
        this.profile.weaknesses.push(evalReport.targetedWeakness);
      }
    } else if (score >= 85 && this.profile.weaknesses.length > 0) {
      this.profile.weaknesses.shift(); // Overcame oldest weakness
    }

    // Rank progression check
    if (this.profile.averageScore >= 85 && this.profile.simulationsCompleted >= 4) {
      this.profile.rankLevel = 3;
      this.profile.currentRank = 'Senior Tactical Specialist';
    } else if (this.profile.averageScore >= 68) {
      this.profile.rankLevel = 2;
      this.profile.currentRank = 'Defense Operator';
    } else {
      this.profile.rankLevel = 1;
      this.profile.currentRank = 'Cadet Trainee';
    }

    this.saveProfile();
    return {
      rank: this.profile.currentRank,
      rankLevel: this.profile.rankLevel,
      xpGained: xpGained,
      averageScore: this.profile.averageScore
    };
  }

  /**
   * Returns dynamically adjusted difficulty multipliers for the next scenario.
   */
  getDifficultyModifiers() {
    if (this.profile.rankLevel === 3) {
      return {
        speedMultiplier: 1.25,
        droneCount: 3,
        sensorNoise: 0.12,
        recommendedDifficulty: 'Critical Threat',
        badgeColor: 'crimson',
        notes: 'High speed, frequency hopping (FHSS), multi-target swarm coordination.'
      };
    } else if (this.profile.rankLevel === 2) {
      return {
        speedMultiplier: 1.0,
        droneCount: 1,
        sensorNoise: 0.05,
        recommendedDifficulty: 'High Risk',
        badgeColor: 'amber',
        notes: 'Nominal operational pace with evasive waypoint maneuvers.'
      };
    } else {
      return {
        speedMultiplier: 0.8,
        droneCount: 1,
        sensorNoise: 0.0,
        recommendedDifficulty: 'Moderate Risk',
        badgeColor: 'sky',
        notes: 'Reduced airspeed and clear Remote ID transponder tracking for cadets.'
      };
    }
  }

  getRankBadgeClass() {
    if (this.profile.rankLevel === 3) return 'bg-red-950/80 border-red-500 text-red-300';
    if (this.profile.rankLevel === 2) return 'bg-amber-950/80 border-amber-500 text-amber-300';
    return 'bg-sky-950/80 border-sky-500 text-sky-300';
  }
}

if (typeof window !== 'undefined') {
  window.aiAdaptive = new AIAdaptiveDifficulty();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAdaptiveDifficulty };
}
