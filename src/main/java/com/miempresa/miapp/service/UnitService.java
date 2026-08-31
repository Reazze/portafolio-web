package com.miempresa.miapp.service;

import com.miempresa.miapp.model.Unit;
import java.util.List;

public interface UnitService {
    List<Unit> getAllUnits();
    Unit getUnitById(int id);
}