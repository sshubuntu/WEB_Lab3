package com.sshubuntu.weblab3.service;

import com.sshubuntu.weblab3.exception.InvalidPointException;
import com.sshubuntu.weblab3.model.PointResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class ResultService {

    @PersistenceContext(unitName = "PointsPU")
    private EntityManager entityManager;

    @Inject
    private PointAreaService pointAreaService;

    @Transactional
    public PointResult registerPoint(double x, double y, double r) {
        validateInput(x, y, r);
        boolean hit = pointAreaService.isHit(x, y, r);
        PointResult entity = new PointResult(x, y, r, hit);
        entityManager.persist(entity);
        entityManager.flush();
        return entity;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<PointResult> fetchAllOrdered() {
        return entityManager.createQuery("SELECT p FROM PointResult p ORDER BY p.creationTime DESC", PointResult.class).getResultList();
    }

    private void validateInput(double x, double y, double r) {
        if (Double.isNaN(x) || Double.isInfinite(x)) throw new InvalidPointException("Введите X");
        if (x < -3 || x > 5) throw new InvalidPointException("X должен быть значением из {-3, -2, -1, 0, 1, 2, 3, 4, 5}");
        if (Double.isNaN(y) || Double.isInfinite(y)) throw new InvalidPointException("Введите Y");
        if (y < -3 || y > 5) throw new InvalidPointException("Y должен быть в диапазоне (-3; 5)");
        if (Double.isNaN(r) || Double.isInfinite(r)) throw new InvalidPointException("Введите R");
        if (r < 1 || r > 3) throw new InvalidPointException("R должен быть значением из {1, 1.5, 2, 2.5, 3}");
    }
}



