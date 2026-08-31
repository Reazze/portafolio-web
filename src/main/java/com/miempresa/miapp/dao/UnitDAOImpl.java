package com.miempresa.miapp.dao;

import com.miempresa.miapp.model.Unit;
import java.util.ArrayList;
import java.util.List;

public class UnitDAOImpl implements UnitDAO {

    @Override
    public List<Unit> findAll() {
        // En una etapa avanzada, aquí realizas la consulta SQL a la base de datos
        List<Unit> units = new ArrayList<>();
        units.add(new Unit(1, "UD01", "Arquitectura y Fundamentos Web", "icosahedron", "#00e5ff"));
        units.add(new Unit(2, "UD02", "Programación Estructurada y Algoritmos", "torus", "#0088ff"));
        units.add(new Unit(3, "UD03", "Bases de Datos y Modelamiento", "octahedron", "#7d2ae8"));
        units.add(new Unit(4, "UD04", "Desarrollo Frontend Avanzado", "dodecahedron", "#00ffaa"));
        units.add(new Unit(5, "UD05", "Backend y Servicios Web / APIs", "cylinder", "#ff007f"));
        units.add(new Unit(6, "UD06", "Seguridad, Deploy y DevOps", "torusKnot", "#ffaa00"));
        units.add(new Unit(7, "UD07", "Proyecto Integrador Profesional", "tetrahedron", "#00ffcc"));
        return units;
    }

    @Override
    public Unit findById(int id) {
        return findAll().stream()
                .filter(u -> u.getId() == id)
                .findFirst()
                .orElse(null);
    }
}