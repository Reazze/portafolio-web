// ==========================================
// UI.JS - EFECTOS VISUALES Y TERMINAL
// ==========================================

import { UNITS_CONFIG, SYSTEM_STATE } from "./config.js";
import { uploadEntregableBackend, cancelarEntregableBackend } from "./api.js";

const activeDecodeIntervals = {};
let matrixInterval = null;

// Variables de estado interno para el modal de carga
let selectedFiles = [];
let activeTab = "files"; // "files" | "url"

export function appendLogLine(text) {
  const logsContainer = document.getElementById("terminal-logs");
  if (!logsContainer) return;
  const p = document.createElement("p");
  p.className = "log-line text-active";
  p.textContent = text;
  logsContainer.appendChild(p);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

export function initMatrixCanvas() {
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

export function initUIEventListeners() {
  // Escuchar la tecla ESCAPE de manera global
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.code === "Escape") {
      closeUploadModal();
      if (typeof window.returnToGlobalView === "function") {
        window.returnToGlobalView();
      }
    }
  });

  // Escuchar clic en el botón físico del HUD si existe
  const backBtn = document.getElementById("back-hud-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (typeof window.returnToGlobalView === "function") {
        window.returnToGlobalView();
      }
    });
  }

  // Inicializar eventos del modal de carga de entregables
  initUploadModalEvents();
}

export function hideDeliverablesPanel() {
  const panel = document.getElementById("session-panel");
  if (panel) {
    panel.classList.remove("show", "active");
  }
  Object.keys(activeDecodeIntervals).forEach((key) =>
    clearInterval(activeDecodeIntervals[key]),
  );
}

// Alias de compatibilidad
export const closeSessionPanel = hideDeliverablesPanel;
export function showDeliverablesPanel(sessionId) {
  openDecodedPanel(sessionId);
}

export function openDecodedPanel(sessionId) {
  const unitsList = UNITS_CONFIG || SYSTEM_STATE.units || [];

  const unit =
    unitsList.find(
      (u) =>
        u.id === SYSTEM_STATE.currentUnitId ||
        u.id == SYSTEM_STATE.currentUnitId,
    ) || unitsList[0];
  if (!unit) return;

  const sessions = unit.sessions || unit.sesiones || [];
  let data = null;

  if (Array.isArray(sessions)) {
    data = sessions.find(
      (s) =>
        s.id === sessionId || s.id == sessionId || s.sessionId === sessionId,
    );
  } else if (typeof sessions === "object") {
    data = sessions[sessionId];
  }

  if (!data) {
    const sIdPad = String(sessionId).padStart(2, "0");
    data = {
      id: sessionId,
      title: `SESIÓN ${sIdPad}: ${unit.nombre || unit.title}`,
      tag: `SESIÓN-${sIdPad}`,
      descripcion: `Contenido de la sesión ${sIdPad} correspondiente a ${unit.nombre}.`,
      deliverables: [
        `Guia_Practica_S${sIdPad}.pdf`,
        `Laboratorio_Evaluable_S${sIdPad}.zip`,
      ],
    };
  }

  const panel = document.getElementById("session-panel");
  if (!panel) return;

  if (panel.classList.contains("show")) {
    panel.classList.remove("show", "active");
    Object.keys(activeDecodeIntervals).forEach((key) =>
      clearInterval(activeDecodeIntervals[key]),
    );
    setTimeout(() => renderAndShowPanelContent(panel, data), 400);
  } else {
    renderAndShowPanelContent(panel, data);
  }
}

