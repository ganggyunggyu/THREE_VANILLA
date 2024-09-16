import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
interface SceneOption {
  camera: THREE.Camera;
  loader: GLTFLoader;
}

export class Scene {
  private scene: THREE.Scene;

  constructor(options: SceneOption) {
    this.scene = new THREE.Scene();
    this.scene.add(options.camera);
  }
}
