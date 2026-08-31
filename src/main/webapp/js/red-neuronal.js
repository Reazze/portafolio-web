// ==========================================
// 1. ESTADO GLOBAL Y DATOS DE LAS 7 UNIDADES (16 SESIONES C/U)
// ==========================================
const SYSTEM_STATE = {
  isAuthenticated: false,
  userRole: null,
  currentUnitId: null,
  currentSession: null,
  viewMode: "GLOBAL", // 'GLOBAL' (Carpetas 3D) | 'UNIT_DETAIL' (16 Nodos)
  isZoomed: false,
};

// Configuración de las 7 Unidades Didácticas con geometrías y colores distintivos
const UNITS_CONFIG = [
  {
    id: 1,
    tag: "UD01",
    title: "Unidad 1: Arquitectura y Fundamentos Web",
    shape: "icosahedron",
    color: 0x00e5ff,
  },
  {
    id: 2,
    tag: "UD02",
    title: "Unidad 2: Programación Estructurada y Algoritmos",
    shape: "torus",
    color: 0x0088ff,
  },
  {
    id: 3,
    tag: "UD03",
    title: "Unidad 3: Bases de Datos y Modelamiento",
    shape: "octahedron",
    color: 0x7d2ae8,
  },
  {
    id: 4,
    tag: "UD04",
    title: "Unidad 4: Desarrollo Frontend Avanzado",
    shape: "dodecahedron",
    color: 0x00ffaa,
  },
  {
    id: 5,
    tag: "UD05",
    title: "Unidad 5: Backend y Servicios Web / APIs",
    shape: "cylinder",
    color: 0xff007f,
  },
  {
    id: 6,
    tag: "UD06",
    title: "Unidad 6: Seguridad, Deploy y DevOps",
    shape: "torusKnot",
    color: 0xffaa00,
  },
  {
    id: 7,
    tag: "UD07",
    title: "Unidad 7: Proyecto Integrador Profesional",
    shape: "tetrahedron",
    color: 0x00ffcc,
  },
];

// Mapeo automático de 16 Sesiones por cada Unidad Didáctica
const CURRICULUM_DATA = {};
UNITS_CONFIG.forEach((unit) => {
  const sessions = {};
  for (let i = 1; i <= 16; i++) {
    const num = i < 10 ? `0${i}` : `${i}`;
    sessions[i] = {
      title: `Sesión ${num}: ${unit.title} - Módulo ${num}`,
      tag: `${unit.tag}-S${num} // DECRYPTED`,
      desc: `Contenido técnico práctico de la Sesión ${num} enfocado en los estándares de la ${unit.title}.`,
      deliverables: [
        `Entregable A - S${num}`,
        `Documentación técnica S${num}`,
        `Código fuente verificado`,
      ],
    };
  }
  CURRICULUM_DATA[unit.id] = { ...unit, sessions };
});

// ==========================================
// 2. CONFIGURACIÓN THREE.JS Y ESCENARIO
// ==========================================
let scene, camera, renderer, raycaster, mouse;

const globalCardsGroup = new THREE.Group();
const unitDetailGroup = new THREE.Group();

const clickableCardsMeshes = [];
const clickableSessionMeshes = [];
const nodesData = [];
let linesMesh = null;
let activeSelectedNode = null;

const CONFIG = {
  totalNodes: 16,
  initialPos: { x: 0, y: 0, z: 22 },
};

