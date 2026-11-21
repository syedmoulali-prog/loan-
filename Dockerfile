# ==============================================================================
# Unified Production Multi-Stage Dockerfile for Customer Loan Eligibility System
# Packages React Frontend and Spring Boot Backend together into ONE single service
# ==============================================================================

# Stage 1: Build React Vite Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Backend with embedded Frontend static files
FROM eclipse-temurin:21-jdk-jammy AS backend-build
WORKDIR /app/backend
RUN apt-get update && apt-get install -y maven
COPY backend/pom.xml .
COPY backend/src ./src
# Embed built React static files into Spring Boot static resources directory
COPY --from=frontend-build /app/frontend/dist/ ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Minimal Java 21 Production Runtime Image
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=backend-build /app/backend/target/loan-eligibility-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
