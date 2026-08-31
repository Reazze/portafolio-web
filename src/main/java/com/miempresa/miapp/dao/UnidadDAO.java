package com.miempresa.miapp.dao;

import com.miempresa.miapp.config.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UnidadDAO {

    /**
     * Obtiene las unidades didácticas filtradas por programa de estudios y semestre
     */
    public List<Map<String, Object>> obtenerUnidadesPorProgramaYSemestre(String codigoPrograma, int semestre) {
        List<Map<String, Object>> lista = new ArrayList<>();
        
        String sql = "SELECT ud.id, ud.tag, ud.nombre, ud.creditos, ud.forma_3d, ud.color_hex " +
                     "FROM unidades_didacticas ud " +
                     "JOIN programas_estudio pe ON ud.programa_estudio_id = pe.id " +
                     "WHERE pe.codigo = ? AND ud.semestre = ? " +
                     "ORDER BY ud.tag";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigoPrograma);
            stmt.setInt(2, semestre);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> unidad = new HashMap<>();
                    unidad.put("id", rs.getInt("id"));
                    unidad.put("tag", rs.getString("tag"));
                    unidad.put("nombre", rs.getString("nombre"));
                    unidad.put("creditos", rs.getInt("creditos"));
                    unidad.put("forma3d", rs.getString("forma_3d"));
                    unidad.put("colorHex", rs.getString("color_hex"));
                    lista.add(unidad);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error al consultar unidades didácticas: " + e.getMessage());
        }
        return lista;
    }
}