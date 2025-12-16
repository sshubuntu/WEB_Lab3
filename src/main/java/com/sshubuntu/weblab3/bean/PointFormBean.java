package com.sshubuntu.weblab3.bean;

import com.sshubuntu.weblab3.exception.InvalidPointException;
import com.sshubuntu.weblab3.model.PointResult;
import com.sshubuntu.weblab3.service.ResultService;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;

import java.io.Serializable;
import java.util.List;

@Named("pointForm")
@ViewScoped
public class PointFormBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final List<Double> listx = List.of(-3., -2d, -1d, 0d, 1d, 2d, 3d, 4d, 5d);
    private static final List<Double> listr = List.of(1d, 1.5d, 2d, 2.5d, 3d);

    private Double x;
    private Double y;
    private Double r;

    @Inject
    private ResultService resultService;

    @Inject
    private ResultHistoryBean historyBean;

    public List<Double> getAllowedX() {
        return listx;
    }

    public List<Double> getAllowedR() {
        return listr;
    }

    public String submit() {
        try {
            PointResult result = resultService.registerPoint(x, y, r);
            historyBean.prepend(result);
            FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_INFO, "Точка сохранена", null));
        } catch (InvalidPointException ex) {
            FacesContext.getCurrentInstance().addMessage(null, new FacesMessage(FacesMessage.SEVERITY_ERROR, ex.getMessage(), null));
        }
        return null;
    }

    public Double getX() {
        return x;
    }

    public Double getY() {
        return y;
    }

    public Double getR() {
        return r;
    }

    public void setY(Double y) {
        this.y = y;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public void setR(Double r) {
        this.r = r;
    }

}

