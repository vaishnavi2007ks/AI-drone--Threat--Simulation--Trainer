/**
 * Tactical Radar & Grid Canvas Renderer
 * Renders real-time polar sweep, airspace geofences, drone targets, heading vectors,
 * and historical telemetry trails.
 */

class TacticalRadar {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 20;

    this.sweepAngle = 0;
    this.sweepSpeed = 0.025; // Radians per frame
    this.drones = [];
    this.selectedDroneId = null;

    this.showTrails = true;
    this.showZones = true;
    this.showRings = true;
    this.showSweep = true;
    this.showPrediction = true; // AI Threat Prediction Layer

    this.activePrediction = null; // Stored from aiPredictor
    this.droneTrails = {}; // droneId -> array of past positions
    this.blips = []; // Simulated radar blip flashes

    this.initCanvasResize();
    this.setupInteractivity();
  }

  initCanvasResize() {
    const resize = () => {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement.getBoundingClientRect();
      const size = Math.min(rect.width, 680);
      if (size > 200) {
        this.canvas.width = size;
        this.canvas.height = size;
        this.width = size;
        this.height = size;
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 24;
      }
    };

    window.addEventListener('resize', resize);
    setTimeout(resize, 100);
  }

  setupInteractivity() {
    if (!this.canvas) return;
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let clickedDrone = null;
      let minDistance = 25; // pixels

      this.drones.forEach(d => {
        if (!d.currentCanvasPos) return;
        const dx = clickX - d.currentCanvasPos.x;
        const dy = clickY - d.currentCanvasPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          clickedDrone = d;
        }
      });

      if (clickedDrone) {
        this.selectedDroneId = clickedDrone.id;
        if (window.tacticalAudio) window.tacticalAudio.playActionBeep();
        if (window.onDroneSelected) window.onDroneSelected(clickedDrone);
      }
    });
  }

  setDrones(drones) {
    this.drones = drones || [];
    if (this.drones.length > 0 && !this.selectedDroneId) {
      this.selectedDroneId = this.drones[0].id;
    }
  }

  update(dt, progress) {
    // Increment sweep angle
    this.sweepAngle = (this.sweepAngle + this.sweepSpeed) % (Math.PI * 2);

    // Play subtle audio ping every full revolution
    if (this.sweepAngle < this.sweepSpeed && window.tacticalAudio) {
      window.tacticalAudio.playRadarPing();
    }

    // Update positions along trajectory based on simulation progress (0 to 1)
    this.drones.forEach(drone => {
      if (!drone.trajectory || drone.trajectory.length === 0) return;

      const pos = this._interpolateTrajectory(drone.trajectory, progress);
      drone.currentPos = pos;

      // Map normalized coordinates (-1 to 1) to canvas coordinates
      const screenX = this.centerX + pos.x * (this.radius * 0.95);
      const screenY = this.centerY + pos.y * (this.radius * 0.95);
      drone.currentCanvasPos = { x: screenX, y: screenY };

      // Update trail history
      if (!this.droneTrails[drone.id]) this.droneTrails[drone.id] = [];
      const trail = this.droneTrails[drone.id];
      if (trail.length === 0 || Math.hypot(trail[trail.length - 1].x - screenX, trail[trail.length - 1].y - screenY) > 8) {
        trail.push({ x: screenX, y: screenY, time: Date.now() });
        if (trail.length > 30) trail.shift();
      }
    });
  }

  _interpolateTrajectory(traj, progress) {
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

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // 1. Clear background
    ctx.clearRect(0, 0, this.width, this.height);

    // Dark circular radar base
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#060d1b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e3a5f';
    ctx.stroke();
    ctx.clip(); // Clip everything to inside radar circle

    // 2. Render Security Zones & Geofences
    if (this.showZones) {
      this._renderZones(ctx);
    }

    // 3. Render Range Rings and Azimuth Grid
    if (this.showRings) {
      this._renderGrid(ctx);
    }

    // 4. Render Radar Sweep Beam
    if (this.showSweep) {
      this._renderSweepBeam(ctx);
    }

    // 5. Render Drone Trails
    if (this.showTrails) {
      this._renderTrails(ctx);
    }

    // 5.5. Render AI Trajectory Prediction Vector (Module 3)
    if (this.showPrediction && this.activePrediction) {
      this._renderTrajectoryPrediction(ctx);
    }

    // 6. Render Drones and Heading Vectors
    this._renderDrones(ctx);

    ctx.restore();

    // 7. Render Cardinal / Compass Headings on the outer ring
    this._renderCompassLabels(ctx);
  }

  _renderZones(ctx) {
    // Zone Red: Core Restricted No-Fly Perimeter (radius 0.28)
    const redRadius = this.radius * 0.28;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, redRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Zone Red Text Label
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(248, 113, 113, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText('RESTRICTED CORE (NO-FLY ZONE)', this.centerX, this.centerY - redRadius + 14);

    // Zone Amber: Advisory Buffer (radius 0.62)
    const amberRadius = this.radius * 0.62;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, amberRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
    ctx.fill();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Advisory label
    ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.fillText('ADVISORY 3KM BUFFER', this.centerX, this.centerY - amberRadius + 14);

    // Defense Central Facility Icon at (0,0)
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '8px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('FACILITY HQ', this.centerX, this.centerY + 16);
  }

  _renderGrid(ctx) {
    const ringDistances = [0.28, 0.45, 0.62, 0.82, 0.98];
    const ringKmLabels = ['1.0 km', '2.0 km', '3.0 km', '4.5 km', '5.5 km'];

    ctx.lineWidth = 1;

    ringDistances.forEach((dist, idx) => {
      const r = this.radius * dist;
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.stroke();

      // Range ring distance label
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.textAlign = 'left';
      ctx.fillText(ringKmLabels[idx], this.centerX + 4, this.centerY - r + 10);
    });

    // Crosshairs (North-South, East-West)
    ctx.beginPath();
    ctx.moveTo(this.centerX - this.radius, this.centerY);
    ctx.lineTo(this.centerX + this.radius, this.centerY);
    ctx.moveTo(this.centerX, this.centerY - this.radius);
    ctx.lineTo(this.centerX, this.centerY + this.radius);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.stroke();

    // 45-degree diagonals
    ctx.beginPath();
    const dOffset = this.radius * 0.7071;
    ctx.moveTo(this.centerX - dOffset, this.centerY - dOffset);
    ctx.lineTo(this.centerX + dOffset, this.centerY + dOffset);
    ctx.moveTo(this.centerX - dOffset, this.centerY + dOffset);
    ctx.lineTo(this.centerX + dOffset, this.centerY - dOffset);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.stroke();
  }

  _renderSweepBeam(ctx) {
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(this.sweepAngle);

    // Sweeping gradient cone (40-degree tail)
    const beamAngle = 0.7; // ~40 degrees
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, this.radius);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, -beamAngle, 0);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Leading edge beam line
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.radius, 0);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  _renderTrails(ctx) {
    Object.keys(this.droneTrails).forEach(droneId => {
      const trail = this.droneTrails[droneId];
      if (trail.length < 2) return;

      const isSelected = droneId === this.selectedDroneId;
      for (let i = 1; i < trail.length; i++) {
        const opacity = (i / trail.length) * (isSelected ? 0.8 : 0.45);
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = isSelected ? `rgba(56, 189, 248, ${opacity})` : `rgba(244, 63, 94, ${opacity})`;
        ctx.lineWidth = isSelected ? 2 : 1.2;
        ctx.stroke();
      }
    });
  }

  setPrediction(predData) {
    this.activePrediction = predData;
  }

  _renderTrajectoryPrediction(ctx) {
    const pred = this.activePrediction;
    if (!pred || !pred.forecastPoints || pred.forecastPoints.length === 0) return;

    // Find active drone
    const drone = this.drones.find(d => d.id === pred.droneId) || this.drones[0];
    if (!drone || !drone.currentCanvasPos) return;

    const startX = drone.currentCanvasPos.x;
    const startY = drone.currentCanvasPos.y;

    // Draw dashed futuristic prediction line
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = pred.coreBreachProb > 65 ? 'rgba(239, 68, 68, 0.75)' : 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const canvasPoints = pred.forecastPoints.map(fp => {
      const px = this.centerX + fp.x * (this.radius * 0.95);
      const py = this.centerY + fp.y * (this.radius * 0.95);
      ctx.lineTo(px, py);
      return { ...fp, px, py };
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw forecast waypoint blips and labels
    canvasPoints.forEach(cp => {
      ctx.beginPath();
      ctx.arc(cp.px, cp.py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = cp.isInsideCore ? '#ef4444' : cp.isInsideAdvisory ? '#f59e0b' : '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Time tag label
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = cp.isInsideCore ? '#f87171' : 'rgba(148, 163, 184, 0.9)';
      ctx.textAlign = 'left';
      ctx.fillText(`+${cp.secondsAhead}s (${cp.distanceKm}km)`, cp.px + 6, cp.py - 2);
    });

    // If Core breach predicted, draw alert intersection badge
    if (pred.etbCoreSec !== null && pred.etbCoreSec <= 35) {
      const lastPoint = canvasPoints[canvasPoints.length - 1];
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(`⚠️ ETB CORE: ~${pred.etbCoreSec}s`, lastPoint.px, lastPoint.py + 14);
    }

    ctx.restore();
  }

  _renderDrones(ctx) {
    this.drones.forEach(drone => {
      if (!drone.currentCanvasPos) return;
      const { x, y } = drone.currentCanvasPos;
      const isSelected = drone.id === this.selectedDroneId;

      // Color coding based on threat level
      let color = '#fbbf24'; // Moderate
      if (drone.threatLevel === 'Critical') color = '#ef4444';
      else if (drone.threatLevel === 'High') color = '#f97316';
      else if (drone.threatLevel === 'Low') color = '#10b981';

      // 1. Draw Heading Vector Line
      const headingRad = (drone.headingDeg * Math.PI) / 180;
      const vectorLen = 22 + (drone.speedKmh * 0.15);
      const vx = x + Math.sin(headingRad) * vectorLen;
      const vy = y - Math.cos(headingRad) * vectorLen;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(vx, vy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Vector arrowhead
      ctx.beginPath();
      ctx.arc(vx, vy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // 2. Pulse / Selection Ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 19, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Drone Blip Body
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 4. Drone Telemetry Badge on Map
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(drone.id, x + 12, y - 6);

      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.fillText(`${Math.round(drone.speedKmh)}km/h | ${Math.round(drone.altitudeM)}m`, x + 12, y + 6);
    });
  }

  _renderCompassLabels(ctx) {
    const r = this.radius + 12;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('N (000°)', this.centerX, this.centerY - r);
    ctx.fillText('S (180°)', this.centerX, this.centerY + r);
    ctx.fillText('E (090°)', this.centerX + r + 8, this.centerY);
    ctx.fillText('W (270°)', this.centerX - r - 8, this.centerY);
  }

  resetTrails() {
    this.droneTrails = {};
  }
}

window.TacticalRadar = TacticalRadar;
