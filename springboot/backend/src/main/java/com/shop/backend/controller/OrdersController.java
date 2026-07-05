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
@RequestMapping("/api/admin/orders")
public class OrdersController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public OrdersController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping
    public ApiResponse<PageResult<Map<String, Object>>> list(@RequestParam(required = false) String orderNo,
                                                             @RequestParam(required = false) String type,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from orders");
        query.like("cast(order_id as char)", orderNo);
        query.eq("order_type", type);
        query.eq("order_status", status);
        return ApiResponse.ok(page(orderSelect() + query.sql, "select count(*) " + query.sql, query.params, page, pageSize));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable Integer id) {
        var rows = jdbcTemplate.queryForList(orderSelect() + " from orders where order_id = ?", id);
        return rows.isEmpty() ? ApiResponse.fail("order does not exist") : ApiResponse.ok(rows.get(0));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return jdbcTemplate.update("update orders set order_status = ? where order_id = ?", body.get("status"), id) > 0
                ? ApiResponse.ok("updated", null) : ApiResponse.fail("order does not exist");
    }

    private String orderSelect() {
        return """
                select order_id id, order_id orderNo, user_id userId, merchant_id merchantId,
                       order_type orderType, total_amount amount, total_amount totalAmount,
                       pay_status payStatus, delivery_type fulfillType, delivery_type deliveryType,
                       order_status orderStatus, address, title, content item, content,
                       reward, status_class statusClass, time, location, color, rewarded,
                       after_sale_id afterSaleId
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
