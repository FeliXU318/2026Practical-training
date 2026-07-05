package com.shop.backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 扫描mapper接口所在包
@MapperScan("com.shop.backend.mapper")
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BackendApplication.class, args);
    }

    private static void loadDotEnv() {
        List<Path> candidates = List.of(
                Path.of(".env"),
                Path.of("..", ".env"),
                Path.of("..", "..", ".env")
        );
        for (Path candidate : candidates) {
            Path file = candidate.toAbsolutePath().normalize();
            if (Files.isRegularFile(file)) {
                readDotEnv(file);
            }
        }
    }

    private static void readDotEnv(Path file) {
        try {
            for (String line : Files.readAllLines(file)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int index = trimmed.indexOf('=');
                if (index <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, index).trim();
                String value = stripQuotes(trimmed.substring(index + 1).trim());
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException ex) {
            System.err.println("Failed to load .env file: " + file + " - " + ex.getMessage());
        }
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
