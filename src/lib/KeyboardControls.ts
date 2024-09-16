export class KeyboardControls {
  private keysPressed: { [key: string]: boolean } = {};

  constructor() {
    // 이벤트 핸들러 바인딩
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // 이벤트 리스너 등록
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = this.mapKey(event.code);
    if (key) {
      this.keysPressed[key] = true;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    const key = this.mapKey(event.code);
    if (key) {
      this.keysPressed[key] = false;
    }
  }

  /**
   * 키 코드를 액션 이름으로 매핑합니다.
   * @param code - KeyboardEvent.code
   * @returns 액션 이름 또는 null
   */
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
      case 'KeyV':
        return 'toggleView';
      default:
        return null;
    }
  }

  /**
   * 특정 액션 키가 눌려있는지 확인합니다.
   * @param key - 액션 이름 (예: 'forward', 'jump')
   * @returns 눌려있으면 true, 아니면 false
   */
  public isPressed(key: string): boolean {
    return !!this.keysPressed[key];
  }

  /**
   * 모든 키 상태를 초기화합니다.
   */
  public reset(): void {
    for (const key in this.keysPressed) {
      if (Object.prototype.hasOwnProperty.call(this.keysPressed, key)) {
        this.keysPressed[key] = false;
      }
    }
  }

  /**
   * 이벤트 리스너를 제거하여 메모리 누수를 방지합니다.
   */
  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
