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
@TableName("secondhand")
public class Secondhand implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("user_id")
    private Integer userId;

    @TableField("title")
    private String title;

    @TableField("price")
    private Double price;

    @TableField("original_price")
    private Double originalPrice;

    @TableField("image")
    private String image;

    @TableField("seller")
    private String seller;

    @TableField("campus")
    private String campus;

    @TableField("time")
    private String time;

    @TableField("category")
    private String category;

    @TableField("description")
    private String description;

    @TableField("sold")
    private Byte sold;
}
