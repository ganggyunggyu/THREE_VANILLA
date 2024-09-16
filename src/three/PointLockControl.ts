import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as THREE from 'three';

interface PointerLockControlOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  onLock?: () => void;
  onUnlock?: () => void;
}

export class PointerLockControl {
  private controls: PointerLockControls;
  private onLockCallback?: () => void;
  private onUnlockCallback?: () => void;

  constructor(options: PointerLockControlOptions) {
    this.controls = new PointerLockControls(options.camera, options.domElement);
    this.onLockCallback = options.onLock;
    this.onUnlockCallback = options.onUnlock;

    this.controls.addEventListener('lock', this.onLock.bind(this));
    this.controls.addEventListener('unlock', this.onUnlock.bind(this));

    this.domElementClickListener = this.domElementClickListener.bind(this);
    options.domElement.addEventListener('click', this.domElementClickListener);
  }

  private onLock() {
    if (this.onLockCallback) this.onLockCallback();
  }

  private onUnlock() {
    if (this.onUnlockCallback) this.onUnlockCallback();
  }

  private domElementClickListener() {
    this.controls.lock();
  }

  public getObject(): THREE.Object3D {
    return this.controls.getObject();
  }

  public isLocked(): boolean {
    return this.controls.isLocked;
  }

  public dispose() {
    this.controls.removeEventListener('lock', this.onLock.bind(this));
    this.controls.removeEventListener('unlock', this.onUnlock.bind(this));
    this.controls.dispose();
  }
}
