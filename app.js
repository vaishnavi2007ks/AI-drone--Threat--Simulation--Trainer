/**
 * Master Application Controller (Modules 1 - 10 Integrated)
 * Coordinates UI tabs, simulation playback loop, radar rendering,
 * AI Threat Engine evaluation, trajectory prediction, trainee defense console,
 * AI Mentor chatbot, and adaptive post-mission debriefing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'home',
    activeScenario: SCENARIOS[0],
    selectedDroneIndex: 0,
    isPlaying: false,
    simTime: 0, // In seconds
    simDuration: 60,
    playbackSpeed: 1,
    simProgress: 0,
    lastFrameTime: performance.now(),
    analysisReport: null,
    currentPrediction: null,
    eventLogs: [],
    radarInstance: null,
    reportManager: null,
    lastEvaluatorReport: null
  };

  // Initialize Report Manager
  const reportManager = new ReportManager();
  window.reportManager = reportManager;
  state.reportManager = reportManager;

  // Initialize Tactical Radar Canvas
  const radar = new TacticalRadar('tactical-radar-canvas');
  window.radar = radar;
  state.radarInstance = radar;

  // DOM Elements cache
  const elements = {
    tabButtons: document.querySelectorAll('[data-tab-target]'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIcon: document.getElementById('sound-icon'),
    soundText: document.getElementById('sound-text'),

    // Live Sim Controls
    btnPlay: document.getElementById('btn-sim-play'),
    btnPlayIcon: document.getElementById('sim-play-icon'),
    btnPause: document.getElementById('btn-sim-pause'),
    btnReset: document.getElementById('btn-sim-reset'),
    speedSelect: document.getElementById('sim-speed-select'),
    simProgressBar: document.getElementById('sim-progress-bar'),
    simTimeCurrent: document.getElementById('sim-time-current'),
    simTimeTotal: document.getElementById('sim-time-total'),

    // Telemetry display elements
    telemetryDroneId: document.getElementById('telemetry-drone-id'),
    telemetryLocation: document.getElementById('telemetry-location'),
    telemetrySpeed: document.getElementById('telemetry-speed'),
    telemetryAltitude: document.getElementById('telemetry-altitude'),
    telemetryDirection: document.getElementById('telemetry-direction'),
    telemetryThreatBadge: document.getElementById('telemetry-threat-badge'),
    telemetryRcs: document.getElementById('telemetry-rcs'),
    telemetryRf: document.getElementById('telemetry-rf'),
    telemetryRemoteId: document.getElementById('telemetry-remote-id'),

    // AI Analysis Display
    aiClassification: document.getElementById('ai-classification'),
    aiClassificationCode: document.getElementById('ai-class-code'),
    aiRiskScoreVal: document.getElementById('ai-risk-score-val'),
    aiRiskGaugeBar: document.getElementById('ai-risk-gauge-bar'),
    aiRiskCategoryBadge: document.getElementById('ai-risk-category-badge'),
    aiReasonsContainer: document.getElementById('ai-reasons-container'),
    aiRecommendationsList: document.getElementById('ai-recommendations-list'),
    aiResponseProtocolBadge: document.getElementById('ai-protocol-badge'),
    aiFeatureImportanceList: document.getElementById('ai-features-list'),
    aiInferenceLatency: document.getElementById('ai-inference-latency'),
    aiCounterfactualsContainer: document.getElementById('ai-counterfactuals-container'),

    // Live Status Bar & Events
    liveStatusLed: document.getElementById('live-status-led'),
    liveStatusText: document.getElementById('live-status-text'),
    liveDetectionTime: document.getElementById('live-detection-time'),
    liveEventFeed: document.getElementById('live-event-feed'),
    droneSelectorContainer: document.getElementById('drone-selector-chips'),

    // Trainee Defense Console HUD (Modules 7 & 8)
    traineeActionCount: document.getElementById('trainee-action-count'),
    traineeRankIndicator: document.getElementById('trainee-rank-indicator'),
    headerTraineeRank: document.getElementById('header-trainee-rank'),
    liveHudEtb: document.getElementById('live-hud-etb'),
    liveHudLatency: document.getElementById('live-hud-latency'),

    // Scenario Selection UI
    scenarioCardsContainer: document.getElementById('scenario-cards-container'),
    customScenarioModal: document.getElementById('custom-scenario-modal'),
    customScenarioForm: document.getElementById('custom-scenario-form'),

    // AI Scenario Generator UI (Module 1 & 10)
    aiScenarioModal: document.getElementById('ai-scenario-generator-modal'),
    aiScenarioForm: document.getElementById('ai-scenario-generator-form'),
    aiGenPrompt: document.getElementById('ai-gen-prompt'),
    aiGenDifficulty: document.getElementById('ai-gen-difficulty'),
    aiGenCategory: document.getElementById('ai-gen-category'),
    aiGenDroneCount: document.getElementById('ai-gen-drone-count'),
    aiGenDroneCountLabel: document.getElementById('ai-gen-drone-count-label'),
    aiGenModeBadge: document.getElementById('ai-gen-mode-badge'),

    // AI Debrief Modal (Modules 7, 8, 10)
    aiDebriefModal: document.getElementById('ai-debrief-modal'),
    debriefScenarioTitle: document.getElementById('debrief-scenario-title'),
    debriefTimestamp: document.getElementById('debrief-timestamp'),
    debriefGradeBadge: document.getElementById('debrief-grade-badge'),
    debriefScore: document.getElementById('debrief-score'),
    debriefLatency: document.getElementById('debrief-latency'),
    debriefActionsCount: document.getElementById('debrief-actions-count'),
    debriefRank: document.getElementById('debrief-rank'),
    debriefStrengths: document.getElementById('debrief-strengths'),
    debriefImprovements: document.getElementById('debrief-improvements'),
    debriefNarrative: document.getElementById('debrief-narrative'),

    // AI Settings Modal
    aiSettingsModal: document.getElementById('ai-settings-modal'),
    aiSettingsApiKey: document.getElementById('ai-settings-api-key'),
    aiSettingsModel: document.getElementById('ai-settings-model'),
    aiSettingsLiveBadge: document.getElementById('ai-settings-live-badge'),
    settingsTraineeRank: document.getElementById('settings-trainee-rank'),
    settingsTraineeSims: document.getElementById('settings-trainee-sims'),
    settingsTraineeAvg: document.getElementById('settings-trainee-avg'),

    // AI Mentor Chatbot Drawer (Module 6)
    aiMentorDrawer: document.getElementById('ai-mentor-drawer'),
    mentorChatMessages: document.getElementById('mentor-chat-messages'),
    mentorChatForm: document.getElementById('mentor-chat-form'),
    mentorChatInput: document.getElementById('mentor-chat-input'),
    mentorEngineBadge: document.getElementById('mentor-engine-badge'),

    // Reports UI
    reportsContainer: document.getElementById('reports-display-container'),
    reportsFilterSelect: document.getElementById('reports-filter-select'),
    reportsSearchInput: document.getElementById('reports-search-input'),
    reportsViewToggle: document.getElementById('reports-view-toggle')
  };

  // Set initial scenario in radar
  radar.setDrones(state.activeScenario.drones);
  state.simDuration = state.activeScenario.duration;

  // Initialize UI & Profiles
  renderScenarioCards();
  updateAdaptiveProfileUI();
  performAIAnalysis();
  updateTelemetryUI();
  updateReportsUI();

  // Initial Event Log entries
  logEvent('System initialized. AeroShield AI Multi-Sensor Defense Matrix online.', 'info');
  logEvent(`Active scenario loaded: "${state.activeScenario.title}"`, 'info');

  /* ==========================================================================
     TAB NAVIGATION SYSTEM
     ========================================================================== */
  function switchTab(tabId) {
    state.currentTab = tabId;

    elements.tabButtons.forEach(btn => {
      const target = btn.getAttribute('data-tab-target');
      if (target === tabId) {
        btn.classList.add('active', 'text-sky-400');
        btn.classList.remove('text-slate-300');
      } else {
        btn.classList.remove('active', 'text-sky-400');
        btn.classList.add('text-slate-300');
      }
    });

    elements.tabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    if (tabId === 'reports') {
      updateReportsUI();
    }

    if (elements.mobileMenu) {
      elements.mobileMenu.classList.add('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-target');
      if (target) switchTab(target);
    });
  });

  window.navigateTo = (tabId) => switchTab(tabId);

  if (elements.mobileMenuBtn && elements.mobileMenu) {
    elements.mobileMenuBtn.addEventListener('click', () => {
      elements.mobileMenu.classList.toggle('hidden');
    });
  }

  /* ==========================================================================
     TACTICAL AUDIO MUTE TOGGLE
     ========================================================================== */
  function updateSoundUI() {
    const isMuted = window.tacticalAudio ? window.tacticalAudio.isMuted : true;
    if (elements.soundText) {
      elements.soundText.textContent = isMuted ? 'Sound: Off' : 'Sound: Tactical';
    }
    if (elements.soundToggleBtn) {
      if (isMuted) {
        elements.soundToggleBtn.classList.remove('border-cyan-500', 'text-cyan-400');
        elements.soundToggleBtn.classList.add('border-slate-700', 'text-slate-400');
      } else {
        elements.soundToggleBtn.classList.add('border-cyan-500', 'text-cyan-400');
        elements.soundToggleBtn.classList.remove('border-slate-700', 'text-slate-400');
      }
    }
  }

  if (elements.soundToggleBtn) {
    elements.soundToggleBtn.addEventListener('click', () => {
      if (window.tacticalAudio) {
        window.tacticalAudio.toggleMute();
        updateSoundUI();
        if (!window.tacticalAudio.isMuted) {
          window.tacticalAudio.playActionBeep();
        }
      }
    });
  }
  updateSoundUI();

  /* ==========================================================================
     SCENARIO SELECTION & SETUP
     ========================================================================== */
  function renderScenarioCards() {
    if (!elements.scenarioCardsContainer) return;

    elements.scenarioCardsContainer.innerHTML = SCENARIOS.map(sc => {
      const isActive = sc.id === state.activeScenario.id;
      let badgeClass = 'badge-moderate';
      if (sc.baseThreatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (sc.baseThreatLevel === 'High') badgeClass = 'badge-high';
      else if (sc.baseThreatLevel === 'Low') badgeClass = 'badge-low';

      return `
        <div class="tactical-card p-5 cursor-pointer relative ${isActive ? 'tactical-card-active' : ''}" onclick="window.selectScenario('${sc.id}')">
          <div class="flex items-start justify-between mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass}">
              ${sc.difficulty}
            </span>
            <span class="text-xs font-mono text-cyan-400">${sc.drones.length} UAV${sc.drones.length > 1 ? 's' : ''}</span>
          </div>

          <h3 class="text-base font-bold text-slate-100 mb-1">${sc.title}</h3>
          <p class="text-xs text-slate-400 mb-4 line-clamp-2">${sc.description}</p>

          <div class="space-y-1.5 text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800/80 mb-4">
            <div class="flex justify-between">
              <span class="text-slate-500">Target Airframe:</span>
              <span class="text-slate-200">${sc.drones[0].type}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Initial Speed:</span>
              <span class="text-cyan-400">${sc.drones[0].speedKmh} km/h</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Altitude:</span>
              <span class="text-slate-200">${sc.drones[0].altitudeM} m AGL</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Target Zone:</span>
              <span class="text-amber-400">${sc.primaryZone}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-800">
            <span class="text-xs font-mono text-slate-500">Scenario ID: ${sc.id}</span>
            <button class="px-3 py-1 text-xs rounded font-medium ${isActive ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'} transition">
              ${isActive ? 'Active Target' : 'Select'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectScenario = (scenarioId) => {
    const sc = SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;

    state.activeScenario = sc;
    state.selectedDroneIndex = 0;
    state.simTime = 0;
    state.simProgress = 0;
    state.simDuration = sc.duration || 60;

    radar.resetTrails();
    radar.setDrones(sc.drones);

    renderScenarioCards();
    updateDroneChips();
    performAIAnalysis();
    updateTelemetryUI();
    resetTraineeConsole();

    logEvent(`Loaded scenario: "${sc.title}" (${sc.drones.length} target(s))`, 'info');

    if (window.tacticalAudio) {
      if (sc.baseThreatLevel === 'Critical' || sc.baseThreatLevel === 'High') {
        window.tacticalAudio.playThreatAlert(sc.baseThreatLevel === 'Critical');
      } else {
        window.tacticalAudio.playActionBeep();
      }
    }
  };

  function updateDroneChips() {
    if (!elements.droneSelectorContainer) return;

    if (state.activeScenario.drones.length <= 1) {
      elements.droneSelectorContainer.innerHTML = '';
      return;
    }

    elements.droneSelectorContainer.innerHTML = `
      <div class="flex items-center space-x-2 pb-2">
        <span class="text-xs font-mono text-slate-400 uppercase tracking-wider">Swarm Targets:</span>
        ${state.activeScenario.drones.map((d, idx) => `
          <button onclick="window.selectDrone(${idx})" class="px-2.5 py-1 text-xs font-mono rounded border transition ${idx === state.selectedDroneIndex ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}">
            ${d.id}
          </button>
        `).join('')}
      </div>
    `;
  }

  window.selectDrone = (droneIndex) => {
    state.selectedDroneIndex = droneIndex;
    const drone = state.activeScenario.drones[droneIndex];
    if (drone) {
      radar.selectedDroneId = drone.id;
      performAIAnalysis();
      updateTelemetryUI();
      logEvent(`Focused tracking on unit ${drone.id}`, 'info');
      if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
    }
    updateDroneChips();
  };

  window.onDroneSelected = (drone) => {
    const idx = state.activeScenario.drones.findIndex(d => d.id === drone.id);
    if (idx !== -1) {
      state.selectedDroneIndex = idx;
      performAIAnalysis();
      updateTelemetryUI();
      updateDroneChips();
    }
  };

  /* ==========================================================================
     AI THREAT ANALYSIS & TRAJECTORY PREDICTION (Modules 2, 3, 4, 5)
     ========================================================================== */
  function performAIAnalysis() {
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    if (!currentDrone) return;

    // 1. AI Threat Evaluation & Classification
    const report = window.aiThreatEngine.analyze(state.activeScenario, currentDrone, state);
    state.analysisReport = report;

    // 2. AI Threat Trajectory Prediction (Module 3)
    const prediction = window.aiPredictor.predict(currentDrone, state.activeScenario, state.simProgress, state.simDuration);
    state.currentPrediction = prediction;
    radar.setPrediction(prediction);

    // Update UI elements with analysis
    if (elements.aiClassification) elements.aiClassification.textContent = report.threatClassification;
    if (elements.aiClassificationCode) elements.aiClassificationCode.textContent = report.classificationCode;
    if (elements.aiRiskScoreVal) elements.aiRiskScoreVal.textContent = report.riskScore;

    if (elements.aiRiskGaugeBar) {
      elements.aiRiskGaugeBar.style.width = `${report.riskScore}%`;
      elements.aiRiskGaugeBar.className = 'h-3 rounded-full transition-all duration-500 ' + 
        (report.riskScore >= 75 ? 'bg-red-500 shadow-lg shadow-red-500/30' : report.riskScore >= 45 ? 'bg-amber-400 shadow-lg shadow-amber-500/30' : 'bg-emerald-400 shadow-lg shadow-emerald-500/30');
    }

    if (elements.aiRiskCategoryBadge) {
      let badgeClass = 'badge-moderate';
      if (report.threatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (report.threatLevel === 'High') badgeClass = 'badge-high';
      else if (report.threatLevel === 'Low') badgeClass = 'badge-low';

      elements.aiRiskCategoryBadge.textContent = `${report.threatLevel} Severity (${report.riskScore}/100)`;
      elements.aiRiskCategoryBadge.className = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`;
    }

    if (elements.aiInferenceLatency) {
      elements.aiInferenceLatency.textContent = `${report.inferenceTimeMs} ms`;
    }

    // Render Reasons
    if (elements.aiReasonsContainer) {
      elements.aiReasonsContainer.innerHTML = report.reasons.map((r, i) => `
        <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/90 flex items-start space-x-3">
          <div class="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5">
            ${i + 1}
          </div>
          <div>
            <h5 class="text-xs font-bold text-slate-200 uppercase tracking-wider mb-0.5">${r.title}</h5>
            <p class="text-xs text-slate-400 leading-relaxed">${r.detail}</p>
          </div>
        </div>
      `).join('');
    }

    // Render Feature Breakdown
    if (elements.aiFeatureImportanceList) {
      elements.aiFeatureImportanceList.innerHTML = report.featureImportance.map(f => `
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-300 font-medium">${f.feature} <span class="text-slate-500">(${f.weight})</span></span>
            <span class="font-mono ${f.score > 70 ? 'text-red-400' : f.score > 40 ? 'text-amber-400' : 'text-emerald-400'} font-bold">${f.score}%</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="h-1.5 rounded-full ${f.score > 70 ? 'bg-red-500' : f.score > 40 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${f.score}%"></div>
          </div>
          <div class="text-[11px] text-slate-500">${f.description}</div>
        </div>
      `).join('');
    }

    // Render Counterfactuals (Module 5)
    if (elements.aiCounterfactualsContainer && report.counterfactuals) {
      elements.aiCounterfactualsContainer.innerHTML = report.counterfactuals.map(cf => `
        <div class="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-start space-x-2 text-slate-300">
          <span class="text-cyan-400 font-bold">›</span>
          <span class="leading-relaxed">${cf}</span>
        </div>
      `).join('');
    }

    // Render Safe Response Checklist
    if (elements.aiRecommendationsList) {
      const resp = report.recommendedResponse;
      if (elements.aiResponseProtocolBadge) {
        elements.aiResponseProtocolBadge.textContent = resp.protocolLevel;
      }

      elements.aiRecommendationsList.innerHTML = resp.actionItems.map((act) => `
        <li class="flex items-start space-x-2 text-xs text-slate-300">
          <svg class="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="leading-relaxed">${act}</span>
        </li>
      `).join('');
    }

    // Update Live Radar HUD with Predicted Breach
    if (elements.liveHudEtb && prediction) {
      if (prediction.coreBreachProb > 60 && prediction.etbCoreSec !== null) {
        elements.liveHudEtb.textContent = `ETB Core: ~${prediction.etbCoreSec}s (${prediction.coreBreachProb}%)`;
        elements.liveHudEtb.className = 'text-red-400 font-bold';
      } else if (prediction.etbAdvisorySec !== null) {
        elements.liveHudEtb.textContent = `ETB Advisory: ~${prediction.etbAdvisorySec}s (${prediction.advisoryBreachProb}%)`;
        elements.liveHudEtb.className = 'text-amber-400 font-bold';
      } else {
        elements.liveHudEtb.textContent = `Clear Corridor (${prediction.coreBreachProb}%)`;
        elements.liveHudEtb.className = 'text-emerald-400 font-bold';
      }
    }
  }

  /* ==========================================================================
     TELEMETRY DISPLAY UPDATES
     ========================================================================== */
  function updateTelemetryUI() {
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    if (!currentDrone) return;

    if (elements.telemetryDroneId) elements.telemetryDroneId.textContent = currentDrone.id;
    if (elements.telemetrySpeed) elements.telemetrySpeed.textContent = `${Math.round(currentDrone.speedKmh)} km/h`;
    if (elements.telemetryAltitude) elements.telemetryAltitude.textContent = `${Math.round(currentDrone.altitudeM)} m AGL`;
    if (elements.telemetryDirection) elements.telemetryDirection.textContent = currentDrone.headingText || `${currentDrone.headingDeg}°`;
    if (elements.telemetryRcs) elements.telemetryRcs.textContent = `${currentDrone.rcsM2 || 0.05} m²`;
    if (elements.telemetryRf) elements.telemetryRf.textContent = currentDrone.rfFrequency || '2.4 GHz';
    if (elements.telemetryRemoteId) elements.telemetryRemoteId.textContent = currentDrone.remoteId || 'BROADCAST_DISABLED';

    const pos = currentDrone.currentPos || currentDrone.initialPos || { x: 0, y: 0 };
    const distKm = (Math.hypot(pos.x, pos.y) * 5.5).toFixed(2);
    const lat = (37.7749 + pos.y * 0.035).toFixed(4);
    const lon = (-122.4194 + pos.x * 0.035).toFixed(4);

    if (elements.telemetryLocation) {
      elements.telemetryLocation.textContent = `[${lat}°, ${lon}°] • ${distKm} km from HQ`;
    }

    let badgeClass = 'badge-moderate';
    if (currentDrone.threatLevel === 'Critical') badgeClass = 'badge-critical';
    else if (currentDrone.threatLevel === 'High') badgeClass = 'badge-high';
    else if (currentDrone.threatLevel === 'Low') badgeClass = 'badge-low';

    if (elements.telemetryThreatBadge) {
      elements.telemetryThreatBadge.textContent = currentDrone.threatLevel;
      elements.telemetryThreatBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${badgeClass}`;
    }

    // Update Live Radar HUD Elements
    const hudDroneId = document.getElementById('live-hud-drone-id');
    const hudSpeed = document.getElementById('live-hud-speed');
    const hudAltitude = document.getElementById('live-hud-altitude');
    const hudHeading = document.getElementById('live-hud-heading');
    const hudDistance = document.getElementById('live-hud-distance');
    const hudRisk = document.getElementById('live-hud-risk');
    const hudThreat = document.getElementById('live-hud-threat');

    if (hudDroneId) hudDroneId.textContent = currentDrone.id;
    if (hudSpeed) hudSpeed.textContent = `${Math.round(currentDrone.speedKmh)} km/h`;
    if (hudAltitude) hudAltitude.textContent = `${Math.round(currentDrone.altitudeM)} m`;
    if (hudHeading) hudHeading.textContent = currentDrone.headingText || `${currentDrone.headingDeg}°`;
    if (hudDistance) hudDistance.textContent = `${distKm} km`;
    if (hudRisk && state.analysisReport) hudRisk.textContent = `${state.analysisReport.riskScore}/100`;
    if (hudThreat) {
      hudThreat.textContent = currentDrone.threatLevel;
      hudThreat.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${badgeClass}`;
    }
  }

  /* ==========================================================================
     TRAINEE DEFENSE CONSOLE & DECISION HANDLING (Modules 7 & 8)
     ========================================================================== */
  function resetTraineeConsole() {
    ['btn-action-atc', 'btn-action-ptz', 'btn-action-rid', 'btn-action-patrol'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('dispatched');
    });
    if (elements.traineeActionCount) elements.traineeActionCount.textContent = '0';
    if (elements.liveHudLatency) elements.liveHudLatency.textContent = '0.0s';
  }

  window.dispatchTraineeAction = (actionType, actionLabel) => {
    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    const record = window.aiEvaluator.recordAction(actionType, actionLabel, currentDrone, state.simTime);

    // Update button visual
    const actionBtnMap = {
      'ATC_ALERT': 'btn-action-atc',
      'PTZ_LOCK': 'btn-action-ptz',
      'INTERROGATE': 'btn-action-rid',
      'DISPATCH_PATROL': 'btn-action-patrol'
    };
    const btn = document.getElementById(actionBtnMap[actionType]);
    if (btn) btn.classList.add('dispatched');

    // Update action count
    if (elements.traineeActionCount) {
      elements.traineeActionCount.textContent = window.aiEvaluator.recordedActions.length;
    }

    logEvent(`[TRAINEE DISPATCH] ${actionLabel} executed (T+${record.reactionTimeSec}s)`, 'success');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  };

  /* ==========================================================================
     SIMULATION PLAYBACK LOOP
     ========================================================================== */
  function startSimulation() {
    state.isPlaying = true;
    window.aiEvaluator.startSession(state.activeScenario);
    resetTraineeConsole();

    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'SIMULATION ACTIVE';
      elements.liveStatusText.className = 'text-xs font-mono text-emerald-400 font-bold';
    }

    logEvent(`Simulation started: target velocity locked at ${state.playbackSpeed}x`, 'info');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  function pauseSimulation() {
    state.isPlaying = false;
    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-amber-400';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'SIMULATION PAUSED';
      elements.liveStatusText.className = 'text-xs font-mono text-amber-400 font-bold';
    }

    logEvent('Simulation paused by operator.', 'warning');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  function resetSimulation() {
    state.isPlaying = false;
    state.simTime = 0;
    state.simProgress = 0;

    radar.resetTrails();
    resetTraineeConsole();

    if (elements.btnPlayIcon) {
      elements.btnPlayIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
    if (elements.liveStatusLed) {
      elements.liveStatusLed.className = 'w-2.5 h-2.5 rounded-full bg-cyan-400';
    }
    if (elements.liveStatusText) {
      elements.liveStatusText.textContent = 'STANDBY / READY';
      elements.liveStatusText.className = 'text-xs font-mono text-cyan-400 font-bold';
    }
    if (elements.simProgressBar) {
      elements.simProgressBar.style.width = '0%';
    }
    if (elements.simTimeCurrent) {
      elements.simTimeCurrent.textContent = '00:00';
    }

    radar.update(0, 0);
    performAIAnalysis();
    updateTelemetryUI();

    logEvent('Simulation timeline reset to initial contact vector.', 'info');
    if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
  }

  if (elements.btnPlay) elements.btnPlay.addEventListener('click', () => state.isPlaying ? pauseSimulation() : startSimulation());
  if (elements.btnPause) elements.btnPause.addEventListener('click', pauseSimulation);
  if (elements.btnReset) elements.btnReset.addEventListener('click', resetSimulation);

  if (elements.speedSelect) {
    elements.speedSelect.addEventListener('change', (e) => {
      state.playbackSpeed = parseFloat(e.target.value);
      logEvent(`Simulation speed set to ${state.playbackSpeed}x`, 'info');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      state.isPlaying ? pauseSimulation() : startSimulation();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      resetSimulation();
    }
  });

  /* ==========================================================================
     ANIMATION LOOP & SIMULATION TICK
     ========================================================================== */
  function animationLoop(timestamp) {
    const dt = (timestamp - state.lastFrameTime) / 1000;
    state.lastFrameTime = timestamp;

    if (state.isPlaying) {
      state.simTime += dt * state.playbackSpeed;
      state.simProgress = Math.min(1, state.simTime / state.simDuration);

      // Trainee stopwatch update
      if (elements.liveHudLatency && window.aiEvaluator.sessionStartTime) {
        const elapsed = (performance.now() - window.aiEvaluator.sessionStartTime) / 1000;
        elements.liveHudLatency.textContent = `${elapsed.toFixed(1)}s`;
      }

      // Periodic AI re-evaluation every 0.5s
      if (Math.floor(state.simTime * 2) !== Math.floor((state.simTime - dt * state.playbackSpeed) * 2)) {
        performAIAnalysis();
        updateTelemetryUI();
      }

      if (elements.simTimeCurrent) {
        const mins = Math.floor(state.simTime / 60).toString().padStart(2, '0');
        const secs = Math.floor(state.simTime % 60).toString().padStart(2, '0');
        elements.simTimeCurrent.textContent = `${mins}:${secs}`;
      }
      if (elements.simProgressBar) {
        elements.simProgressBar.style.width = `${state.simProgress * 100}%`;
      }

      if (state.simTime >= state.simDuration) {
        pauseSimulation();
        onSimulationCompleted();
      }
    }

    radar.update(dt, state.simProgress);
    radar.render();

    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);

  /* ==========================================================================
     SIMULATION COMPLETION & AUTOMATIC DEBRIEFING (Modules 7, 8, 9, 10)
     ========================================================================== */
  async function onSimulationCompleted() {
    logEvent(`Simulation run complete: Initiating AI After-Action Review (AAR)...`, 'success');

    if (window.tacticalAudio) {
      window.tacticalAudio.playSafeSuccess();
    }

    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];

    // 1. Evaluate Trainee Performance via AI Evaluator
    const evalReport = await window.aiEvaluator.evaluate(
      state.activeScenario,
      currentDrone,
      state.analysisReport ? state.analysisReport.riskScore : 75,
      state.simDuration
    );
    state.lastEvaluatorReport = evalReport;

    // 2. Update Adaptive Profile (Module 9)
    const adaptiveResult = window.aiAdaptive.recordSimulationResult(evalReport);
    updateAdaptiveProfileUI();

    // 3. Save to Reports Archive
    const newReport = {
      id: `SIM-RPT-${Math.floor(1000 + Math.random() * 9000)}`,
      scenario: state.activeScenario.title,
      scenarioId: state.activeScenario.id,
      droneId: currentDrone.id,
      threatLevel: state.analysisReport ? state.analysisReport.threatLevel : 'High',
      riskScore: state.analysisReport ? state.analysisReport.riskScore : 75,
      dateTime: new Date().toLocaleString(),
      result: state.analysisReport ? state.analysisReport.recommendedResponse.actionItems[0] : 'Defensive protocol logged successfully.',
      classification: state.analysisReport ? state.analysisReport.threatClassification : 'Simulated Airspace Contact',
      inferenceLatency: state.analysisReport ? `${state.analysisReport.inferenceTimeMs} ms` : '22.0 ms',
      traineeGrade: evalReport.traineeGrade,
      traineeScore: evalReport.overallScore,
      avgLatencySec: evalReport.avgLatencySec,
      actionsCount: evalReport.actionsRecorded.length,
      debriefSummary: evalReport.debriefSummary,
      notes: `Automated post-flight telemetry log: Duration ${state.simDuration}s, trajectory pattern: ${currentDrone.flightPattern}. Non-kinetic safe resolution confirmed.`
    };

    reportManager.saveReport(newReport);
    updateReportsUI();

    // 4. Open Post-Mission AI Debrief Modal automatically
    window.openAIDebriefModal(evalReport);
    showToast(`Mission Debrief Ready! Grade: ${evalReport.traineeGrade}`);
  }

  /* ==========================================================================
     DEBRIEF MODAL HANDLERS
     ========================================================================== */
  window.openAIDebriefModal = (evalReport) => {
    const r = evalReport || state.lastEvaluatorReport;
    if (!r || !elements.aiDebriefModal) return;

    if (elements.debriefScenarioTitle) elements.debriefScenarioTitle.textContent = `AAR: ${state.activeScenario.title}`;
    if (elements.debriefTimestamp) elements.debriefTimestamp.textContent = `Completed: ${new Date().toLocaleTimeString()}`;
    if (elements.debriefGradeBadge) elements.debriefGradeBadge.textContent = r.traineeGrade;
    if (elements.debriefScore) elements.debriefScore.textContent = `${r.overallScore} / 100`;
    if (elements.debriefLatency) elements.debriefLatency.textContent = `${r.avgLatencySec}s (${r.latencyRating})`;
    if (elements.debriefActionsCount) elements.debriefActionsCount.textContent = `${r.actionsRecorded.length} Action(s)`;
    if (elements.debriefRank) elements.debriefRank.textContent = window.aiAdaptive.profile.currentRank;

    if (elements.debriefStrengths) {
      elements.debriefStrengths.innerHTML = r.strengths.map(s => `<li>${s}</li>`).join('');
    }
    if (elements.debriefImprovements) {
      elements.debriefImprovements.innerHTML = r.improvements.map(i => `<li>${i}</li>`).join('');
    }
    if (elements.debriefNarrative) {
      elements.debriefNarrative.textContent = r.debriefSummary;
    }

    elements.aiDebriefModal.classList.remove('hidden');
    elements.aiDebriefModal.classList.add('flex');
  };

  window.closeAIDebriefModal = () => {
    if (elements.aiDebriefModal) {
      elements.aiDebriefModal.classList.add('hidden');
      elements.aiDebriefModal.classList.remove('flex');
    }
  };

  window.launchRemediationDrill = async () => {
    window.closeAIDebriefModal();
    const weakness = (state.lastEvaluatorReport && state.lastEvaluatorReport.targetedWeakness) || 'Perimeter Incursion';
    const modifiers = window.aiAdaptive.getDifficultyModifiers();

    showToast(`Generating targeted drill for ${weakness}...`);

    const drillScenario = await window.aiScenarioGenerator.generate({
      difficulty: modifiers.recommendedDifficulty,
      category: 'Remediation Training',
      targetedWeakness: weakness,
      prompt: `Targeted remediation drill to improve trainee skill in ${weakness}.`
    });

    SCENARIOS.unshift(drillScenario);
    window.selectScenario(drillScenario.id);
    switchTab('live');
    startSimulation();

    logEvent(`Adaptive drill launched: "${drillScenario.title}"`, 'warning');
  };

  /* ==========================================================================
     AI SCENARIO GENERATOR MODAL HANDLERS (Module 1 & 10)
     ========================================================================== */
  window.openAIScenarioModal = () => {
    if (elements.aiScenarioModal) {
      const isLive = window.aiService && window.aiService.isLiveAIAvailable();
      if (elements.aiGenModeBadge) {
        elements.aiGenModeBadge.textContent = isLive
          ? `Engine: Google Gemini (${window.aiService.getModel()})`
          : 'Engine: Built-in Procedural AI (Offline Mode)';
      }
      elements.aiScenarioModal.classList.remove('hidden');
      elements.aiScenarioModal.classList.add('flex');
    }
  };

  window.closeAIScenarioModal = () => {
    if (elements.aiScenarioModal) {
      elements.aiScenarioModal.classList.add('hidden');
      elements.aiScenarioModal.classList.remove('flex');
    }
  };

  if (elements.aiGenDroneCount && elements.aiGenDroneCountLabel) {
    elements.aiGenDroneCount.addEventListener('input', (e) => {
      elements.aiGenDroneCountLabel.textContent = `${e.target.value} Contact${e.target.value > 1 ? 's' : ''}`;
    });
  }

  if (elements.aiScenarioForm) {
    elements.aiScenarioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-ai-gen-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Synthesizing...</span>`;
      }

      const prompt = elements.aiGenPrompt ? elements.aiGenPrompt.value : '';
      const difficulty = elements.aiGenDifficulty ? elements.aiGenDifficulty.value : 'High Risk';
      const category = elements.aiGenCategory ? elements.aiGenCategory.value : 'Dynamic Training';
      const droneCount = elements.aiGenDroneCount ? parseInt(elements.aiGenDroneCount.value) : 1;

      try {
        const scenario = await window.aiScenarioGenerator.generate({
          prompt,
          difficulty,
          category,
          droneCount
        });

        SCENARIOS.unshift(scenario);
        window.closeAIScenarioModal();
        window.selectScenario(scenario.id);
        switchTab('live');
        showToast(`AI Scenario Generated: ${scenario.title}`);
      } catch (err) {
        console.error('Scenario generation error', err);
        showToast('Generation failed, using procedural fallback.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Synthesize & Launch</span>`;
        }
      }
    });
  }

  /* ==========================================================================
     AI SETTINGS & ADAPTIVE PROFILE MODAL (Module 9)
     ========================================================================== */
  function updateAdaptiveProfileUI() {
    const prof = window.aiAdaptive.profile;
    if (elements.traineeRankIndicator) {
      elements.traineeRankIndicator.textContent = `${prof.currentRank} (Lvl ${prof.rankLevel})`;
      elements.traineeRankIndicator.className = `px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${window.aiAdaptive.getRankBadgeClass()}`;
    }
    if (elements.headerTraineeRank) {
      elements.headerTraineeRank.textContent = `Lvl ${prof.rankLevel}`;
    }
    if (elements.settingsTraineeRank) elements.settingsTraineeRank.textContent = prof.currentRank;
    if (elements.settingsTraineeSims) elements.settingsTraineeSims.textContent = `${prof.simulationsCompleted} Missions`;
    if (elements.settingsTraineeAvg) elements.settingsTraineeAvg.textContent = `${prof.averageScore}%`;
  }

  window.openAISettingsModal = () => {
    if (elements.aiSettingsModal) {
      if (elements.aiSettingsApiKey) elements.aiSettingsApiKey.value = window.aiService.getApiKey();
      if (elements.aiSettingsModel) elements.aiSettingsModel.value = window.aiService.getModel();
      if (elements.aiSettingsLiveBadge) {
        const isLive = window.aiService.isLiveAIAvailable();
        elements.aiSettingsLiveBadge.textContent = isLive ? 'Gemini Live AI Connected' : 'Offline Mode (Built-In AI)';
        elements.aiSettingsLiveBadge.className = isLive ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400';
      }
      updateAdaptiveProfileUI();
      elements.aiSettingsModal.classList.remove('hidden');
      elements.aiSettingsModal.classList.add('flex');
    }
  };

  window.closeAISettingsModal = () => {
    if (elements.aiSettingsModal) {
      elements.aiSettingsModal.classList.add('hidden');
      elements.aiSettingsModal.classList.remove('flex');
    }
  };

  window.saveAISettings = () => {
    if (elements.aiSettingsApiKey) {
      window.aiService.setApiKey(elements.aiSettingsApiKey.value);
    }
    if (elements.aiSettingsModel) {
      window.aiService.setModel(elements.aiSettingsModel.value);
    }
    if (elements.mentorEngineBadge) {
      elements.mentorEngineBadge.textContent = window.aiService.isLiveAIAvailable() ? `Gemini (${window.aiService.getModel()})` : 'Aerospace Training AI';
    }
    window.closeAISettingsModal();
    showToast('AI Settings updated successfully.');
  };

  /* ==========================================================================
     AEROSHIELD AI MENTOR CHATBOT DRAWER (Module 6)
     ========================================================================== */
  window.toggleAIMentor = () => {
    if (elements.aiMentorDrawer) {
      elements.aiMentorDrawer.classList.toggle('open');
      if (elements.aiMentorDrawer.classList.contains('open')) {
        if (elements.mentorEngineBadge) {
          elements.mentorEngineBadge.textContent = window.aiService.isLiveAIAvailable()
            ? `Google Gemini (${window.aiService.getModel()})`
            : 'Aerospace Training AI';
        }
        if (elements.mentorChatInput) elements.mentorChatInput.focus();
      }
    }
  };

  window.sendMentorPrompt = (promptText) => {
    if (elements.mentorChatInput) {
      elements.mentorChatInput.value = promptText;
      handleMentorSubmit(promptText);
    }
  };

  async function handleMentorSubmit(question) {
    const q = (question || (elements.mentorChatInput ? elements.mentorChatInput.value : '')).trim();
    if (!q || !elements.mentorChatMessages) return;

    if (elements.mentorChatInput) elements.mentorChatInput.value = '';

    // Render user message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg-user p-3 text-slate-200 leading-relaxed self-end';
    userMsg.textContent = q;
    elements.mentorChatMessages.appendChild(userMsg);

    // Render typing placeholder
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-msg-assistant p-3 text-slate-400 leading-relaxed italic';
    typingMsg.textContent = 'AeroShield Mentor analyzing airspace context...';
    elements.mentorChatMessages.appendChild(typingMsg);
    elements.mentorChatMessages.scrollTop = elements.mentorChatMessages.scrollHeight;

    const currentDrone = state.activeScenario.drones[state.selectedDroneIndex] || state.activeScenario.drones[0];
    const answer = await window.aiAssistant.ask(q, {
      currentDrone: currentDrone,
      scenario: state.activeScenario,
      simProgress: state.simProgress
    });

    typingMsg.className = 'chat-msg-assistant p-3 text-slate-200 leading-relaxed font-sans whitespace-pre-line';
    typingMsg.textContent = answer;
    elements.mentorChatMessages.scrollTop = elements.mentorChatMessages.scrollHeight;
  }

  if (elements.mentorChatForm) {
    elements.mentorChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleMentorSubmit();
    });
  }

  /* ==========================================================================
     CUSTOM SCENARIO CREATOR (LEGACY PRESERVED)
     ========================================================================== */
  window.openCustomScenarioModal = () => {
    if (elements.customScenarioModal) {
      elements.customScenarioModal.classList.remove('hidden');
      elements.customScenarioModal.classList.add('flex');
    }
  };

  window.closeCustomScenarioModal = () => {
    if (elements.customScenarioModal) {
      elements.customScenarioModal.classList.add('hidden');
      elements.customScenarioModal.classList.remove('flex');
    }
  };

  if (elements.customScenarioForm) {
    elements.customScenarioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(elements.customScenarioForm);
      const params = Object.fromEntries(formData.entries());

      const customScenario = createCustomScenario(params);
      SCENARIOS.unshift(customScenario);

      window.closeCustomScenarioModal();
      window.selectScenario(customScenario.id);
      switchTab('simulation');

      logEvent(`Custom scenario created: "${customScenario.title}"`, 'warning');
    });
  }

  /* ==========================================================================
     EVENT LOGGING SYSTEM & TOASTS
     ========================================================================== */
  function logEvent(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const eventObj = { time, message, type };
    state.eventLogs.unshift(eventObj);
    if (state.eventLogs.length > 40) state.eventLogs.pop();

    if (elements.liveEventFeed) {
      const logHtml = state.eventLogs.slice(0, 15).map(e => `
        <div class="log-item ${e.type} p-2 text-xs font-mono rounded bg-slate-900/40 border border-slate-800/80 mb-1.5 flex items-start space-x-2">
          <span class="text-slate-500 whitespace-nowrap">[${e.time}]</span>
          <span class="${e.type === 'critical' ? 'text-red-400' : e.type === 'warning' ? 'text-amber-400' : e.type === 'success' ? 'text-emerald-400' : 'text-slate-300'}">
            ${e.message}
          </span>
        </div>
      `).join('');
      elements.liveEventFeed.innerHTML = logHtml;
    }
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-3 rounded-lg shadow-xl shadow-cyan-500/10 text-xs font-mono flex items-center space-x-2 transition-all duration-300';
    toast.innerHTML = `
      <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${msg}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================================
     REPORTS UI CONTROLS & RADAR TOGGLES
     ========================================================================== */
  function updateReportsUI() {
    reportManager.render('reports-display-container');
  }

  if (elements.reportsFilterSelect) {
    elements.reportsFilterSelect.addEventListener('change', (e) => {
      reportManager.currentFilter = e.target.value;
      updateReportsUI();
    });
  }

  if (elements.reportsSearchInput) {
    elements.reportsSearchInput.addEventListener('input', (e) => {
      reportManager.searchQuery = e.target.value;
      updateReportsUI();
    });
  }

  if (elements.reportsViewToggle) {
    elements.reportsViewToggle.addEventListener('click', () => {
      reportManager.viewMode = reportManager.viewMode === 'table' ? 'cards' : 'table';
      elements.reportsViewToggle.textContent = reportManager.viewMode === 'table' ? 'View as Cards' : 'View as Table';
      updateReportsUI();
    });
  }

  setInterval(() => {
    if (elements.liveDetectionTime) {
      elements.liveDetectionTime.textContent = new Date().toLocaleTimeString();
    }
  }, 1000);

  // Radar display toggle buttons
  const toggleTrailsBtn = document.getElementById('toggle-radar-trails');
  if (toggleTrailsBtn) {
    toggleTrailsBtn.addEventListener('click', () => {
      radar.showTrails = !radar.showTrails;
      toggleTrailsBtn.classList.toggle('text-cyan-400');
      toggleTrailsBtn.classList.toggle('text-slate-400');
    });
  }

  const toggleZonesBtn = document.getElementById('toggle-radar-zones');
  if (toggleZonesBtn) {
    toggleZonesBtn.addEventListener('click', () => {
      radar.showZones = !radar.showZones;
      toggleZonesBtn.classList.toggle('text-cyan-400');
      toggleZonesBtn.classList.toggle('text-slate-400');
    });
  }

  const toggleSweepBtn = document.getElementById('toggle-radar-sweep');
  if (toggleSweepBtn) {
    toggleSweepBtn.addEventListener('click', () => {
      radar.showSweep = !radar.showSweep;
      toggleSweepBtn.classList.toggle('text-cyan-400');
      toggleSweepBtn.classList.toggle('text-slate-400');
    });
  }

  const togglePredictionBtn = document.getElementById('toggle-radar-prediction');
  if (togglePredictionBtn) {
    togglePredictionBtn.addEventListener('click', () => {
      radar.showPrediction = !radar.showPrediction;
      togglePredictionBtn.classList.toggle('text-cyan-400');
      togglePredictionBtn.classList.toggle('text-slate-400');
      togglePredictionBtn.classList.toggle('border-cyan-500/60');
      togglePredictionBtn.classList.toggle('border-slate-700');
    });
  }
});
