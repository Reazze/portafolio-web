package com.miempresa.miapp.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // Lee la URL del pooler de Supabase desde las variables de entorno de Render
    private static final String URL = System.getenv("DB_URL") != null ? 
        System.getenv("DB_URL") : "jdbc:postgresql://aws-0-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require";
    
    // El usuario para el pooler de Supabase incluye el ID del proyecto
    private static final String USER = System.getenv("DB_USER") != null ? 
        System.getenv("DB_USER") : "postgres.acmshmfjhdpftgplccew"; 
        
    private static final String PASSWORD = System.getenv("DB_PASSWORD") != null ? 
        System.getenv("DB_PASSWORD") : "tu_contraseña_aqui"; 

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("Error al cargar el Driver de PostgreSQL: " + e.getMessage());
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                System.err.println("Error al cerrar la conexión: " + e.getMessage());
            }
        }
    }
}