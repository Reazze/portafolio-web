<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neural Core Portfolio // System Access</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/estilos.css">
</head>

<body>

    <!-- ==================== PANTALLA DE ACCESO CON ANIMACIÓN ==================== -->
    <div id="access-screen">
        <canvas id="matrix-canvas"></canvas>

        <div class="access-container initial-state" id="access-card" onclick="revealLoginForm()">
            <div class="brain-preview-side">
                <div class="brain-status-badge">NEURAL CORE: LOCKED</div>
                <div class="confidential-header">
                    <div class="confidential-stamp">CONFIDENCIAL // CLASIFICADO</div>
                    <div class="student-info">
                        <span class="info-label">ALUMNO / TITULAR:</span> <strong id="student-name">PALOMINO BARBA, Jose Manuel</strong><br>
                        <span class="info-label">PROGRAMA:</span> <span>Diseño y Programación Web</span><br>
                        <span class="info-label">ESTADO:</span> <span class="status-active">EXPEDIENTE ABIERTO</span>
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
                        <button type="button" id="btn-close-access-card" class="btn-close-card" title="Cerrar terminal">&times;</button>
                    </div>
                </div>

                <div class="terminal-body" id="terminal-logs">
                    <p class="log-line text-muted">> INITIALIZING NEURAL LINK...</p>
                    <p class="log-line text-muted">> TARGET: BRAIN_STUDENT_CORE_16S</p>
                    <p class="log-line text-alert">> SECURITY WARNING: RESTRICTED MEMORY BANK</p>
                    <p class="log-line text-active">> AWAITING CREDENTIALS...</p>
                </div>

                <form id="login-form" onsubmit="handleInfiltration(event)">
                    <div class="input-group">
                        <label class="input-label">> SELECT_ROLE:</label>
                        <select id="user-role" class="term-input" onchange="updateRoleHint()">
                            <option value="DOCENTE">DOCENTE // INFILTRADO (HACKER)</option>
                            <option value="ESTUDIANTE">ESTUDIANTE // PROPIETARIO (CORE)</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label class="input-label">> ENTER_ACCESS_KEY:</label>
                        <input type="password" id="user-key" class="term-input" placeholder="INGRESA CLAVE DE ACCESO..." required autocomplete="off">
                    </div>

                    <div class="credentials-hint" id="role-hint">
                        <span>[ HINT DOCENTE ]: Clave -> <strong>HACK_BRAIN</strong></span>
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
            <button class="btn-action btn-close" onclick="resetCameraView()"">[ ESC / CERRAR ]</button>
        </div>
    </div>

    <div id="status-hud">
        <div id="hud-user-role">SYSTEM: LOCKDOWN</div>
        <div id="hud-progress">> SYSTEM AWAITING LOGIN...</div>
    </div>

    <!-- LIBRERÍAS DE SOPORTE Y TRES D -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>

    <!-- ARCHIVOS JS PROPIOS -->
    <script src="${pageContext.request.contextPath}/js/red-neuronal.js"></script>
</body>
</html>