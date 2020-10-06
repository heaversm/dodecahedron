import * as THREE from "three";
import { GLTFLoader } from "THREE/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "THREE/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { gsap } from "gsap";

const config = {
  controls: true,
  gui: true,
  initRotX: 0, //deg
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

const clipParams = {
  clipIntersection: true,
  planeConstant: 0,
  showHelpers: false,
};

const clipPlanes = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
];
clipPlanes.forEach((clipPlane) => {
  clipPlane.constant = clipParams.planeConstant;
});
const sphereGroup = new THREE.Group();
let sphereColors = [
  0x00ffae,
  0xff0066,
  0x00ffae,
  0xff0066,
  0x00ffae,
  0xff0066,
  0x00ffae,
  0xff0066,
];

const $bg = document.querySelector("body");
const $circle = document.querySelector(".circle");

const loader = new GLTFLoader();
// Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("THREE/examples/js/libs/draco/");
loader.setDRACOLoader(dracoLoader);

const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 3.0);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.localClippingEnabled = true;

document.body.appendChild(renderer.domElement);

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
scene.add(directionalLight);

if (config.controls) {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 6;
  controls.update();
}

const colorTo = function (target, value, duration = 1) {
  let valueHex = new THREE.Color(value);
  gsap.to(target, {
    r: valueHex.r,
    g: valueHex.g,
    b: valueHex.b,
    duration: duration,
  });
};

const onGuiRotChange = function () {
  const { x, y, z } = guiRot;
  geo.rotation.set(
    THREE.MathUtils.degToRad(x),
    THREE.MathUtils.degToRad(y),
    THREE.MathUtils.degToRad(z)
  );
};

const initGUI = function () {
  gui = new dat.GUI();

  guiRot = {
    x: config.initRotX,
    y: 0,
    z: 0,
  };
  const posFolder = gui.addFolder("Positioning");
  const guiRotX = posFolder.add(guiRot, "x", 0, 359);
  guiRotX.onChange(onGuiRotChange);
  const guiRotY = posFolder.add(guiRot, "y", 0, 359);
  guiRotY.onChange(onGuiRotChange);
  const guiRotZ = posFolder.add(guiRot, "z", 0, 359);
  guiRotZ.onChange(onGuiRotChange);

  posFolder.add(camera.position, "z", -2, 5).name("cam z");

  //gui.add(material);
  const colorFolder = gui.addFolder("Color");
  colorFolder
    .addColor(new ColorGUIHelper(material, "color"), "value") //
    .name("color");
  colorFolder
    .addColor(new ColorGUIHelper(material, "emissive"), "value") //
    .name("emissive");

  colorFolder
    .addColor(new ColorGUIHelper(ambientLight, "color"), "value") //
    .name("ambient light");

  colorFolder.addColor($bg.style, "backgroundColor").name("scene bg");
  colorFolder.addColor($circle.style, "backgroundColor").name("circle");
  gui
    .add(clipParams, "planeConstant", -1, 1)
    .step(0.01)
    .name("plane constant")
    .onChange((value) => {
      for (var j = 0; j < clipPlanes.length; j++) {
        clipPlanes[j].constant = value;
      }
    });

  const morphFolder = gui.addFolder("Morph Targets");
  morphFolder
    .add(params, "influence1", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[0] = value;
    });
  morphFolder
    .add(params, "influence2", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[1] = value;
    });
  morphFolder
    .add(params, "influence3", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[2] = value;
    });
  morphFolder
    .add(params, "influence4", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[3] = value;
    });
  morphFolder
    .add(params, "influence5", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[4] = value;
    });
  morphFolder
    .add(params, "influence6", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[5] = value;
    });
  morphFolder
    .add(params, "influence7", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[6] = value;
    });
  morphFolder
    .add(params, "influence8", 0, 1)
    .step(0.01)
    .onChange(function (value) {
      dodec.morphTargetInfluences[7] = value;
    });
};

const initSphere = function () {
  const sphereCount = 14;
  for (let i = 1; i <= sphereCount; i += 2) {
    let geometry = new THREE.SphereBufferGeometry(
      (i / sphereCount) * 0.25,
      48,
      24
    );

    const colorIndex = Math.ceil(i / 2);

    let material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(sphereColors[colorIndex]),
      side: THREE.DoubleSide,
      clippingPlanes: clipPlanes,
      clipIntersection: clipParams.clipIntersection,
    });

    const sphereMesh = new THREE.Mesh(geometry, material);
    sphereMesh.rotation.y = THREE.MathUtils.degToRad(90);
    sphereGroup.add(sphereMesh);
  }
  scene.add(sphereGroup);

  var light = new THREE.HemisphereLight(0xffffff, 0x080808, 1.5);
  light.position.set(-1.25, 1, 1.25);
  scene.add(light);
};

initSphere();

setTimeout(() => {
  if (config && config.gui) {
    initGUI();
  }
}, 5000);

loader.load(
  // resource URL
  "dodecahedron-sculpt.glb",
  // called when the resource is loaded
  function (gltf) {
    geo = gltf.scene;
    scene.add(geo);
    dodec = scene.getObjectByName("Solid");
    dodec.material = material;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened");
  }
);

const animate = function () {
  requestAnimationFrame(animate);
  if (controls) {
    controls.update();
  }
  renderer && renderer.render(scene, camera);
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
