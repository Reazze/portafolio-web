package com.miempresa.miapp.config;

import java.sql.Connection;
import java.sql.SQLException;

public class TestConnection {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("--------------------------------------------------");
                System.out.println("¡CONEXIÓN EXITOSA CON POSTGRESQL (portafolio_db)!");
                System.out.println("--------------------------------------------------");
            }
        } catch (SQLException e) {
            System.err.println("Error de conexión: " + e.getMessage());
        }
    }
}