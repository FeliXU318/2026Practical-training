package com.shop.backend.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shop.backend.entity.AdminUser;
import com.shop.backend.mapper.AdminUserMapper;
import com.shop.backend.service.AdminUserService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminUserServiceImpl extends ServiceImpl<AdminUserMapper, AdminUser> implements AdminUserService {

    private static final String DEFAULT_RESET_CODE = "RESET2026";
    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final JdbcTemplate jdbcTemplate;

    public AdminUserServiceImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Map<String, Object> login(String username, String password) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return null;
        }
        AdminUser adminUser = lambdaQuery().eq(AdminUser::getUsername, username).one();
        if (adminUser == null || isDisabled(adminUser)) {
            return null;
        }
        if (!StringUtils.hasText(adminUser.getPasswordHash())
                || !passwordMatches(password, adminUser.getPasswordHash())) {
            return null;
        }

        Map<String, Object> adminInfo = new HashMap<>();
        adminInfo.put("id", adminUser.getId());
        adminInfo.put("username", adminUser.getUsername());
        adminInfo.put("roleName", adminUser.getRoleName());

        Map<String, Object> data = new HashMap<>();
        data.put("token", "admin-token-" + adminUser.getId());
        data.put("adminInfo", adminInfo);
        return data;
    }

    @Override
    public boolean changePassword(String authorization, String username, String oldPassword, String newPassword) {
        if (!StringUtils.hasText(oldPassword) || !isValidNewPassword(newPassword)) {
            return false;
        }
        AdminUser adminUser = findAdmin(authorization, username);
        if (adminUser == null || isDisabled(adminUser)) {
            return false;
        }
        if (!StringUtils.hasText(adminUser.getPasswordHash())
                || !passwordMatches(oldPassword, adminUser.getPasswordHash())) {
            return false;
        }
        adminUser.setPasswordHash(PASSWORD_ENCODER.encode(newPassword));
        return updateById(adminUser);
    }

    @Override
    public boolean resetPassword(String username, String resetCode, String newPassword) {
        if (!StringUtils.hasText(username) || !isValidNewPassword(newPassword)) {
            return false;
        }
        String configuredCode = System.getProperty("ADMIN_RESET_CODE", DEFAULT_RESET_CODE);
        if (!configuredCode.equals(resetCode)) {
            return false;
        }
        AdminUser adminUser = lambdaQuery().eq(AdminUser::getUsername, username).one();
        if (adminUser == null || isDisabled(adminUser)) {
            return false;
        }
        adminUser.setPasswordHash(PASSWORD_ENCODER.encode(newPassword));
        return updateById(adminUser);
    }

    @Override
    public Map<String, Object> profile(String authorization) {
        Long adminId = parseAdminId(authorization);
        if (adminId == null) {
            return null;
        }
        AdminUser adminUser = getById(adminId);
        if (adminUser == null || isDisabled(adminUser)) {
            return null;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("id", adminUser.getId());
        data.put("username", adminUser.getUsername());
        data.put("roleName", adminUser.getRoleName());
        return data;
    }

    @Override
    public Map<String, Object> dashboardSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("todayOrders", numberValue("select count(*) from orders"));
        data.put("todaySales", decimalValue("select coalesce(sum(total_amount), 0) from orders"));
        data.put("pendingProducts", numberValue("select count(*) from product where coalesce(tag, 'pending') = 'pending'"));
        data.put("pendingSecondhand", numberValue("select count(*) from secondhand where coalesce(sold, 0) = 0"));
        data.put("pendingComplaints", pendingAftersaleCount());
        return data;
    }

    @Override
    public Map<String, Object> orderTrend(String startDate, String endDate) {
        Map<String, Object> data = new HashMap<>();
        List<String> dates = new ArrayList<>();
        List<Long> orders = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String date = LocalDate.now().minusDays(i).toString();
            dates.add(date);
            orders.add(numberValue("select count(*) from orders where time like '" + date + "%'"));
        }
        data.put("dates", dates);
        data.put("orders", orders);
        data.put("businessSales", jdbcTemplate.queryForList("""
                select coalesce(nullif(order_type, ''), 'unknown') name,
                       coalesce(sum(total_amount), 0) value
                from orders
                group by coalesce(nullif(order_type, ''), 'unknown')
                """));
        data.put("statusDistribution", jdbcTemplate.queryForList("""
                select coalesce(nullif(order_status, ''), 'unknown') name,
                       count(*) value
                from orders
                group by coalesce(nullif(order_status, ''), 'unknown')
                """));
        return data;
    }

    @Override
    public Map<String, Object> userPortrait() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", numberValue("select count(*) from user_profile"));
        data.put("activeUsers", numberValue("select count(*) from user_profile where activity_level = 'active'"));
        data.put("totalAmount", decimalValue("select coalesce(sum(total_amount), 0) from user_profile"));
        data.put("avgOrderAmount", decimalValue("select coalesce(avg(avg_order_amount), 0) from user_profile"));
        data.put("levelDistribution", jdbcTemplate.queryForList("select coalesce(user_level, 'unknown') name, count(*) value from user_profile group by coalesce(user_level, 'unknown')"));
        data.put("consumeDistribution", jdbcTemplate.queryForList("select coalesce(consume_level, 'unknown') name, count(*) value from user_profile group by coalesce(consume_level, 'unknown')"));
        data.put("activityDistribution", jdbcTemplate.queryForList("select coalesce(activity_level, 'unknown') name, count(*) value from user_profile group by coalesce(activity_level, 'unknown')"));
        data.put("riskDistribution", jdbcTemplate.queryForList("select coalesce(risk_level, 'unknown') name, count(*) value from user_profile group by coalesce(risk_level, 'unknown')"));
        data.put("categoryPreference", jdbcTemplate.queryForList("select coalesce(favorite_category, 'unknown') name, count(*) value from user_profile group by coalesce(favorite_category, 'unknown')"));
        data.put("recommendationCategories", jdbcTemplate.queryForList("select coalesce(category, 'unknown') name, count(*) value from user_recommendation group by coalesce(category, 'unknown')"));
        data.put("topRecommendations", jdbcTemplate.queryForList("""
                select product_name productName, category, count(*) recommendCount, round(avg(score), 4) avgScore
                from user_recommendation
                group by product_id, product_name, category
                order by avgScore desc, recommendCount desc
                limit 6
                """));
        return data;
    }

    @Override
    public Object todos() {
        List<Map<String, Object>> todos = new ArrayList<>();
        todos.add(todo(1, "product", "Pending products", "high",
                numberValue("select count(*) from product where coalesce(tag, 'pending') = 'pending'")));
        todos.add(todo(2, "secondhand", "Available secondhand items", "medium",
                numberValue("select count(*) from secondhand where coalesce(sold, 0) = 0")));
        todos.add(todo(3, "complaint", "Pending aftersales", "high", pendingAftersaleCount()));
        return todos;
    }

    private AdminUser findAdmin(String authorization, String username) {
        Long adminId = parseAdminId(authorization);
        if (adminId != null) {
            return getById(adminId);
        }
        if (StringUtils.hasText(username)) {
            return lambdaQuery().eq(AdminUser::getUsername, username).one();
        }
        return null;
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (!StringUtils.hasText(rawPassword) || !StringUtils.hasText(storedPassword)) {
            return false;
        }
        if (storedPassword.startsWith("$2a$")
                || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$")) {
            return PASSWORD_ENCODER.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private boolean isDisabled(AdminUser adminUser) {
        return adminUser.getStatus() != null && adminUser.getStatus() == 0;
    }

    private boolean isValidNewPassword(String newPassword) {
        return StringUtils.hasText(newPassword) && newPassword.length() >= 6;
    }

    private long pendingAftersaleCount() {
        return numberValue("select count(*) from aftersale where coalesce(status, 'pending') in ('pending', 'processing', '')");
    }

    private Map<String, Object> todo(int id, String type, String title, String level, long count) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("type", type);
        item.put("title", title);
        item.put("level", level);
        item.put("count", count);
        return item;
    }

    private long numberValue(String sql) {
        Number value = jdbcTemplate.queryForObject(sql, Number.class);
        return value == null ? 0L : value.longValue();
    }

    private BigDecimal decimalValue(String sql) {
        BigDecimal value = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return value == null ? BigDecimal.ZERO : value;
    }

    private Long parseAdminId(String authorization) {
        if (!StringUtils.hasText(authorization)) {
            return null;
        }
        String marker = "admin-token-";
        int index = authorization.indexOf(marker);
        if (index < 0) {
            return null;
        }
        try {
            return Long.valueOf(authorization.substring(index + marker.length()));
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}
