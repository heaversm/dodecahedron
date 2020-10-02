import * as THREE from "three";
import { GLTFLoader } from "THREE/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "THREE/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

import { gsap } from "gsap";

const config = {
  controls: true,
  gui: true,
  initCamZ: 5,
  primeCamZ: 2.5,
  zoomedZ: -1,
  initRotX: 0, //deg
  zoomedRotX: 30,
};

const params = {
  //morph targets
  influence1: 0,
  influence2: 0,
  influence3: 0,
  influence4: 0,
  influence5: 0,
  influence6: 0,
  influence7: 0,
  influence8: 0,
};

let controls, geo, gui, guiRot, dodec;

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
  color: 0xffa400,
  emissive: 0xbb5a5a,
  side: THREE.DoubleSide,
  flatShading: true,
  morphTargets: true,
});

material.color.convertSRGBToLinear();
material.emissive.convertSRGBToLinear();

const ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = false;

const onControlsChange = function () {
  //console.log(controls.getAzimuthalAngle(), controls.getPolarAngle());
};

const onGuiRotChange = function () {
  const { x, y, z } = guiRot;
  geo.rotation.set(
    THREE.MathUtils.degToRad(x),
    THREE.MathUtils.degToRad(y),
    THREE.MathUtils.degToRad(z)
  );
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

const randomIntFromInterval = function (min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const animObjects = [];

const doMorphAnim = function (index) {
  const thisAnimObj = animObjects[index];
  thisAnimObj.tween = gsap.to(thisAnimObj, {
    duration: randomIntFromInterval(0, 5),
    value: 1,
    ease: "expo.inOut",
    onUpdate: function (thisIndex) {
      dodec.morphTargetInfluences[thisIndex] = this.progress();
    },
    onUpdateParams: [index],
    yoyo: true,
    repeat: -1,
  });
};

const initMorphAnims = function () {
  for (let i = 0; i < dodec.morphTargetInfluences.length; i++) {
    animObjects.push({
      value: 0,
      tween: null,
    });
    doMorphAnim(i);
  }
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

  var folder = gui.addFolder("Morph Targets");
  folder
    .add(params, "influence1", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[0] = value;
    });
  folder
    .add(params, "influence2", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      console.log(dodec.morphTargetInfluences[1]);
      dodec.morphTargetInfluences[1] = value;
      //dodec.updateMorphTargets();
    });
  folder
    .add(params, "influence3", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[2] = value;
    });
  folder
    .add(params, "influence4", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[3] = value;
    });
  folder
    .add(params, "influence5", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[4] = value;
    });
  folder
    .add(params, "influence6", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[5] = value;
    });
  folder
    .add(params, "influence7", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[6] = value;
    });
  folder
    .add(params, "influence8", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[7] = value;
    });
};

scene.add(directionalLight);

if (config.controls) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.autoRotate = true;
  controls.update();
  controls.addEventListener("change", onControlsChange);
}

loader.load(
  // resource URL
  "dodecahedron-sculpt.glb",
  // called when the resource is loaded
  function (gltf) {
    geo = gltf.scene;
    (geo.rotation.x = THREE.MathUtils.degToRad(config.initRotX)),
      scene.add(geo);

    //gltf.animations; // Array<THREE.AnimationClip>
    //gltf.scene; // THREE.Group
    //gltf.scenes; // Array<THREE.Group>
    //gltf.cameras; // Array<THREE.Camera>
    //gltf.asset; // Object
    console.log(geo);
    dodec = scene.getObjectByName("Solid");
    dodec.material = material; //MH - wrong child?
    initGUI();
    setTimeout(initMorphAnims, 5000);
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
  controls.update();
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
