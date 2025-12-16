FROM eclipse-temurin:17-jdk
COPY wildfly-37.0.1.Final/wildfly-37.0.1.Final /opt/wildfly
RUN useradd -m -s /bin/bash jboss && chown -R jboss:jboss /opt/wildfly
USER jboss
WORKDIR /opt/wildfly
EXPOSE 8080 9990
CMD ["/opt/wildfly/bin/standalone.sh", "-b", "0.0.0.0", "-bmanagement", "0.0.0.0"]