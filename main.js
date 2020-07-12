import * as THREE from "three";
import { GLTFLoader } from "THREE/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "THREE/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

import { gsap } from "gsap";

const config = {
  controls: false,
  gui: true,
  initCamZ: 5,
  primeCamZ: 2.5,
  zoomedZ: -1,
  initRotX: 0, //deg
  zoomedRotX: 30,
};

let controls, geo, gui, guiRot;

let tlGeo;

// Instantiate a loader
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("THREE/examples/js/libs/draco/");
loader.setDRACOLoader(dracoLoader);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  //roughness: 1,
  //metalness: 0.5,
  side: THREE.DoubleSide,
  flatShading: true,
});

material.color.convertSRGBToLinear();
material.emissive.convertSRGBToLinear();

const ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);
console.log(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = false;

const onControlsChange = function () {
  console.log(controls.getAzimuthalAngle(), controls.getPolarAngle());
};

const onGuiRotChange = function () {
  const { x, y, z } = guiRot;
  geo.rotation.set(
    THREE.MathUtils.degToRad(x),
    THREE.MathUtils.degToRad(y),
    THREE.MathUtils.degToRad(z)
  );
};

const initAnims = function () {
  tlGeo = gsap.timeline({
    //repeat: -1,
    //yoyo: false,
  });

  tlGeo.to(
    camera.position,
    {
      z: 3,
      duration: 5,
      ease: "none",
      onStart: () => {
        colorTo(material.emissive, 0xe8e8e8, 5);
      },
      onComplete: () => {
        camera.position.z -= 0.5;
        scene.background = new THREE.Color(0x000000);
        material.color = new THREE.Color(0xffffff);
        material.emissive = new THREE.Color(0xcdcdcd);
      },
    },
    "zoomIn"
  );
  tlGeo.to(
    geo.rotation,
    {
      x: THREE.MathUtils.degToRad(config.zoomedRotX),
      duration: 5,
    },
    "zoomIn"
  );
  tlGeo.to(camera.position, {
    z: 2,
    duration: 5,
    ease: "none",
    onComplete: () => {
      camera.position.z -= 0.25;
      material.color = new THREE.Color(0xa2a7a2);
      material.emissive = new THREE.Color(0x373737);
      ambientLight.color = new THREE.Color(0xf5f5b4);
      //scene.background = new THREE.Color(0x5ca47d);
      colorTo(scene.background, 0x5ca47d, 1);
    },
  });
  tlGeo.to(geo.rotation, {
    x: THREE.MathUtils.degToRad(150),
    duration: 2,
    onComplete: () => {
      scene.background = new THREE.Color(0xcd6666);
      material.emissive = new THREE.Color(0x8c3e3e);
    },
  });
  tlGeo.to(geo.rotation, {
    y: THREE.MathUtils.degToRad(180),
    duration: 2,
    onComplete: () => {
      material.color = new THREE.Color(0xfbaf08);
      material.emissive = new THREE.Color(0x313131);
      ambientLight.color = new THREE.Color(0xaa9c92);
      //scene.background = new THREE.Color(0x101357);
      colorTo(scene.background, 0x101357, 1);
    },
  });
  tlGeo.to(geo.rotation, {
    z: THREE.MathUtils.degToRad(180),
    duration: 2,
    onComplete: () => {
      material.color = new THREE.Color(0xfb0000);
      material.emissive = new THREE.Color(0x313131);
      ambientLight.color = new THREE.Color(0x92a8aa);
      // scene.background = new THREE.Color(0x104657);
      colorTo(scene.background, 0x104657, 1);
    },
  });
  tlGeo.to(camera.position, {
    z: 2,
    duration: 1,
    ease: "back.in(2)",
    onStart: () => {
      colorTo(scene.background, 0xc964b6, 1);
      //scene.background = new THREE.Color(0xc964b6);
      colorTo(material.color, 0xffe070, 2);
      colorTo(ambientLight.color, 0xe6ca00, 1);
      material.emissive = new THREE.Color(0x000000);
    },
  });
  tlGeo.to(camera.position, {
    onStart: () => {
      colorTo(scene.background, 0x0000000, 1);
    },
    z: -2,
    duration: 1,
  });
};

const colorTo = function (target, value, duration = 1) {
  let valueHex = new THREE.Color(value);
  gsap.to(target, {
    r: valueHex.r,
    g: valueHex.g,
    b: valueHex.b,
    duration: duration,
  });
};

const initGUI = function () {
  gui = new dat.GUI();
  if (!config.gui) {
    gui.hide();
  }
  guiRot = {
    x: config.initRotX,
    y: 0,
    z: 0,
  };
  const guiRotX = gui.add(guiRot, "x", 0, 359);
  guiRotX.onChange(onGuiRotChange);
  const guiRotY = gui.add(guiRot, "y", 0, 359);
  guiRotY.onChange(onGuiRotChange);
  const guiRotZ = gui.add(guiRot, "z", 0, 359);
  guiRotZ.onChange(onGuiRotChange);

  gui.add(camera.position, "z", -2, 5).name("cam z");

  //gui.add(material);
  gui
    .addColor(new ColorGUIHelper(material, "color"), "value") //
    .name("color");
  gui
    .addColor(new ColorGUIHelper(material, "emissive"), "value") //
    .name("emissive");

  gui
    .addColor(new ColorGUIHelper(ambientLight, "color"), "value") //
    .name("ambient light");

  gui
    .addColor(new ColorGUIHelper(scene, "background"), "value") //
    .name("scene bg");
};

scene.add(directionalLight);

if (config.controls) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();
  controls.addEventListener("change", onControlsChange);
}

loader.load(
  // resource URL
  "dodecahedron.glb",
  // called when the resource is loaded
  function (gltf) {
    geo = gltf.scene;
    geo.children[0].material = material;
    (geo.rotation.x = THREE.MathUtils.degToRad(config.initRotX)),
      scene.add(geo);

    //gltf.animations; // Array<THREE.AnimationClip>
    //gltf.scene; // THREE.Group
    //gltf.scenes; // Array<THREE.Group>
    //gltf.cameras; // Array<THREE.Camera>
    //gltf.asset; // Object
    console.log(geo);
    initGUI();
    initAnims();
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

camera.position.z = config.initCamZ;

const animate = function () {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
};

animate();

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
