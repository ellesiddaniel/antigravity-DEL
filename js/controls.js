/**
 * Subway Surfers 3D - Controls & Input Handler
 * Supports Keyboard, Touch Swipe Gestures, Virtual D-pad, and Double-Tap.
 */

class InputHandler {
  constructor() {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.lastTapTime = 0;
    this.minSwipeDistance = 30; // Min px to trigger swipe
    this.maxTapDelay = 300; // ms for double tap
    this.active = true;

    this.initKeyboard();
    this.initTouch();
    this.initMobileButtons();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.active) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.triggerAction('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.triggerAction('right');
          break;
        case 'ArrowUp':
        case 'KeyW':
          this.triggerAction('jump');
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.triggerAction('slide');
          break;
        case 'Space':
        case 'KeyE':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.triggerAction('hoverboard');
          break;
        case 'Escape':
        case 'KeyP':
          this.triggerAction('pause');
          break;
      }
    });
  }

  initTouch() {
    const container = document.getElementById('game-container') || window;

    container.addEventListener('touchstart', (e) => {
      if (!this.active) return;
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();

      // Double tap detection for hoverboard
      const currentTime = Date.now();
      const tapLength = currentTime - this.lastTapTime;
      if (tapLength < this.maxTapDelay && tapLength > 50) {
        this.triggerAction('hoverboard');
      }
      this.lastTapTime = currentTime;
    }, { passive: false });

    container.addEventListener('touchend', (e) => {
      if (!this.active) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > this.minSwipeDistance) {
        // Determine horizontal vs vertical swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0) {
            this.triggerAction('right');
          } else {
            this.triggerAction('left');
          }
        } else {
          if (deltaY > 0) {
            this.triggerAction('slide');
          } else {
            this.triggerAction('jump');
          }
        }
      }
    }, { passive: false });
  }

  initMobileButtons() {
    const btnUp = document.getElementById('dpad-up');
    const btnDown = document.getElementById('dpad-down');
    const btnLeft = document.getElementById('dpad-left');
    const btnRight = document.getElementById('dpad-right');
    const btnBoard = document.getElementById('btn-board-trigger');

    if (btnUp) btnUp.addEventListener('click', () => this.triggerAction('jump'));
    if (btnDown) btnDown.addEventListener('click', () => this.triggerAction('slide'));
    if (btnLeft) btnLeft.addEventListener('click', () => this.triggerAction('left'));
    if (btnRight) btnRight.addEventListener('click', () => this.triggerAction('right'));
    if (btnBoard) btnBoard.addEventListener('click', () => this.triggerAction('hoverboard'));
  }

  triggerAction(action) {
    if (!window.game) return;
    
    // Resume audio context on any first user interaction
    if (window.audioManager) {
      window.audioManager.ensureContext();
    }

    switch (action) {
      case 'left':
        window.game.moveLane(-1);
        break;
      case 'right':
        window.game.moveLane(1);
        break;
      case 'jump':
        window.game.jump();
        break;
      case 'slide':
        window.game.slide();
        break;
      case 'hoverboard':
        window.game.activateHoverboard();
        break;
      case 'pause':
        window.game.togglePause();
        break;
    }
  }
}

window.inputHandler = new InputHandler();
