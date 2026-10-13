package com.miempresa.miapp.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // Configuración de la base de datos
    private static final String URL = "jdbc:postgresql://db.acmshmfjhdpftgplccew.supabase.co:5432/postgres?sslmode=require";
    private static final String USER = "postgres";      // Cambia si usas otro usuario
    private static final String PASSWORD = "x1pk2t7h4f13g8"; // Reemplaza por tu contraseña de Postgres

    static {
        try {
            // Cargar el driver JDBC de PostgreSQL
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("Error al cargar el Driver de PostgreSQL: " + e.getMessage());
        }
    }

    /**
     * Obtiene una conexión activa a la base de datos PostgreSQL
     * @return Connection
     * @throws SQLException
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    /**
     * Método utilitario para cerrar la conexión de forma segura
     * @param conn
     */
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