// Coordenadas fijas para los 16 Nodos
const GEOMETRIC_POSITIONS = [
  { x: 0, y: 4, z: 0 }, // Node 1 (S01)
  { x: 2.8, y: 2.5, z: 1.6 }, // Node 2 (S02)
  { x: -2.8, y: 2.5, z: 1.6 }, // Node 3 (S03)
  { x: 0, y: 2.5, z: -3.2 }, // Node 4 (S04)
  { x: 3.8, y: 0.5, z: 0 }, // Node 5 (S05)
  { x: 1.9, y: 0.5, z: 3.3 }, // Node 6 (S06)
  { x: -1.9, y: 0.5, z: 3.3 }, // Node 7 (S07)
  { x: -3.8, y: 0.5, z: 0 }, // Node 8 (S08)
  { x: -1.9, y: 0.5, z: -3.3 }, // Node 9 (S09)
  { x: 1.9, y: 0.5, z: -3.3 }, // Node 10 (S10)
  { x: 2.8, y: -2.0, z: 1.6 }, // Node 11 (S11)
  { x: -2.8, y: -2.0, z: 1.6 }, // Node 12 (S12)
  { x: 0, y: -2.0, z: -3.2 }, // Node 13 (S13)
  { x: 1.9, y: -3.0, z: 0 }, // Node 14 (S14)
  { x: -1.9, y: -3.0, z: 0 }, // Node 15 (S15)
  { x: 0, y: -4.5, z: 0 }, // Node 16 (S16)
];

const GEOMETRIC_CONNECTIONS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [2, 3],
  [3, 1],
  [1, 4],
  [1, 5],
  [2, 6],
  [2, 7],
  [3, 8],
  [3, 9],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 4],
  [5, 10],
  [6, 11],
  [8, 12],
  [4, 10],
  [7, 11],
  [9, 12],
  [10, 13],
  [11, 14],
  [12, 13],
  [12, 14],
  [13, 15],
  [14, 15],
  [10, 15],
  [11, 15],
];

// GRID AJUSTADO A 2 FILAS (4 ARRIBA / 3 ABAJO)
const CARDS_GRID_POSITIONS = [
  { x: -10.5, y: 4.0, z: 0 }, // UD01
  { x: -3.5, y: 4.0, z: 0 }, // UD02
  { x: 3.5, y: 4.0, z: 0 }, // UD03
  { x: 10.5, y: 4.0, z: 0 }, // UD04
  { x: -7.0, y: -4.0, z: 0 }, // UD05
  { x: 0.0, y: -4.0, z: 0 }, // UD06
  { x: 7.0, y: -4.0, z: 0 }, // UD07
];

function createGeometryByShape(shapeType) {
  switch (shapeType) {
    case "icosahedron":
      return new THREE.IcosahedronGeometry(0.8, 0);
    case "torus":
      return new THREE.TorusGeometry(0.6, 0.25, 16, 32);
    case "octahedron":
      return new THREE.OctahedronGeometry(0.85, 0);
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(0.75, 0);
    case "cylinder":
      return new THREE.CylinderGeometry(0.55, 0.55, 1.2, 16);
    case "torusKnot":
      return new THREE.TorusKnotGeometry(0.5, 0.18, 64, 8);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(0.9, 0);
    default:
      return new THREE.SphereGeometry(0.75, 32, 32);
  }
}

// ==========================================
// 3. GENERACIÓN DE TEXTURAS EN ALTA RESOLUCIÓN
// ==========================================
function createFolderTitleTexture(tag, title) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(4, 16, 36, 0.88)";
  ctx.strokeStyle = "#00f3ff";
  ctx.lineWidth = 4;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 16);
  } else {
    ctx.rect(12, 12, canvas.width - 24, canvas.height - 24);
  }
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(0, 243, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 105);
  ctx.lineTo(canvas.width - 30, 105);
  ctx.stroke();

  ctx.fillStyle = "#00f3ff";
  ctx.font = "bold 36px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, canvas.width / 2, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px sans-serif";

  const cleanTitle = title.includes(":") ? title.split(":")[1].trim() : title;

  const words = cleanTitle.split(" ");
  let line1 = "";
  let line2 = "";

  words.forEach((word) => {
    if ((line1 + word).length < 24) {
      line1 += word + " ";
    } else {
      line2 += word + " ";
    }
  });

  if (line2.trim() === "") {
    ctx.fillText(line1.trim(), canvas.width / 2, 165);
  } else {
    ctx.fillText(line1.trim(), canvas.width / 2, 145);
    ctx.fillText(line2.trim(), canvas.width / 2, 185);
  }

  return new THREE.CanvasTexture(canvas);
}

function createNodeBadgeTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(4, 12, 24, 0.85)";
  ctx.strokeStyle = "#00f3ff";
  ctx.lineWidth = 2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 8);
  } else {
    ctx.rect(8, 8, canvas.width - 16, canvas.height - 16);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#00f3ff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return new THREE.CanvasTexture(canvas);
}

