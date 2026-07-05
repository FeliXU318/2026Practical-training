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
@RequestMapping("/api/admin/deliveries")
public class RunController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public RunController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String deliveryNo,
                                                             @RequestParam(required = false) String rider,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from run");
        query.like("cast(id as char)", stripPrefix(deliveryNo, "RUN-"));
        query.like("cast(runner_id as char)", rider);
        query.eq("status", status);
        return ApiResponse.ok(page("""
                select id, concat('RUN-', id) deliveryNo, concat('ORDER-', id) orderNo,
                       user receiver, location dormAddress, cast(runner_id as char) riderName,
                       coalesce(status, 'waiting') deliveryStatus, time estimatedArrivalAt
                """ + query.sql, "select count(*) " + query.sql, query.params, page, pageSize));
    }

    @PutMapping("/{id}/assign")
    public ApiResponse<Void> assign(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Integer runnerId = parseInteger(body.get("rider"));
        int updated = runnerId == null
                ? jdbcTemplate.update("update run set delivery_desc = ? where id = ?", body.get("rider"), id)
                : jdbcTemplate.update("update run set runner_id = ? where id = ?", runnerId, id);
        return updated > 0 ? ApiResponse.ok("assigned", null) : ApiResponse.fail("delivery task does not exist");
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return jdbcTemplate.update("update run set status = ? where id = ?", body.get("status"), id) > 0
                ? ApiResponse.ok("updated", null) : ApiResponse.fail("delivery task does not exist");
    }

    private PageResult<Map<String, Object>> page(String listSql, String countSql, MapSqlParameterSource params, long page, long pageSize) {
        params.addValue("offset", Math.max(0, (page - 1) * pageSize));
        params.addValue("pageSize", pageSize);
        Long total = namedJdbcTemplate.queryForObject(countSql, params, Long.class);
        return new PageResult<>(namedJdbcTemplate.queryForList(listSql + " limit :offset, :pageSize", params), total == null ? 0 : total);
    }

    private String stripPrefix(String value, String prefix) {
        return StringUtils.hasText(value) && value.startsWith(prefix) ? value.substring(prefix.length()) : value;
    }

    private Integer parseInteger(String value) {
        try {
            return StringUtils.hasText(value) ? Integer.valueOf(value) : null;
        } catch (NumberFormatException ex) {
            return null;
        }
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
