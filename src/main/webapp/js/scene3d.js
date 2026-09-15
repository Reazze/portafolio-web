// ==========================================
// SCENE3D.JS - MOTOR THREE.JS Y GRAFO 3D
// ==========================================
import { showDeliverablesPanel, hideDeliverablesPanel } from "./ui.js";
import {
  SYSTEM_STATE,
  UNITS_CONFIG,
  CURRICULUM_DATA,
  SCENE_CONFIG,
  GEOMETRIC_POSITIONS,
  GEOMETRIC_CONNECTIONS,
  CARDS_GRID_POSITIONS,
} from "./config.js";

import { openDecodedPanel } from "./ui.js";

let scene, camera, renderer, raycaster, mouse;
const globalCardsGroup = new THREE.Group();
const unitDetailGroup = new THREE.Group();

const clickableCardsMeshes = [];
const clickableSessionMeshes = [];
const nodesData = [];
let linesMesh = null;
let activeSelectedNode = null;

function createGeometryByShape(shapeType) {
  const shape = (shapeType || "").toLowerCase();

  switch (shape) {
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
    case "torusknot": // Cubre "torusKnot" al convertir a toLowerCase()
      return new THREE.TorusKnotGeometry(0.5, 0.18, 64, 8);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(0.9, 0);
    default:
      return new THREE.SphereGeometry(0.75, 32, 32);
  }
}

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

function createFolderTitleTexture(tag, nombre) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "rgba(4, 16, 36, 0.88)";
  ctx.strokeStyle = "#00f3ff";
  ctx.lineWidth = 4;

  ctx.beginPath();
  if (ctx.roundRect)
    ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 16);
  else ctx.rect(12, 12, canvas.width - 24, canvas.height - 24);
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

  const cleanTitle = nombre.includes(":")
    ? nombre.split(":")[1].trim()
    : nombre;
  const words = cleanTitle.split(" ");
  let line1 = "",
    line2 = "";

  words.forEach((word) => {
    if ((line1 + word).length < 24) line1 += word + " ";
    else line2 += word + " ";
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
  if (ctx.roundRect)
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 8);
  else ctx.rect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#00f3ff";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return new THREE.CanvasTexture(canvas);
}

export function init3D() {
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
    SCENE_CONFIG.initialPos.x,
    SCENE_CONFIG.initialPos.y,
    SCENE_CONFIG.initialPos.z,
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

export function buildGlobalCards() {
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
    const pos = CARDS_GRID_POSITIONS[index] || { x: 0, y: 0, z: 0 };
    folderGroup.position.set(pos.x, pos.y, pos.z);

    // 1. EXTRAER CAMPOS REALES DE POSTGRESQL
    const unitTag = unit.tag || unit.code || `UD-0${index + 1}`;
    const unitName =
      unit.nombre || unit.name || unit.title || `Unidad ${index + 1}`;
    const baseColor = unit.color_hex || unit.color || "#00f3ff";
    const shapeType = (unit.forma_3d || unit.shape || "icosahedron")
      .toLowerCase()
      .trim();

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

    // Tapa posterior
    const backCover = new THREE.Mesh(folderGeo, glassMat);
    const backWire = new THREE.Mesh(folderGeo, wireMat);
    backCover.add(backWire);
    backCover.position.set(0, 0, -0.4);
    folderGroup.add(backCover);

    // Hojas centrales
    for (let i = 1; i <= 3; i++) {
      const midSheet = new THREE.Mesh(folderGeo, glassMat);
      const midWire = new THREE.Mesh(folderGeo, wireMat);
      midSheet.add(midWire);
      midSheet.scale.set(0.96 - i * 0.02, 0.96 - i * 0.02, 1);
      midSheet.position.set(0, -i * 0.05, -0.4 + i * 0.2);
      midSheet.rotation.x = i * 0.06;
      folderGroup.add(midSheet);
    }

    // Tapa frontal
    const frontCover = new THREE.Mesh(folderGeo, glassMat);
    const frontWire = new THREE.Mesh(folderGeo, wireMat);
    frontCover.add(frontWire);
    frontCover.position.set(0, -0.1, 0.45);
    frontCover.rotation.x = 0.22;
    folderGroup.add(frontCover);

    // Partículas de datos neón
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

    // 2. FORMA 3D CENTRAL DINÁMICA
    const geom = createGeometryByShape(shapeType);
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

    // 3. ETIQUETA / SPRITE CON NOMBRE DE PROGRAMA REAL
    const titleTexture = createFolderTitleTexture(unitTag, unitName);
    const spriteMat = new THREE.SpriteMaterial({
      map: titleTexture,
      transparent: true,
      opacity: 0.95,
      depthTest: false, // Evita que la tapa oculte el texto
    });
    const badgeSprite = new THREE.Sprite(spriteMat);
    badgeSprite.scale.set(5.0, 2.5, 1);
    badgeSprite.position.set(0, -1.4, 0.8); // Z ajustada hacia adelante
    folderGroup.add(badgeSprite);

    folderGroup.userData = { unitId: unit.id, frontCover: frontCover };
    frontCover.userData = { unitId: unit.id, parentFolder: folderGroup };
    backCover.userData = { unitId: unit.id, parentFolder: folderGroup };
    shapeMesh.userData = { unitId: unit.id, parentFolder: folderGroup };

    clickableCardsMeshes.push(frontCover, backCover, shapeMesh);
    globalCardsGroup.add(folderGroup);
  });
}

