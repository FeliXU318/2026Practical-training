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
@TableName("aftersale")
public class Aftersale implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("after_sale_id")
    private String afterSaleId;

    @TableField("order_id")
    private Integer orderId;

    @TableField("order_title")
    private String orderTitle;

    @TableField("order_content")
    private String orderContent;

    @TableField("order_reward")
    private String orderReward;

    @TableField("type")
    private String type;

    @TableField("type_text")
    private String typeText;

    @TableField("reason")
    private String reason;

    @TableField("reason_text")
    private String reasonText;

    @TableField("reason_desc")
    private String reasonDesc;

    @TableField("amount")
    private Double amount;

    @TableField("actual_refund")
    private Double actualRefund;

    @TableField("description")
    private String description;

    @TableField("images")
    private String images;

    @TableField("status")
    private String status;

    @TableField("status_text")
    private String statusText;

    @TableField("create_time")
    private Long createTime;

    @TableField("update_time")
    private Long updateTime;

    @TableField("timeline")
    private String timeline;

    @TableField("company")
    private String company;

    @TableField("tracking_no")
    private String trackingNo;
}