function renderAndShowPanelContent(panel, data) {
  const roleBadge = document.getElementById("panel-role-badge");
  if (roleBadge) {
    roleBadge.textContent = `// ROLE: ${SYSTEM_STATE.userRole || "ESTUDIANTE"} (EXTRACTION MODE)`;
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

  runTextDecodeEffect(
    titleElem,
    data.title || data.nombre || data.titulo || "SESIÓN",
    "title",
  );
  runTextDecodeEffect(tagElem, data.tag || "DETALLE", "tag");
  runTypewriterEffect(descElem, data.desc || data.descripcion || "", "desc");

  if (delivContainer) {
    // Evaluar estado real proveniente de PostgreSQL
    const estadoReal = (data.estadoEntrega || data.status || data.estado || "pendiente").toLowerCase();
    const isSubmitted = estadoReal === "entregado" || estadoReal === "completado";
    
    const statusColor = isSubmitted ? "#00ffaa" : "#ffaa00";
    const statusText = isSubmitted ? "ENTREGADO" : "PENDIENTE DE ENTREGA";

    const notaTexto = (data.nota !== undefined && data.nota !== null) ? `${data.nota} / 20` : "SIN CALIFICAR";
    const miArchivo = data.miArchivoUrl ? data.miArchivoUrl : null;

    let htmlContent = `
      <div style="border-top: 1px dashed rgba(0, 243, 255, 0.3); padding-top: 10px; margin-top: 10px;">
        <strong style="color:#00f3ff; display:block; margin-bottom:6px;">[ RECURSOS DE LA SESIÓN ]:</strong>
        <ul style="list-style: none; padding-left: 0; margin-top: 4px;" id="ul-deliverables"></ul>
      </div>

      <div style="background: rgba(4, 20, 40, 0.6); border: 1px solid rgba(0, 243, 255, 0.2); padding: 10px; border-radius: 4px; margin-top: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; color: #8a99ad;">ESTADO DE ENTREGA:</span>
          <span style="font-weight: bold; font-size: 11px; color: ${statusColor}; text-transform: uppercase;">[ ${statusText} ]</span>
        </div>

        ${miArchivo ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; color: #8a99ad;">MI ARCHIVO:</span>
            <a href="${miArchivo}" target="_blank" style="font-size: 11px; color: #00ffaa; text-decoration: underline; text-overflow: ellipsis; overflow: hidden; max-width: 180px; white-space: nowrap;">
              🔗 Ver Adjunto / Enlace
            </a>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; color: #8a99ad;">CALIFICACIÓN:</span>
          <span style="font-weight: bold; font-size: 12px; color: #00f3ff;">${notaTexto}</span>
        </div>

        <div style="margin-top: 10px; display: flex; gap: 8px;">
          ${
            isSubmitted
              ? `<button id="btn-cancel-assignment" style="flex: 1; background: rgba(255, 85, 85, 0.15); border: 1px solid #ff5555; color: #ff5555; padding: 6px; font-family: monospace; font-size: 10px; cursor: pointer; border-radius: 2px;">
                  > CANCELAR ENTREGA
                </button>`
              : `<button id="btn-upload-assignment" style="flex: 1; background: rgba(0, 243, 255, 0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 6px; font-family: monospace; font-size: 10px; cursor: pointer; border-radius: 2px;">
                  > SUBIR PRÁCTICA
                </button>`
          }
          <button id="btn-view-feedback" style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; padding: 6px; font-family: monospace; font-size: 10px; cursor: pointer; border-radius: 2px;">
            > FEEDBACK
          </button>
        </div>
      </div>
    `;

    delivContainer.innerHTML = htmlContent;

    // Listar recursos existentes
    const ul = document.getElementById("ul-deliverables");
    const deliverablesList = data.deliverables || data.entregables || [];

    deliverablesList.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.marginBottom = "4px";
      li.style.fontSize = "12px";
      li.style.opacity = "0";
      li.style.transform = "translateX(-10px)";
      li.style.transition = "all 0.3s ease";
      
      const itemNombre = typeof item === "string" ? item : (item.titulo || item.nombre || "Recurso");
      li.innerHTML = `<span style="color:#00ffaa;">></span> ${itemNombre}`;
      ul.appendChild(li);

      setTimeout(
        () => {
          li.style.opacity = "1";
          li.style.transform = "translateX(0)";
        },
        200 + index * 100,
      );
    });

    // Evento para SUBIR PRÁCTICA
    const btnUpload = document.getElementById("btn-upload-assignment");
    if (btnUpload) {
      btnUpload.addEventListener("click", () => {
        appendLogLine(
          `> INICIANDO MÓDULO DE CARGA EN SESIÓN ${data.id || SYSTEM_STATE.currentSession}`,
        );
        openUploadModalForSession(data.id || SYSTEM_STATE.currentSession);
      });
    }

    // Evento para CANCELAR ENTREGA
    const btnCancel = document.getElementById("btn-cancel-assignment");
    if (btnCancel) {
      btnCancel.addEventListener("click", async () => {
        if (
          confirm(
            "¿Estás seguro de cancelar la entrega? Los archivos subidos se eliminarán para permitir una nueva entrega.",
          )
        ) {
          try {
            btnCancel.disabled = true;
            btnCancel.textContent = "> ELIMINANDO...";

            const res = await cancelarEntregableBackend(
              data.id || SYSTEM_STATE.currentSession,
              SYSTEM_STATE.currentUnitId,
            );
            if (res && res.status === "success") {
              alert(
                "Entrega cancelada correctamente. Ahora puedes subir un nuevo entregable.",
              );
              // Actualizar modelo local
              data.estadoEntrega = "pendiente";
              data.status = "pendiente";
              data.estado = "pendiente";
              data.miArchivoUrl = null;
              openDecodedPanel(data.id || SYSTEM_STATE.currentSession);
            } else {
              alert("Error al cancelar la entrega: " + (res ? res.message : "Desconocido"));
              btnCancel.disabled = false;
              btnCancel.textContent = "> CANCELAR ENTREGA";
            }
          } catch (err) {
            console.error(err);
            alert("Error de conexión al intentar cancelar.");
            btnCancel.disabled = false;
            btnCancel.textContent = "> CANCELAR ENTREGA";
          }
        }
      });
    }
  }
}

