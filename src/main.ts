import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControl } from './three/PointLockControl';

let model: THREE.Object3D | undefined;
export let camera: THREE.PerspectiveCamera;
export let scene: THREE.Scene;
let light: THREE.AmbientLight;
let directionalLight: THREE.DirectionalLight;
let loader: GLTFLoader;
let group: THREE.Group;
let isJumping = false;

const velocity = new THREE.Vector3();

const keysPressed: { [key: string]: boolean } = {};
group = new THREE.Group();

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1, -2);

light = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light);

directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="three-container" style="width: 100%; height: 100vh;"/>
`;

const threeContainer =
  document.querySelector<HTMLDivElement>('#three-container')!;
threeContainer.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

const control = new PointerLockControl({
  camera: camera,
  domElement: document.body,
  onLock: () => {
    console.log('lock');
  },
  onUnlock: () => {
    console.log('unlock');
  },
});

const vertex = new THREE.Vector3();
const color = new THREE.Color();

let floorGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(
  2000,
  2000,
  100,
  100
);
floorGeometry.rotateX(-Math.PI / 2);

let position = floorGeometry.attributes.position;

for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i);

  vertex.x += Math.random() * 20 - 10;
  vertex.y += Math.random() * 2;
  vertex.z += Math.random() * 20 - 10;

  position.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

floorGeometry.toNonIndexed();

position = floorGeometry.attributes.position;
const colorsFloor = [];

for (let i = 0, l = position.count; i < l; i++) {
  color.setHSL(
    Math.random() * 0.3 + 0.5,
    0.75,
    Math.random() * 0.25 + 0.75,
    THREE.SRGBColorSpace
  );
  colorsFloor.push(color.r, color.g, color.b);
}

floorGeometry.setAttribute(
  'color',
  new THREE.Float32BufferAttribute(colorsFloor, 3)
);

const floorMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
scene.add(floor);

loader = new GLTFLoader();
loader.load(
  '/SK_Bird.glb',
  (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    model.scale.set(3, 3, 3);
    model.position.set(0, 1, 0);

    group.add(model);
    group.add(camera);
    scene.add(group);
  },
  (error) => {
    console.error('모델 로드 실패', error);
  }
);

window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});
const moveSpeed = 0.1;
const animate = () => {
  requestAnimationFrame(animate);
  const direction = new THREE.Vector3();
  const time = performance.now();
  let prevTime = performance.now();

  const delta = (time - prevTime) / 1000;

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  velocity.y -= 9.8 * 100.0 * delta;
  if (control.isLocked()) {
    if (model) {
      const moveDistance = moveSpeed;
      const rotateAngle = Math.PI / 100;

      if (keysPressed['q']) {
        model.rotation.y += rotateAngle;
      }
      if (keysPressed['e']) {
        model.rotation.y -= rotateAngle;
      }
      if (keysPressed['w']) {
        console.log(performance);
        console.log(direction);
        direction.z += moveDistance;
      }
      if (keysPressed['s']) {
        direction.z -= moveDistance;
      }
      if (keysPressed['a']) {
        direction.x += moveDistance;
      }
      if (keysPressed['d']) {
        direction.x -= moveDistance;
      }
      if (keysPressed['v']) {
        if (!isJumping) {
          isJumping = true;
          let startY = model.position.y;
          let velocity = 0.2;
          let gravity = -0.01;

          const jumpAnimation = () => {
            if (model) {
              velocity += gravity;
              model.position.y += velocity;
              console.log(group.position);
              if (model.position.y <= startY) {
                model.position.y = startY;
                group.position.y = startY;
                isJumping = false;
              } else {
                requestAnimationFrame(jumpAnimation);
              }
            }
          };

          requestAnimationFrame(jumpAnimation);
        }
      }
      model.position.add(direction);
      direction.applyQuaternion(model.quaternion);

      const cameraOffset = new THREE.Vector3(0, 0.3, -1);

      const relativeCameraOffset = cameraOffset
        .clone()
        .applyMatrix4(model.matrixWorld);

      camera.position.lerp(relativeCameraOffset, 0.05);

      camera.lookAt(model.position);
    }
  }

  renderer.render(scene, camera);
};
animate();
