package com.shop.backend.service;

import com.shop.backend.entity.AdminUser;
import com.baomidou.mybatisplus.extension.service.IService;
import java.util.Map;

/**
 * <p>
 * 后台管理员表 服务类
 * </p>
 *
 * @author MisterDong
 * @since 2026-06-30
 */
public interface AdminUserService extends IService<AdminUser> {

    Map<String, Object> login(String username, String password);

    boolean changePassword(String authorization, String username, String oldPassword, String newPassword);

    boolean resetPassword(String username, String resetCode, String newPassword);

    Map<String, Object> profile(String authorization);

    Map<String, Object> dashboardSummary();

    Map<String, Object> orderTrend(String startDate, String endDate);

    Map<String, Object> userPortrait();

    Object todos();
}
