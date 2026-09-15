package com.miempresa.miapp.model;

import java.util.List;

/**
 * Clase DTO para transferir la información de las sesiones,
 * sus materiales y el estado de entrega del estudiante hacia el frontend.
 */
public class SesionDTO {
    private int id;
    private String codigo;
    private String titulo;
    private String tag;
    private String descripcion;
    private Posicion3D posicion3D;
    private List<EntregableDTO> entregables;

    // Campos añadidos para la gestión de entregas en PostgreSQL
    private int tareaId;
    private String estadoEntrega; // "pendiente" | "entregado"
    private Double nota;          // null si está SIN CALIFICAR
    private String miArchivoUrl;  // URL/Nombre del archivo subido por el estudiante

    // Ubicación 3D dentro del canvas Three.js
    public static class Posicion3D {
        private double x;
        private double y;
        private double z;

        public Posicion3D(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        public double getX() { return x; }
        public double getY() { return y; }
        public double getZ() { return z; }
    }

    // Entregables correspondientes a la sesión
    public static class EntregableDTO {
        private String id;
        private String titulo;
        private List<ArchivoDTO> archivos;

        public EntregableDTO(String id, String titulo, List<ArchivoDTO> archivos) {
            this.id = id;
            this.titulo = titulo;
            this.archivos = archivos;
        }

        public String getId() { return id; }
        public String getTitulo() { return titulo; }
        public List<ArchivoDTO> getArchivos() { return archivos; }
    }

    // Archivos adjuntos descargables (Materiales de sesión)
    public static class ArchivoDTO {
        private String nombre;
        private String url;
        private String tipo;

        public ArchivoDTO(String nombre, String url, String tipo) {
            this.nombre = nombre;
            this.url = url;
            this.tipo = tipo;
        }

        public String getNombre() { return nombre; }
        public String getUrl() { return url; }
        public String getTipo() { return tipo; }
    }

    // Constructor principal original
    public SesionDTO(int id, String codigo, String titulo, String tag, String descripcion, Posicion3D posicion3D, List<EntregableDTO> entregables) {
        this.id = id;
        this.codigo = codigo;
        this.titulo = titulo;
        this.tag = tag;
        this.descripcion = descripcion;
        this.posicion3D = posicion3D;
        this.entregables = entregables;
        this.estadoEntrega = "pendiente";
        this.nota = null;
    }

    // Getters y Setters generales
    public int getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getTitulo() { return titulo; }
    public String getTag() { return tag; }
    public String getDescripcion() { return descripcion; }
    public Posicion3D getPosicion3D() { return posicion3D; }
    public List<EntregableDTO> getEntregables() { return entregables; }

    // Getters y Setters de Entrega
    public int getTareaId() { return tareaId; }
    public void setTareaId(int tareaId) { this.tareaId = tareaId; }

    public String getEstadoEntrega() { return estadoEntrega; }
    public void setEstadoEntrega(String estadoEntrega) { this.estadoEntrega = estadoEntrega; }

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }

    public String getMiArchivoUrl() { return miArchivoUrl; }
    public void setMiArchivoUrl(String miArchivoUrl) { this.miArchivoUrl = miArchivoUrl; }
}