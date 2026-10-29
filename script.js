/**
 * ============================================================================
 * ROMANTIC BLOOMING NIGHT GARDEN - SCRIPT.JS (MOBILE & DESKTOP OPTIMIZED)
 * ============================================================================
 */

(() => {
  'use strict';

  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d');

  const introScreen = document.getElementById('introScreen');
  const bloomBtn = document.getElementById('bloomBtn');
  const gardenScene = document.getElementById('gardenScene');

  let isGardenActive = false;

  const ROSE_PALETTES = [
    { outer: '#ff2a6d', mid: '#ff5c8a', inner: '#ffacc5', core: '#ffe066', glow: 'rgba(255, 68, 134, 0.55)' },
    { outer: '#d90429', mid: '#ff4d6d', inner: '#ffb3c1', core: '#ffd166', glow: 'rgba(255, 77, 109, 0.55)' },
    { outer: '#c9184a', mid: '#ff758f', inner: '#ffe5ec', core: '#fff3b0', glow: 'rgba(255, 117, 143, 0.55)' },
    { outer: '#b5179e', mid: '#f72585', inner: '#ff9ebb', core: '#ffe08a', glow: 'rgba(247, 37, 133, 0.5)' },
  ];

  // ============================================================================
  // 1. WEB AUDIO API ROMANTIC MUSIC BOX SYNTHESIZER
  // ============================================================================
  class RomanticMusicBox {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.loopTimer = null;
      this.noteIndex = 0;

      this.melodyNotes = [
        523.25, 659.25, 783.99, 987.77,
        880.00, 783.99, 659.25, 587.33,
        440.00, 523.25, 659.25, 880.00,
        783.99, 659.25, 523.25, 493.88,
        349.23, 440.00, 523.25, 659.25,
        587.33, 523.25, 440.00, 392.00,
        392.00, 493.88, 587.33, 783.99,
        659.25, 587.33, 493.88, 523.25,
      ];

      this.chimeScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
    }

    initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, duration = 2.4, volume = 0.075) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 2, now);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(volume * 0.18, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      subOsc.connect(subGain);
      subGain.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration);
      subOsc.stop(now + duration);
    }

    playBloomChime() {
      if (!this.ctx) return;
      this.initContext();
      const f1 = this.chimeScale[Math.floor(Math.random() * this.chimeScale.length)];
      const f2 = f1 * 1.25;
      this.playTone(f1, 1.8, 0.06);
      setTimeout(() => {
        if (this.ctx) this.playTone(f2, 2.1, 0.045);
      }, 90);
    }

    start() {
      this.initContext();
      if (!this.ctx || this.isPlaying) return;
      this.isPlaying = true;

      const step = () => {
        if (!this.isPlaying) return;
        const note = this.melodyNotes[this.noteIndex % this.melodyNotes.length];
        this.playTone(note, 2.8, 0.075);

        if (this.noteIndex % 4 === 0) {
          this.playTone(note * 0.5, 3.6, 0.05);
        }

        this.noteIndex++;
        this.loopTimer = setTimeout(step, 520);
      };

      step();
    }
  }

  const audio = new RomanticMusicBox();

  // ============================================================================
  // 2. CANVAS BOTANICAL & ATMOSPHERE ENGINE
  // ============================================================================
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let isMobile = width < 600;

  const stars = [];
  const shootingStars = [];
  const fireflies = [];
  const fallingPetals = [];
  const sparkParticles = [];
  const floatingHearts = [];
  const interactiveFlowers = [];

  function resizeCanvas() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const widthChanged = Math.abs(newWidth - width) > 20;

    width = newWidth;
    height = newHeight;
    isMobile = width < 600;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (stars.length === 0 || widthChanged) {
      initStars();
    }
  }

  function initStars() {
    stars.length = 0;
    const count = Math.floor((width * height) / (isMobile ? 7500 : 9000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.78),
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.006,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function initFireflies() {
    fireflies.length = 0;
    const count = isMobile ? 20 : Math.min(35, Math.floor(width / 35));
    for (let i = 0; i < count; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: height * 0.25 + Math.random() * (height * 0.72),
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.4 - 0.15,
        r: Math.random() * (isMobile ? 1.8 : 2.4) + 1.1,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.45 ? 48 : 340,
      });
    }
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * (width * 0.75) + width * 0.15,
      y: Math.random() * (height * 0.28),
      len: (isMobile ? 55 : 85) + Math.random() * 40,
      speed: (isMobile ? 7 : 10) + Math.random() * 6,
      angle: Math.PI * 0.78,
      alpha: 1,
    });
  }

  function spawnBurst(x, y, palette) {
    const sparkCount = isMobile ? 16 : 22;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * (isMobile ? 2.4 : 3.2) + 0.7;
      sparkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        r: Math.random() * 2.4 + 1.1,
        color: i % 2 === 0 ? palette.inner : palette.core,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.012,
      });
    }

    for (let i = 0; i < 3; i++) {
      floatingHearts.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 5,
        vy: -Math.random() * 1.0 - 0.6,
        vx: (Math.random() - 0.5) * 0.5,
        size: Math.random() * (isMobile ? 6 : 8) + (isMobile ? 6 : 8),
        alpha: 0.95,
        color: palette.mid,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function triggerPetalShower(count = 32) {
    const actualCount = isMobile ? Math.floor(count * 0.7) : count;
    for (let i = 0; i < actualCount; i++) {
      const pal = ROSE_PALETTES[Math.floor(Math.random() * ROSE_PALETTES.length)];
      fallingPetals.push({
        x: Math.random() * width,
        y: -20 - Math.random() * 240,
        vx: (Math.random() - 0.35) * 1.1,
        vy: Math.random() * 1.3 + 0.85,
        size: Math.random() * (isMobile ? 5.5 : 7) + (isMobile ? 4.5 : 6),
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? pal.mid : pal.inner,
        alpha: Math.random() * 0.4 + 0.55,
      });
    }
    spawnShootingStar();
    setTimeout(spawnShootingStar, 450);
  }

  class InteractiveFlower {
    constructor(targetX, targetY) {
      this.palette = ROSE_PALETTES[Math.floor(Math.random() * ROSE_PALETTES.length)];
      const scaleFactor = isMobile ? 0.76 : 1;

      // Keep flower heads comfortably inside viewport margins on mobile
      const marginX = isMobile ? 28 : 40;
      this.targetX = Math.max(marginX, Math.min(width - marginX, targetX));
      this.targetY = Math.max(height * 0.26, Math.min(targetY, height * 0.85));

      this.baseX = this.targetX + (Math.random() - 0.5) * (isMobile ? 55 : 90);
      this.baseY = height + 10;

      this.ctrlX = (this.baseX + this.targetX) / 2 + (Math.random() - 0.5) * (isMobile ? 50 : 85);
      this.ctrlY = (this.baseY + this.targetY) / 2;

      this.stemProgress = 0;
      this.stemSpeed = 0.022 + Math.random() * 0.008;
      this.bloomProgress = 0;
      this.bloomSpeed = 0.02 + Math.random() * 0.008;
      this.hasSparked = false;

      this.species = Math.floor(Math.random() * 4);
      this.headRadius = (Math.random() * 13 + 26) * scaleFactor;
      this.stemWidth = 3.4 * scaleFactor;
      this.petalCount = this.species === 2 ? 5 : this.species === 1 ? 6 : 8;

      this.swayPhase = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.01;
      this.swayAmp = (5 + Math.random() * 5) * scaleFactor;

      this.leaves = [
        { t: 0.38, side: -1, size: (14 + Math.random() * 5) * scaleFactor, angle: -0.6 },
        { t: 0.62, side: 1, size: (13 + Math.random() * 5) * scaleFactor, angle: 0.6 },
      ];
    }

    getPointOnStem(t, swayOffset) {
      const invT = 1 - t;
      const x =
        invT * invT * this.baseX +
        2 * invT * t * (this.ctrlX + swayOffset * 0.5) +
        t * t * (this.targetX + swayOffset);
      const y =
        invT * invT * this.baseY +
        2 * invT * t * this.ctrlY +
        t * t * this.targetY;
      return { x, y };
    }

    update() {
      this.swayPhase += this.swaySpeed;

      if (this.stemProgress < 1) {
        this.stemProgress = Math.min(1, this.stemProgress + this.stemSpeed);
      } else if (this.bloomProgress < 1) {
        if (!this.hasSparked) {
          this.hasSparked = true;
          const sway = Math.sin(this.swayPhase) * this.swayAmp;
          spawnBurst(this.targetX + sway, this.targetY, this.palette);
        }
        this.bloomProgress = Math.min(1, this.bloomProgress + this.bloomSpeed);
      }
    }

    draw(ctx) {
      const sway = Math.sin(this.swayPhase) * this.swayAmp * this.stemProgress;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.baseX, this.baseY);

      const steps = 24;
      const maxStep = Math.ceil(steps * this.stemProgress);
      let tipPoint = { x: this.baseX, y: this.baseY };

      for (let i = 1; i <= maxStep; i++) {
        const t = Math.min(this.stemProgress, i / steps);
        tipPoint = this.getPointOnStem(t, sway);
        ctx.lineTo(tipPoint.x, tipPoint.y);
      }

      const stemGrad = ctx.createLinearGradient(this.baseX, this.baseY, tipPoint.x, tipPoint.y);
      stemGrad.addColorStop(0, '#074f3b');
      stemGrad.addColorStop(0.6, '#12b886');
      stemGrad.addColorStop(1, '#63e6be');

      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = this.stemWidth;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(56, 217, 169, 0.4)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      for (const leaf of this.leaves) {
        if (this.stemProgress > leaf.t) {
          const leafScale = Math.min(1, (this.stemProgress - leaf.t) * 3.2);
          const pt = this.getPointOnStem(leaf.t, sway);
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(leaf.angle * leafScale);
          ctx.scale(leafScale, leafScale);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(leaf.side * leaf.size, -leaf.size * 0.7, leaf.side * leaf.size * 1.4, -leaf.size * 0.15);
          ctx.quadraticCurveTo(leaf.side * leaf.size * 0.6, leaf.size * 0.45, 0, 0);

          const leafGrad = ctx.createLinearGradient(0, 0, leaf.side * leaf.size, 0);
          leafGrad.addColorStop(0, '#0ca678');
          leafGrad.addColorStop(1, '#63e6be');
          ctx.fillStyle = leafGrad;
          ctx.fill();
          ctx.restore();
        }
      }

      if (this.stemProgress >= 0.95) {
        const easeOutBack = (x) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        };
        const scale = Math.max(0.01, easeOutBack(this.bloomProgress));
        const headPos = this.getPointOnStem(1, sway);

        ctx.save();
        ctx.translate(headPos.x, headPos.y);
        ctx.rotate(sway * 0.012);
        ctx.scale(scale, scale);

        const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, this.headRadius * 1.7);
        aura.addColorStop(0, this.palette.glow);
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, this.headRadius * 1.7, 0, Math.PI * 2);
        ctx.fill();

        this.drawPetals(ctx, this.headRadius, this.petalCount, this.palette.outer, this.palette.mid, 0);
        this.drawPetals(
          ctx,
          this.headRadius * 0.72,
          this.petalCount,
          this.palette.mid,
          this.palette.inner,
          Math.PI / this.petalCount
        );

        if (this.species === 0 || this.species === 3) {
          this.drawPetals(ctx, this.headRadius * 0.45, 5, this.palette.inner, '#ffffff', 0.4);
        }

        const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, this.headRadius * 0.24);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, this.palette.core);
        coreGrad.addColorStop(1, '#f08c00');

        ctx.fillStyle = coreGrad;
        ctx.shadowColor = this.palette.core;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, this.headRadius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    drawPetals(ctx, radius, count, colorStart, colorEnd, angleOffset) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + angleOffset;
        ctx.save();
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);

        if (this.species === 2) {
          ctx.bezierCurveTo(-radius * 0.45, -radius * 0.4, -radius * 0.5, -radius * 0.95, -radius * 0.12, -radius);
          ctx.lineTo(0, -radius * 0.86);
          ctx.lineTo(radius * 0.12, -radius);
          ctx.bezierCurveTo(radius * 0.5, -radius * 0.95, radius * 0.45, -radius * 0.4, 0, 0);
        } else if (this.species === 1) {
          ctx.quadraticCurveTo(-radius * 0.34, -radius * 0.55, 0, -radius * 1.08);
          ctx.quadraticCurveTo(radius * 0.34, -radius * 0.55, 0, 0);
        } else {
          ctx.bezierCurveTo(-radius * 0.55, -radius * 0.3, -radius * 0.48, -radius * 0.98, 0, -radius);
          ctx.bezierCurveTo(radius * 0.48, -radius * 0.98, radius * 0.55, -radius * 0.3, 0, 0);
        }

        const pGrad = ctx.createLinearGradient(0, 0, 0, -radius);
        pGrad.addColorStop(0, colorStart);
        pGrad.addColorStop(1, colorEnd);

        ctx.fillStyle = pGrad;
        ctx.shadowColor = this.palette.glow;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
    }
  }

  function spawnInteractiveFlower(x, y, playSound = true) {
    const maxFlowers = isMobile ? 24 : 36;
    if (interactiveFlowers.length > maxFlowers) {
      interactiveFlowers.shift();
    }
    interactiveFlowers.push(new InteractiveFlower(x, y));
    if (playSound) {
      audio.playBloomChime();
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      s.phase += s.speed;
      const alpha = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
      ctx.fillStyle = `rgba(255, 250, 240, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.018;

      if (ss.alpha <= 0) {
        shootingStars.splice(i, 1);
        continue;
      }

      const tailX = ss.x - Math.cos(ss.angle) * ss.len;
      const tailY = ss.y - Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    for (const flower of interactiveFlowers) {
      flower.update();
      flower.draw(ctx);
    }

    for (const f of fireflies) {
      f.phase += 0.04;
      f.x += f.vx + Math.sin(f.phase * 0.7) * 0.35;
      f.y += f.vy;

      if (f.y < -20) {
        f.y = height + 10;
        f.x = Math.random() * width;
      }
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;

      const glowAlpha = 0.35 + 0.65 * Math.abs(Math.sin(f.phase));
      ctx.save();
      ctx.fillStyle = `hsla(${f.hue}, 100%, 75%, ${glowAlpha.toFixed(3)})`;
      ctx.shadowColor = `hsla(${f.hue}, 100%, 65%, 0.9)`;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = fallingPetals.length - 1; i >= 0; i--) {
      const p = fallingPetals[i];
      p.swayPhase += 0.03;
      p.x += p.vx + Math.sin(p.swayPhase) * 0.8;
      p.y += p.vy;
      p.rot += p.vRot;

      if (p.y > height + 30) {
        fallingPetals.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size, p.size, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size, p.size * 0.5, -p.size, -p.size, 0, -p.size);
      ctx.fill();
      ctx.restore();
    }

    for (let i = sparkParticles.length - 1; i >= 0; i--) {
      const sp = sparkParticles[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 0.03;
      sp.alpha -= sp.decay;

      if (sp.alpha <= 0) {
        sparkParticles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = sp.alpha;
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = floatingHearts.length - 1; i >= 0; i--) {
      const h = floatingHearts[i];
      h.swayPhase += 0.05;
      h.x += h.vx + Math.sin(h.swayPhase) * 0.4;
      h.y += h.vy;
      h.alpha -= 0.008;

      if (h.alpha <= 0) {
        floatingHearts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;
      ctx.shadowColor = h.color;
      ctx.shadowBlur = 10;

      const s = h.size * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(0, -s * 0.3, -s, -s * 0.3, -s, s * 0.4);
      ctx.bezierCurveTo(-s, s * 1.1, 0, s * 1.5, 0, s * 1.9);
      ctx.bezierCurveTo(0, s * 1.5, s, s * 1.1, s, s * 0.4);
      ctx.bezierCurveTo(s, -s * 0.3, 0, -s * 0.3, 0, s * 0.4);
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(animateCanvas);
  }

  // ============================================================================
  // 3. SURPRISE CHOREOGRAPHY
  // ============================================================================
  function triggerGrandSurprise() {
    if (isGardenActive) return;
    isGardenActive = true;

    // Unlock Web Audio context synchronously inside user gesture
    audio.initContext();
    bloomBtn.textContent = 'Memuat...';
    bloomBtn.style.opacity = '0.75';

    setTimeout(() => {
      document.title = 'I Love You Anisa Aulia 🌸';
      audio.start();

      introScreen.classList.add('fade-out');
      gardenScene.classList.remove('hidden');

      void gardenScene.offsetWidth;
      gardenScene.classList.add('active');

      triggerPetalShower(32);

      const flankPositions = isMobile
        ? [
            { x: width * 0.14, y: height * 0.62, delay: 650 },
            { x: width * 0.86, y: height * 0.60, delay: 1000 },
            { x: width * 0.22, y: height * 0.72, delay: 1400 },
            { x: width * 0.78, y: height * 0.70, delay: 1750 },
          ]
        : [
            { x: width * 0.16, y: height * 0.56, delay: 600 },
            { x: width * 0.84, y: height * 0.54, delay: 950 },
            { x: width * 0.25, y: height * 0.66, delay: 1350 },
            { x: width * 0.75, y: height * 0.64, delay: 1700 },
          ];

      flankPositions.forEach((pos) => {
        setTimeout(() => {
          spawnInteractiveFlower(pos.x, pos.y, false);
        }, pos.delay);
      });
    }, 350);
  }

  bloomBtn.addEventListener('click', triggerGrandSurprise);

  canvas.addEventListener('pointerdown', (e) => {
    if (!isGardenActive) return;
    spawnInteractiveFlower(e.clientX, e.clientY, true);
  });

  setInterval(() => {
    if (document.visibilityState === 'visible' && Math.random() > 0.35) {
      spawnShootingStar();
    }
  }, 6500);

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  initFireflies();
  requestAnimationFrame(animateCanvas);
})();