// ==========================================
// MÓDULO DE CONTROL DEL MODAL DE SUBIDA
// ==========================================

export function initUploadModalEvents() {
  const modal = document.getElementById("upload-modal");
  const btnClose = document.getElementById("btn-close-upload-modal");
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const btnConfirmUpload = document.getElementById("btn-confirm-upload");

  const tabFilesBtn = document.getElementById("tab-files-btn");
  const tabUrlBtn = document.getElementById("tab-url-btn");
  const sectionFiles = document.getElementById("upload-section-files");
  const sectionUrl = document.getElementById("upload-section-url");
  const urlInput = document.getElementById("input-entregable-url");

  if (!modal) return;

  // Botón X para cerrar modal
  if (btnClose) {
    btnClose.onclick = (e) => {
      e.stopPropagation();
      closeUploadModal();
    };
  }

  // Clic fuera del contenido (Backdrop) para cerrar modal
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeUploadModal();
    }
  };

  // Pestañas ARCHIVOS / URL
  if (tabFilesBtn && tabUrlBtn) {
    tabFilesBtn.onclick = (e) => {
      e.stopPropagation();
      activeTab = "files";
      if (sectionFiles) sectionFiles.style.display = "block";
      if (sectionUrl) sectionUrl.style.display = "none";
      tabFilesBtn.classList.add("active");
      tabUrlBtn.classList.remove("active");
      validateConfirmButton();
    };

    tabUrlBtn.onclick = (e) => {
      e.stopPropagation();
      activeTab = "url";
      if (sectionFiles) sectionFiles.style.display = "none";
      if (sectionUrl) sectionUrl.style.display = "block";
      tabUrlBtn.classList.add("active");
      tabFilesBtn.classList.remove("active");
      validateConfirmButton();
    };
  }

  if (urlInput) {
    urlInput.oninput = () => validateConfirmButton();
  }

  // Clic y Selección Múltiple de Archivos
  if (dropZone && fileInput) {
    dropZone.onclick = (e) => {
      e.stopPropagation();
      fileInput.click();
    };

    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(Array.from(e.target.files));
        fileInput.value = "";
      }
    };

    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "#00ffaa";
    };

    dropZone.ondragleave = (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "rgba(0, 243, 255, 0.4)";
    };

    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "rgba(0, 243, 255, 0.4)";
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(Array.from(e.dataTransfer.files));
      }
    };
  }

  // Confirmación de Subida
  if (btnConfirmUpload) {
    btnConfirmUpload.onclick = async (e) => {
      e.stopPropagation();
      const sessionId = SYSTEM_STATE.currentSession;
      const unitId = SYSTEM_STATE.currentUnitId;

      try {
        btnConfirmUpload.disabled = true;
        btnConfirmUpload.textContent = "> PROCESANDO SUBIDA...";

        let result;
        if (activeTab === "files") {
          result = await uploadEntregableBackend(
            sessionId,
            unitId,
            selectedFiles,
            null,
          );
        } else {
          const urlVal = urlInput ? urlInput.value.trim() : "";
          result = await uploadEntregableBackend(sessionId, unitId, [], urlVal);
        }

        if (result && result.status === "success") {
          alert("Entregable registrado correctamente en PostgreSQL.");
          closeUploadModal();
          
          // Refrescar vistas o reabrir el panel dinámicamente
          if (typeof window.cargarSesionesDesdeAPI === "function") {
            await window.cargarSesionesDesdeAPI();
          }
          openDecodedPanel(sessionId);
        } else {
          alert(`Error: ${result ? result.message : "Error desconocido."}`);
        }
      } catch (err) {
        console.error(err);
        alert("Error de conexión con el servidor Java.");
      } finally {
        btnConfirmUpload.disabled = false;
        btnConfirmUpload.textContent = "> SUBIR A POSTGRESQL";
      }
    };
  }
}

