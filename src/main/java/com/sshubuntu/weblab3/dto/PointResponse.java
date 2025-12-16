package com.sshubuntu.weblab3.dto;

import java.io.Serializable;

public record PointResponse(double x, double y, double r, boolean hit, String creationTime) implements Serializable { }





