export class KeyboardControls {
  private keysPressed: { [key: string]: boolean } = {};

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown(event: KeyboardEvent) {
    const key = this.mapKey(event.code);
    if (key) {
      this.keysPressed[key] = true;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    const key = this.mapKey(event.code);
    if (key) {
      this.keysPressed[key] = false;
    }
  }

  private mapKey(code: string): string | null {
    switch (code) {
      case 'ArrowUp':
      case 'KeyW':
        return 'forward';
      case 'ArrowLeft':
      case 'KeyA':
        return 'left';
      case 'ArrowDown':
      case 'KeyS':
        return 'backward';
      case 'ArrowRight':
      case 'KeyD':
        return 'right';
      case 'Space':
        return 'jump';
      default:
        return null;
    }
  }

  public isPressed(key: string): boolean {
    return !!this.keysPressed[key];
  }

  public reset() {
    for (let key in this.keysPressed) {
      this.keysPressed[key] = false;
    }
  }

  public dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