// ==========================================
// 4. MODELADO PROCEDIMENTAL DE CARPETA HOLOGRÁFICA
// ==========================================
function createFolderShape(width = 5.0, height = 3.6, radius = 0.25) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  const tabW = 1.6;
  const tabH = 0.45;

  shape.moveTo(-w + radius, -h);
  shape.lineTo(w - radius, -h);
  shape.quadraticCurveTo(w, -h, w, -h + radius);
  shape.lineTo(w, h - radius);
  shape.quadraticCurveTo(w, h, w - radius, h);

  shape.lineTo(-w + tabW + 0.3, h);
  shape.lineTo(-w + tabW, h + tabH);
  shape.lineTo(-w + radius, h + tabH);
  shape.quadraticCurveTo(-w, h + tabH, -w, h + tabH - radius);
  shape.lineTo(-w, -h + radius);
  shape.quadraticCurveTo(-w, -h, -w + radius, -h);

  return shape;
}

function init3D() {
  const container = document.getElementById("canvas-3d-container");
  if (!container) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040914, 0.015);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(
    CONFIG.initialPos.x,
    CONFIG.initialPos.y,
    CONFIG.initialPos.z,
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  scene.add(globalCardsGroup);
  scene.add(unitDetailGroup);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  buildGlobalCards();
  setupBackButtonHUD();

  window.removeEventListener("click", onGraphClick);
  window.addEventListener("click", onGraphClick);
  window.addEventListener("resize", onWindowResize);

  animate();
}

// ==========================================
// 5. CONSTRUCCIÓN DE LAS CARPETAS HOLOGRÁFICAS
// ==========================================
function buildGlobalCards() {
  globalCardsGroup.clear();
  clickableCardsMeshes.length = 0;

  const folderShape = createFolderShape(5.2, 3.8);
  const extrudeSettings = {
    depth: 0.08,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.04,
    bevelThickness: 0.04,
  };

  const folderGeo = new THREE.ExtrudeGeometry(folderShape, extrudeSettings);
  folderGeo.center();

  UNITS_CONFIG.forEach((unit, index) => {
    const folderGroup = new THREE.Group();
    const pos = CARDS_GRID_POSITIONS[index];
    folderGroup.position.set(pos.x, pos.y, pos.z);

    const baseColor = unit.color || 0x00f3ff;

    // Material Neón Semitransparente
    const glassMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.9,
      side: THREE.DoubleSide,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: baseColor,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });

    // 1. Lámina Trasera
    const backCover = new THREE.Mesh(folderGeo, glassMat);
    const backWire = new THREE.Mesh(folderGeo, wireMat);
    backCover.add(backWire);
    backCover.position.set(0, 0, -0.4);
    folderGroup.add(backCover);

    // 2. Láminas Intermedias en Abanico
    for (let i = 1; i <= 3; i++) {
      const midSheet = new THREE.Mesh(folderGeo, glassMat);
      const midWire = new THREE.Mesh(folderGeo, wireMat);
      midSheet.add(midWire);
      midSheet.scale.set(0.96 - i * 0.02, 0.96 - i * 0.02, 1);
      midSheet.position.set(0, -i * 0.05, -0.4 + i * 0.2);
      midSheet.rotation.x = i * 0.06;
      folderGroup.add(midSheet);
    }

    // 3. Lámina Frontal
    const frontCover = new THREE.Mesh(folderGeo, glassMat);
    const frontWire = new THREE.Mesh(folderGeo, wireMat);
    frontCover.add(frontWire);
    frontCover.position.set(0, -0.1, 0.45);
    frontCover.rotation.x = 0.22;
    folderGroup.add(frontCover);

    // 4. Partículas Flotantes Internas
    const particlesCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particlesCount * 3);

    for (let p = 0; p < particlesCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 4.2;
      particlePositions[p + 1] = (Math.random() - 0.5) * 3.0;
      particlePositions[p + 2] = (Math.random() - 0.5) * 0.8;
    }

    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: baseColor,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const dataParticles = new THREE.Points(particleGeo, particleMat);
    folderGroup.add(dataParticles);

    // 5. Cristal 3D Emblemático
    const geom = createGeometryByShape(unit.shape);
    const shapeMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const shapeMesh = new THREE.Mesh(geom, shapeMat);
    shapeMesh.scale.set(0.9, 0.9, 0.9);
    shapeMesh.position.set(0, 0.1, 0.1);
    folderGroup.add(shapeMesh);

    // 6. Placa Holográfica con Código y Nombre Completo
    const titleTexture = createFolderTitleTexture(unit.tag, unit.title);
    const spriteMat = new THREE.SpriteMaterial({
      map: titleTexture,
      transparent: true,
      opacity: 0.95,
    });
    const badgeSprite = new THREE.Sprite(spriteMat);
    badgeSprite.scale.set(4.8, 2.4, 1);
    badgeSprite.position.set(0, -1.6, 0.6);
    folderGroup.add(badgeSprite);

    // Referencias para Raycaster
    folderGroup.userData = { unitId: unit.id, frontCover: frontCover };
    frontCover.userData = { unitId: unit.id, parentFolder: folderGroup };
    backCover.userData = { unitId: unit.id, parentFolder: folderGroup };
    shapeMesh.userData = { unitId: unit.id, parentFolder: folderGroup };

    clickableCardsMeshes.push(frontCover, backCover, shapeMesh);
    globalCardsGroup.add(folderGroup);
  });
}

