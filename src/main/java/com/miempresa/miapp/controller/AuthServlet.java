package com.miempresa.miapp.controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.miempresa.miapp.dao.UsuarioDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

// Cambiado a /auth-login para coincidir con api.js y evitar el bloqueo por AdBlock (ERR_BLOCKED_BY_CLIENT)
@WebServlet("/auth-login")
public class AuthServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String email = null;
        String password = null;

        // 1. Leer y parsear el cuerpo JSON enviado por fetch() en api.js
        StringBuilder sb = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        if (sb.length() > 0) {
            JsonObject jsonRequest = gson.fromJson(sb.toString(), JsonObject.class);
            if (jsonRequest.has("username")) {
                email = jsonRequest.get("username").getAsString();
            } else if (jsonRequest.has("email")) {
                email = jsonRequest.get("email").getAsString();
            }

            if (jsonRequest.has("password")) {
                password = jsonRequest.get("password").getAsString();
            }
        }

        Map<String, Object> jsonResponse = new HashMap<>();

        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            jsonResponse.put("status", "error");
            jsonResponse.put("message", "Credenciales incompletas");
            response.getWriter().write(gson.toJson(jsonResponse));
            return;
        }

        // 2. Validar usuario por email y contraseña en PostgreSQL
        Map<String, Object> usuario = usuarioDAO.validarUsuario(email.trim(), password.trim());

        if (usuario != null) {
            // Guardar datos en la sesión HTTP
            HttpSession session = request.getSession(true);
            UUID usuarioId = (UUID) usuario.get("id");

            session.setAttribute("usuario_id", usuarioId);
            session.setAttribute("usuario_email", usuario.get("email"));
            session.setAttribute("usuario_nombre", usuario.get("nombres"));
            session.setAttribute("usuario_apellido", usuario.get("apellido"));
            session.setAttribute("usuario_rol", usuario.get("rol"));

            // Registrar log de acceso
            String ipOrigen = request.getRemoteAddr();
            String navegadorInfo = request.getHeader("User-Agent");
            usuarioDAO.registrarLogAcceso(usuarioId, ipOrigen, navegadorInfo);

            jsonResponse.put("status", "success");
            jsonResponse.put("message", "Autenticación exitosa");
            jsonResponse.put("usuario", usuario);
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            jsonResponse.put("status", "error");
            jsonResponse.put("message", "Correo o contraseña incorrectos");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}