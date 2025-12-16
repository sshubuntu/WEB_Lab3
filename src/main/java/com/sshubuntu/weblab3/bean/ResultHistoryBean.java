package com.sshubuntu.weblab3.bean;

import com.sshubuntu.weblab3.dto.PointResponse;
import com.sshubuntu.weblab3.model.PointResult;
import com.sshubuntu.weblab3.service.ResultService;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;

import java.io.Serializable;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Named("historyBean")
@SessionScoped
public class ResultHistoryBean implements Serializable {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

    @Inject
    private ResultService resultService;

    private List<PointResult> results;

    @PostConstruct
    public void init() {
        refresh();
    }

    public void refresh() {
        results = new ArrayList<>(resultService.fetchAllOrdered());
    }

    public void prepend(PointResult result) {
        if (results == null) {
            refresh();
        }
        results.add(0, result);
    }

    public List<PointResult> getResults() {
        if (results == null) {
            refresh();
        }
        return results;
    }

    public String getResultsJson() {
        List<PointResponse> payload = results.stream().map(r -> new PointResponse(r.getX(), r.getY(), r.getR(), r.isHit(), r.getCreationTime() != null ? formatter.format(r.getCreationTime()) : "")).collect(Collectors.toList());
        try (Jsonb jsonb = JsonbBuilder.create()) {
            return jsonb.toJson(payload);
        } catch (Exception e) {
            return "[]";
        }
    }
}

