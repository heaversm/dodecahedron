import * as THREE from "three";
import { GLTFLoader } from "THREE/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "THREE/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls.js";

// Instantiate a loader
var loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
var dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("THREE/examples/js/libs/draco/");
loader.setDRACOLoader(dracoLoader);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const material = new THREE.MeshStandardMaterial({
  color: 0x2194ce,
  emissive: 0x000,
  roughness: 1,
  //metalness: 0.5,
  side: THREE.DoubleSide,
});

//const ambientLight = new THREE.AmbientLight(0x000000);
//scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = true;
directionalLight.add(
  new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  )
);

scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

let geo;

loader.load(
  // resource URL
  "dodecahedron.glb",
  // called when the resource is loaded
  function (gltf) {
    geo = gltf.scene;
    geo.children[0].material = material;
    scene.add(geo);

    //gltf.animations; // Array<THREE.AnimationClip>
    //gltf.scene; // THREE.Group
    //gltf.scenes; // Array<THREE.Group>
    //gltf.cameras; // Array<THREE.Camera>
    //gltf.asset; // Object
    console.log(geo);
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened");
  }
);

camera.position.z = 5;

const animate = function () {
  requestAnimationFrame(animate);
  // s

  renderer.render(scene, camera);
};

animate();
