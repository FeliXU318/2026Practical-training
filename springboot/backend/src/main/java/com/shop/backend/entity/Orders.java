package com.shop.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
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
@TableName("orders")
public class Orders implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "order_id", type = IdType.AUTO)
    private Integer orderId;

    @TableField("user_id")
    private Integer userId;

    @TableField("merchant_id")
    private Integer merchantId;

    @TableField("order_type")
    private String orderType;

    @TableField("total_amount")
    private Double totalAmount;

    @TableField("pay_status")
    private String payStatus;

    @TableField("order_status")
    private String orderStatus;

    @TableField("delivery_type")
    private String deliveryType;

    @TableField("address")
    private String address;

    @TableField("title")
    private String title;

    @TableField("content")
    private String content;

    @TableField("reward")
    private Double reward;

    @TableField("status_class")
    private String statusClass;

    @TableField("time")
    private String time;

    @TableField("location")
    private String location;

    @TableField("color")
    private String color;

    @TableField("rewarded")
    private String rewarded;

    @TableField("after_sale_id")
    private String afterSaleId;
}
