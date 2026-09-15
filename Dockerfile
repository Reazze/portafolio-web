# --- ETAPA 1: Compilación ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copiar el archivo de configuración y descargar dependencias en caché
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el archivo .war
COPY src ./src
RUN mvn clean package -DskipTests

# --- ETAPA 2: Ejecución ---
# Usamos Tomcat 10 (compatible con Jakarta EE 10 y Servlets 6.0) ejecutándose sobre Java 21
FROM tomcat:10.1-jdk21-temurin-alpine
WORKDIR /usr/local/tomcat

# Eliminar las aplicaciones por defecto de Tomcat para limpiar el entorno (Opcional)
RUN rm -rf webapps/*

# Copiar el archivo .war generado en la etapa anterior hacia la carpeta webapps de Tomcat.
# Al renombrarlo a ROOT.war, tu aplicación responderá directamente en la raíz ( http://localhost:8080/ )
COPY --from=build /app/target/portafolio-web.war webapps/ROOT.war

# Tomcat escucha en el puerto 8080 por defecto
EXPOSE 8080

# Comando para iniciar Tomcat
CMD ["catalina.sh", "run"]
