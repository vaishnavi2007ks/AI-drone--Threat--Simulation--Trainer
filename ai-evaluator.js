/**
 * AI Trainee Performance Evaluator & Personalized Feedback Engine (Modules 7, 8, 10)
 * Evaluates trainee decision latency, protocol accuracy, regulatory compliance,
 * and generates structured After-Action Review (AAR) debriefing dossiers.
 */

class AITraineeEvaluator {
  constructor() {
    this.sessionStartTime = null;
    this.recordedActions = [];
    this.currentScore = 100;
  }

  startSession(scenario) {
    this.sessionStartTime = performance.now();
    this.recordedActions = [];
    this.currentScore = 100;
  }

  recordAction(actionType, actionLabel, currentDrone, simTimeSec) {
    const reactionTimeSec = this.sessionStartTime ? (performance.now() - this.sessionStartTime) / 1000 : simTimeSec;

    const actionRecord = {
      actionType: actionType,
      actionLabel: actionLabel,
      droneId: currentDrone ? currentDrone.id : 'ALL',
      droneThreatLevel: currentDrone ? currentDrone.threatLevel : 'High',
      simTimeSec: Math.round(simTimeSec),
      reactionTimeSec: parseFloat(reactionTimeSec.toFixed(1)),
      timestamp: new Date().toLocaleTimeString()
    };

    this.recordedActions.push(actionRecord);
    return actionRecord;
  }

  /**
   * Generates a comprehensive performance debrief upon simulation completion.
   */
  async evaluate(scenario, drone, finalRiskScore, totalSimDuration = 60) {
    const actions = this.recordedActions;
    const targetThreat = (drone && drone.threatLevel) || (scenario && scenario.baseThreatLevel) || 'High';

    // 1. Calculate Decision Latency Metric
    let avgLatencySec = 0;
    if (actions.length > 0) {
      const sumLatency = actions.reduce((acc, a) => acc + a.reactionTimeSec, 0);
      avgLatencySec = parseFloat((sumLatency / actions.length).toFixed(1));
    } else {
      avgLatencySec = totalSimDuration; // No actions taken
    }

    // 2. Calculate Protocol Accuracy
    let accuracyScore = 0;
    const actionTypes = actions.map(a => a.actionType);

    if (targetThreat === 'Critical' || targetThreat === 'High') {
      let scoreAcc = 40; // Base presence
      if (actionTypes.includes('ATC_ALERT')) scoreAcc += 25;
      if (actionTypes.includes('PTZ_LOCK')) scoreAcc += 20;
      if (actionTypes.includes('DISPATCH_PATROL')) scoreAcc += 15;
      if (actions.length === 0) scoreAcc = 15; // Inaction penalty
      accuracyScore = Math.min(100, scoreAcc);
    } else if (targetThreat === 'Moderate') {
      let scoreAcc = 50;
      if (actionTypes.includes('INTERROGATE')) scoreAcc += 30;
      if (actionTypes.includes('PTZ_LOCK')) scoreAcc += 20;
      accuracyScore = Math.min(100, scoreAcc);
    } else {
      // Low threat
      let scoreAcc = 90;
      if (actionTypes.includes('ATC_ALERT')) scoreAcc -= 25; // False alarm penalty
      if (actionTypes.includes('INTERROGATE')) scoreAcc += 10;
      accuracyScore = Math.max(20, Math.min(100, scoreAcc));
    }

    // 3. Latency Rating
    let latencyRating = 'Optimal';
    let latencyPenalty = 0;
    if (avgLatencySec > 35) {
      latencyRating = 'Delayed Reaction';
      latencyPenalty = 20;
    } else if (avgLatencySec > 18) {
      latencyRating = 'Moderate Pace';
      latencyPenalty = 10;
    } else {
      latencyRating = 'Rapid (<15s)';
      latencyPenalty = 0;
    }

    // 4. Overall Trainee Score & Grade
    const overallScore = Math.max(10, Math.min(100, Math.round(accuracyScore - latencyPenalty)));
    const grade = this._computeGrade(overallScore);

    // 5. Strengths and Improvement Areas
    const { strengths, improvements, targetedWeakness } = this._deriveInsights(actions, targetThreat, avgLatencySec);

    // 6. Generate Personalized Feedback Debrief (Dual-Mode: Gemini or Evaluator Synthesis)
    const debriefText = await this._generateDebriefText({
      scenarioTitle: scenario.title,
      droneId: drone ? drone.id : 'TARGET',
      targetThreat,
      overallScore,
      grade,
      avgLatencySec,
      actionsCount: actions.length,
      strengths,
      improvements
    });

    return {
      traineeGrade: grade,
      overallScore: overallScore,
      accuracyScore: accuracyScore,
      avgLatencySec: avgLatencySec,
      latencyRating: latencyRating,
      actionsRecorded: actions,
      strengths: strengths,
      improvements: improvements,
      targetedWeakness: targetedWeakness,
      debriefSummary: debriefText,
      evaluationTimestamp: new Date().toLocaleString()
    };
  }

