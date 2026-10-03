import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* =========================================================
   MOUNTAIN HUNT
   ========================================================= */

// ---------------------------------------------------------
// SCENE
// ---------------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87b7d4);
scene.fog = new THREE.FogExp2(0x9fc1d2, 0.006);


// ---------------------------------------------------------
// CAMERA
// ---------------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1200
);

camera.position.set(0, 4.5, 15);


// ---------------------------------------------------------
// RENDERER
// ---------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);


// ---------------------------------------------------------
// LIGHTING
// ---------------------------------------------------------

const hemiLight = new THREE.HemisphereLight(
  0xcceeff,
  0x554433,
  2.2
);

scene.add(hemiLight);

const sun = new THREE.DirectionalLight(
  0xffe2b8,
  3
);

sun.position.set(-60, 90, 30);

sun.castShadow = true;

scene.add(sun);


// ---------------------------------------------------------
// GROUND
// ---------------------------------------------------------

const groundGeometry = new THREE.PlaneGeometry(
  1000,
  1000,
  120,
  120
);

const groundPositions =
  groundGeometry.attributes.position;

for (
  let i = 0;
  i < groundPositions.count;
  i++
) {

  const x = groundPositions.getX(i);
  const y = groundPositions.getY(i);

  const distance =
    Math.sqrt(x * x + y * y);

  let height =
    Math.sin(x * 0.035) * 4 +
    Math.cos(y * 0.045) * 4 +
    Math.sin((x + y) * 0.018) * 7;

  // flatter near player
  if (distance < 45) {
    height *= distance / 45;
  }

  groundPositions.setZ(i, height);
}

groundGeometry.computeVertexNormals();

const groundMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x536b3f,
    roughness: 1
  });

const ground =
  new THREE.Mesh(
    groundGeometry,
    groundMaterial
  );

ground.rotation.x = -Math.PI / 2;

ground.position.y = -2;

ground.receiveShadow = true;

scene.add(ground);


// ---------------------------------------------------------
// DISTANT MOUNTAINS
// ---------------------------------------------------------

function createMountain(
  x,
  z,
  height,
  radius,
  color
) {

  const geometry =
    new THREE.ConeGeometry(
      radius,
      height,
      8
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: color,
      roughness: 1
    });

  const mountain =
    new THREE.Mesh(
      geometry,
      material
    );

  mountain.position.set(
    x,
    height / 2 - 4,
    z
  );

  mountain.rotation.y =
    Math.random() * Math.PI;

  scene.add(mountain);
}


// mountain ranges

for (let i = 0; i < 22; i++) {

  createMountain(
    -220 + i * 22,
    -170 - Math.random() * 100,
    45 + Math.random() * 70,
    30 + Math.random() * 30,
    0x56646a
  );
}


// ---------------------------------------------------------
// SNOW CAPS
// ---------------------------------------------------------

for (let i = 0; i < 12; i++) {

  const geometry =
    new THREE.ConeGeometry(
      12 + Math.random() * 10,
      15 + Math.random() * 12,
      8
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0xe8eeee
    });

  const snow =
    new THREE.Mesh(
      geometry,
      material
    );

  snow.position.set(
    -160 + i * 30,
    40 + Math.random() * 25,
    -190 - Math.random() * 60
  );

  scene.add(snow);
}


// ---------------------------------------------------------
// TREES
// ---------------------------------------------------------

function createTree(x, z, scale = 1) {

  const tree = new THREE.Group();

  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.35 * scale,
        0.55 * scale,
        5 * scale,
        7
      ),
      new THREE.MeshStandardMaterial({
        color: 0x4b3022
      })
    );

  trunk.position.y =
    2.5 * scale;

  tree.add(trunk);


  const leavesMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x183d27,
      roughness: 1
    });


  for (let i = 0; i < 3; i++) {

    const leaves =
      new THREE.Mesh(
        new THREE.ConeGeometry(
          (3 - i * 0.5) * scale,
          5 * scale,
          8
        ),
        leavesMaterial
      );

    leaves.position.y =
      (4.5 + i * 2) * scale;

    tree.add(leaves);
  }

  tree.position.set(x, -2, z);

  scene.add(tree);
}


// random forest

for (let i = 0; i < 90; i++) {

  let x =
    (Math.random() - 0.5) * 350;

  let z =
    -20 - Math.random() * 250;

  // keep center shooting area clearer
  if (
    Math.abs(x) < 15 &&
    z > -100
  ) {
    x += x > 0 ? 25 : -25;
  }

  createTree(
    x,
    z,
    0.7 + Math.random() * 1.2
  );
}


// ---------------------------------------------------------
// RIFLE
// ---------------------------------------------------------

let rifle = null;

const rifleHolder =
  new THREE.Group();

camera.add(rifleHolder);

scene.add(camera);


const loader =
  new GLTFLoader();


