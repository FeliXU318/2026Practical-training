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
@TableName("merchant")
public class Merchant implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "merchant_id", type = IdType.AUTO)
    private Integer merchantId;

    @TableField("merchant_name")
    private String merchantName;

    @TableField("merchant_role")
    private String merchantRole;

    @TableField("contact_phone")
    private String contactPhone;

    @TableField("status")
    private String status;

    @TableField("business_type")
    private String businessType;

    @TableField("business_label")
    private String businessLabel;

    @TableField("merchant_category")
    private String merchantCategory;

    @TableField("merchant_category_label")
    private String merchantCategoryLabel;

    @TableField("dorm_building")
    private String dormBuilding;

    @TableField("manager")
    private String manager;

    @TableField("phone")
    private String phone;

    @TableField("account")
    private String account;

    @TableField("password")
    private String password;
}
