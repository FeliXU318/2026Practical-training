package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/phone-card")
public class SimcardController {

    private final JdbcTemplate jdbcTemplate;

    public SimcardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> detail() {
        var rows = jdbcTemplate.queryForList("select id, name, price, data, calls, features, recommended from simcard order by recommended desc, id limit 1");
        if (rows.isEmpty()) {
            return ApiResponse.ok(null);
        }
        Map<String, Object> row = rows.get(0);
        row.put("recommended", number(row.get("recommended")).intValue() == 1);
        return ApiResponse.ok(row);
    }

    @PutMapping
    public ApiResponse<Void> save(@RequestBody Map<String, Object> body) {
        Object recommended = Boolean.TRUE.equals(body.get("recommended")) ? 1 : 0;
        if (body.get("id") == null) {
            jdbcTemplate.update("insert into simcard(name, price, data, calls, features, recommended) values(?, ?, ?, ?, ?, ?)",
                    body.get("name"), body.get("price"), body.get("data"), body.get("calls"), body.get("features"), recommended);
        } else {
            jdbcTemplate.update("update simcard set name = ?, price = ?, data = ?, calls = ?, features = ?, recommended = ? where id = ?",
                    body.get("name"), body.get("price"), body.get("data"), body.get("calls"), body.get("features"), recommended, body.get("id"));
        }
        return ApiResponse.ok("saved", null);
    }

    private Number number(Object value) {
        return value instanceof Number number ? number : 0;
    }
}
