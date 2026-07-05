package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import com.shop.backend.common.PageResult;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/secondhand")
public class SecondhandController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public SecondhandController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping("/audit")
    public ApiResponse<PageResult<Map<String, Object>>> audit(@RequestParam(required = false) String name,
                                                              @RequestParam(required = false) String category,
                                                              @RequestParam(required = false) String status,
                                                              @RequestParam(defaultValue = "1") long page,
                                                              @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from secondhand");
        query.like("title", name);
        query.like("category", category);
        if ("available".equals(status)) {
            query.eq("sold", 0);
        } else if ("sold".equals(status)) {
            query.eq("sold", 1);
        }
        PageResult<Map<String, Object>> result = page(secondhandSelect() + query.sql, "select count(*) " + query.sql, query.params, page, pageSize);
        result.getList().forEach(this::normalize);
        return ApiResponse.ok(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable Integer id) {
        var rows = jdbcTemplate.queryForList(secondhandSelect() + " from secondhand where id = ?", id);
        return rows.isEmpty() ? ApiResponse.fail("secondhand item does not exist") : ApiResponse.ok(normalize(rows.get(0)));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<Void> approve(@PathVariable Integer id) {
        return jdbcTemplate.update("update secondhand set sold = 0 where id = ?", id) > 0
                ? ApiResponse.ok("online", null) : ApiResponse.fail("secondhand item does not exist");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<Void> reject(@PathVariable Integer id) {
        return jdbcTemplate.update("update secondhand set sold = 1 where id = ?", id) > 0
                ? ApiResponse.ok("offline", null) : ApiResponse.fail("secondhand item does not exist");
    }

    private String secondhandSelect() {
        return """
                select id, user_id userId, title name, title, price, original_price originalPrice,
                       image, seller, campus, time, category, description, sold
                """;
    }

    private Map<String, Object> normalize(Map<String, Object> row) {
        boolean sold = number(row.get("sold")).intValue() == 1;
        row.put("sold", sold);
        row.put("auditStatus", sold ? "sold" : "available");
        return row;
    }

    private Number number(Object value) {
        return value instanceof Number number ? number : 0;
    }

    private PageResult<Map<String, Object>> page(String listSql, String countSql, MapSqlParameterSource params, long page, long pageSize) {
        params.addValue("offset", Math.max(0, (page - 1) * pageSize));
        params.addValue("pageSize", pageSize);
        Long total = namedJdbcTemplate.queryForObject(countSql, params, Long.class);
        return new PageResult<>(namedJdbcTemplate.queryForList(listSql + " limit :offset, :pageSize", params), total == null ? 0 : total);
    }

    private static class QueryParts {
        private final StringBuilder sql;
        private final MapSqlParameterSource params = new MapSqlParameterSource();
        private int index;

        private QueryParts(String sql) {
            this.sql = new StringBuilder(sql);
        }

        private void like(String column, String value) {
            if (StringUtils.hasText(value)) {
                String name = "p" + index++;
                appendCondition(column + " like :" + name);
                params.addValue(name, "%" + value + "%");
            }
        }

        private void eq(String column, Object value) {
            if (value != null && StringUtils.hasText(String.valueOf(value))) {
                String name = "p" + index++;
                appendCondition(column + " = :" + name);
                params.addValue(name, value);
            }
        }

        private void appendCondition(String condition) {
            sql.append(index == 1 ? " where " : " and ").append(condition);
        }
    }
}
