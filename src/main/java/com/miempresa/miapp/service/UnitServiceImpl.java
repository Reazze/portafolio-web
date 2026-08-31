package com.miempresa.miapp.service;

import com.miempresa.miapp.dao.UnitDAO;
import com.miempresa.miapp.dao.UnitDAOImpl;
import com.miempresa.miapp.model.Unit;
import java.util.List;

public class UnitServiceImpl implements UnitService {

    // Llama al trabajador de la base de datos (DAO)
    private final UnitDAO unitDAO = new UnitDAOImpl();

    @Override
    public List<Unit> getAllUnits() {
        return unitDAO.findAll();
    }

    @Override
    public Unit getUnitById(int id) {
        return unitDAO.findById(id);
    }
}