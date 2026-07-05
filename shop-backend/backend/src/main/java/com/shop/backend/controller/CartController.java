package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
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
@RequestMapping("/api/cart")
public class CartController {

    private final JdbcTemplate jdbcTemplate;

    public CartController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> list(@RequestParam(required = false) Integer userId,
                                                       @RequestParam(required = false) String cartKey) {
        if (userId != null) {
            return ApiResponse.ok(jdbcTemplate.queryForList(cartSelect() + " from cart where user_id = ? order by id desc", userId));
        }
        if (cartKey != null && !cartKey.isBlank()) {
            return ApiResponse.ok(jdbcTemplate.queryForList(cartSelect() + " from cart where cart_key = ? order by id desc", cartKey));
        }
        return ApiResponse.ok(jdbcTemplate.queryForList(cartSelect() + " from cart order by id desc"));
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody Map<String, Object> body) {
        jdbcTemplate.update("""
                insert into cart(user_id, cart_key, product_id, name, price, image, quantity)
                values(?, ?, ?, ?, ?, ?, ?)
                """, body.get("userId"), body.get("cartKey"), body.get("productId"), body.get("name"),
                body.get("price"), body.get("image"), body.get("quantity"));
        return ApiResponse.ok("created", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        int updated = jdbcTemplate.update("""
                update cart set user_id = ?, cart_key = ?, product_id = ?, name = ?,
                       price = ?, image = ?, quantity = ?
                where id = ?
                """, body.get("userId"), body.get("cartKey"), body.get("productId"), body.get("name"),
                body.get("price"), body.get("image"), body.get("quantity"), id);
        return updated > 0 ? ApiResponse.ok("updated", null) : ApiResponse.fail("cart item does not exist");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        return jdbcTemplate.update("delete from cart where id = ?", id) > 0
                ? ApiResponse.ok("deleted", null) : ApiResponse.fail("cart item does not exist");
    }

    private String cartSelect() {
        return """
                select id, user_id userId, cart_key cartKey, product_id productId,
                       name, price, image, quantity
                """;
    }
}