export function build16NodesGraphForUnit(unitId) {
  unitDetailGroup.clear();
  clickableSessionMeshes.length = 0;
  nodesData.length = 0;

  const unit = CURRICULUM_DATA[unitId];
  if (!unit) return;

  const shapeGeom = createGeometryByShape(unit.shape);

  for (let i = 0; i < SCENE_CONFIG.totalNodes; i++) {
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
    color: new THREE.Color(unitColor || "#00f3ff"), // Convierte el hex string de PostgreSQL
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
      focusOnGraphNode(intersects[0].object);
    }
  }
}

export function openUnitDetailView(unitId) {
  SYSTEM_STATE.viewMode = "UNIT_DETAIL";
  SYSTEM_STATE.currentUnitId = unitId;

  let selectedFolder = null;
  globalCardsGroup.children.forEach((group) => {
    if (group.userData && group.userData.unitId === unitId)
      selectedFolder = group;
  });

  if (!selectedFolder) return;

  // 1. Ocultar carpetas no seleccionadas y guardar su opacidad original
  globalCardsGroup.children.forEach((group) => {
    if (group !== selectedFolder) {
      gsap.to(group.position, {
        y: group.position.y - 18,
        duration: 0.5,
        ease: "power2.in",
      });
      group.traverse((child) => {
        if (child.material) {
          // Guardar opacidad por defecto antes de animar a 0
          if (child.userData.originalOpacity === undefined) {
            child.userData.originalOpacity = child.material.opacity;
          }
          gsap.to(child.material, { opacity: 0, duration: 0.4 });
        }
      });
    }
  });

  // 2. Abrir tapa frontal
  if (selectedFolder.userData.frontCover) {
    gsap.to(selectedFolder.userData.frontCover.rotation, {
      x: 0.85,
      duration: 0.6,
      ease: "power2.out",
    });
  }

  // 3. Zoom y desvanecimiento de la carpeta seleccionada
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
      if (child.userData.originalOpacity === undefined) {
        child.userData.originalOpacity = child.material.opacity;
      }
      gsap.to(child.material, { opacity: 0, duration: 0.6, delay: 0.3 });
    }
  });

  // 4. Generación y animación de entrada del grafo de 16 nodos
  build16NodesGraphForUnit(unitId);
  unitDetailGroup.position.set(0, 0, 0);
  unitDetailGroup.rotation.set(0, 0, 0);
  unitDetailGroup.scale.set(0.001, 0.001, 0.001);
  unitDetailGroup.visible = true;

  // Cambiar el zoom final de 1 a 2.2 o 2.5 en openUnitDetailView
  gsap.to(unitDetailGroup.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 1.1,
    delay: 0.65,
    ease: "back.out(1.4)",
  });

  // 5. Interfaz HUD
  const btnBack = document.getElementById("back-hud-btn");
  if (btnBack) btnBack.style.display = "flex";

  const hudProgress = document.getElementById("hud-progress");
  if (hudProgress) {
    // Buscar los datos reales de la unidad en UNITS_CONFIG
    const currentUnit =
      UNITS_CONFIG.find((u) => u.id === unitId || u.id == unitId) ||
      UNITS_CONFIG[unitId - 1];

    if (currentUnit) {
      const tag = currentUnit.tag || currentUnit.code || `UD-0${unitId}`;
      const nombre = (
        currentUnit.nombre ||
        currentUnit.title ||
        currentUnit.name ||
        `UNIDAD ${unitId}`
      ).toUpperCase();

      hudProgress.textContent = `> EXPEDIENTE ${tag}: ${nombre} DESPLEGADO (16 NODOS)`;
    } else {
      hudProgress.textContent = `> EXPEDIENTE UNIDAD 0${unitId} DESPLEGADO (16 NODOS)`;
    }
  }
}

export function resetCameraView() {
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
}

/**
 * Restablece la cámara 3D a la vista global de carpetas holográficas
 * e interactúa directamente con el objeto global window.
 */
