package com.miempresa.miapp.controller;

import com.miempresa.miapp.dao.EntregaDAO;
import com.miempresa.miapp.model.SesionDTO;
import com.miempresa.miapp.model.SesionDTO.ArchivoDTO;
import com.miempresa.miapp.model.SesionDTO.EntregableDTO;
import com.miempresa.miapp.model.SesionDTO.Posicion3D;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@WebServlet("/api/sesiones")
public class SesionController extends HttpServlet {

    private EntregaDAO entregaDAO = new EntregaDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        
        // Obtener estudianteId desde sesión HTTPSession o parámetro URL
        HttpSession session = request.getSession(false);
        UUID estudianteId = null;

        if (session != null && session.getAttribute("usuarioId") != null) {
            estudianteId = UUID.fromString(session.getAttribute("usuarioId").toString());
        } else if (request.getParameter("estudianteId") != null) {
            try {
                estudianteId = UUID.fromString(request.getParameter("estudianteId"));
            } catch (IllegalArgumentException e) {
                System.out.println("UUID no válido proporcionado en los parámetros.");
            }
        }

        List<SesionDTO> listaSesiones = obtenerSesiones(estudianteId);
        
        String jsonOutput = convertirAJson(listaSesiones);
        
        PrintWriter out = response.getWriter();
        out.print(jsonOutput);
        out.flush();
    }

    private List<SesionDTO> obtenerSesiones(UUID estudianteId) {
        List<SesionDTO> sesiones = new ArrayList<>();

        for (int i = 1; i <= 16; i++) {
            String codigo = String.format("S%02d", i);
            String titulo = "Sesión " + String.format("%02d", i) + ": Módulo de Desarrollo " + i;
            String tag = codigo + " // DECRYPTED";
            String descripcion = "Contenido detallado y entregables prácticos correspondientes a la sesión " + i + ".";

            double x = (i % 4 - 1.5) * 2.5;
            double y = (i / 4.0 - 2.0) * 1.8;
            double z = (i % 2 == 0) ? 0.5 : -0.5;

            List<EntregableDTO> entregables = new ArrayList<>();
            List<ArchivoDTO> archivos = new ArrayList<>();
            
            archivos.add(new ArchivoDTO("informe_s" + i + ".pdf", "/uploads/s" + i + "/informe.pdf", "pdf"));
            archivos.add(new ArchivoDTO("codigo_s" + i + ".zip", "/uploads/s" + i + "/codigo.zip", "zip"));

            entregables.add(new EntregableDTO("E" + i + "-1", "Entregable Práctico S" + i, archivos));

            SesionDTO sesion = new SesionDTO(i, codigo, titulo, tag, descripcion, new Posicion3D(x, y, z), entregables);

            // Cargar estado de PostgreSQL si existe un estudiante en sesión
            if (estudianteId != null) {
                entregaDAO.cargarEstadoEntregaEstudiante(sesion, estudianteId);
            }

            sesiones.add(sesion);
        }

        return sesiones;
    }

    private String convertirAJson(List<SesionDTO> sesiones) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < sesiones.size(); i++) {
            SesionDTO s = sesiones.get(i);
            sb.append("{");
            sb.append("\"id\":").append(s.getId()).append(",");
            sb.append("\"codigo\":\"").append(escapeJson(s.getCodigo())).append("\",");
            sb.append("\"titulo\":\"").append(escapeJson(s.getTitulo())).append("\",");
            sb.append("\"tag\":\"").append(escapeJson(s.getTag())).append("\",");
            sb.append("\"descripcion\":\"").append(escapeJson(s.getDescripcion())).append("\",");
            
            // Nuevos atributos de entrega desde PostgreSQL
            sb.append("\"tareaId\":").append(s.getTareaId()).append(",");
            sb.append("\"estadoEntrega\":\"").append(s.getEstadoEntrega() != null ? s.getEstadoEntrega() : "pendiente").append("\",");
            sb.append("\"nota\":").append(s.getNota() != null ? s.getNota() : "null").append(",");
            sb.append("\"miArchivoUrl\":").append(s.getMiArchivoUrl() != null ? "\"" + escapeJson(s.getMiArchivoUrl()) + "\"" : "null").append(",");

            sb.append("\"posicion3D\":{")
              .append("\"x\":").append(s.getPosicion3D().getX()).append(",")
              .append("\"y\":").append(s.getPosicion3D().getY()).append(",")
              .append("\"z\":").append(s.getPosicion3D().getZ())
              .append("},");
            
            sb.append("\"entregables\":[");
            for (int j = 0; j < s.getEntregables().size(); j++) {
                EntregableDTO e = s.getEntregables().get(j);
                sb.append("{");
                sb.append("\"id\":\"").append(escapeJson(e.getId())).append("\",");
                sb.append("\"titulo\":\"").append(escapeJson(e.getTitulo())).append("\",");
                sb.append("\"archivos\":[");
                for (int k = 0; k < e.getArchivos().size(); k++) {
                    ArchivoDTO a = e.getArchivos().get(k);
                    sb.append("{");
                    sb.append("\"nombre\":\"").append(escapeJson(a.getNombre())).append("\",");
                    sb.append("\"url\":\"").append(escapeJson(a.getUrl())).append("\",");
                    sb.append("\"tipo\":\"").append(escapeJson(a.getTipo())).append("\"");
                    sb.append("}");
                    if (k < e.getArchivos().size() - 1) sb.append(",");
                }
                sb.append("]");
                sb.append("}");
                if (j < s.getEntregables().size() - 1) sb.append(",");
            }
            sb.append("]");
            
            sb.append("}");
            if (i < sesiones.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
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