// ==========================================
// 6. CONSTRUCCIÓN DE LOS 16 NODOS (DETALLE DE LA UNIDAD)
// ==========================================
function build16NodesGraphForUnit(unitId) {
  unitDetailGroup.clear();
  clickableSessionMeshes.length = 0;
  nodesData.length = 0;

  const unit = CURRICULUM_DATA[unitId];
  if (!unit) return;

  const shapeGeom = createGeometryByShape(unit.shape);

  for (let i = 0; i < CONFIG.totalNodes; i++) {
    const sessionId = i + 1;
    const sessionData = unit.sessions[sessionId];

    const material = new THREE.MeshStandardMaterial({
      color: unit.color,
      emissive: unit.color,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });

    const mesh = new THREE.Mesh(shapeGeom, material);
    mesh.scale.set(0.45, 0.45, 0.45);

    const pos = GEOMETRIC_POSITIONS[i] || { x: 0, y: 0, z: 0 };
    mesh.position.set(pos.x, pos.y, pos.z);

    mesh.userData = {
      id: i,
      sessionId: sessionId,
      unitId: unitId,
      sessionData: sessionData,
      originalColor: unit.color,
    };

    nodesData.push(mesh);
    clickableSessionMeshes.push(mesh);

    const badgeNum = i < 9 ? `S0${i + 1}` : `S${i + 1}`;
    const spriteMaterial = new THREE.SpriteMaterial({
      map: createNodeBadgeTexture(badgeNum),
      transparent: true,
      depthTest: false,
    });

    const badgeSprite = new THREE.Sprite(spriteMaterial);
    badgeSprite.scale.set(1.6, 0.8, 1);
    badgeSprite.position.set(0, 0.65, 0);

    mesh.userData.badge = badgeSprite;
    mesh.add(badgeSprite);

    unitDetailGroup.add(mesh);
  }

  updateConnections(unit.color);
}

