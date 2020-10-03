import * as THREE from "three";
import { GLTFLoader } from "THREE/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "THREE/examples/jsm/loaders/DRACOLoader";

import { gsap } from "gsap";

let geo, dodec;
let tlCam, tlColor; //tweens
const animObjects = [];
const colorArray = [
  "#ff99",
  "#ff9900",
  "#ff6153",
  "#ff9",
  "#ff9990",
  "#ff5353",
  "#ffc14a",
  "#791111",
];
let curColor;

const clipParams = {
  clipIntersection: true,
  planeConstant: 0.5,
  showHelpers: false,
};

const clipPlanes = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
];
clipPlanes.forEach((clipPlane) => {
  clipPlane.constant = 0.5;
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
camera.position.set(0, 0, 5.0);

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
  return Math.floor(Math.random() * (max - min + 1) + min);
};

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
  for (let j = 0; j < clipPlanes.length; j++) {
    gsap.to(clipPlanes[j], {
      duration: 0.5,
      constant: 0,
      yoyo: true,
      repeat: -1,
      repeatDelay: 0.5,
    });
  }

  tlCam = gsap.to(camera.position, {
    z: 3.5,
    duration: 0.5,
    repeatDelay: 0.5,
    ease: "back.inOut(1.7)",
    yoyo: true,
    repeat: -1,
  });

  tlColor = gsap.to(".morph", {
    backgroundColor: () => colorArray[curColor],
    duration: 0.5,
    repeatDelay: 0.5,
    repeat: -1,
    ease: "back.inOut(1.7)",
    repeatRefresh: true,
    onRepeat: () => {
      if (curColor < colorArray.length - 1) {
        curColor++;
      } else {
        curColor = 0;
      }
    },
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

loader.load(
  // resource URL
  "dodecahedron-sculpt.glb",
  // called when the resource is loaded
  function (gltf) {
    geo = gltf.scene;

    scene.add(geo);

    //gltf.animations; // Array<THREE.AnimationClip>
    //gltf.scene; // THREE.Group
    //gltf.scenes; // Array<THREE.Group>
    //gltf.cameras; // Array<THREE.Camera>
    //gltf.asset; // Object
    dodec = scene.getObjectByName("Solid");
    dodec.material = material;
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

const animate = function () {
  requestAnimationFrame(animate);
  if (dodec) {
    dodec.rotation.y -= 0.01;
  }
  renderer.render(scene, camera);
};

animate();
