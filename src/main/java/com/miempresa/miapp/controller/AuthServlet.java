package com.miempresa.miapp.controller;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.miempresa.miapp.dao.UsuarioDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@WebServlet("/api/login")
public class AuthServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final UsuarioDAO usuarioDAO = new UsuarioDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Lectura del JSON enviado desde el frontend
        StringBuilder buffer = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            buffer.append(line);
        }

        Type mapType = new TypeToken<Map<String, String>>() {}.getType();
        Map<String, String> credentials = gson.fromJson(buffer.toString(), mapType);

        String documento = credentials.get("documento"); // DNI o Código
        String key = credentials.get("key");             // Password

        Map<String, Object> jsonResponse = new HashMap<>();

        // Validar contra PostgreSQL
        Map<String, Object> usuario = usuarioDAO.validarUsuario(documento, key);

        if (usuario != null) {
            UUID usuarioId = (UUID) usuario.get("id");
            String ipOrigen = request.getRemoteAddr();
            String navegadorInfo = request.getHeader("User-Agent");

            // Registrar la auditoría de inicio de sesión
            usuarioDAO.registrarLogAcceso(usuarioId, ipOrigen, navegadorInfo);

            jsonResponse.put("status", "success");
            jsonResponse.put("message", "Login exitoso");
            jsonResponse.put("rol", usuario.get("rol"));
            jsonResponse.put("nombre", usuario.get("nombres") + " " + usuario.get("apellido"));
        } else {
            jsonResponse.put("status", "error");
            jsonResponse.put("message", "Credenciales incorrectas o usuario inactivo");
        }

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}
