package com.miempresa.miapp;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/saludo")
public class MiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("text/html;charset=UTF-8");
        String nombre = request.getParameter("nombre");
        
        try (PrintWriter out = response.getWriter()) {
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head><title>Respuesta Backend</title></head>");
            out.println("<body style='font-family: Arial; text-align: center; margin-top: 50px;'>");
            out.println("<h2>Hola, " + (nombre != null ? nombre : "Invitado") + "!</h2>");
            out.println("<p>Esta respuesta fue procesada nativamente por un <strong>Java Servlet</strong>.</p>");
            out.println("<a href='index.jsp'>Volver al Inicio</a>");
            out.println("</body>");
            out.println("</html>");
        }
    }
}
