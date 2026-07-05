package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import com.shop.backend.common.PageResult;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/member-records")
public class MemberRecordController {

    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public MemberRecordController(NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String userId,
                                                             @RequestParam(required = false) String type,
                                                             @RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from member_record");
        query.eq("user_id", userId);
        query.eq("type", type);
        return ApiResponse.ok(page("""
                select id, record_id recordId, user_id userId, type, `change`, balance, reason, order_id orderId, time
                """ + query.sql, "select count(*) " + query.sql, query.params, page, pageSize));
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
