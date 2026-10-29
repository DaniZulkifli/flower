/**
 * ============================================================================
 * ROMANTIC BLOOMING NIGHT GARDEN - SCRIPT.JS
 * High-Performance Offscreen-Cached Canvas Engine (60/120 FPS Smooth)
 * ============================================================================
 */

(() => {
  'use strict';

  const canvas = document.getElementById('gardenCanvas');
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

  const introScreen = document.getElementById('introScreen');
  const errorContainer = document.getElementById('errorContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const bloomBtn = document.getElementById('bloomBtn');
  const gardenScene = document.getElementById('gardenScene');
  const bgMusic = document.getElementById('bgMusic');

  let isGardenActive = false;
  let isRenderLoopRunning = false;

  const ROSE_PALETTES = [
    { outer: '#ff2a6d', mid: '#ff5c8a', inner: '#ffacc5', core: '#ffe066', glow: 'rgba(255, 68, 134, 0.48)' },
    { outer: '#d90429', mid: '#ff4d6d', inner: '#ffb3c1', core: '#ffd166', glow: 'rgba(255, 77, 109, 0.48)' },
    { outer: '#c9184a', mid: '#ff758f', inner: '#ffe5ec', core: '#fff3b0', glow: 'rgba(255, 117, 143, 0.48)' },
    { outer: '#b5179e', mid: '#f72585', inner: '#ff9ebb', core: '#ffe08a', glow: 'rgba(247, 37, 133, 0.45)' },
  ];

  // ============================================================================
  // 1. CANVAS BOTANICAL & ATMOSPHERE ENGINE (OFFSCREEN CACHED, ZERO SHADOWBLUR)
  // ============================================================================
  let width = window.innerWidth;
  let height = window.innerHeight;
  let isMobile = width < 600;
  let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

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
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (stars.length === 0 || widthChanged) {
      initStars();
    }
  }

  function initStars() {
    stars.length = 0;
    const count = Math.floor((width * height) / (isMobile ? 9500 : 10500));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.78),
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.75 + 0.2,
        speed: Math.random() * 0.018 + 0.006,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function initFireflies() {
    fireflies.length = 0;
    const count = isMobile ? 15 : 24;
    for (let i = 0; i < count; i++) {
      const isGold = Math.random() > 0.45;
      fireflies.push({
        x: Math.random() * width,
        y: height * 0.25 + Math.random() * (height * 0.72),
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.38 - 0.14,
        r: Math.random() * (isMobile ? 1.6 : 2.1) + 1.1,
        phase: Math.random() * Math.PI * 2,
        coreColor: isGold ? '#fff3b0' : '#ffccd5',
        haloColor: isGold ? 'rgba(255, 212, 59, 0.28)' : 'rgba(255, 92, 138, 0.28)',
      });
    }
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * (width * 0.75) + width * 0.15,
      y: Math.random() * (height * 0.28),
      len: (isMobile ? 55 : 80) + Math.random() * 35,
      speed: (isMobile ? 7 : 10) + Math.random() * 5,
      angle: Math.PI * 0.78,
      alpha: 1,
    });
  }

  function spawnBurst(x, y, palette) {
    const sparkCount = isMobile ? 12 : 16;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * (isMobile ? 2.2 : 2.9) + 0.6;
      sparkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.45,
        r: Math.random() * 2.1 + 1.0,
        color: i % 2 === 0 ? palette.inner : palette.core,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.014,
      });
    }

    for (let i = 0; i < 2; i++) {
      floatingHearts.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y - 5,
        vy: -Math.random() * 0.9 - 0.55,
        vx: (Math.random() - 0.5) * 0.45,
        size: Math.random() * (isMobile ? 5 : 7) + (isMobile ? 6 : 7),
        alpha: 0.92,
        color: palette.mid,
        swayPhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function triggerPetalShower(count = 24) {
    const actualCount = isMobile ? 16 : count;
    for (let i = 0; i < actualCount; i++) {
      const pal = ROSE_PALETTES[Math.floor(Math.random() * ROSE_PALETTES.length)];
      fallingPetals.push({
        x: Math.random() * width,
        y: -20 - Math.random() * 220,
        vx: (Math.random() - 0.35) * 1.0,
        vy: Math.random() * 1.2 + 0.8,
        size: Math.random() * (isMobile ? 5 : 6.5) + (isMobile ? 4.5 : 5.5),
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.035,
        swayPhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? pal.mid : pal.inner,
        alpha: Math.random() * 0.35 + 0.55,
      });
    }
    spawnShootingStar();
  }

  // --- Pre-rendered Procedural Flower Class (Ultra-Fast) ---
  class InteractiveFlower {
    constructor(targetX, targetY) {
      this.palette = ROSE_PALETTES[Math.floor(Math.random() * ROSE_PALETTES.length)];
      const scaleFactor = isMobile ? 0.76 : 1;

      const marginX = isMobile ? 28 : 40;
      this.targetX = Math.max(marginX, Math.min(width - marginX, targetX));
      this.targetY = Math.max(height * 0.26, Math.min(targetY, height * 0.85));

      this.baseX = this.targetX + (Math.random() - 0.5) * (isMobile ? 50 : 85);
      this.baseY = height + 10;

      this.ctrlX = (this.baseX + this.targetX) / 2 + (Math.random() - 0.5) * (isMobile ? 45 : 80);
      this.ctrlY = (this.baseY + this.targetY) / 2;

      this.stemProgress = 0;
      this.stemSpeed = 0.025 + Math.random() * 0.008;
      this.bloomProgress = 0;
      this.bloomSpeed = 0.024 + Math.random() * 0.008;
      this.hasSparked = false;

      this.species = Math.floor(Math.random() * 4);
      this.headRadius = (Math.random() * 12 + 25) * scaleFactor;
      this.stemWidth = 3.2 * scaleFactor;
      this.petalCount = this.species === 2 ? 5 : this.species === 1 ? 6 : 8;

      this.swayPhase = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.015 + Math.random() * 0.008;
      this.swayAmp = (4.5 + Math.random() * 4.5) * scaleFactor;

      this.leaves = [
        { t: 0.38, side: -1, size: (13 + Math.random() * 4) * scaleFactor, angle: -0.6 },
        { t: 0.62, side: 1, size: (12 + Math.random() * 4) * scaleFactor, angle: 0.6 },
      ];

      // Pre-render flower head to an offscreen canvas once!
      this.spriteSize = Math.ceil(this.headRadius * 3.4);
      this.spriteCanvas = this.buildHeadSprite();
    }

    buildHeadSprite() {
      const off = document.createElement('canvas');
      const s = this.spriteSize;
      off.width = s * dpr;
      off.height = s * dpr;
      const oCtx = off.getContext('2d');
      oCtx.scale(dpr, dpr);
      oCtx.translate(s / 2, s / 2);

      // Soft radial aura
      const aura = oCtx.createRadialGradient(0, 0, 2, 0, 0, this.headRadius * 1.6);
      aura.addColorStop(0, this.palette.glow);
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      oCtx.fillStyle = aura;
      oCtx.beginPath();
      oCtx.arc(0, 0, this.headRadius * 1.6, 0, Math.PI * 2);
      oCtx.fill();

      // Petal layers
      this.drawPetalsToCache(oCtx, this.headRadius, this.petalCount, this.palette.outer, this.palette.mid, 0);
      this.drawPetalsToCache(
        oCtx,
        this.headRadius * 0.72,
        this.petalCount,
        this.palette.mid,
        this.palette.inner,
        Math.PI / this.petalCount
      );

      if (this.species === 0 || this.species === 3) {
        this.drawPetalsToCache(oCtx, this.headRadius * 0.45, 5, this.palette.inner, '#ffffff', 0.4);
      }

      // Glowing core
      const coreGrad = oCtx.createRadialGradient(0, 0, 1, 0, 0, this.headRadius * 0.25);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.55, this.palette.core);
      coreGrad.addColorStop(1, 'rgba(240, 140, 0, 0)');
      oCtx.fillStyle = coreGrad;
      oCtx.beginPath();
      oCtx.arc(0, 0, this.headRadius * 0.25, 0, Math.PI * 2);
      oCtx.fill();

      return off;
    }

    drawPetalsToCache(oCtx, radius, count, colorStart, colorEnd, angleOffset) {
      const pGrad = oCtx.createLinearGradient(0, 0, 0, -radius);
      pGrad.addColorStop(0, colorStart);
      pGrad.addColorStop(1, colorEnd);

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + angleOffset;
        oCtx.save();
        oCtx.rotate(angle);

        oCtx.beginPath();
        oCtx.moveTo(0, 0);

        if (this.species === 2) {
          oCtx.bezierCurveTo(-radius * 0.45, -radius * 0.4, -radius * 0.5, -radius * 0.95, -radius * 0.12, -radius);
          oCtx.lineTo(0, -radius * 0.86);
          oCtx.lineTo(radius * 0.12, -radius);
          oCtx.bezierCurveTo(radius * 0.5, -radius * 0.95, radius * 0.45, -radius * 0.4, 0, 0);
        } else if (this.species === 1) {
          oCtx.quadraticCurveTo(-radius * 0.34, -radius * 0.55, 0, -radius * 1.08);
          oCtx.quadraticCurveTo(radius * 0.34, -radius * 0.55, 0, 0);
        } else {
          oCtx.bezierCurveTo(-radius * 0.55, -radius * 0.3, -radius * 0.48, -radius * 0.98, 0, -radius);
          oCtx.bezierCurveTo(radius * 0.48, -radius * 0.98, radius * 0.55, -radius * 0.3, 0, 0);
        }

        oCtx.fillStyle = pGrad;
        oCtx.fill();
        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        oCtx.lineWidth = 0.7;
        oCtx.stroke();
        oCtx.restore();
      }
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

      // 1. Draw Stem (using native quadraticCurveTo when fully grown, or segmented while growing)
      ctx.beginPath();
      ctx.moveTo(this.baseX, this.baseY);

      if (this.stemProgress >= 1) {
        ctx.quadraticCurveTo(this.ctrlX + sway * 0.5, this.ctrlY, this.targetX + sway, this.targetY);
      } else {
        const steps = 14;
        const maxStep = Math.ceil(steps * this.stemProgress);
        for (let i = 1; i <= maxStep; i++) {
          const t = Math.min(this.stemProgress, i / steps);
          const pt = this.getPointOnStem(t, sway);
          ctx.lineTo(pt.x, pt.y);
        }
      }

      ctx.strokeStyle = '#20c997';
      ctx.lineWidth = this.stemWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 2. Draw Leaves
      ctx.fillStyle = '#20c997';
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
          ctx.fill();
          ctx.restore();
        }
      }

      // 3. Draw Cached Flower Head Sprite (1 drawImage call!)
      if (this.stemProgress >= 0.95) {
        const x = this.bloomProgress;
        const c1 = 1.70158;
        const c3 = c1 + 1;
        const scale = Math.max(0.01, 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2));
        const headPos = this.getPointOnStem(1, sway);
        const half = this.spriteSize / 2;

        ctx.save();
        ctx.translate(headPos.x, headPos.y);
        ctx.rotate(sway * 0.012);
        ctx.scale(scale, scale);
        ctx.drawImage(this.spriteCanvas, -half, -half, this.spriteSize, this.spriteSize);
        ctx.restore();
      }
    }
  }

  function spawnInteractiveFlower(x, y) {
    const maxFlowers = isMobile ? 16 : 24;
    if (interactiveFlowers.length >= maxFlowers) {
      interactiveFlowers.shift();
    }
    interactiveFlowers.push(new InteractiveFlower(x, y));
  }

  // --- Ultra-Light 60/120fps Render Loop ---
  function animateCanvas() {
    if (!isRenderLoopRunning) return;

    if (document.visibilityState === 'hidden') {
      requestAnimationFrame(animateCanvas);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Twinkling Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.speed;
      ctx.globalAlpha = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
      ctx.fillStyle = '#fffaf0';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Shooting Stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.02;

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
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }

    // 3. Procedural Flowers (Offscreen Cached)
    for (let i = 0; i < interactiveFlowers.length; i++) {
      interactiveFlowers[i].update();
      interactiveFlowers[i].draw(ctx);
    }

    // 4. Fireflies (Fast Dual-Circle Glow without shadowBlur)
    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];
      f.phase += 0.04;
      f.x += f.vx + Math.sin(f.phase * 0.7) * 0.3;
      f.y += f.vy;

      if (f.y < -20) {
        f.y = height + 10;
        f.x = Math.random() * width;
      }
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;

      const glowAlpha = 0.35 + 0.65 * Math.abs(Math.sin(f.phase));
      ctx.globalAlpha = glowAlpha;

      // Soft outer halo
      ctx.fillStyle = f.haloColor;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = f.coreColor;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Falling Petals
    for (let i = fallingPetals.length - 1; i >= 0; i--) {
      const p = fallingPetals[i];
      p.swayPhase += 0.03;
      p.x += p.vx + Math.sin(p.swayPhase) * 0.75;
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

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size, p.size, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size, p.size * 0.5, -p.size, -p.size, 0, -p.size);
      ctx.fill();
      ctx.restore();
    }

    // 6. Spark Particles
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

      ctx.globalAlpha = sp.alpha;
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Floating Mini Hearts
    for (let i = floatingHearts.length - 1; i >= 0; i--) {
      const h = floatingHearts[i];
      h.swayPhase += 0.05;
      h.x += h.vx + Math.sin(h.swayPhase) * 0.35;
      h.y += h.vy;
      h.alpha -= 0.009;

      if (h.alpha <= 0) {
        floatingHearts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.globalAlpha = h.alpha;
      ctx.fillStyle = h.color;

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

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateCanvas);
  }

  // ============================================================================
  // 2. SURPRISE CHOREOGRAPHY
  // ============================================================================
  function triggerGrandSurprise() {
    if (isGardenActive) return;
    isGardenActive = true;

    // Jalankan sound.mp3 langsung saat tombol diklik
    if (bgMusic) {
      bgMusic.currentTime = 0;
      bgMusic.play().catch(() => {});
    }

    // Tampilkan indikator loading di tengah layar
    if (errorContainer) errorContainer.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');

    // Bunga mekar 5 detik (5000ms) setelah tombol diklik
    setTimeout(() => {
      if (!isRenderLoopRunning) {
        isRenderLoopRunning = true;
        requestAnimationFrame(animateCanvas);
      }

      introScreen.classList.add('fade-out');
      gardenScene.classList.remove('hidden');

      void gardenScene.offsetWidth;
      gardenScene.classList.add('active');

      triggerPetalShower(24);

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
          spawnInteractiveFlower(pos.x, pos.y);
        }, pos.delay);
      });
    }, 5000);
  }

  bloomBtn.addEventListener('click', triggerGrandSurprise);

  canvas.addEventListener('pointerdown', (e) => {
    if (!isGardenActive || !isRenderLoopRunning) return;
    spawnInteractiveFlower(e.clientX, e.clientY);
  });

  setInterval(() => {
    if (isRenderLoopRunning && document.visibilityState === 'visible' && Math.random() > 0.4) {
      spawnShootingStar();
    }
  }, 7000);

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  initFireflies();
})();
