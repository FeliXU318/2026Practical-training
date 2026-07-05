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
@RequestMapping("/api/admin/products")
public class ProductController {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    public ProductController(JdbcTemplate jdbcTemplate, NamedParameterJdbcTemplate namedJdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = namedJdbcTemplate;
    }

    @GetMapping("/audit")
    public ApiResponse<PageResult<Map<String, Object>>> audit(@RequestParam(required = false) String name,
                                                              @RequestParam(required = false) String type,
                                                              @RequestParam(required = false) String status,
                                                              @RequestParam(defaultValue = "1") long page,
                                                              @RequestParam(defaultValue = "10") long pageSize) {
        QueryParts query = new QueryParts("from product");
        query.like("product_name", name);
        query.eq("product_type", type);
        query.eq("tag", status);
        return ApiResponse.ok(page(productSelect() + query.sql, "select count(*) " + query.sql, query.params, page, pageSize));
    }

    @GetMapping("/{id}")
    public ApiResponse<Map<String, Object>> detail(@PathVariable Integer id) {
        var rows = jdbcTemplate.queryForList(productSelect() + " from product where product_id = ?", id);
        return rows.isEmpty() ? ApiResponse.fail("product does not exist") : ApiResponse.ok(rows.get(0));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<Void> approve(@PathVariable Integer id) {
        return jdbcTemplate.update("update product set tag = 'approved' where product_id = ?", id) > 0
                ? ApiResponse.ok("approved", null) : ApiResponse.fail("product does not exist");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<Void> reject(@PathVariable Integer id) {
        return jdbcTemplate.update("update product set tag = 'rejected' where product_id = ?", id) > 0
                ? ApiResponse.ok("rejected", null) : ApiResponse.fail("product does not exist");
    }

    private String productSelect() {
        return """
                select product_id productId, product_name name, product_name productName,
                       category, product_type type, product_type productType, merchant_id merchantId,
                       price, original_price originalPrice, sales, stock, image, unit,
                       coalesce(tag, 'pending') auditStatus, tag
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