function addFiles(newFiles) {
  selectedFiles = [...selectedFiles, ...newFiles];
  renderFilesList();
  validateConfirmButton();
}

function renderFilesList() {
  const container = document.getElementById("file-preview-container");
  if (!container) return;

  container.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.style.cssText =
      "display: flex; justify-content: space-between; font-size: 11px; color: #00ffaa; margin-bottom: 4px; background: rgba(0, 255, 170, 0.05); padding: 4px 8px; border: 1px solid rgba(0, 255, 170, 0.2);";
    item.innerHTML = `
      <span>📄 ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
      <span class="remove-file-btn" data-index="${index}" style="color: #ff5555; cursor: pointer; margin-left: 10px;">[ELIMINAR]</span>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll(".remove-file-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute("data-index"), 10);
      selectedFiles.splice(idx, 1);
      renderFilesList();
      validateConfirmButton();
    };
  });
}

function validateConfirmButton() {
  const btnConfirm = document.getElementById("btn-confirm-upload");
  const urlInput = document.getElementById("input-entregable-url");
  if (!btnConfirm) return;

  if (activeTab === "files") {
    btnConfirm.disabled = selectedFiles.length === 0;
  } else {
    btnConfirm.disabled = !urlInput || urlInput.value.trim() === "";
  }
}

export function openUploadModalForSession(sessionId) {
  const modal = document.getElementById("upload-modal");
  const infoText = document.getElementById("upload-session-info");

  if (infoText) {
    const sIdPad = String(sessionId).padStart(2, "0");
    const uIdPad = String(SYSTEM_STATE.currentUnitId || 1).padStart(2, "0");
    infoText.textContent = `UNIDAD: UD-${uIdPad} | SESIÓN: S-${sIdPad}`;
  }

  resetUploadModal();
  if (modal) {
    modal.style.display = "flex";
  }
}

export function closeUploadModal() {
  const modal = document.getElementById("upload-modal");
  if (modal) {
    modal.style.display = "none";
  }
  resetUploadModal();
}

function resetUploadModal() {
  selectedFiles = [];
  activeTab = "files";

  const fileInput = document.getElementById("file-input");
  if (fileInput) fileInput.value = "";

  const urlInput = document.getElementById("input-entregable-url");
  if (urlInput) urlInput.value = "";

  const container = document.getElementById("file-preview-container");
  if (container) container.innerHTML = "";

  const sectionFiles = document.getElementById("upload-section-files");
  const sectionUrl = document.getElementById("upload-section-url");
  const tabFilesBtn = document.getElementById("tab-files-btn");
  const tabUrlBtn = document.getElementById("tab-url-btn");

  if (sectionFiles) sectionFiles.style.display = "block";
  if (sectionUrl) sectionUrl.style.display = "none";
  if (tabFilesBtn) tabFilesBtn.classList.add("active");
  if (tabUrlBtn) tabUrlBtn.classList.remove("active");

  validateConfirmButton();
}

// ==========================================
// EFECTOS VISUALES DE TEXTO (DECODE & TYPEWRITER)
// ==========================================
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