/**
 * Reports & Historical Simulation Incident Manager
 * Handles local storage persistence, filtering, card/table view rendering,
 * and academic report export (CSV, JSON, Printable view).
 */

class ReportManager {
  constructor() {
    this.storageKey = 'aero_simulation_reports_v2';
    this.reports = this._loadReports();
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.viewMode = 'table'; // 'table' or 'cards'
  }

  _loadReports() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read reports from storage', e);
    }

    // Default pre-loaded academic simulation sample reports
    return [
      {
        id: 'SIM-RPT-1001',
        scenario: 'Drone Entering Restricted Airspace',
        scenarioId: 'restricted-area',
        droneId: 'UAV-INTRUDER-91',
        threatLevel: 'High',
        riskScore: 84,
        dateTime: '2026-10-22 14:15:20',
        result: 'Passive PTZ lock confirmed; ATC advisory broadcast; facility security alerted.',
        classification: 'Unauthorized Critical Airspace Incursion',
        inferenceLatency: '24.2 ms',
        notes: 'Target maintained 85 km/h descent toward core compound before safe protocol escalation.'
      },
      {
        id: 'SIM-RPT-1002',
        scenario: 'Multiple Drones Detected (Coordinated Swarm)',
        scenarioId: 'multiple-drones',
        droneId: 'SWARM-LEAD-01 (+2 escorts)',
        threatLevel: 'Critical',
        riskScore: 95,
        dateTime: '2026-10-22 15:30:11',
        result: 'Multi-target radar lock engaged; regional civil aviation NOTAM triggered; spectrum forensic archived.',
        classification: 'Synchronized Multi-UAV Swarm Incursion',
        inferenceLatency: '28.6 ms',
        notes: 'Coordinated V-formation detected on 915 MHz mesh network.'
      },
      {
        id: 'SIM-RPT-1003',
        scenario: 'Suspicious Flight Pattern',
        scenarioId: 'suspicious-pattern',
        droneId: 'RECON-ZIGZAG-19',
        threatLevel: 'High',
        riskScore: 78,
        dateTime: '2026-10-22 16:05:44',
        result: 'Digital Remote ID interrogation pinged; optical payload classification logged.',
        classification: 'Perimeter Reconnaissance & Evasive Trajectory',
        inferenceLatency: '21.0 ms',
        notes: 'Erratic altitude variation (30m to 180m) logged along northwest fence.'
      },
      {
        id: 'SIM-RPT-1004',
        scenario: 'Unknown Drone Detected',
        scenarioId: 'unknown-drone',
        droneId: 'GHOST-UAV-04',
        threatLevel: 'Moderate',
        riskScore: 56,
        dateTime: '2026-10-22 16:40:02',
        result: 'Advisory zone logging initiated; geofence proximity monitored; zero breach recorded.',
        classification: 'Unidentified Aerial Contact / Loitering Anomaly',
        inferenceLatency: '19.5 ms',
        notes: 'Commercial quad hovering at 88m altitude outside 3km advisory ring.'
      },
      {
        id: 'SIM-RPT-1005',
        scenario: 'Authorized Commercial Delivery (Control Test)',
        scenarioId: 'authorized-transit',
        droneId: 'AERO-LOGIX-402',
        threatLevel: 'Low',
        riskScore: 12,
        dateTime: '2026-10-22 17:10:55',
        result: 'Verified against certified civil flight registry; nominal transit permitted.',
        classification: 'Authorized Civilian Transit / Low Risk Contact',
        inferenceLatency: '16.4 ms',
        notes: 'FAA Remote ID cryptographic validation passed. Transit corridor Charlie.'
      }
    ];
  }

  saveReport(report) {
    this.reports.unshift(report);
    // Keep max 50 reports in local storage
    if (this.reports.length > 50) this.reports.pop();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }

  getFilteredReports() {
    return this.reports.filter(r => {
      // Threat level filter
      if (this.currentFilter !== 'all' && r.threatLevel.toLowerCase() !== this.currentFilter.toLowerCase()) {
        return false;
      }

      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          r.scenario.toLowerCase().includes(query) ||
          r.droneId.toLowerCase().includes(query) ||
          r.classification.toLowerCase().includes(query) ||
          r.result.toLowerCase().includes(query) ||
          r.id.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const filtered = this.getFilteredReports();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-base font-medium">No simulation incident reports found matching criteria.</p>
          <p class="text-sm text-slate-500 mt-1">Try resetting the filter or execute a new simulation run.</p>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'table') {
      this._renderTableView(container, filtered);
    } else {
      this._renderCardsView(container, filtered);
    }
  }

  _renderTableView(container, reports) {
    let rowsHtml = reports.map(r => {
      let badgeClass = 'badge-moderate';
      if (r.threatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (r.threatLevel === 'High') badgeClass = 'badge-high';
      else if (r.threatLevel === 'Low') badgeClass = 'badge-low';

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
          <td class="py-3 px-4 text-xs font-mono text-cyan-400 font-semibold">${r.id}</td>
          <td class="py-3 px-4">
            <div class="text-sm font-medium text-slate-100">${r.scenario}</div>
            <div class="text-xs text-slate-400 font-mono">${r.droneId}</div>
          </td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
              ${r.threatLevel}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-mono font-bold ${r.riskScore >= 75 ? 'text-red-400' : r.riskScore >= 45 ? 'text-amber-400' : 'text-emerald-400'}">
                ${r.riskScore}/100
              </span>
              <div class="w-16 bg-slate-700 rounded-full h-1.5 hidden sm:block">
                <div class="h-1.5 rounded-full ${r.riskScore >= 75 ? 'bg-red-500' : r.riskScore >= 45 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${r.riskScore}%"></div>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-xs text-slate-400 font-mono whitespace-nowrap">${r.dateTime}</td>
          <td class="py-3 px-4">
            <div class="text-xs text-slate-300 max-w-xs truncate" title="${r.result}">${r.result}</div>
            <div class="text-xs text-cyan-400/80 font-mono mt-0.5">${r.classification}</div>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="window.reportManager.showReportModal('${r.id}')" class="px-2.5 py-1 text-xs rounded bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-700/50 transition">
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-700/80 text-xs font-mono text-slate-400 uppercase tracking-wider bg-slate-900/40">
              <th class="py-3 px-4">Report ID</th>
              <th class="py-3 px-4">Scenario / Target</th>
              <th class="py-3 px-4">Threat Level</th>
              <th class="py-3 px-4">Risk Score</th>
              <th class="py-3 px-4">Date / Time</th>
              <th class="py-3 px-4">Safe Response Result</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  _renderCardsView(container, reports) {
    let cardsHtml = reports.map(r => {
      let badgeClass = 'badge-moderate';
      if (r.threatLevel === 'Critical') badgeClass = 'badge-critical';
      else if (r.threatLevel === 'High') badgeClass = 'badge-high';
      else if (r.threatLevel === 'Low') badgeClass = 'badge-low';

      return `
        <div class="tactical-card p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono text-cyan-400 font-semibold">${r.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
                ${r.threatLevel}
              </span>
            </div>
            <h4 class="text-base font-semibold text-slate-100 mb-1">${r.scenario}</h4>
            <div class="text-xs font-mono text-slate-400 mb-3">Target ID: ${r.droneId}</div>
            
            <div class="bg-slate-900/60 p-3 rounded-lg border border-slate-800 mb-3 space-y-1.5">
              <div class="flex justify-between text-xs">
                <span class="text-slate-400">Risk Assessment:</span>
                <span class="font-mono font-bold ${r.riskScore >= 75 ? 'text-red-400' : r.riskScore >= 45 ? 'text-amber-400' : 'text-emerald-400'}">${r.riskScore} / 100</span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-1.5">
                <div class="h-1.5 rounded-full ${r.riskScore >= 75 ? 'bg-red-500' : r.riskScore >= 45 ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${r.riskScore}%"></div>
              </div>
              <div class="text-xs text-cyan-400 font-mono pt-1">
                ${r.classification}
              </div>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
              ${r.result}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-xs font-mono text-slate-500">${r.dateTime}</span>
            <button onclick="window.reportManager.showReportModal('${r.id}')" class="px-3 py-1 text-xs rounded bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-700/50 transition">
              Full Breakdown
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${cardsHtml}
      </div>
    `;
  }

  showReportModal(reportId) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    const modal = document.getElementById('report-detail-modal');
    const content = document.getElementById('report-modal-content');
    if (!modal || !content) return;

    let badgeClass = 'badge-moderate';
    if (report.threatLevel === 'Critical') badgeClass = 'badge-critical';
    else if (report.threatLevel === 'High') badgeClass = 'badge-high';
    else if (report.threatLevel === 'Low') badgeClass = 'badge-low';

    content.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <div class="text-xs font-mono text-cyan-400">${report.id} • Forensic Incident Archive</div>
            <h3 class="text-lg font-bold text-slate-100">${report.scenario}</h3>
            <div class="text-xs text-slate-400 font-mono mt-0.5">Recorded: ${report.dateTime}</div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${badgeClass}">
            ${report.threatLevel} Threat
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-xs">
          <div>
            <div class="text-slate-500">Drone Target</div>
            <div class="text-slate-200 font-bold mt-0.5">${report.droneId}</div>
          </div>
          <div>
            <div class="text-slate-500">Risk Score</div>
            <div class="font-bold mt-0.5 ${report.riskScore >= 75 ? 'text-red-400' : 'text-amber-400'}">${report.riskScore}/100</div>
          </div>
          <div>
            <div class="text-slate-500">Inference Speed</div>
            <div class="text-emerald-400 font-bold mt-0.5">${report.inferenceLatency || '21 ms'}</div>
          </div>
          <div>
            <div class="text-slate-500">Compliance</div>
            <div class="text-sky-400 font-bold mt-0.5">ICAO Non-Kinetic</div>
          </div>
        </div>

        <div>
          <div class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">AI Classification</div>
          <div class="text-sm font-semibold text-cyan-300 bg-cyan-950/30 p-2.5 rounded border border-cyan-800/40">
            ${report.classification}
          </div>
        </div>

        <div>
          <div class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Safe Response Executed</div>
          <div class="text-xs text-slate-200 bg-slate-800/60 p-3 rounded border border-slate-700/60 leading-relaxed">
            ${report.result}
          </div>
        </div>

        ${report.traineeGrade ? `
        <div class="p-3 rounded bg-cyan-950/40 border border-cyan-800/60 space-y-1">
          <div class="flex justify-between items-center text-xs font-mono">
            <span class="text-cyan-400 font-bold uppercase">Trainee Performance Assessment:</span>
            <span class="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold">${report.traineeGrade} (${report.traineeScore || report.riskScore}/100)</span>
          </div>
          <div class="text-xs text-slate-300 leading-relaxed pt-1">
            <strong>Latency:</strong> ${report.avgLatencySec ? report.avgLatencySec + 's' : 'Optimal'} • <strong>Actions:</strong> ${report.actionsCount || 1} protocol(s) executed.
          </div>
        </div>
        ` : ''}

        <div>
          <div class="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Analyst Forensic Notes / AI Debrief</div>
          <div class="text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded border border-slate-800 whitespace-pre-line leading-relaxed">
            ${report.debriefSummary || report.notes || 'Simulated trajectory conforms with defensive AI threat assessment parameters.'}
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModal() {
    const modal = document.getElementById('report-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  exportCSV() {
    const headers = ['Report ID', 'Scenario', 'Target Drone ID', 'Threat Level', 'Risk Score', 'Date Time', 'AI Classification', 'Safe Response Result'];
    const rows = this.reports.map(r => [
      `"${r.id}"`,
      `"${r.scenario.replace(/"/g, '""')}"`,
      `"${r.droneId}"`,
      `"${r.threatLevel}"`,
      r.riskScore,
      `"${r.dateTime}"`,
      `"${r.classification.replace(/"/g, '""')}"`,
      `"${r.result.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AeroShield_Threat_Reports_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.reports, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AeroShield_Threat_Reports_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReportSummary() {
    window.print();
  }
}

window.ReportManager = ReportManager;
