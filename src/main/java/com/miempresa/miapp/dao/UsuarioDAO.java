package com.miempresa.miapp.dao;

import com.miempresa.miapp.config.DBConnection;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


public class UsuarioDAO {

    /**
     * Valida la contraseña ingresada mediante hashing BCrypt.
     */
    public Map<String, Object> validarUsuario(String email, String password) {
        Map<String, Object> usuario = null;

        // 1. Buscamos al usuario únicamente por su correo electrónico y estado activo
        String sql = "SELECT u.id, u.email, u.password_hash, u.nombres, u.apellido_paterno, r.nombre AS rol " +
                     "FROM usuarios u " +
                     "JOIN roles r ON u.rol_id = r.id " +
                     "WHERE LOWER(u.email) = LOWER(?) AND u.estado = true";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email.trim());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password_hash");

                    // 2. Validación estricta con BCrypt
                    if (storedHash != null && BCrypt.checkpw(password.trim(), storedHash)) {
                        usuario = new HashMap<>();

                        Object rawId = rs.getObject("id");
                        if (rawId instanceof UUID) {
                            usuario.put("id", rawId);
                        } else if (rawId != null) {
                            usuario.put("id", UUID.fromString(rawId.toString()));
                        }

                        usuario.put("email", rs.getString("email"));
                        usuario.put("nombres", rs.getString("nombres"));
                        usuario.put("apellido", rs.getString("apellido_paterno"));
                        usuario.put("rol", rs.getString("rol"));

                        System.out.println("> [UsuarioDAO Debug] Autenticación BCrypt exitosa para: " + email);
                    } else {
                        System.out.println("> [UsuarioDAO Debug] La contraseña ingresada no coincide con el hash BCrypt.");
                    }
                } else {
                    System.out.println("> [UsuarioDAO Debug] No se encontró un usuario activo con el correo: " + email);
                }
            }
        } catch (SQLException e) {
            System.err.println("> [UsuarioDAO Error] Error al validar usuario: " + e.getMessage());
        }
        return usuario;
    }

    
    /**
     * Registra el log de acceso en la base de datos tras una autenticación exitosa.
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
            System.err.println("> [UsuarioDAO Error] Error al registrar log de acceso: " + e.getMessage());
        }
    }
}