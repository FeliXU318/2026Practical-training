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
@TableName("run")
public class Run implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("user_id")
    private Integer userId;

    @TableField("runner_id")
    private Integer runnerId;

    @TableField("type")
    private String type;

    @TableField("reward")
    private String reward;

    @TableField("content")
    private String content;

    @TableField("user")
    private String user;

    @TableField("avatar")
    private String avatar;

    @TableField("location")
    private String location;

    @TableField("time")
    private String time;

    @TableField("status")
    private String status;

    @TableField("status_class")
    private String statusClass;

    @TableField("color")
    private String color;

    @TableField("delivery_photo")
    private String deliveryPhoto;

    @TableField("delivery_desc")
    private String deliveryDesc;
}