function updateConnections(unitColor) {
  if (linesMesh) unitDetailGroup.remove(linesMesh);

  const linePositions = [];

  GEOMETRIC_CONNECTIONS.forEach(([p1Index, p2Index]) => {
    const nodeA = nodesData[p1Index];
    const nodeB = nodesData[p2Index];

    if (nodeA && nodeB) {
      linePositions.push(
        nodeA.position.x,
        nodeA.position.y,
        nodeA.position.z,
        nodeB.position.x,
        nodeB.position.y,
        nodeB.position.z,
      );
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );

  const material = new THREE.LineDashedMaterial({
    color: unitColor,
    transparent: true,
    opacity: 0.45,
    dashSize: 0.3,
    gapSize: 0.15,
    scale: 1.0,
  });

  linesMesh = new THREE.LineSegments(geometry, material);
  linesMesh.computeLineDistances();
  unitDetailGroup.add(linesMesh);
}

// ==========================================
// 7. INTERACCIÓN Y NAVEGACIÓN
// ==========================================
function onGraphClick(event) {
  if (
    !SYSTEM_STATE.isAuthenticated ||
    event.target.closest("#access-screen") ||
    event.target.closest("#session-panel") ||
    event.target.closest("#back-hud-btn")
  ) {
    return;
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (SYSTEM_STATE.viewMode === "GLOBAL") {
    const intersects = raycaster.intersectObjects(clickableCardsMeshes);
    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const unitId =
        hitObj.userData.unitId ||
        (hitObj.userData.parentFolder &&
          hitObj.userData.parentFolder.userData.unitId);
      if (unitId) openUnitDetailView(unitId);
    }
  } else if (SYSTEM_STATE.viewMode === "UNIT_DETAIL") {
    const intersects = raycaster.intersectObjects(clickableSessionMeshes);
    if (intersects.length > 0) {
      const selectedNode = intersects[0].object;
      focusOnGraphNode(selectedNode);
    }
  }
}

function openUnitDetailView(unitId) {
  SYSTEM_STATE.viewMode = "UNIT_DETAIL";
  SYSTEM_STATE.currentUnitId = unitId;

  let selectedFolder = null;
  globalCardsGroup.children.forEach((group) => {
    if (group.userData && group.userData.unitId === unitId) {
      selectedFolder = group;
    }
  });

  if (!selectedFolder) return;

  globalCardsGroup.children.forEach((group) => {
    if (group !== selectedFolder) {
      gsap.to(group.position, {
        y: group.position.y - 18,
        duration: 0.5,
        ease: "power2.in",
      });
      group.traverse((child) => {
        if (child.material) {
          gsap.to(child.material, { opacity: 0, duration: 0.4 });
        }
      });
    }
  });

  if (selectedFolder.userData.frontCover) {
    gsap.to(selectedFolder.userData.frontCover.rotation, {
      x: 0.85,
      duration: 0.6,
      ease: "power2.out",
    });
  }

  gsap.to(selectedFolder.position, {
    x: 0,
    y: 0,
    z: 11,
    duration: 0.9,
    ease: "power3.inOut",
  });

  gsap.to(selectedFolder.rotation, {
    y: Math.PI * 2,
    duration: 1.0,
    ease: "power2.inOut",
  });

  gsap.to(selectedFolder.scale, {
    x: 2.8,
    y: 2.8,
    z: 2.8,
    duration: 0.9,
    ease: "power2.in",
  });

  selectedFolder.traverse((child) => {
    if (child.material) {
      gsap.to(child.material, {
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
      });
    }
  });

  build16NodesGraphForUnit(unitId);
  unitDetailGroup.position.set(0, 0, 0);
  unitDetailGroup.rotation.set(0, 0, 0);
  unitDetailGroup.scale.set(0.001, 0.001, 0.001);
  unitDetailGroup.visible = true;

  gsap.to(unitDetailGroup.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 1.1,
    delay: 0.65,
    ease: "back.out(1.5)",
  });

  const btnBack = document.getElementById("back-hud-btn");
  if (btnBack) btnBack.style.display = "flex";

  const hudProgress = document.getElementById("hud-progress");
  if (hudProgress)
    hudProgress.textContent = `> EXPEDIENTE UNIDAD 0${unitId} DESPLEGADO (16 NODOS)`;
}

window.resetCameraView = function () {
  SYSTEM_STATE.isZoomed = false;
  SYSTEM_STATE.currentSession = null;

  if (activeSelectedNode) {
    gsap.to(activeSelectedNode.scale, {
      x: 0.45,
      y: 0.45,
      z: 0.45,
      duration: 0.5,
      ease: "power2.out",
    });
    nodesData.forEach((n) => {
      if (n.userData.badge) n.userData.badge.material.opacity = 1.0;
    });
    activeSelectedNode = null;
  }

  gsap.to(unitDetailGroup.position, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.9,
    ease: "power3.inOut",
  });

  gsap.to(unitDetailGroup.rotation, {
    x: 0,
    y: unitDetailGroup.rotation.y,
    z: 0,
    duration: 0.9,
    ease: "power3.inOut",
  });

  const panel = document.getElementById("session-panel");
  if (panel) panel.classList.remove("show", "active");
};

