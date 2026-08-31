package com.miempresa.miapp.controller;

import com.google.gson.Gson;
import com.miempresa.miapp.dao.UnidadDAO;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/unidades")
public class UnitServlet extends HttpServlet {

    private final Gson gson = new Gson();
    private final UnidadDAO unidadDAO = new UnidadDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // Parámetros opcionales enviados desde el cliente (Por defecto: DPW, Semestre 1)
        String programa = request.getParameter("programa");
        if (programa == null || programa.trim().isEmpty()) {
            programa = "DPW";
        }

        int semestre = 1;
        String semestreParam = request.getParameter("semestre");
        if (semestreParam != null) {
            try {
                semestre = Integer.parseInt(semestreParam);
            } catch (NumberFormatException ignored) {}
        }

        List<Map<String, Object>> unidades = unidadDAO.obtenerUnidadesPorProgramaYSemestre(programa, semestre);

        Map<String, Object> jsonResponse = new HashMap<>();
        jsonResponse.put("status", "success");
        jsonResponse.put("programa", programa);
        jsonResponse.put("semestre", semestre);
        jsonResponse.put("data", unidades);

        response.getWriter().write(gson.toJson(jsonResponse));
    }
}