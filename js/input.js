/**
 * Input Manager for Brawl Legends (Keyboard & Gamepad)
 */

class InputManager {
  constructor() {
    this.keysDown = {};
    this.keysJustPressed = {};

    // Bindings for P1
    this.p1Binds = {
      left: ['KeyA', 'KeyA'],
      right: ['KeyD', 'KeyD'],
      up: ['KeyW', 'KeyW'],
      down: ['KeyS', 'KeyS'],
      jump: ['Space', 'KeyW'],
      light: ['KeyJ'],
      heavy: ['KeyK'],
      dodge: ['KeyL', 'ShiftLeft']
    };

    // Bindings for P2
    this.p2Binds = {
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      jump: ['ArrowUp'],
      light: ['Numpad1', 'Digit1'],
      heavy: ['Numpad2', 'Digit2'],
      dodge: ['Numpad3', 'Digit3']
    };

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture inputs if typing inside an input field
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (!this.keysDown[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keysDown[e.code] = true;

      // Prevent default page scroll on arrow keys and space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
    });
  }

  update() {
    // Clear single frame pressed pulses at the end of each frame
    this.keysJustPressed = {};
  }

  getInput(slotId, isBot, aiController, stage, fighters) {
    if (isBot && aiController) {
      return aiController.update(stage, fighters);
    }

    const binds = slotId === 'P2' ? this.p2Binds : this.p1Binds;
    const gamepad = this.getGamepad(slotId === 'P2' ? 1 : 0);

    const input = {
      left: this.checkKey(binds.left) || (gamepad && gamepad.left),
      right: this.checkKey(binds.right) || (gamepad && gamepad.right),
      up: this.checkKey(binds.up) || (gamepad && gamepad.up),
      down: this.checkKey(binds.down) || (gamepad && gamepad.down),
      jumpJustPressed: this.checkJustPressed(binds.jump) || (gamepad && gamepad.jumpJustPressed),
      lightJustPressed: this.checkJustPressed(binds.light) || (gamepad && gamepad.lightJustPressed),
      heavyJustPressed: this.checkJustPressed(binds.heavy) || (gamepad && gamepad.heavyJustPressed),
      dodgeJustPressed: this.checkJustPressed(binds.dodge) || (gamepad && gamepad.dodgeJustPressed)
    };

    return input;
  }

  checkKey(codes) {
    if (!codes) return false;
    return codes.some(code => this.keysDown[code]);
  }

  checkJustPressed(codes) {
    if (!codes) return false;
    return codes.some(code => this.keysJustPressed[code]);
  }

  getGamepad(padIndex = 0) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = gamepads[padIndex];
    if (!pad) return null;

    const deadzone = 0.25;
    const axisX = pad.axes[0] || 0;
    const axisY = pad.axes[1] || 0;

    return {
      left: axisX < -deadzone || (pad.buttons[14] && pad.buttons[14].pressed),
      right: axisX > deadzone || (pad.buttons[15] && pad.buttons[15].pressed),
      up: axisY < -deadzone || (pad.buttons[12] && pad.buttons[12].pressed),
      down: axisY > deadzone || (pad.buttons[13] && pad.buttons[13].pressed),
      jumpJustPressed: pad.buttons[0] && pad.buttons[0].pressed, // A / Cross
      lightJustPressed: pad.buttons[2] && pad.buttons[2].pressed, // X / Square
      heavyJustPressed: pad.buttons[3] && pad.buttons[3].pressed, // Y / Triangle
      dodgeJustPressed: (pad.buttons[1] && pad.buttons[1].pressed) || 
                        (pad.buttons[5] && pad.buttons[5].pressed) || 
                        (pad.buttons[7] && pad.buttons[7].pressed) // B / R1 / R2
    };
  }
}

window.inputManager = new InputManager();
