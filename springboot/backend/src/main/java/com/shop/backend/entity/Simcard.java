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
@TableName("simcard")
public class Simcard implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("name")
    private String name;

    @TableField("price")
    private Integer price;

    @TableField("data")
    private String data;

    @TableField("calls")
    private String calls;

    @TableField("features")
    private String features;

    @TableField("recommended")
    private Byte recommended;
}
