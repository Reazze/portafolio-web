package com.miempresa.miapp.dao;

import com.miempresa.miapp.config.DBConnection;
import com.miempresa.miapp.model.SesionDTO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

public class EntregaDAO {

    /**
     * Obtiene la información de la tarea y la entrega activa correspondiente a una sesión para un estudiante.
     */
    public void cargarEstadoEntregaEstudiante(SesionDTO sesion, UUID estudianteId) {
        String sql = "SELECT t.id AS tarea_id, e.estado_envio, e.nota, e.archivo_url " +
                     "FROM public.tareas_actividades t " +
                     "LEFT JOIN public.entregas_estudiantes e ON t.id = e.tarea_id " +
                     "AND e.estudiante_id = ? AND e.estado_envio != 'ANULADO' " +
                     "WHERE t.sesion_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setObject(1, estudianteId);
            ps.setInt(2, sesion.getId());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    sesion.setTareaId(rs.getInt("tarea_id"));
                    
                    String estado = rs.getString("estado_envio");
                    if (estado != null) {
                        sesion.setEstadoEntrega(estado.toLowerCase()); // 'enviado', 'reemplazado'
                    } else {
                        sesion.setEstadoEntrega("pendiente");
                    }

                    double notaVal = rs.getDouble("nota");
                    if (!rs.wasNull()) {
                        sesion.setNota(notaVal);
                    } else {
                        sesion.setNota(null);
                    }

                    sesion.setMiArchivoUrl(rs.getString("archivo_url"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Registra o actualiza la entrega de un estudiante en PostgreSQL.
     * Respeta el CHECK (ENVIADO, REEMPLAZADO, ANULADO).
     */
    public boolean guardarOActualizarEntrega(int tareaId, UUID estudianteId, String archivoUrl, String observacion) {
        String sql = "INSERT INTO public.entregas_estudiantes " +
                     "(tarea_id, estudiante_id, archivo_url, observacion_estudiante, fecha_entrega, estado_envio) " +
                     "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'ENVIADO') " +
                     "ON CONFLICT (tarea_id, estudiante_id) DO UPDATE SET " +
                     "archivo_url = EXCLUDED.archivo_url, " +
                     "observacion_estudiante = EXCLUDED.observacion_estudiante, " +
                     "fecha_entrega = CURRENT_TIMESTAMP, " +
                     "estado_envio = 'REEMPLAZADO'";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, tareaId);
            stmt.setObject(2, estudianteId); // Manejo nativo de UUID
            stmt.setString(3, archivoUrl);
            stmt.setString(4, observacion);

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Marca la entrega como 'ANULADO' o la elimina según corresponda.
     */
    public boolean cancelarEntrega(int tareaId, UUID estudianteId) {
        String sql = "UPDATE public.entregas_estudiantes " +
                     "SET estado_envio = 'ANULADO' " +
                     "WHERE tarea_id = ? AND estudiante_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, tareaId);
            ps.setObject(2, estudianteId);

            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}