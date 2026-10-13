package com.miempresa.miapp.config;

import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    // Carga el archivo .env de forma local
    private static final Dotenv dotenv = Dotenv.configure().load();

    private static final String URL = dotenv.get("DB_URL");
    private static final String USER = dotenv.get("DB_USER");
    private static final String PASSWORD = dotenv.get("DB_PASSWORD");

    static {
        try {
            Class.forName("org.postgresql.Driver");
            System.out.println("Driver de PostgreSQL cargado correctamente.");
        } catch (ClassNotFoundException e) {
            System.err.println("ERROR CRITICO: No se encontró el Driver de PostgreSQL: " + e.getMessage());
        }
    }


    public static Connection getConnection() throws SQLException {
        try {
            System.out.println("Intentando conectar a Supabase localmente...");
            Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("¡CONEXIÓN EXITOSA A SUPABASE!");
            return conn;
        } catch (SQLException e) {
            System.err.println("FALLO DE CONEXIÓN A SUPABASE: " + e.getMessage());
            System.err.println("SQLState: " + e.getSQLState());
            throw e;
        }
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