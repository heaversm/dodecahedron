import * as dat from "dat.gui";
import { gsap } from "gsap";

let container, texture, particleCon;
let leon, controll;
const particleTotal = 5000;
let particles = [];
let myText = "digitalfutures ".split("");
const textTotal = myText.length;
let curText = -1;
let DELAY_TIME = 0.8;

function init() {
  generatePixi(0xfec82e, ".container");

  //myText = shuffle(myText);

  texture = PIXI.Texture.from("drop-alpha.png");

  particleCon = new PIXI.ParticleContainer(particleTotal, {
    vertices: false,
    scale: true,
    position: true,
    rotation: false,
    uvs: false,
    alpha: false,
  });
  stage.addChild(particleCon);

  let p, i;
  for (i = 0; i < particleTotal; i++) {
    p = new PIXI.Sprite(texture);
    p.x = sw / 2;
    p.y = sh / 2;
    p.anchor.set(0.5);
    p.scale.x = p.scale.y = 0;
    particleCon.addChild(p);
    particles.push(p);
  }

  const blurFilter = new PIXI.filters.BlurFilter();
  blurFilter.blur = 10;
  blurFilter.autoFit = true;

  const fragSource = [
    "precision mediump float;",
    "varying vec2 vTextureCoord;",
    "uniform sampler2D uSampler;",
    "uniform float threshold;",
    "uniform float mr;",
    "uniform float mg;",
    "uniform float mb;",
    "void main(void)",
    "{",
    "    vec4 color = texture2D(uSampler, vTextureCoord);",
    "    vec3 mcolor = vec3(mr, mg, mb);",
    "    if (color.a > threshold) {",
    "       gl_FragColor = vec4(mcolor, 1.0);",
    "    } else {",
    "       gl_FragColor = vec4(vec3(0.0), 0.0);",
    "    }",
    "}",
  ].join("\n");

  const uniformsData = {
    threshold: 0.5,
    mr: 255.0 / 255.0,
    mg: 255.0 / 255.0,
    mb: 255.0 / 255.0,
  };

  const uniformsBlackData = {
    threshold: 0.5,
    mr: 0 / 255.0,
    mg: 0 / 255.0,
    mb: 0 / 255.0,
  };

  let thresholdFilter = new PIXI.Filter(null, fragSource, uniformsData);
  let thresholdFilterBlack = new PIXI.Filter(
    null,
    fragSource,
    uniformsBlackData
  );

  const outlineFilter = new PIXI.filters.OutlineFilter(1, 0xdedede);

  stage.filters = [blurFilter, thresholdFilter, outlineFilter];
  stage.filterArea = renderer.screen;

  controll = {
    weight: 6,
    outline: true,
  };

  leon = new LeonSans({
    text: "",
    size: 600,
    weight: 700,
    pathGap: -1,
    isPath: true,
  });
  leon.on("update", (data) => {
    update(data);
  });

  const gui = new dat.GUI();
  gui.add(leon, "size", 400, 1000);
  gui.add(controll, "weight", 3, 9);
  const otControll = gui.add(controll, "outline");
  otControll.onChange((value) => {
    if (value) {
      stage.filters = [blurFilter, thresholdFilterBlack, outlineFilter];
    } else {
      stage.filters = [blurFilter, thresholdFilterBlack];
    }
  });

  requestAnimationFrame(animate);

  showText();
}

function switchToWhiteText() {
  stage.filters[1] = thresholdFilter;
}

function switchToWhiteText() {
  stage.filters = [blurFilter, thresholdFilter];
}

function switchToBlackText() {
  stage.filters = [blurFilter, thresholdFilterBlack];
}

function switchToOutlineText() {
  stage.filters = [blurFilter, thresholdFilter, outlineFilter];
}

function nextText() {
  gsap.killTweensOf(showText);
  gsap.delayedCall(DELAY_TIME, showText);
}

function showText() {
  curText += 1;
  if (curText == textTotal) curText = 0;
  leon.text = myText[curText];
  nextText();
}

function shuffle(oldArray) {
  var newArray = oldArray.slice(),
    len = newArray.length,
    i = len,
    p,
    t;
  while (i--) {
    p = (Math.random() * len) | 0;
    t = newArray[i];
    newArray[i] = newArray[p];
    newArray[p] = t;
  }
  return newArray;
}

function update(model) {
  const total = model.paths.length;
  const sw2 = sw / 2;
  const sh2 = sh / 2;
  let i, p, pos, scale;
  for (i = 0; i < particleTotal; i++) {
    p = particles[i];
    gsap.killTweensOf(p);
    if (i < total) {
      pos = model.paths[i];
      if (pos.type == "a") {
        scale = controll.weight * 0.02 * leon.scale;
      } else {
        scale = controll.weight * 0.01 * leon.scale;
      }
      gsap.to(p, 0.4, {
        x: sw2,
        y: sh2,
        ease: "sine.easein",
      });
      gsap.to(p, 0.5, {
        delay: 0.3,
        x: pos.x,
        y: pos.y,
        ease: "expo.easeout",
      });
      gsap.to(p.scale, 0.5, {
        delay: 0.3,
        x: scale,
        y: scale,
        ease: "expo.easeout",
      });
    } else {
      gsap.to(p, 0.3, {
        x: sw2,
        y: sh2,
        ease: "sine.easein",
      });
      gsap.to(p.scale, 0.3, {
        x: 0,
        y: 0,
        ease: "sine.easein",
      });
    }
  }
}

function animate(t) {
  requestAnimationFrame(animate);

  const x = (sw - leon.rect.w) / 2;
  const y = (sh - leon.rect.h) / 2;
  leon.position(x, y);

  renderer.render(stage);
}

window.onload = () => {
  init();
};
