import * as THREE from 'three';

import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let controls: PointerLockControls;
let model: THREE.Object3D | null;
let raycaster: THREE.Raycaster;

const objects: THREE.Mesh[] = [];

let isFirstPerson: boolean = true;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const loader = new GLTFLoader();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

init();

function init() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="tutorial-overlay">
    <div id="tutorial-guide">
      <p style="font-size: 36px">Click to play</p>
    </div>
  </div>
`;

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.y = 10;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 0, 750);

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  loader.load(
    '/public/SK_Bird.glb',
    (gltf) => {
      model = gltf.scene;
      console.log(model);
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
        }
      });
      model.scale.set(5, 5, 5);
      model.position.set(0, 10, 0);

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error('GLTF 모델 로드 실패:', error);
    }
  );

  controls = new PointerLockControls(camera, document.body);

  const tutorialOverlay = document.getElementById(
    'tutorial-overlay'
  ) as HTMLDivElement;
  const tutorialGuide = document.getElementById(
    'tutorial-guide'
  ) as HTMLDivElement;

  tutorialGuide.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    tutorialGuide.style.display = 'none';
    tutorialOverlay.style.display = 'none';
  });

  controls.addEventListener('unlock', () => {
    tutorialOverlay.style.display = 'block';
    tutorialGuide.style.display = '';
  });
  console.log(controls);
  scene.add(controls.object);

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;

      case 'Space':
        if (canJump === true) velocity.y += 350;
        canJump = false;
        break;
      case 'KeyV':
        toggleView();
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(0, -1, 0),
    0,
    10
  );

  let floorGeometry = new THREE.PlaneGeometry(
    2000,
    2000,
    100,
    100
  ) as THREE.BufferGeometry;
  floorGeometry.rotateX(-Math.PI / 2);

  let position = floorGeometry.attributes.position;

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i);

    vertex.x += Math.random() * 20 - 10;
    vertex.y += Math.random() * 2;
    vertex.z += Math.random() * 20 - 10;

    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  floorGeometry = floorGeometry.toNonIndexed();

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

  const floorMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });

  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);

  const boxGeometry = new THREE.BoxGeometry(20, 20, 20).toNonIndexed();

  position = boxGeometry.attributes.position;
  const colorsBox = [];

  for (let i = 0, l = position.count; i < l; i++) {
    color.setHSL(
      Math.random() * 0.3 + 0.5,
      0.75,
      Math.random() * 0.25 + 0.75,
      THREE.SRGBColorSpace
    );
    colorsBox.push(color.r, color.g, color.b);
  }

  boxGeometry.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(colorsBox, 3)
  );

  for (let i = 0; i < 500; i++) {
    const boxMaterial = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      flatShading: true,
      vertexColors: true,
    });
    boxMaterial.color.setHSL(
      Math.random() * 0.2 + 0.5,
      0.75,
      Math.random() * 0.25 + 0.75,
      THREE.SRGBColorSpace
    );

    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
    box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
    box.position.z = Math.floor(Math.random() * 20 - 10) * 20;

    scene.add(box);
    objects.push(box);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const toggleView = () => {
  isFirstPerson = !isFirstPerson;

  if (isFirstPerson) {
    // 1인칭 시점으로 전환
    if (model) {
      // 카메라 위치를 모델의 머리 위치로 설정
      const headOffset = new THREE.Vector3(0, 5, 0); // 모델의 머리 위치에 맞게 조정
      headOffset.applyQuaternion(camera.quaternion);
      camera.position.copy(model.position).add(headOffset);

      // PointerLockControls 활성화
      controls.lock();
    }
  } else {
    // 3인칭 시점으로 전환
    if (model) {
      // PointerLockControls 비활성화
      controls.unlock();

      // 카메라를 모델의 뒤쪽으로 배치
      const thirdPersonOffset = new THREE.Vector3(0, 5, 10); // 뒤쪽 및 약간 위로
      thirdPersonOffset.applyQuaternion(camera.quaternion);
      camera.position.copy(model.position).add(thirdPersonOffset);

      // 카메라가 모델을 바라보도록 설정
      camera.lookAt(model.position);
    }
  }
};

function animate() {
  const time = performance.now();

  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.object.position);
    if (model) raycaster.ray.origin.copy(model.position);

    raycaster.ray.origin.y -= 10;

    const intersections = raycaster.intersectObjects(objects, false);

    const onObject = intersections.length > 0;

    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) {
      velocity.z -= direction.z * 1000.0 * delta;
      console.log(velocity.z);
    }
    if (moveLeft || moveRight) {
      velocity.x -= direction.x * 1000.0 * delta;
    }

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    if (isFirstPerson && model) {
      model.position.copy(controls.object.position);
    }

    if (!isFirstPerson && model) {
      // PointerLockControls의 객체 위치 가져오기
      const cameraPosition = controls.object.position;

      // 3인칭 시점의 오프셋 정의
      const thirdPersonOffset = new THREE.Vector3(5, 0, 0);

      // cameraPosition과 thirdPersonOffset을 더하여 새로운 위치 계산
      const targetPosition = cameraPosition.clone().add(thirdPersonOffset);

      // 카메라의 위치를 targetPosition으로 설정
      model.position.copy(targetPosition);
    }
    controls.object.position.y += velocity.y * delta;

    if (controls.object.position.y < 10) {
      velocity.y = 0;
      controls.object.position.y = 10;

      canJump = true;
    }
  }

  prevTime = time;

  renderer.render(scene, camera);
}