window.returnToGlobalView = function () {
  window.resetCameraView();
  SYSTEM_STATE.viewMode = "GLOBAL";
  SYSTEM_STATE.currentUnitId = null;

  gsap.to(unitDetailGroup.scale, {
    x: 0,
    y: 0,
    z: 0,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      unitDetailGroup.visible = false;
    },
  });

  buildGlobalCards();
  globalCardsGroup.position.set(0, 0, 0);
  globalCardsGroup.visible = true;

  const btnBack = document.getElementById("back-hud-btn");
  if (btnBack) btnBack.style.display = "none";

  const hudProgress = document.getElementById("hud-progress");
  if (hudProgress) hudProgress.textContent = "> 7 PORTAFOLIOS DISPONIBLES";
};

// ==========================================
// 8. ANIMACIONES Y DECODIFICADOR
// ==========================================
function focusOnGraphNode(node) {
  if (activeSelectedNode && activeSelectedNode !== node) {
    gsap.to(activeSelectedNode.scale, {
      x: 0.45,
      y: 0.45,
      z: 0.45,
      duration: 0.4,
      ease: "power2.out",
    });
    nodesData.forEach((n) => {
      if (n.userData.badge) {
        n.userData.badge.material.opacity = n === node ? 1.0 : 0.25;
      }
    });
  }

  activeSelectedNode = node;
  SYSTEM_STATE.isZoomed = true;
  SYSTEM_STATE.currentSession = node.userData.sessionId;

  gsap.to(node.scale, {
    x: 2.2,
    y: 2.2,
    z: 2.2,
    duration: 0.8,
    ease: "back.out(1.7)",
  });

  const pos = node.position;
  const targetRotationY = -Math.atan2(pos.x, pos.z);
  const distanceXZ = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  const targetRotationX = Math.atan2(pos.y, distanceXZ);

  gsap.to(unitDetailGroup.rotation, {
    x: targetRotationX,
    y: targetRotationY,
    z: 0,
    duration: 1.0,
    ease: "power3.inOut",
  });

  const nodeRadius = pos.length();
  gsap.to(unitDetailGroup.position, {
    x: -3.5,
    y: 0,
    z: CONFIG.initialPos.z - nodeRadius - 12.0,
    duration: 1.0,
    ease: "power3.inOut",
  });

  openDecodedPanel(node.userData.sessionId);
}

