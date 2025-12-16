package com.sshubuntu.weblab3.bean;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Named;

@Named("studentInfo")
@ApplicationScoped
public class StudentInfoBean {

    private final String fullName = "Шубин Егор Вячеславович";
    private final String group = "P3209";
    private final String variant = "7645";

    public String getFullName() {
        return fullName;
    }

    public String getGroup() {
        return group;
    }

    public String getVariant() {
        return variant;
    }
}