export function returnToGlobalView() {
  if (SYSTEM_STATE.viewMode === "GLOBAL") return;

  // 1. Restablecer flags de estado
  SYSTEM_STATE.viewMode = "GLOBAL";
  SYSTEM_STATE.currentUnitId = null;
  SYSTEM_STATE.isZoomed = false;

  // 2. Colapsar y ocultar el grupo de nodos 3D de la unidad
  gsap.to(unitDetailGroup.scale, {
    x: 0.001,
    y: 0.001,
    z: 0.001,
    duration: 0.4,
    ease: "power2.in",
    onComplete: () => {
      unitDetailGroup.visible = false;
      unitDetailGroup.clear();
    },
  });

  // 3. Ocultar HUDs y botones de retorno
  const btnBack = document.getElementById("back-hud-btn");
  if (btnBack) btnBack.style.display = "none";

  const panel = document.getElementById("session-panel");
  if (panel) panel.classList.remove("show", "active");

  if (typeof hideDeliverablesPanel === "function") {
    hideDeliverablesPanel();
  }

  // 4. Restaurar cada carpeta a su posición, rotación, escala y opacidad original
  globalCardsGroup.children.forEach((group, index) => {
    const originalPos = CARDS_GRID_POSITIONS[index] || { x: 0, y: 0, z: 0 };

    // Posición, rotación y escala del grupo completo
    gsap.to(group.position, {
      x: originalPos.x,
      y: originalPos.y,
      z: originalPos.z,
      duration: 0.8,
      delay: index * 0.04,
      ease: "power3.out",
    });

    gsap.to(group.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.8,
      ease: "power2.out",
    });

    // Cerrar la tapa frontal
    if (group.userData && group.userData.frontCover) {
      gsap.to(group.userData.frontCover.rotation, {
        x: 0.22,
        duration: 0.5,
        ease: "power2.out",
      });
    }

    // Restaurar opacidades respetando la opacidad original guardada o fallback explícito
    group.traverse((child) => {
      if (child.material) {
        let targetOpacity = child.userData.originalOpacity;

        if (targetOpacity === undefined) {
          if (child.isSprite) {
            targetOpacity = 0.95;
          } else if (child.isPoints) {
            targetOpacity = 0.85;
          } else if (child.material.wireframe) {
            targetOpacity = 0.65;
          } else if (
            child.geometry &&
            child.geometry.type === "ExtrudeGeometry"
          ) {
            targetOpacity = 0.22;
          } else {
            targetOpacity = 0.85; // Geometría 3D central (Icosaedro, etc.)
          }
        }

        gsap.to(child.material, {
          opacity: targetOpacity,
          duration: 0.6,
        });
      }
    });
  });

  // 5. Actualizar el indicador del HUD
  const hudProgress = document.getElementById("hud-progress");
  if (hudProgress) {
    hudProgress.textContent = "> VISTA GLOBAL: SELECCIONE UNA UNIDAD DIDÁCTICA";
  }
}

// Exposición explícita en window para compatibilidad con eventos inline del DOM y listeners globales
window.returnToGlobalView = returnToGlobalView;
window.resetCameraView = returnToGlobalView;

/**
 * Manejador de clics del Raycaster sobre los nodos 3D
 */
export function handleNodeInteractions(intersects) {
  if (!intersects || intersects.length === 0) return;

  const hitObject = intersects[0].object;

  // 1. Clic sobre una Carpeta Holográfica (Unidad Didáctica)
  if (hitObject.userData && hitObject.userData.type === "unit_card") {
    const unitId = hitObject.userData.unitId || (hitObject.userData.data && hitObject.userData.data.id);
    if (unitId && typeof openUnitDetailView === "function") {
      openUnitDetailView(unitId);
    }
    return;
  }

  // 2. Clic sobre un Nodo de Sesión (Grafo de 16 Nodos)
  if (hitObject.userData && hitObject.userData.type === "session_node") {
    // Extraer el id numérico o el objeto devuelto por el Raycaster
    const rawSession = hitObject.userData.sessionId || hitObject.userData.id || hitObject.userData.data;
    const sessionId = typeof rawSession === "object" ? (rawSession.id || rawSession.sessionId) : rawSession;

    SYSTEM_STATE.selectedNode = sessionId;
    SYSTEM_STATE.currentSession = sessionId;

    // Abrir panel lateral con la información enviada al rol de Estudiante
    if (typeof openDecodedPanel === "function") {
      openDecodedPanel(sessionId);
    } else if (typeof showDeliverablesPanel === "function") {
      showDeliverablesPanel(sessionId);
    }
  }
}

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
      if (n.userData.badge)
        n.userData.badge.material.opacity = n === node ? 1.0 : 0.25;
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
    z: SCENE_CONFIG.initialPos.z - nodeRadius - 12.0,
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
      position: fixed; top: 25px; left: 25px; z-index: 999; display: none;
      align-items: center; gap: 8px; background: rgba(4, 16, 36, 0.88);
      border: 1px solid #00f3ff; color: #00f3ff; padding: 10px 18px;
      border-radius: 6px; font-family: monospace; font-weight: bold; cursor: pointer;
      box-shadow: 0 0 15px rgba(0,243,255,0.3); transition: all 0.3s ease;
    `;
    btn.innerHTML = "◄ VOLVER A LAS UNIDADES";
    btn.addEventListener("click", returnToGlobalView);
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
