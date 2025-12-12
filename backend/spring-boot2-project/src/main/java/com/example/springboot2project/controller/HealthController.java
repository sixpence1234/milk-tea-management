package com.example.springboot2project.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("timestamp", LocalDateTime.now());
        result.put("message", "Spring Boot application is running");
        return result;
    }

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> result = new HashMap<>();
        result.put("app", "Spring Boot 2.7.18");
        result.put("version", "1.0.0");
        result.put("status", "running");
        result.put("endpoints", new String[]{
            "/health - Health check",
            "/api/hello - Hello endpoint"
        });
        return result;
    }

    @GetMapping("/api/hello")
    public Map<String, Object> hello() {
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Hello from Spring Boot!");
        result.put("timestamp", LocalDateTime.now());
        return result;
    }
}
