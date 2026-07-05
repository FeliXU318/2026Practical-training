package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import com.shop.backend.service.AdminUserService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        Map<String, Object> data = adminUserService.login(body.get("username"), body.get("password"));
        return data == null
                ? ApiResponse.fail("username or password is incorrect")
                : ApiResponse.ok("login success", data);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok("logout success", null);
    }

    @GetMapping("/profile")
    public ApiResponse<Map<String, Object>> profile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        Map<String, Object> data = adminUserService.profile(authorization);
        return data == null ? ApiResponse.fail("admin token is invalid") : ApiResponse.ok(data);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestHeader(value = "Authorization", required = false) String authorization,
                                            @RequestBody Map<String, String> body) {
        boolean changed = adminUserService.changePassword(
                authorization,
                body.get("username"),
                body.get("oldPassword"),
                body.get("newPassword")
        );
        return changed
                ? ApiResponse.ok("password changed", null)
                : ApiResponse.fail("admin user does not exist, old password is incorrect, or new password is invalid");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody Map<String, String> body) {
        boolean reset = adminUserService.resetPassword(
                body.get("username"),
                body.get("resetCode"),
                body.get("newPassword")
        );
        return reset
                ? ApiResponse.ok("password reset", null)
                : ApiResponse.fail("reset code is incorrect, admin user does not exist, or new password is invalid");
    }

    @GetMapping("/dashboard/summary")
    public ApiResponse<Map<String, Object>> dashboardSummary() {
        return ApiResponse.ok(adminUserService.dashboardSummary());
    }

    @GetMapping("/dashboard/order-trend")
    public ApiResponse<Map<String, Object>> orderTrend() {
        return ApiResponse.ok(adminUserService.orderTrend(null, null));
    }

    @GetMapping("/dashboard/user-portrait")
    public ApiResponse<Map<String, Object>> userPortrait() {
        return ApiResponse.ok(adminUserService.userPortrait());
    }

    @GetMapping("/dashboard/todos")
    public ApiResponse<Object> todos() {
        return ApiResponse.ok(adminUserService.todos());
    }
}