function setupBackButtonHUD() {
  let btn = document.getElementById("back-hud-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "back-hud-btn";
    btn.style.cssText = `
            position: fixed;
            top: 25px;
            left: 25px;
            z-index: 999;
            display: none;
            align-items: center;
            gap: 8px;
            background: rgba(4, 16, 36, 0.88);
            border: 1px solid #00f3ff;
            color: #00f3ff;
            padding: 10px 18px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(0,243,255,0.3);
            transition: all 0.3s ease;
        `;
    btn.innerHTML = "◄ VOLVER A LAS 7 UNIDADES";
    btn.addEventListener("click", window.returnToGlobalView);
    document.body.appendChild(btn);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (SYSTEM_STATE.viewMode === "GLOBAL") {
    globalCardsGroup.children.forEach((folderGroup) => {
      const shapeMesh = folderGroup.children[5];
      if (shapeMesh) {
        shapeMesh.rotation.y += 0.015;
        shapeMesh.rotation.x += 0.008;
      }
    });
  } else if (SYSTEM_STATE.viewMode === "UNIT_DETAIL") {
    if (!SYSTEM_STATE.isZoomed) {
      unitDetailGroup.rotation.y += 0.0012;
      unitDetailGroup.rotation.x += 0.0005;
    } else {
      const time = Date.now() * 0.0015;
      unitDetailGroup.position.y = Math.sin(time) * 0.3;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// 9. PANEL Y EFECTOS MATRIX
// ==========================================
const activeDecodeIntervals = {};

function openDecodedPanel(sessionId) {
  const unit = CURRICULUM_DATA[SYSTEM_STATE.currentUnitId];
  if (!unit) return;
  const data = unit.sessions[sessionId];
  if (!data) return;

  const panel = document.getElementById("session-panel");
  if (!panel) return;

  if (panel.classList.contains("show")) {
    panel.classList.remove("show", "active");
    Object.keys(activeDecodeIntervals).forEach((key) =>
      clearInterval(activeDecodeIntervals[key]),
    );

    setTimeout(() => {
      renderAndShowPanelContent(panel, data);
    }, 500);
  } else {
    renderAndShowPanelContent(panel, data);
  }
}

function renderAndShowPanelContent(panel, data) {
  const roleBadge = document.getElementById("panel-role-badge");
  if (roleBadge) {
    roleBadge.textContent = `// ROLE: ${SYSTEM_STATE.userRole || "DOCENTE"} (EXTRACTION MODE)`;
  }

  const titleElem = document.getElementById("p-title");
  const tagElem = document.getElementById("p-tag");
  const descElem = document.getElementById("p-desc");
  const delivContainer = document.getElementById("deliverables-container");

  if (titleElem) titleElem.textContent = "";
  if (tagElem) tagElem.textContent = "";
  if (descElem) descElem.textContent = "";
  if (delivContainer) delivContainer.innerHTML = "";

  panel.classList.add("show", "active");

  runTextDecodeEffect(titleElem, data.title, "title");
  runTextDecodeEffect(tagElem, data.tag, "tag");
  runTypewriterEffect(descElem, data.desc, "desc");

  if (delivContainer) {
    delivContainer.innerHTML =
      '<strong style="color:#00f3ff; display:block; margin-bottom:8px;">[ ARCHIVOS RECOVERED ]:</strong>';
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.paddingLeft = "0";
    ul.style.marginTop = "8px";

    delivContainer.appendChild(ul);

    data.deliverables.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.marginBottom = "6px";
      li.style.opacity = "0";
      li.style.transform = "translateX(-10px)";
      li.style.transition = "all 0.3s ease";
      li.innerHTML = `<span style="color:#00ffaa;">></span> ${item}`;
      ul.appendChild(li);

      setTimeout(
        () => {
          li.style.opacity = "1";
          li.style.transform = "translateX(0)";
        },
        300 + index * 150,
      );
    });
  }
}

function runTextDecodeEffect(element, finalText, key) {
  if (!element) return;
  if (activeDecodeIntervals[key]) clearInterval(activeDecodeIntervals[key]);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#$_";
  let iterations = 0;

  activeDecodeIntervals[key] = setInterval(() => {
    element.textContent = finalText
      .split("")
      .map((char, index) => {
        if (index < iterations) return finalText[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join("");

    if (iterations >= finalText.length) {
      clearInterval(activeDecodeIntervals[key]);
    }
    iterations += 1 / 2;
  }, 25);
}

function runTypewriterEffect(element, finalText, key) {
  if (!element) return;
  if (activeDecodeIntervals[key]) clearInterval(activeDecodeIntervals[key]);

  element.textContent = "";
  let index = 0;

  activeDecodeIntervals[key] = setInterval(() => {
    if (index < finalText.length) {
      element.textContent += finalText.charAt(index);
      index++;
    } else {
      clearInterval(activeDecodeIntervals[key]);
    }
  }, 15);
}

let matrixInterval = null;

function initMatrixCanvas() {
  const canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const katakana =
    "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプ";
  const latin = "0123456789ABCDEF<>/#_";
  const alphabet = katakana + latin;

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const rainDrops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = "rgba(4, 9, 20, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00f3ff";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < rainDrops.length; i++) {
      const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

      if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        rainDrops[i] = 0;
      }
      rainDrops[i]++;
    }
  }

  if (matrixInterval) clearInterval(matrixInterval);
  matrixInterval = setInterval(draw, 33);
}

window.revealLoginForm = function () {
  const card = document.getElementById("access-card");
  const prompt = document.getElementById("click-prompt");
  if (card && card.classList.contains("initial-state")) {
    card.classList.remove("initial-state");
    card.classList.add("expanded");
    if (prompt) prompt.style.display = "none";
    appendLogLine("> TERMINAL UNLOCKED. READY FOR CREDENTIALS.");
  }
};

window.updateRoleHint = function () {
  const roleSelect = document.getElementById("user-role");
  const hintBox = document.getElementById("role-hint");
  if (!roleSelect || !hintBox) return;

  if (roleSelect.value === "DOCENTE") {
    hintBox.innerHTML =
      "<span>[ HINT DOCENTE ]: Clave -> <strong>HACK_BRAIN</strong></span>";
  } else {
    hintBox.innerHTML =
      "<span>[ HINT ESTUDIANTE ]: Clave -> <strong>CORE_16S</strong></span>";
  }
};

window.handleInfiltration = async function (event) {
  event.preventDefault();

  const role = document.getElementById("user-role").value;
  const key = document.getElementById("user-key").value;
  const statusDot = document.getElementById("term-status-dot");

  appendLogLine(`> AUTENTICANDO CON EL SERVIDOR JAVA... [ROLE: ${role}]`);

  try {
    // Petición HTTP POST al Servlet en Java
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: role, key: key }),
    });

    const data = await response.json();

    if (data.success) {
      SYSTEM_STATE.isAuthenticated = true;
      SYSTEM_STATE.userRole = data.role;

      if (statusDot) statusDot.style.backgroundColor = "#00ff66";
      appendLogLine("> ACCESO CONCEDIDO POR EL SERVIDOR. CARGANDO DATOS 3D...");

      setTimeout(() => {
        const accessScreen = document.getElementById("access-screen");
        if (accessScreen) {
          accessScreen.style.display = "none";
          startSystem(); // Inicia Three.js
        }
      }, 1000);
    } else {
      if (statusDot) statusDot.style.backgroundColor = "#ff4757";
      appendLogLine(`> ERROR DEL SERVIDOR: ${data.message}`);
    }
  } catch (error) {
    if (statusDot) statusDot.style.backgroundColor = "#ff4757";
    appendLogLine("> ERROR DE CONEXIÓN CON EL BACKEND JAVA");
    console.error("Error en login:", error);
  }
};
async function loadUnitsFromBackend() {
  try {
    const response = await fetch("/api/units");
    const unitsData = await response.json();

    // Asignas los datos recibidos de Java a tu variable global
    window.UNITS_CONFIG = unitsData;

    // Generas la escena 3D con la información real del Servidor
    buildGlobalCards();
  } catch (error) {
    console.error("No se pudieron obtener las unidades desde Java", error);
  }
}

