package com.sshubuntu.weblab3.service;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PointAreaService {

    public boolean isHit(double x, double y, double r) {
        return inRectangle(x, y, r) || inTriangle(x, y, r) || inQuarterCircle(x, y, r);
    }

    private boolean inRectangle(double x, double y, double r) {
        double halfR = r / 2.0;
        return x >= -halfR && x <= 0 && y >= 0 && y <= r;
    }

    private boolean inTriangle(double x, double y, double r) {
        double halfR = r / 2.0;
        return x >= 0 && y >= 0 && x <= halfR && y <= halfR && y <= halfR - x;
    }


    private boolean inQuarterCircle(double x, double y, double r) {
        double radius = r / 2.0;
        double distanceSquared = x * x + y * y;
        if (distanceSquared > radius * radius) {
            return false;
        }

        if (x > 0 || y > 0) {
            return false;
        }
        double angle = Math.atan2(y, x);
        double angleDegrees = Math.toDegrees(angle);
        return angleDegrees >= -180 && angleDegrees <= -90;
    }
}



