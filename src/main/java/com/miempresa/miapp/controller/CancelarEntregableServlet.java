package com.miempresa.miapp.controller;

import com.miempresa.miapp.dao.EntregaDAO;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet(name = "CancelarEntregableServlet", urlPatterns = {"/api/entregables/cancelar"})
public class CancelarEntregableServlet extends HttpServlet {

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
            if (sessionId == null) {
                sessionId = request.getParameter("sessionId");
            }

            String tareaIdParam = request.getParameter("tarea_id");
            if (tareaIdParam == null) {
                tareaIdParam = request.getParameter("tareaId");
            }

            String fileName = request.getParameter("fileName");

            // 2. Obtener y validar identidad del estudiante (UUID)
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

            // 4. Borrar archivo físico si se proporciona la ruta/nombre
            if (fileName != null && !fileName.trim().isEmpty()) {
                String applicationPath = request.getServletContext().getRealPath("");
                String uploadFilePath = (applicationPath != null && !applicationPath.isEmpty())
                        ? applicationPath + File.separator + UPLOAD_DIR
                        : System.getProperty("user.home") + File.separator + "app_uploads";

                // Extraer solo el nombre base si viene la ruta "uploads/UUID_nombre.ext"
                String cleanFileName = fileName.contains("/") 
                        ? fileName.substring(fileName.lastIndexOf("/") + 1) 
                        : fileName;

                File fileToDelete = new File(uploadFilePath + File.separator + cleanFileName);
                if (fileToDelete.exists()) {
                    fileToDelete.delete();
                }
            }

            // 5. Cancelar la entrega en la base de datos (UPDATE estado_envio = 'ANULADO')
            boolean cancelado = entregaDAO.cancelarEntrega(tareaId, estudianteId);
            if (cancelado) {
                sendJsonResponse(response, HttpServletResponse.SC_OK, "success", "Entrega cancelada exitosamente.");
            } else {
                sendJsonResponse(response, HttpServletResponse.SC_BAD_REQUEST, "error", "No se encontró una entrega activa para cancelar.");
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

    private void sendJsonResponse(HttpServletResponse response, int statusCode, String status, String message) throws IOException {
        response.setStatus(statusCode);
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"status\":\"").append(escapeJson(status)).append("\",");
        json.append("\"message\":\"").append(escapeJson(message)).append("\"");
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