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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/complaints")
public class AftersaleController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public AftersaleController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String code,
                                                             @RequestParam(required = false) String type,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from aftersale");
        query.like("after_sale_id", code);
        query.eq("type_text", type);
        query.eq("status", status);
        return ApiResponse.ok(page(complaintSelect() + query.sql, "select count(*) " + query.sql, query.params, page, pageSize));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable Integer id) {
        var rows = jdbcTemplate.queryForList(complaintSelect() + " from aftersale where id = ?", id);
        return rows.isEmpty() ? ApiResponse.fail("aftersale record does not exist") : ApiResponse.ok(rows.get(0));
    }

    @PutMapping("/{id}/handle")
    public ApiResponse<Void> handle(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        int updated = jdbcTemplate.update("""
                update aftersale
                set status = 'closed', status_text = 'handled', timeline = ?, update_time = ?
                where id = ?
                """, body.get("result"), System.currentTimeMillis(), id);
        return updated > 0 ? ApiResponse.ok("handled", null) : ApiResponse.fail("aftersale record does not exist");
    }

    private String complaintSelect() {
        return """
                select id, after_sale_id code, order_id complainantUserId,
                       coalesce(type_text, type) type,
                       concat('order ', coalesce(order_id, '')) relatedObject,
                       coalesce(reason_text, reason, description) summary,
                       coalesce(reason_desc, description) detail,
                       create_time submittedAt,
                       coalesce(status, 'pending') status,
                       timeline handleResult
                """;
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
