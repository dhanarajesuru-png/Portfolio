/**
 * ============================================================================
 * WHOLE-CARD ELASTIC LANYARD & ID BADGE PHYSICS ENGINE
 * Enables dragging the entire ID Card across the entire monitor/screen,
 * while the lanyard strap acts as a dynamic ultra-elastic rubber band.
 * On release: 2D Spring-Mass-Damper + Pendulum Harmonic Oscillation.
 * ============================================================================
 */

(function initWholeCardElasticLanyard() {
  const wrapper = document.getElementById('hero-photo-wrapper');
  const card = document.getElementById('hero-photo-card');
  const mount = document.getElementById('id-lanyard-mount');
  const svg = document.getElementById('lanyard-elastic-svg');
  const bandPath = document.getElementById('lanyard-band-path');
  const shadowPath = document.getElementById('lanyard-shadow-path');
  const neonPath = document.getElementById('lanyard-neon-path');

  if (!card || !wrapper || !svg || !bandPath) return;

  // Web Audio Context for tactile rubber stretch and snap effects
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTensionHum(tensionRatio) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120 + tensionRatio * 320, now);
      
      gain.gain.setValueAtTime(0.02 * Math.min(tensionRatio, 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }

  function playSnapAndSwingSound(velocityMag, distance) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      
      // Whip snap sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.min(distance * 0.5, 400), now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (_) {}
  }

  // Physics & Coordinate State
  let isDragging = false;
  let pointerId = null;
  let grabOffsetX = 0;
  let grabOffsetY = 0;

  // Current Card Position (relative to origin (0, 0))
  let posX = 0;
  let posY = 0;
  let targetX = 0;
  let targetY = 0;
  let velX = 0;
  let velY = 0;

  // Angular Pendulum Rotation
  let angle = 0;
  let targetAngle = 0;
  let angleVel = 0;

  // Rubber Squash/Stretch
  let squish = 0;
  let squishVel = 0;

  let animFrameId = null;
  let lastSoundTime = 0;

  // Base dimensions & physics constants
  const BASE_STRAP_WIDTH = 30;  // Width in px when relaxed
  const MIN_STRAP_WIDTH = 8;    // Width in px at maximum stretch
  const STIFFNESS = 0.14;       // Bungee spring tension strength
  const DAMPING = 0.82;         // Air and elastic friction damping (smooth bouncy oscillation)
  const ANGULAR_STIFFNESS = 0.16;
  const ANGULAR_DAMPING = 0.80;

  // Calculate local coordinates of the top lanyard mount relative to SVG
  function getAnchorCoords() {
    const wrapRect = wrapper.getBoundingClientRect();
    const mountRect = mount ? mount.getBoundingClientRect() : wrapRect;
    
    return {
      x: (mountRect.left + mountRect.width / 2) - wrapRect.left,
      y: (mountRect.top + mountRect.height / 2) - wrapRect.top
    };
  }

  // Draw the elastic lanyard ribbon SVG connecting top anchor to the card clip
  function drawLanyardStrap(cardOffsetX, cardOffsetY, cardAngleDeg, tension) {
    const anchor = getAnchorCoords();
    const wrapRect = wrapper.getBoundingClientRect();

    // The top attachment point of the card clip in SVG coordinates
    // Origin of card is at top center
    const cardTopX = anchor.x + cardOffsetX;
    const cardTopY = anchor.y + 24 + cardOffsetY;

    // Control point for realistic elastic catenary curve
    const midX = (anchor.x + cardTopX) / 2;
    const midY = (anchor.y + cardTopY) / 2;
    
    // Dynamic sag / drag bow
    const sagX = midX - cardOffsetX * 0.12;
    const sagY = midY - cardOffsetY * 0.08 + Math.min(tension * 25, 40);

    const pathD = `M ${anchor.x} ${anchor.y} Q ${sagX} ${sagY} ${cardTopX} ${cardTopY}`;

    // Dynamic strap width: thins under high tension (Poisson conservation)
    const strapWidth = Math.max(MIN_STRAP_WIDTH, BASE_STRAP_WIDTH * (1 / (1 + tension * 1.6)));
    const neonWidth = Math.max(2, strapWidth * 0.25);

    // Dynamic glow colors based on tension percentage
    let neonColor, glowSpread;
    if (tension < 0.35) {
      neonColor = '#00f2fe';
      glowSpread = '0 0 10px #00f2fe';
    } else if (tension < 0.75) {
      neonColor = '#c084fc';
      glowSpread = '0 0 16px #c084fc';
    } else {
      neonColor = '#ff4b6e';
      glowSpread = '0 0 22px #ff4b6e';
    }

    if (bandPath) {
      bandPath.setAttribute('d', pathD);
      bandPath.setAttribute('stroke-width', strapWidth.toFixed(1));
    }

    if (shadowPath) {
      shadowPath.setAttribute('d', `M ${anchor.x} ${anchor.y + 6} Q ${sagX} ${sagY + 8} ${cardTopX} ${cardTopY + 6}`);
      shadowPath.setAttribute('stroke-width', (strapWidth + 6).toFixed(1));
    }

    if (neonPath) {
      neonPath.setAttribute('d', pathD);
      neonPath.setAttribute('stroke-width', neonWidth.toFixed(1));
      neonPath.setAttribute('stroke', neonColor);
      neonPath.style.filter = `drop-shadow(${glowSpread})`;
    }
  }

  // Apply complete 6-DOF transform & visual state to card
  function applyCardTransform(x, y, cardAngle, tension) {
    const dist = Math.sqrt(x * x + y * y);

    // 3D perspective tilt
    const tiltX = Math.max(-25, Math.min(25, -(y * 0.04)));
    const tiltY = Math.max(-25, Math.min(25, (x * 0.04)));

    // Rubber squash / stretch along velocity & tension
    const scaleY = 1 + tension * 0.08 + squish * 0.15;
    const scaleX = 1 / Math.sqrt(Math.max(0.5, scaleY));

    // Dynamic border color & glow
    let borderColor, glowColor;
    if (tension < 0.35) {
      borderColor = `rgba(0, 242, 254, ${0.4 + tension * 0.6})`;
      glowColor = `rgba(0, 242, 254, ${0.2 + tension * 0.4})`;
    } else if (tension < 0.75) {
      borderColor = `rgba(192, 132, 252, ${0.6 + tension * 0.4})`;
      glowColor = `rgba(192, 132, 252, ${0.3 + tension * 0.4})`;
    } else {
      borderColor = `rgba(255, 75, 110, 0.95)`;
      glowColor = `rgba(255, 75, 110, 0.55)`;
    }

    const glowRadius = 20 + tension * 40;

    card.style.transform = `
      translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(tension * 30).toFixed(1)}px)
      rotateZ(${cardAngle.toFixed(2)}deg)
      rotateX(${tiltX.toFixed(2)}deg)
      rotateY(${tiltY.toFixed(2)}deg)
      scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})
    `;

    card.style.borderColor = borderColor;
    card.style.boxShadow = `0 25px 60px rgba(0, 0, 0, 0.85), 0 0 ${glowRadius}px ${glowColor}`;

    // Update lanyard SVG strap
    drawLanyardStrap(x, y, cardAngle, tension);
  }

  // Animation Frame Loop for Spring Physics & Pendulum Decaying Oscillation
  function startPhysicsLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    function frame() {
      const dist = Math.sqrt(posX * posX + posY * posY);
      const maxScreenDist = Math.max(window.innerWidth, window.innerHeight) * 0.7;
      const tension = Math.min(dist / maxScreenDist, 1.2);

      if (isDragging) {
        // Fluidly chase mouse target position
        posX += (targetX - posX) * 0.55;
        posY += (targetY - posY) * 0.55;

        // Angle dynamically aligns with pull vector + horizontal drag momentum
        const pullAngle = Math.atan2(posX, Math.max(40, posY + 80)) * (180 / Math.PI) * 0.65;
        angle += (pullAngle - angle) * 0.4;

        applyCardTransform(posX, posY, angle, tension);
        animFrameId = requestAnimationFrame(frame);
        return;
      }

      // 2D Damped Harmonic Bungee Spring: F = -k * x - c * v
      const springFx = -STIFFNESS * posX;
      const springFy = -STIFFNESS * posY;

      velX = (velX + springFx) * DAMPING;
      velY = (velY + springFy) * DAMPING;

      posX += velX;
      posY += velY;

      // Angular Pendulum Decay
      const targetPendulumAngle = Math.atan2(posX, 120) * (180 / Math.PI) * 0.75;
      const angularTorque = -ANGULAR_STIFFNESS * (angle - targetPendulumAngle);
      angleVel = (angleVel + angularTorque) * ANGULAR_DAMPING;
      angle += angleVel;

      // Squash/Stretch Harmonic Wobble
      const squishForce = -0.22 * squish;
      squishVel = (squishVel + squishForce) * 0.75;
      squish += squishVel;

      applyCardTransform(posX, posY, angle, tension);

      // Check remaining energy to settle
      const totalEnergy = Math.abs(posX) + Math.abs(posY) + Math.abs(velX) + Math.abs(velY) + Math.abs(angle) + Math.abs(angleVel);
      if (totalEnergy > 0.12) {
        animFrameId = requestAnimationFrame(frame);
      } else {
        // Clean rest state
        posX = 0;
        posY = 0;
        velX = 0;
        velY = 0;
        angle = 0;
        angleVel = 0;
        squish = 0;
        squishVel = 0;
        card.style.transform = '';
        card.style.borderColor = '';
        card.style.boxShadow = '';
        drawLanyardStrap(0, 0, 0, 0);
      }
    }

    animFrameId = requestAnimationFrame(frame);
  }

  // Pointer Events: Allows boundless dragging anywhere on the screen
  function onPointerDown(e) {
    // Only primary mouse button or touch
    if (e.button !== undefined && e.button !== 0) return;

    isDragging = true;
    pointerId = e.pointerId;
    card.classList.add('is-dragging');

    try {
      card.setPointerCapture(e.pointerId);
    } catch (_) {}

    // Calculate grab offset relative to current card position
    const wrapRect = wrapper.getBoundingClientRect();
    const anchor = getAnchorCoords();
    const cardRestX = wrapRect.left + anchor.x;
    const cardRestY = wrapRect.top + anchor.y + 24;

    grabOffsetX = e.clientX - (cardRestX + posX);
    grabOffsetY = e.clientY - (cardRestY + posY);

    getAudioContext();
    startPhysicsLoop();
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    const wrapRect = wrapper.getBoundingClientRect();
    const anchor = getAnchorCoords();
    const cardRestX = wrapRect.left + anchor.x;
    const cardRestY = wrapRect.top + anchor.y + 24;

    // Target displacement anywhere on monitor
    targetX = e.clientX - cardRestX - grabOffsetX;
    targetY = e.clientY - cardRestY - grabOffsetY;

    // Audio tension hum
    const dist = Math.sqrt(targetX * targetX + targetY * targetY);
    const now = Date.now();
    if (now - lastSoundTime > 110) {
      playTensionHum(Math.min(dist / 500, 1));
      lastSoundTime = now;
    }
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    card.classList.remove('is-dragging');

    try {
      card.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Impart snap release velocity based on distance pulled
    const dist = Math.sqrt(posX * posX + posY * posY);
    velX = -posX * 0.28;
    velY = -posY * 0.28;
    angleVel = (velX * 0.12);
    squish = Math.min(dist * 0.0025, 0.8);
    squishVel = -0.35;

    playSnapAndSwingSound(Math.sqrt(velX * velX + velY * velY), dist);
    startPhysicsLoop();
  }

  // Hover magnet pull
  function onWrapperMouseMove(e) {
    if (isDragging) return;
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const dx = e.clientX - cardCenterX;
    const dy = e.clientY - cardCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 220) {
      const pull = Math.min(dist * 0.08, 14);
      const theta = Math.atan2(dy, dx);
      targetX = Math.cos(theta) * pull;
      targetY = Math.sin(theta) * pull;
      posX += (targetX - posX) * 0.2;
      posY += (targetY - posY) * 0.2;
      angle += ((targetX * 0.3) - angle) * 0.2;
      applyCardTransform(posX, posY, angle, pull / 14 * 0.15);
    }
  }

  function onWrapperMouseLeave() {
    if (!isDragging && (posX !== 0 || posY !== 0)) {
      startPhysicsLoop();
    }
  }

  // Event Listeners
  card.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  wrapper.addEventListener('mousemove', onWrapperMouseMove);
  wrapper.addEventListener('mouseleave', onWrapperMouseLeave);

  // Resize handler to keep lanyard anchor calibrated
  window.addEventListener('resize', () => {
    drawLanyardStrap(posX, posY, angle, 0);
  });

  // Initial draw & subtle intro swing
  drawLanyardStrap(0, 0, 0, 0);
  setTimeout(() => {
    velX = 18;
    velY = 24;
    angleVel = 6;
    startPhysicsLoop();
  }, 1000);
})();
