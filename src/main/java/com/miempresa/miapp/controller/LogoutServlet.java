package com.miempresa.miapp.controller;

import com.google.gson.Gson;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/logout")
public class LogoutServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // Destruye la sesión del servidor
        }

        Map<String, Object> jsonResponse = new HashMap<>();
        jsonResponse.put("status", "success");
        jsonResponse.put("message", "Sesión cerrada correctamente");

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}