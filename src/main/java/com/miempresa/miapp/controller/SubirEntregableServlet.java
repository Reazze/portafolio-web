package com.miempresa.miapp.controller;

import com.miempresa.miapp.dao.EntregaDAO;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Collection;
import java.util.UUID;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

@WebServlet(name = "SubirEntregableServlet", urlPatterns = {"/api/entregables/subir"})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2,  // 2 MB
    maxFileSize = 1024 * 1024 * 50,       // 50 MB
    maxRequestSize = 1024 * 1024 * 100    // 100 MB
)
public class SubirEntregableServlet extends HttpServlet {

    private static final String UPLOAD_DIR = "uploads";
    private final EntregaDAO entregaDAO = new EntregaDAO();

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        setCorsHeaders(response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        setCorsHeaders(response);
        response.setContentType("application/json;charset=UTF-8");

        try {
            // 1. Obtener parámetros requeridos
            String sessionId = request.getParameter("session_id");
            String tareaIdParam = request.getParameter("tarea_id");
            if (tareaIdParam == null) {
                tareaIdParam = request.getParameter("tareaId"); // Compatibilidad con camelCase
            }
            String url = request.getParameter("url");
            String observacion = request.getParameter("observacion");

            // 2. Obtener y validar la identidad del estudiante (UUID)
            HttpSession session = request.getSession(false);
            UUID estudianteId = null;
            
            if (session != null && session.getAttribute("usuario_id") != null) {
                Object attr = session.getAttribute("usuario_id");
                estudianteId = (attr instanceof UUID) ? (UUID) attr : UUID.fromString(attr.toString());
            } else if (request.getParameter("estudiante_id") != null && !request.getParameter("estudiante_id").trim().isEmpty()) {
                estudianteId = UUID.fromString(request.getParameter("estudiante_id").trim());
            }

            if (estudianteId == null) {
                sendJsonResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "error", "Usuario no autenticado o ID de estudiante no proporcionado.");
                return;
            }

            // 3. Resolver ID de la tarea
            int tareaId;
            try {
                tareaId = (tareaIdParam != null && !tareaIdParam.trim().isEmpty()) 
                        ? Integer.parseInt(tareaIdParam.trim()) 
                        : (sessionId != null ? Integer.parseInt(sessionId.trim()) : 0);
            } catch (NumberFormatException e) {
                sendJsonResponse(response, HttpServletResponse.SC_BAD_REQUEST, "error", "ID de tarea o sesión inválido.");
                return;
            }

            String archivoGuardadoUrl = "";

            // 4. Configurar directorio físico de almacenamiento
            String applicationPath = request.getServletContext().getRealPath("");
            String uploadFilePath = (applicationPath != null && !applicationPath.isEmpty())
                    ? applicationPath + File.separator + UPLOAD_DIR
                    : System.getProperty("user.home") + File.separator + "app_uploads";
            
            File uploadFolder = new File(uploadFilePath);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            // Option A) Entrada mediante URL externa
            if (url != null && !url.trim().isEmpty()) {
                archivoGuardadoUrl = url.trim();
            } 
            // Option B) Entrada mediante archivo adjunto (Flexibilidad en el nombre de parametro: file, files, archivo)
            else {
                Collection<Part> parts = request.getParts();
                for (Part part : parts) {
                    if (part.getSubmittedFileName() != null && !part.getSubmittedFileName().trim().isEmpty() && part.getSize() > 0) {
                        String originalFileName = extractFileName(part);
                        String safeFileName = UUID.randomUUID().toString() + "_" + sanitizeFileName(originalFileName);
                        String fullSavePath = uploadFilePath + File.separator + safeFileName;
                        
                        part.write(fullSavePath);
                        archivoGuardadoUrl = UPLOAD_DIR + "/" + safeFileName;
                        break;
                    }
                }
            }

            if (archivoGuardadoUrl.isEmpty()) {
                sendJsonResponse(response, HttpServletResponse.SC_BAD_REQUEST, "error", "No se recibió un archivo válido ni una URL.");
                return;
            }

            // 5. Guardar o actualizar registro en base de datos
            boolean exitoBD = entregaDAO.guardarOActualizarEntrega(tareaId, estudianteId, archivoGuardadoUrl, observacion);
            if (exitoBD) {
                sendJsonResponse(response, HttpServletResponse.SC_OK, "success", "Entregable guardado en base de datos correctamente.", archivoGuardadoUrl);
            } else {
                sendJsonResponse(response, HttpServletResponse.SC_BAD_REQUEST, "error", "No se pudo registrar la entrega en la base de datos.");
            }

        } catch (IllegalArgumentException e) {
            sendJsonResponse(response, HttpServletResponse.SC_BAD_REQUEST, "error", "Formato de UUID o parámetro inválido: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            sendJsonResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "error", "Error interno en el servidor: " + e.getMessage());
        }
    }

    private void setCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    private String extractFileName(Part part) {
        String submittedName = part.getSubmittedFileName();
        if (submittedName != null && !submittedName.isEmpty()) {
            return Paths.get(submittedName).getFileName().toString();
        }
        return "archivo_" + System.currentTimeMillis();
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
    }

    private void sendJsonResponse(HttpServletResponse response, int statusCode, String status, String message) throws IOException {
        sendJsonResponse(response, statusCode, status, message, null);
    }

    private void sendJsonResponse(HttpServletResponse response, int statusCode, String status, String message, String archivoUrl) throws IOException {
        response.setStatus(statusCode);
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"status\":\"").append(escapeJson(status)).append("\",");
        json.append("\"message\":\"").append(escapeJson(message)).append("\"");
        if (archivoUrl != null) {
            json.append(",\"archivoUrl\":\"").append(escapeJson(archivoUrl)).append("\"");
        }
        json.append("}");
        response.getWriter().write(json.toString());
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\b", "\\b")
                    .replace("\f", "\\f")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
    }
}