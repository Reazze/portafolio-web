// ==========================================
// CONFIG.JS - ESTADO Y CONSTANTES
// ==========================================

export const SYSTEM_STATE = {
  isAuthenticated: false,
  user: null, // Guardará { id, nombres, apellido, email, rol }
  userRole: "ESTUDIANTE",
  currentUnitId: null,
  currentSession: null,
  viewMode: "GLOBAL", // 'GLOBAL' | 'UNIT_DETAIL'
  isZoomed: false,
};

export let UNITS_CONFIG = [];
export const CURRICULUM_DATA = {};

export function hexToThreeColor(hexStr) {
  if (!hexStr) return 0x00e5ff;
  return parseInt(hexStr.replace("#", "0x"), 16);
}

export function setUnitsConfigFromAPI(apiData) {
  UNITS_CONFIG = apiData.map((u) => ({
    id: u.id,
    tag: u.tag || `UD${String(u.id).padStart(2, "0")}`,
    title: u.nombre || u.title,
    shape: u.forma3d || u.shape || "icosahedron",
    color: typeof u.colorHex === "string" ? hexToThreeColor(u.colorHex) : (u.color || 0x00e5ff),
    creditos: u.creditos || 0
  }));

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
}

export const SCENE_CONFIG = {
  totalNodes: 16,
  initialPos: { x: 0, y: 0, z: 22 },
};

export const GEOMETRIC_POSITIONS = [
  { x: 0, y: 4, z: 0 },
  { x: 2.8, y: 2.5, z: 1.6 },
  { x: -2.8, y: 2.5, z: 1.6 },
  { x: 0, y: 2.5, z: -3.2 },
  { x: 3.8, y: 0.5, z: 0 },
  { x: 1.9, y: 0.5, z: 3.3 },
  { x: -1.9, y: 0.5, z: 3.3 },
  { x: -3.8, y: 0.5, z: 0 },
  { x: -1.9, y: 0.5, z: -3.3 },
  { x: 1.9, y: 0.5, z: -3.3 },
  { x: 2.8, y: -2.0, z: 1.6 },
  { x: -2.8, y: -2.0, z: 1.6 },
  { x: 0, y: -2.0, z: -3.2 },
  { x: 1.9, y: -3.0, z: 0 },
  { x: -1.9, y: -3.0, z: 0 },
  { x: 0, y: -4.5, z: 0 },
];

export const GEOMETRIC_CONNECTIONS = [
  [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1],
  [1, 4], [1, 5], [2, 6], [2, 7], [3, 8], [3, 9],
  [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 4],
  [5, 10], [6, 11], [8, 12], [4, 10], [7, 11], [9, 12],
  [10, 13], [11, 14], [12, 13], [12, 14], [13, 15], [14, 15],
  [10, 15], [11, 15]
];

// Posiciones de las tarjetas de las unidades en la vista de cuadrícula
export const CARDS_GRID_POSITIONS = [
  { x: -12.5, y: 4.5, z: 0 }, // UD01
  { x: -4.2, y: 4.5, z: 0 },  // UD02
  { x: 4.2, y: 4.5, z: 0 },   // UD03
  { x: 12.5, y: 4.5, z: 0 },  // UD04
  { x: -8.3, y: -4.5, z: 0 }, // UD05
  { x: 0.0, y: -4.5, z: 0 },  // UD06
  { x: 8.3, y: -4.5, z: 0 },  // UD07
];