loader.load(

  "./rifle.glb",

  function (gltf) {

    rifle =
      gltf.scene;

    rifleHolder.add(rifle);


    // automatically normalize rifle size

    const box =
      new THREE.Box3()
        .setFromObject(rifle);

    const size =
      new THREE.Vector3();

    box.getSize(size);

    const maxDimension =
      Math.max(
        size.x,
        size.y,
        size.z
      );

    const desiredSize = 4.5;

    const scale =
      desiredSize / maxDimension;

    rifle.scale.setScalar(scale);


    // recalculate after scaling

    const newBox =
      new THREE.Box3()
        .setFromObject(rifle);

    const center =
      new THREE.Vector3();

    newBox.getCenter(center);


    rifle.position.sub(center);


    // FIRST PERSON POSITION

    rifleHolder.position.set(
      1.25,
      -1.25,
      -2.6
    );


    // orientation for this rifle model
    rifle.rotation.y =
      Math.PI / 2;

    rifle.rotation.z =
      -0.05;


    rifle.traverse(
      function (object) {

        if (object.isMesh) {

          object.castShadow = true;
          object.receiveShadow = true;

        }

      }
    );


    console.log(
      "RIFLE LOADED"
    );
     const loadingScreen = document.getElementById("loading");

if (loadingScreen) {
    loadingScreen.style.display = "none";
}
  },

  function (xhr) {

    if (xhr.total) {

      console.log(
        Math.round(
          xhr.loaded /
          xhr.total *
          100
        ) + "% rifle loaded"
      );

    }

  },

  function (error) {

    console.error(
      "RIFLE ERROR:",
      error
    );

  }

);


// ---------------------------------------------------------
// BIRDS
// ---------------------------------------------------------

const birds = [];

const birdGeometry =
  new THREE.BufferGeometry();

birdGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(
    [
      0, 0, 0,
      -1.4, -0.25, 0,
      -0.3, 0.35, 0,

      0, 0, 0,
      1.4, -0.25, 0,
      0.3, 0.35, 0
    ],
    3
  )
);

birdGeometry.computeVertexNormals();

const birdMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x25201b,
    side: THREE.DoubleSide
  });


function spawnBird() {

  const bird =
    new THREE.Mesh(
      birdGeometry,
      birdMaterial.clone()
    );

  const fromLeft =
    Math.random() > 0.5;

  bird.position.set(

    fromLeft ? -70 : 70,

    12 + Math.random() * 25,

    -40 - Math.random() * 100

  );

  bird.userData.speed =
    7 + Math.random() * 8;

  bird.userData.direction =
    fromLeft ? 1 : -1;

  bird.userData.phase =
    Math.random() * Math.PI * 2;

  bird.scale.setScalar(
    0.7 + Math.random() * 0.8
  );

  scene.add(bird);

  birds.push(bird);
}


for (let i = 0; i < 8; i++) {

  spawnBird();

}


// ---------------------------------------------------------
// AIMING
// ---------------------------------------------------------

let yaw = 0;
let pitch = 0;

let targetYaw = 0;
let targetPitch = 0;

let aiming = false;


document.addEventListener(
  "mousemove",
  function (event) {

    const sensitivity =
      aiming ? 0.0008 : 0.0015;

    targetYaw -=
      event.movementX *
      sensitivity;

    targetPitch -=
      event.movementY *
      sensitivity;

    targetPitch =
      Math.max(
        -0.7,
        Math.min(
          0.7,
          targetPitch
        )
      );

  }
);


// ---------------------------------------------------------
// POINTER LOCK
// ---------------------------------------------------------

renderer.domElement.addEventListener(
  "click",
  function () {

    if (
      document.pointerLockElement !==
      renderer.domElement
    ) {

      renderer.domElement
        .requestPointerLock();

    }

  }
);


// ---------------------------------------------------------
// SCORE
// ---------------------------------------------------------

let score = 0;
let shots = 0;


// ---------------------------------------------------------
// HUD
// ---------------------------------------------------------

const hud =
  document.createElement("div");

hud.style.position = "fixed";
hud.style.top = "25px";
hud.style.left = "30px";

hud.style.color = "white";
hud.style.fontFamily =
  "Arial, sans-serif";

hud.style.fontSize = "18px";
hud.style.letterSpacing = "3px";

hud.style.textShadow =
  "0 2px 5px black";

hud.style.zIndex = "20";

hud.innerHTML =
  "MOUNTAIN HUNT<br>" +
  "<span id='score'>HITS 0 &nbsp; SHOTS 0</span>";

document.body.appendChild(hud);


// ---------------------------------------------------------
// CROSSHAIR
// ---------------------------------------------------------

const crosshair =
  document.createElement("div");

crosshair.innerHTML = "+";

crosshair.style.position =
  "fixed";

crosshair.style.left = "50%";
crosshair.style.top = "50%";

crosshair.style.transform =
  "translate(-50%, -50%)";

crosshair.style.color = "white";

crosshair.style.fontSize = "30px";

crosshair.style.fontFamily =
  "Arial";

crosshair.style.textShadow =
  "0 1px 5px black";

crosshair.style.zIndex = "20";

crosshair.style.pointerEvents =
  "none";

document.body.appendChild(
  crosshair
);