  _computeGrade(score) {
    if (score >= 92) return 'A+ (Distinction)';
    if (score >= 82) return 'A (Proficient)';
    if (score >= 70) return 'B (Competent)';
    if (score >= 55) return 'C (Needs Training)';
    return 'D (Unsatisfactory)';
  }

  _deriveInsights(actions, threatLevel, avgLatency) {
    const strengths = [];
    const improvements = [];
    let targetedWeakness = null;

    const actionTypes = actions.map(a => a.actionType);

    if (actions.length > 0 && avgLatency < 15) {
      strengths.push('Excellent situational awareness with rapid initial escalation under 15 seconds.');
    }
    if (actionTypes.includes('ATC_ALERT') && (threatLevel === 'Critical' || threatLevel === 'High')) {
      strengths.push('Prompt regulatory Air Traffic Control coordination dispatched before perimeter violation.');
    }
    if (actionTypes.includes('PTZ_LOCK')) {
      strengths.push('Maintained continuous passive optical tracking for forensic evidence verification.');
    }

    if (actions.length === 0) {
      improvements.push('Zero defensive counter-measures initiated during incursion. Immediate response required.');
      targetedWeakness = 'Incident Inaction';
    } else {
      if (!actionTypes.includes('ATC_ALERT') && threatLevel === 'Critical') {
        improvements.push('Failed to alert regional civil ATC towers during a critical high-risk incursion.');
        targetedWeakness = 'ATC Coordination';
      }
      if (avgLatency > 25) {
        improvements.push('Response latency was elevated. Target penetrated deeper into advisory zone before first action.');
        targetedWeakness = 'Reaction Speed';
      }
      if (threatLevel === 'Low' && actionTypes.includes('ATC_ALERT')) {
        improvements.push('Unnecessary false alarm: Dispatched regional ATC alert for an authorized certified flight.');
        targetedWeakness = 'Threat Categorization';
      }
    }

    if (strengths.length === 0) {
      strengths.push('Maintained situational surveillance of telemetry stream.');
    }
    if (improvements.length === 0) {
      improvements.push('Continue practicing multi-drone swarm scenarios to maintain low latency under stress.');
    }

    return { strengths, improvements, targetedWeakness };
  }

  async _generateDebriefText(data) {
    // If Gemini is available, generate dynamic instructor review
    if (window.aiService && window.aiService.isLiveAIAvailable()) {
      try {
        const systemPrompt = `You are a certified aerospace defense training instructor evaluating a trainee operator in a simulated counter-drone scenario. 
Produce a concise, professional 3-paragraph After-Action Review (AAR) debriefing based on the trainee's score, reaction latency, and actions taken.
STRICT NON-KINETIC AND EDUCATIONAL ONLY. Format in clean markdown.`;

        const userPrompt = `Trainee Performance Dossier:
Scenario: "${data.scenarioTitle}"
Target Threat: ${data.targetThreat}
Overall Grade: ${data.grade} (${data.overallScore}/100)
Average Response Latency: ${data.avgLatencySec}s
Actions Dispatched: ${data.actionsCount}
Key Strengths: ${data.strengths.join('; ')}
Areas for Improvement: ${data.improvements.join('; ')}`;

        const res = await window.aiService.generateCompletion(userPrompt, systemPrompt);
        if (res && res.text) return res.text;
      } catch (err) {
        console.warn('AI Evaluator: Gemini debrief error, using algorithmic feedback:', err);
      }
    }

    // Built-in intelligent debrief synthesis
    return `### **Instructor After-Action Review (AAR)**
**Mission Assessment: ${data.grade}**
During the simulated **"${data.scenarioTitle}"** scenario involving target contact \`${data.droneId}\` classified as **${data.targetThreat} Threat**, the operator achieved an overall performance rating of **${data.overallScore}/100**.

**Operational Strengths:**
${data.strengths.map(s => `• ${s}`).join('\n')}

**Key Coaching Recommendations:**
${data.improvements.map(i => `• ${i}`).join('\n')}

*Assessment strictly conforms to non-kinetic civil aviation defense standards (ICAO Doc 10019).*`;
  }
}

if (typeof window !== 'undefined') {
  window.aiEvaluator = new AITraineeEvaluator();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AITraineeEvaluator };
}
