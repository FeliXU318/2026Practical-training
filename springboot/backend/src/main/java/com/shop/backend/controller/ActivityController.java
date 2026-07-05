package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import com.shop.backend.common.PageResult;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/activities")
public class ActivityController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public ActivityController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String keyword,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from activity");
        query.like("name", keyword);
        query.eq("status", status);
        return ApiResponse.ok(page("select id, name, type, start_time startTime, end_time endTime, status " + query.sql,
                "select count(*) " + query.sql, query.params, page, pageSize));
    }

    @PostMapping
    public ApiResponse<Map<String, Object>> create(@RequestBody Map<String, Object> body) {
        jdbcTemplate.update("insert into activity(name, type, start_time, end_time, status) values(?, ?, ?, ?, ?)",
                body.get("name"), body.get("type"), body.get("startTime"), body.get("endTime"), defaultValue(body.get("status"), "draft"));
        Long id = jdbcTemplate.queryForObject("select last_insert_id()", Long.class);
        return ApiResponse.ok("created", Map.of("id", id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        int updated = jdbcTemplate.update("update activity set name = ?, type = ?, start_time = ?, end_time = ?, status = ? where id = ?",
                body.get("name"), body.get("type"), body.get("startTime"), body.get("endTime"), body.get("status"), id);
        return updated > 0 ? ApiResponse.ok("updated", null) : ApiResponse.fail("activity does not exist");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        return jdbcTemplate.update("delete from activity where id = ?", id) > 0 ? ApiResponse.ok("deleted", null) : ApiResponse.fail("activity does not exist");
    }

    private PageResult<Map<String, Object>> page(String listSql, String countSql, MapSqlParameterSource params, long page, long pageSize) {
        params.addValue("offset", Math.max(0, (page - 1) * pageSize));
        params.addValue("pageSize", pageSize);
        Long total = namedJdbcTemplate.queryForObject(countSql, params, Long.class);
        return new PageResult<>(namedJdbcTemplate.queryForList(listSql + " limit :offset, :pageSize", params), total == null ? 0 : total);
    }

    private Object defaultValue(Object value, Object fallback) {
        return value == null || !StringUtils.hasText(String.valueOf(value)) ? fallback : value;
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
