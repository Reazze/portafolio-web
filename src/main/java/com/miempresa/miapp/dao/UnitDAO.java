package com.miempresa.miapp.dao;

import com.miempresa.miapp.model.Unit;
import java.util.List;

public interface UnitDAO {
    List<Unit> findAll();
    Unit findById(int id);
}