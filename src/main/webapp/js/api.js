import { UNITS_CONFIG, SYSTEM_STATE } from "./config.js";

/**
 * Normaliza la respuesta JSON del Servlet de Java / PostgreSQL
 * al formato de datos estricto que requiere scene3d.js.
 *
 * @param {Array|Object} rawData - Respuesta cruda enviada por el Servlet de Java.
 * @returns {Array} Arreglo de unidades estructurado para el Engine 3D.
 */
function normalizeUnitData(rawData) {
  const unitsArray = Array.isArray(rawData)
    ? rawData
    : rawData.unidades || rawData.data || [];

  if (!Array.isArray(unitsArray) || unitsArray.length === 0) {
    console.warn(
      "> [API Adaptador] Formato no válido o array vacío recibido del Servlet. Manteniendo fallback.",
    );
    return UNITS_CONFIG;
  }

  return unitsArray.map((item, index) => {
    // 1. EXTRAER CAMPOS REALES DE POSTGRESQL
    const unitTag = item.tag || item.codigo || `UD-0${index + 1}`;
    const unitNombre =
      item.nombre || item.nombre_unidad || item.title || `UNIDAD ${index + 1}`;
    const unitForma = (
      item.forma_3d ||
      item.forma3d ||
      item.shape ||
      "icosahedron"
    )
      .toLowerCase()
      .trim();

    // 2. EXTRACCIÓN Y FORMATEO DINÁMICO DEL COLOR DESDE LA BASE DE DATOS
    let dynamicColor =
      item.color_hex || item.colorHex || item.color || item.hexColor;

    if (dynamicColor !== undefined && dynamicColor !== null) {
      if (typeof dynamicColor === "string") {
        dynamicColor = dynamicColor.trim();
        if (!dynamicColor.startsWith("#")) {
          dynamicColor = "#" + dynamicColor.replace(/^0x/i, "");
        }
      } else if (typeof dynamicColor === "number") {
        dynamicColor = "#" + dynamicColor.toString(16).padStart(6, "0");
      }
    } else {
      dynamicColor = "#00f3ff";
    }

    // 3. ESTRUCTURA COMPATIBLE
    return {
      id: item.id || index + 1,
      tag: unitTag,
      code: unitTag,
      nombre: unitNombre,
      name: unitNombre,
      title: unitNombre,
      creditos: item.creditos || 4,
      forma_3d: unitForma,
      shape: unitForma,
      color_hex: dynamicColor,
      color: dynamicColor,
      description:
        item.descripcion || item.description || "Sin descripción disponible.",

      // Normalización de sesiones
      sessions: Array.isArray(item.sessions || item.sesiones)
        ? (item.sessions || item.sesiones).map((sess, sIdx) => ({
            id: sess.id || `S${sIdx + 1}`,
            name: sess.name || sess.nombre || `Sesión ${sIdx + 1}`,
            status: sess.status || sess.estado || "pending",
            deliverables: sess.deliverables || sess.entregables || [],
          }))
        : [],
    };
  });
}

/**
 * Petición de autenticación enviada al Servlet de Java
 */
export async function loginBackend(username, password) {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const CONTEXT_PATH = pathSegments.length > 0 ? `/${pathSegments[0]}` : "";
  const url = `${CONTEXT_PATH}/auth-login`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("> [API Error] Fallo en la autenticación:", error);
    throw error;
  }
}

/**
 * Obtiene las unidades curriculares del Servlet Java (/api/unidades)
 * y las procesa a través del adaptador antes de actualizar el estado global.
 */
export async function fetchUnidadesBackend() {
  try {
    const response = await fetch("./api/unidades", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const normalizedUnits = normalizeUnitData(jsonResponse);

    if (Array.isArray(UNITS_CONFIG)) {
      UNITS_CONFIG.length = 0;
      UNITS_CONFIG.push(...normalizedUnits);
    }
    if (SYSTEM_STATE) {
      SYSTEM_STATE.units = normalizedUnits;
    }

    return normalizedUnits;
  } catch (error) {
    console.warn(
      "> [API Warning] No se pudo conectar al Servlet /api/unidades. Usando datos base de respaldo.",
      error,
    );
    return UNITS_CONFIG;
  }
}

/**
 * Envío multipart del archivo entregable al Servlet Java.
 */
export async function uploadEntregableBackend(
  sessionId,
  tareaId, // Recibe el ID real de la tarea
  files = [],
  url = null,
  observacion = "",
) {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const contextPath = pathSegments.length > 0 ? `/${pathSegments[0]}` : "";
  const endpoint = `${contextPath}/api/entregables/subir`;

  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("tarea_id", tareaId || sessionId); // Si no viene tareaId, usa sessionId como fallback

  if (observacion) {
    formData.append("observacion", observacion);
  }
  if (url) {
    formData.append("url", url);
  }

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append("archivo", file);
    });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error Status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Cancelación de entrega en el backend.
 * Usa exclusivamente 'session_id', 'tarea_id' y 'fileName'.
 */
export async function cancelarEntregableBackend(
  sessionId,
  unitId,
  fileName = null,
) {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  const contextPath = pathSegments.length > 0 ? `/${pathSegments[0]}` : "";
  const endpoint = `${contextPath}/api/entregables/cancelar`;

  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("tarea_id", tareaId);

  if (unitId) {
    formData.append("unit_id", unitId);
  }
  if (fileName) {
    formData.append("fileName", fileName);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error Status: ${response.status}`);
  }

  return await response.json();
}
