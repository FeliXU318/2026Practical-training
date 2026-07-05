package com.shop.backend.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

/**
 * <p>
 * 
 * </p>
 *
 * @author MisterDong
 * @since 2026-07-04
 */
@Getter
@Setter
@TableName("user_profile")
public class UserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 用户ID
     */
    @TableId("user_id")
    private Long userId;

    /**
     * 用户昵称
     */
    @TableField("nickname")
    private String nickname;

    /**
     * 订单总数
     */
    @TableField("order_count")
    private Integer orderCount;

    /**
     * 已支付订单数
     */
    @TableField("paid_order_count")
    private Integer paidOrderCount;

    /**
     * 退款订单数
     */
    @TableField("refund_order_count")
    private Integer refundOrderCount;

    /**
     * 累计消费金额
     */
    @TableField("total_amount")
    private BigDecimal totalAmount;

    /**
     * 平均订单金额
     */
    @TableField("avg_order_amount")
    private BigDecimal avgOrderAmount;

    /**
     * 最近下单时间
     */
    @TableField("last_order_time")
    private LocalDateTime lastOrderTime;

    /**
     * 偏好商品类别
     */
    @TableField("favorite_category")
    private String favoriteCategory;

    /**
     * 投诉次数
     */
    @TableField("complaint_count")
    private Integer complaintCount;

    /**
     * 用户等级
     */
    @TableField("user_level")
    private String userLevel;

    /**
     * 消费等级
     */
    @TableField("consume_level")
    private String consumeLevel;

    /**
     * 活跃等级
     */
    @TableField("activity_level")
    private String activityLevel;

    /**
     * 风险等级
     */
    @TableField("risk_level")
    private String riskLevel;

    /**
     * 聚类编号
     */
    @TableField("cluster_id")
    private Integer clusterId;

    /**
     * 更新时间
     */
    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