function appendLogLine(text) {
  const logsContainer = document.getElementById("terminal-logs");
  if (!logsContainer) return;
  const p = document.createElement("p");
  p.className = "log-line text-active";
  p.textContent = text;
  logsContainer.appendChild(p);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

function startSystem() {
  const hudRole = document.getElementById("hud-user-role");
  const hudProgress = document.getElementById("hud-progress");

  if (hudRole)
    hudRole.textContent = `SYSTEM: ONLINE // ROLE: ${SYSTEM_STATE.userRole}`;
  if (hudProgress) hudProgress.textContent = "> 7 PORTAFOLIOS DISPONIBLES";

  init3D();
}

document.addEventListener("DOMContentLoaded", () => {
  initMatrixCanvas();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (SYSTEM_STATE.isZoomed) {
        window.resetCameraView();
      } else if (SYSTEM_STATE.viewMode === "UNIT_DETAIL") {
        window.returnToGlobalView();
      }
    }
  });

  const btnCloseAccess = document.getElementById("btn-close-access-card");
  if (btnCloseAccess) {
    btnCloseAccess.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = document.getElementById("access-card");
      if (card) {
        card.classList.remove("expanded");
        card.classList.add("initial-state");
      }
      const prompt = document.getElementById("click-prompt");
      if (prompt) prompt.style.display = "block";
    });
  }
});
