package com.sshubuntu.weblab3.web;

import com.sshubuntu.weblab3.bean.ResultHistoryBean;
import com.sshubuntu.weblab3.dto.PointResponse;
import com.sshubuntu.weblab3.exception.InvalidPointException;
import com.sshubuntu.weblab3.model.PointResult;
import com.sshubuntu.weblab3.service.ResultService;
import jakarta.inject.Inject;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;

@WebServlet(urlPatterns = "/controller")
public class PointControllerServlet extends HttpServlet {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
    private final Jsonb jsonb = JsonbBuilder.create();

    @Inject
    private ResultService resultService;

    @Inject
    private ResultHistoryBean historyBean;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        resp.setContentType("application/json;charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");
        
        PrintWriter writer = null;
        try {
            double x = parseParam(req, "x");
            double y = parseParam(req, "y");
            double r = parseParam(req, "r");

            PointResult saved = resultService.registerPoint(x, y, r);
            historyBean.prepend(saved);

            PointResponse payload = new PointResponse(saved.getX(), saved.getY(), saved.getR(), saved.isHit(), saved.getCreationTime() != null ? formatter.format(saved.getCreationTime()) : "");
            
            writer = resp.getWriter();
            writer.write(jsonb.toJson(payload));
            writer.flush();
        } catch (Exception ex) {
           writer.write(ex.getMessage());
        }
    }

    private double parseParam(HttpServletRequest req, String name) {
        String raw = req.getParameter(name);
        if (raw == null || raw.isBlank()) {
            String paramName = name.toUpperCase();
            throw new InvalidPointException("Введите " + paramName);
        }
        try {
            double value = Double.parseDouble(raw.replace(',', '.'));
            if (Double.isNaN(value) || Double.isInfinite(value)) {
                String paramName = name.toUpperCase();
                throw new InvalidPointException("Введите " + paramName);
            }
            return value;
        } catch (NumberFormatException e) {
            String paramName = name.toUpperCase();
            throw new InvalidPointException(paramName + " должен быть числом");
        }
    }

}

