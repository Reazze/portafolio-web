<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neural Core Portfolio // System Access</title>

        <!-- Módulos CSS Modularizados -->
        <link rel="stylesheet" href="${pageContext.request.contextPath}/css/base.css">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/css/canvas-viewport.css">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/css/terminal.css">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/css/hud-panels.css">

    </head>

    <body>

        <!-- ==================== PANTALLA DE ACCESO CON ANIMACIÓN ==================== -->
        <div id="access-screen">
            <canvas id="matrix-canvas"></canvas>

            <div class="access-container initial-state" id="access-card">
                <div class="brain-preview-side">
                    <div class="brain-status-badge">IESTP"ANDRES AVELINO CACERES DORREGARAY"</div>
                    <div class="confidential-header">
                        <div class="confidential-stamp">CONFIDENCIAL // CLASIFICADO</div>
                        <div class="student-info">
                            <span class="info-label">ALUMNO / TITULAR:</span> <strong id="student-name">PALOMINO BARBA,
                                Jose Manuel</strong><br>
                            <span class="info-label">PROGRAMA:</span> <span>Diseño y Programación Web</span><br>
                            <span class="info-label">ESTADO:</span> <span class="status-active">EXPEDIENTE
                                ABIERTO</span>
                        </div>
                    </div>

                    <div class="brain-video-container">
                        <video autoplay loop muted playsinline class="brain-video">
                            <source src="${pageContext.request.contextPath}/img/cerebro.webm" type="video/webm">
                        </video>
                        <div class="synapse-overlay"></div>
                    </div>

                    <div class="click-prompt" id="click-prompt">
                        <span class="prompt-text">[ HAGA CLIC PARA DESBLOQUEAR ]</span>
                    </div>
                </div>

                <div class="terminal-side" id="terminal-side">
                    <div class="terminal-header">
                        <span class="terminal-title">AUTH_TERMINAL // SYSTEM_ACCESS</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div id="term-status-dot"></div>
                            <button type="button" id="btn-close-access-card" class="btn-close-card"
                                title="Cerrar terminal">&times;</button>
                        </div>
                    </div>

                    <div class="terminal-body" id="terminal-logs">
                        <p class="log-line text-muted">> INITIALIZING NEURAL LINK...</p>
                        <p class="log-line text-muted">> TARGET: BRAIN_STUDENT_CORE_16S</p>
                        <p class="log-line text-alert">> SECURITY WARNING: RESTRICTED MEMORY BANK</p>
                        <p class="log-line text-active">> AWAITING CREDENTIALS...</p>
                    </div>

                    <form id="form-login">
                        <div class="input-group">
                            <label class="input-label" for="email">> ENTER_EMAIL / USER:</label>
                            <input type="email" id="email" class="term-input" placeholder="ejemplo@dominio.com" required
                                autocomplete="off">
                        </div>

                        <div class="input-group">
                            <label class="input-label" for="password">> ENTER_ACCESS_KEY:</label>
                            <input type="password" id="password" class="term-input"
                                placeholder="INGRESA CLAVE DE ACCESO..." required autocomplete="off">
                        </div>

                        <button type="submit" class="btn-hack">
                            <span class="btn-text">[ EXECUTE_INFILTRATION ]</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- ==================== CONTENEDOR DE LA ESCENA 3D ==================== -->
        <div id="canvas-3d-container"></div>

        <!-- ==================== MUNDO DE NEURONAS ==================== -->
        <div class="viewport">
            <div id="world">
                <svg id="synapse-svg"></svg>
                <div id="neurons-container"></div>
            </div>
        </div>

        <!-- ==================== PANEL DE SESIONES ==================== -->
        <div id="session-panel">
            <div class="panel-security-tag">
                <span id="panel-role-badge">// ROLE: DOCENTE (EXTRACTION MODE)</span>
                <span>LEVEL_04</span>
            </div>

            <div class="panel-header">
                <div class="panel-title" id="p-title">Sesión 01</div>
                <div class="panel-session-tag" id="p-tag">S01 // DECRYPTED</div>
            </div>

            <div class="panel-stats">
                <p id="p-desc"></p>
                <div id="deliverables-container"></div>
            </div>

            <div class="panel-actions">
                <button type="button" class="btn-action btn-close" id="btn-close-session-panel">[ ESC / CERRAR
                    ]</button>
            </div>
        </div>
        <!-- MODAL DE CARGA DE ENTREGABLES -->
        <div id="upload-modal" class="modal-backdrop" style="display: none;">
            <div class="modal-container">
                <div class="modal-header">
                    <span class="modal-title">// MÓDULO DE CARGA DE ENTREGABLE</span>
                    <button id="btn-close-upload-modal" class="modal-close">&times;</button>
                </div>

                <div class="modal-body">
                    <div id="upload-session-info" class="session-info-tag">UNIDAD: UD-01 | SESIÓN: S-01</div>

                    <!-- Pestañas para alternar entre Archivos y URL -->
                    <div class="modal-tabs">
                        <button id="tab-files-btn" class="tab-btn active">> SUBIR ARCHIVOS</button>
                        <button id="tab-url-btn" class="tab-btn">> ENLACE URL</button>
                    </div>

                    <!-- SECCIÓN 1: ARCHIVOS -->
                    <div id="upload-section-files" class="tab-content">
                        <div id="drop-zone" class="drop-zone">
                            <div id="drop-zone-prompt">
                                <span class="upload-icon">⇪</span>
                                <p>HAZ CLIC O ARRASTRA ARCHIVOS AQUÍ</p>
                                <span class="sub-text">[ Puedes seleccionar múltiples archivos .pdf, .zip, .rar ]</span>
                            </div>
                            <input type="file" id="file-input" multiple style="display: none;" />
                        </div>

                        <!-- Contenedor dinámico de previsualización de múltiples archivos -->
                        <div id="file-preview-container" class="preview-list"></div>
                    </div>

                    <!-- SECCIÓN 2: URL -->
                    <div id="upload-section-url" class="tab-content" style="display: none;">
                        <div class="url-input-container">
                            <label for="input-entregable-url">> INGRESA LA URL DEL ENTREGABLE (GitHub, Drive, Figma,
                                etc.):</label>
                            <input type="url" id="input-entregable-url" placeholder="https://..." class="cyber-input" />
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button id="btn-confirm-upload" class="cyber-btn" disabled>> SUBIR A POSTGRESQL</button>
                </div>
            </div>
        </div>

        <div id="status-hud">
            <div id="hud-user-role">SYSTEM: LOCKDOWN</div>
            <div id="hud-progress">> SYSTEM AWAITING LOGIN...</div>
        </div>

        <!-- LIBRERÍAS EXTERNAS DE THREE.JS Y GSAP -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>

        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>

        <!-- CARGA DEL MÓDULO JS PRINCIPAL -->
        <script type="module" src="${pageContext.request.contextPath}/js/app.js"></script>
    </body>

    </html>