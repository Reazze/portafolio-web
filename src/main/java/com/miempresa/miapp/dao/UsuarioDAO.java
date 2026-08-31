package com.miempresa.miapp.dao;

import com.miempresa.miapp.config.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class UsuarioDAO {

    /**
     * Valida el ingreso de un usuario por su credencial/DNI y contraseña
     */
    public Map<String, Object> validarUsuario(String documento, String password) {
        Map<String, Object> usuario = null;
        String sql = "SELECT u.id, u.nombres, u.apellido_paterno, r.nombre AS rol " +
                     "FROM usuarios u " +
                     "JOIN roles r ON u.rol_id = r.id " +
                     "WHERE u.numero_documento = ? AND u.password_hash = ? AND u.estado = true";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, documento);
            stmt.setString(2, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    usuario = new HashMap<>();
                    usuario.put("id", rs.getObject("id", UUID.class));
                    usuario.put("nombres", rs.getString("nombres"));
                    usuario.put("apellido", rs.getString("apellido_paterno"));
                    usuario.put("rol", rs.getString("rol"));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al validar usuario: " + e.getMessage());
        }
        return usuario;
    }

    /**
     * Registra el log de acceso cada vez que un usuario inicia sesión
     */
    public void registrarLogAcceso(UUID usuarioId, String ipOrigen, String navegadorInfo) {
        String sql = "INSERT INTO logs_acceso (usuario_id, ip_origen, navegador_info) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setObject(1, usuarioId);
            stmt.setString(2, ipOrigen);
            stmt.setString(3, navegadorInfo);

            stmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error al registrar log de acceso: " + e.getMessage());
        }
    }
}