// ---------------------------------------------------------
// SCOPE OVERLAY
// ---------------------------------------------------------

const scope =
  document.createElement("div");

scope.style.position =
  "fixed";

scope.style.left = "50%";
scope.style.top = "50%";

scope.style.width = "70vh";
scope.style.height = "70vh";

scope.style.transform =
  "translate(-50%, -50%)";

scope.style.border =
  "12px solid rgba(0,0,0,0.9)";

scope.style.borderRadius =
  "50%";

scope.style.boxShadow =
  "0 0 0 100vmax rgba(0,0,0,0.82)";

scope.style.zIndex = "15";

scope.style.pointerEvents =
  "none";

scope.style.display =
  "none";

document.body.appendChild(
  scope
);


// scope lines

const scopeHorizontal =
  document.createElement("div");

scopeHorizontal.style.position =
  "absolute";

scopeHorizontal.style.left = "0";
scopeHorizontal.style.top = "50%";

scopeHorizontal.style.width =
  "100%";

scopeHorizontal.style.height =
  "1px";

scopeHorizontal.style.background =
  "rgba(0,0,0,0.8)";

scope.appendChild(
  scopeHorizontal
);


const scopeVertical =
  document.createElement("div");

scopeVertical.style.position =
  "absolute";

scopeVertical.style.left =
  "50%";

scopeVertical.style.top = "0";

scopeVertical.style.height =
  "100%";

scopeVertical.style.width =
  "1px";

scopeVertical.style.background =
  "rgba(0,0,0,0.8)";

scope.appendChild(
  scopeVertical
);


// ---------------------------------------------------------
// RIGHT CLICK = SCOPE
// ---------------------------------------------------------

document.addEventListener(
  "contextmenu",
  function (event) {

    event.preventDefault();

  }
);


document.addEventListener(
  "mousedown",
  function (event) {

    if (event.button === 2) {

      aiming = true;

      scope.style.display =
        "block";

      crosshair.style.display =
        "none";

    }

  }
);


document.addEventListener(
  "mouseup",
  function (event) {

    if (event.button === 2) {

      aiming = false;

      scope.style.display =
        "none";

      crosshair.style.display =
        "block";

    }

  }
);


// ---------------------------------------------------------
// SHOOTING
// ---------------------------------------------------------

const raycaster =
  new THREE.Raycaster();


function shoot() {

  shots++;

  raycaster.setFromCamera(
    new THREE.Vector2(0, 0),
    camera
  );

  const hits =
    raycaster.intersectObjects(
      birds,
      false
    );

  if (hits.length > 0) {

    const bird =
      hits[0].object;

    score++;

    scene.remove(bird);

    const index =
      birds.indexOf(bird);

    if (index !== -1) {

      birds.splice(
        index,
        1
      );

    }

    setTimeout(
      spawnBird,
      800
    );

  }


  document.getElementById(
    "score"
  ).innerHTML =
    "HITS " +
    score +
    " &nbsp; SHOTS " +
    shots;


  // recoil

  if (rifleHolder) {

    rifleHolder.position.z +=
      0.18;

    setTimeout(
      function () {

        rifleHolder.position.z -=
          0.18;

      },
      80
    );

  }

}


document.addEventListener(
  "mousedown",
  function (event) {

    if (
      event.button === 0 &&
      document.pointerLockElement ===
      renderer.domElement
    ) {

      shoot();

    }

  }
);


// ---------------------------------------------------------
// CLOCK
// ---------------------------------------------------------

const clock =
  new THREE.Clock();


// ---------------------------------------------------------
// ANIMATION
// ---------------------------------------------------------

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  // smooth camera movement

  yaw +=
    (targetYaw - yaw) *
    0.12;

  pitch +=
    (targetPitch - pitch) *
    0.12;


  camera.rotation.order =
    "YXZ";

  camera.rotation.y =
    yaw;

  camera.rotation.x =
    pitch;


  // zoom while aiming

  const desiredFov =
    aiming ? 25 : 65;

  camera.fov +=
    (desiredFov -
      camera.fov) *
    0.12;

  camera.updateProjectionMatrix();


  // hide rifle while looking through scope

  if (rifleHolder) {

    rifleHolder.visible =
      !aiming;

  }


  // animate birds

  for (
    let i = birds.length - 1;
    i >= 0;
    i--
  ) {

    const bird =
      birds[i];

    bird.position.x +=

      bird.userData.direction *
      bird.userData.speed *
      delta;


    bird.position.y +=

      Math.sin(
        performance.now() *
        0.005 +
        bird.userData.phase
      ) *
      0.015;


    // face travel direction

    bird.rotation.y =
      bird.userData.direction > 0
        ? 0
        : Math.PI;


    if (
      Math.abs(
        bird.position.x
      ) > 90
    ) {

      scene.remove(bird);

      birds.splice(
        i,
        1
      );

      spawnBird();

    }

  }


  renderer.render(
    scene,
    camera
  );

}


animate();


// ---------------------------------------------------------
// WINDOW RESIZE
// ---------------------------------------------------------

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
