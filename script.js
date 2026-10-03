import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================
   SCENE
========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x9bb6c9);


/* =========================
   CAMERA
========================= */

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 0.5, 6);


/* =========================
   RENDERER
========================= */

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.2;

document.body.appendChild(
  renderer.domElement
);


/* =========================
   LIGHTS
========================= */

const skyLight =
  new THREE.HemisphereLight(
    0xffffff,
    0x3a342c,
    3
  );

scene.add(skyLight);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    5
  );

sun.position.set(
  5,
  8,
  5
);

scene.add(sun);


const warmLight =
  new THREE.DirectionalLight(
    0xffb36b,
    2
  );

warmLight.position.set(
  -5,
  2,
  4
);

scene.add(warmLight);


/* =========================
   RIFLE
========================= */

let rifle = null;

const loader = new GLTFLoader();

/*
  IMPORTANT:
  This is the exact name of
  your GitHub rifle file.
*/

const MODEL_URL =
  "./dae_-__rigby_hunting_rifle_-_game_ready_asset.glb";


loader.load(

  MODEL_URL,

  /* SUCCESS */

  function (gltf) {

    console.log(
      "RIFLE LOADED SUCCESSFULLY!"
    );

    rifle = gltf.scene;

    scene.add(rifle);


    /* -------------------------
       FIND MODEL SIZE
    ------------------------- */

    rifle.updateMatrixWorld(true);

    const box =
      new THREE.Box3()
        .setFromObject(rifle);

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    const largestSide =
      Math.max(
        size.x,
        size.y,
        size.z
      );


    /* -------------------------
       SCALE MODEL
    ------------------------- */

    const scale =
      4.5 / largestSide;

    rifle.scale.setScalar(scale);

    rifle.updateMatrixWorld(true);


    /* -------------------------
       CENTER MODEL
    ------------------------- */

    const newBox =
      new THREE.Box3()
        .setFromObject(rifle);

    const center =
      newBox.getCenter(
        new THREE.Vector3()
      );

    rifle.position.x -= center.x;
    rifle.position.y -= center.y;
    rifle.position.z -= center.z;


    /* Slightly lift rifle */

    rifle.position.y += 0.2;


    /* Starting angle */

    rifle.rotation.y = 0.4;

    rifle.rotation.x = 0.05;


    /* -------------------------
       MATERIAL SETTINGS
    ------------------------- */

    rifle.traverse(
      function (object) {

        if (object.isMesh) {

          object.castShadow = true;

          object.receiveShadow = true;

          if (object.material) {

            object.material.needsUpdate =
              true;

          }
        }
      }
    );


    /* REMOVE LOADING SCREEN */

    const loading =
      document.getElementById(
        "loading"
      );

    if (loading) {

      loading.style.display =
        "none";

    }

  },


  /* LOADING PROGRESS */

  function (progress) {

    if (progress.total > 0) {

      const percent =
        Math.round(
          progress.loaded /
          progress.total *
          100
        );

      const text =
        document.querySelector(
          ".loading-text"
        );

      if (text) {

        text.textContent =
          "LOADING RIFLE... " +
          percent +
          "%";

      }
    }
  },


  /* ERROR */

  function (error) {

    console.error(
      "RIFLE ERROR:",
      error
    );

    const text =
      document.querySelector(
        ".loading-text"
      );

    if (text) {

      text.textContent =
        "RIFLE FAILED TO LOAD";

    }
  }

);


/* =========================
   MOUSE MOVEMENT
========================= */

let targetX = 0.05;
let targetY = 0.4;

document.addEventListener(
  "mousemove",
  function (event) {

    const mouseX =
      event.clientX /
      window.innerWidth -
      0.5;

    const mouseY =
      event.clientY /
      window.innerHeight -
      0.5;

    targetY =
      mouseX * 1.2;

    targetX =
      mouseY * 0.3;

  }
);


/* =========================
   RESIZE
========================= */

window.addEventListener(
  "resize",
  function () {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


/* =========================
   GAME LOOP
========================= */

function animate() {

  requestAnimationFrame(
    animate
  );

  if (rifle) {

    rifle.rotation.y +=
      (targetY -
       rifle.rotation.y) *
      0.04;

    rifle.rotation.x +=
      (targetX -
       rifle.rotation.x) *
      0.04;

  }

  renderer.render(
    scene,
    camera
  );

}

animate();
