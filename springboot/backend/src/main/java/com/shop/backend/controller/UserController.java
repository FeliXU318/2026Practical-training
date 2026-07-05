package com.shop.backend.controller;

import com.shop.backend.common.ApiResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/agent")
public class UserController {

    @PostMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboardAgent() {
        return ApiResponse.ok(localAgent("low", "Local dashboard analysis completed. Handle pending products and aftersales first."));
    }

    @PostMapping("/complaint")
    public ApiResponse<Map<String, Object>> complaintAgent() {
        Map<String, Object> data = localAgent("medium", "Check order details, refund amount, and user description before submitting the result.");
        data.put("reply", "Your aftersale request has been received. We will verify the order and refund information as soon as possible.");
        return ApiResponse.ok(data);
    }

    @PostMapping("/audit")
    public ApiResponse<Map<String, Object>> auditAgent() {
        return ApiResponse.ok(localAgent("low", "Check name, price, image, and description completeness before approving."));
    }

    private Map<String, Object> localAgent(String riskLevel, String summary) {
        Map<String, Object> data = new HashMap<>();
        data.put("source", "local");
        data.put("modelUsed", "local-rules");
        data.put("riskLevel", riskLevel);
        data.put("summary", summary);
        data.put("risks", List.of("Missing fields require manual review", "Confirm related order before changing status"));
        data.put("suggestions", List.of("Prioritize high risk or long pending records", "Keep handling notes for later tracing"));
        data.put("actions", List.of("Review base info", "Update status", "Record handling result"));
        return data;
    }
}
