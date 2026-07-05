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
@TableName("product")
public class Product implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "product_id", type = IdType.AUTO)
    private Integer productId;

    @TableField("merchant_id")
    private Integer merchantId;

    @TableField("product_name")
    private String productName;

    @TableField("category")
    private String category;

    @TableField("price")
    private Double price;

    @TableField("original_price")
    private Double originalPrice;

    @TableField("sales")
    private Integer sales;

    @TableField("stock")
    private Integer stock;

    @TableField("image")
    private String image;

    @TableField("unit")
    private String unit;

    @TableField("tag")
    private String tag;

    @TableField("category_id")
    private Integer categoryId;

    @TableField("product_type")
    private String productType;
}
