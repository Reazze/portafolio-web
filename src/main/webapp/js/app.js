// ==========================================
// APP.JS - PUNTO DE ENTRADA Y CONTROLADOR
// ==========================================

import { SYSTEM_STATE, UNITS_CONFIG, CURRICULUM_DATA } from "./config.js";
import { loginBackend, fetchUnidadesBackend } from "./api.js";
import { initMatrixCanvas, appendLogLine } from "./ui.js";
import { init3D, resetCameraView, returnToGlobalView } from "./scene3d.js";
import { initUploadModalEvents } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  initMatrixCanvas();
  initUploadModalEvents();
  // Controladores de eventos para la interfaz de acceso
  const accessCard = document.getElementById("access-card");
  if (accessCard) {
    accessCard.addEventListener("click", () => {
      if (accessCard.classList.contains("initial-state")) {
        accessCard.classList.remove("initial-state");
        accessCard.classList.add("expanded");

        const prompt = document.getElementById("click-prompt");
        if (prompt) prompt.style.display = "none";

        if (typeof appendLogLine === "function") {
          appendLogLine("> TERMINAL UNLOCKED. READY FOR CREDENTIALS.");
        }
      }
    });
  }

  const btnCloseAccess = document.getElementById("btn-close-access-card");
  if (btnCloseAccess) {
    btnCloseAccess.addEventListener("click", (e) => {
      e.stopPropagation();
      if (accessCard) {
        accessCard.classList.remove("expanded");
        accessCard.classList.add("initial-state");
      }
      const prompt = document.getElementById("click-prompt");
      if (prompt) prompt.style.display = "block";
    });
  }

  // Manejo del formulario de Login conectado al backend Java
  const formLogin =
    document.getElementById("form-login") ||
    document.getElementById("infiltration-form");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput =
        document.getElementById("email") ||
        document.getElementById("user-email");
      const passwordInput =
        document.getElementById("password") ||
        document.getElementById("user-key");
      const statusDot = document.getElementById("term-status-dot");

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value.trim() : "";

      appendLogLine(`> AUTENTICANDO CON EL SERVIDOR JAVA... [${email}]`);

      try {
        const data = await loginBackend(email, password);

        if (data.status === "success") {
          SYSTEM_STATE.isAuthenticated = true;
          SYSTEM_STATE.user = data.usuario;
          SYSTEM_STATE.userRole = data.usuario.rol;

          if (statusDot) statusDot.style.backgroundColor = "#00ff66";
          appendLogLine(
            `> ACCESO CONCEDIDO: ${data.usuario.nombres} ${data.usuario.apellido}`,
          );

          // 1. Cargar unidades dinámicas desde PostgreSQL vía Java Servlet
          await fetchUnidadesBackend();
          appendLogLine("> UNIDADES CURRICULARES OBTENIDAS DESDE POSTGRESQL");

          // 2. SINCRONIZACIÓN COMPLETA DE UNITS_CONFIG Y CURRICULUM_DATA
          UNITS_CONFIG.forEach((unit, index) => {
            const parsedColor = unit.color_hex
              ? unit.color_hex.trim()
              : unit.color || "#00f3ff";
            const parsedShape = (unit.forma_3d || unit.shape || "icosahedron")
              .toLowerCase()
              .trim();

            // Mapeo explicito para Three.js
            unit.id = unit.id || index + 1;
            unit.tag = unit.tag || `UD0${index + 1}`;
            unit.code = unit.tag;
            unit.nombre = unit.nombre || `Unidad ${index + 1}`;
            unit.name = unit.nombre;
            unit.title = unit.nombre;
            unit.shape = parsedShape;
            unit.forma_3d = parsedShape;
            unit.color = parsedColor;
            unit.color_hex = parsedColor;

            // Llenar datos dinamicos para el grafo de 16 nodos
            if (!CURRICULUM_DATA[unit.id]) {
              CURRICULUM_DATA[unit.id] = {
                id: unit.id,
                title: unit.nombre,
                color: parsedColor,
                shape: parsedShape,
                sessions: {},
              };
              for (let s = 1; s <= 16; s++) {
                CURRICULUM_DATA[unit.id].sessions[s] = {
                  id: s,
                  title: `Sesión ${s}: ${unit.nombre}`,
                  deliverables: [],
                };
              }
            } else {
              CURRICULUM_DATA[unit.id].color = parsedColor;
              CURRICULUM_DATA[unit.id].shape = parsedShape;
            }
          });

          setTimeout(() => {
            const accessScreen = document.getElementById("access-screen");
            if (accessScreen) accessScreen.style.display = "none";
            startSystem();
          }, 1000);
        } else {
          if (statusDot) statusDot.style.backgroundColor = "#ff4757";
          appendLogLine(`> ERROR: ${data.message}`);
        }
      } catch (error) {
        if (statusDot) statusDot.style.backgroundColor = "#ff4757";
        appendLogLine("> ERROR DE CONEXIÓN CON EL BACKEND JAVA");
        console.error("Error en login:", error);
      }
    });
  }

  // Tecla Escape para salir de vistas
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (SYSTEM_STATE.isZoomed) {
        resetCameraView();
      } else if (SYSTEM_STATE.viewMode === "UNIT_DETAIL") {
        returnToGlobalView();
      }
    }
  });
});

function startSystem() {
  const hudRole = document.getElementById("hud-user-role");
  const hudProgress = document.getElementById("hud-progress");

  if (hudRole)
    hudRole.textContent = `SYSTEM: ONLINE // ROLE: ${SYSTEM_STATE.userRole}`;
  if (hudProgress)
    hudProgress.textContent = `> ${UNITS_CONFIG.length} PORTAFOLIOS DISPONIBLES`;

  init3D();
}
