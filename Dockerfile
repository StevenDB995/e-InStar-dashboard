# ---- Step 1: Build stage with Java 11 and Maven ----
FROM maven:3.9.5-eclipse-temurin-11 AS build

WORKDIR /app

# Copy only the build-related files first (for caching)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN ./mvnw dependency:go-offline

# Copy the full source and build the JAR
COPY . .
RUN ./mvnw clean package -DskipTests

# ---- Step 2: Runtime stage with Java 11 JDK only ----
FROM eclipse-temurin:11-jdk-jammy

WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Default command to run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
