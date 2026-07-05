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
@TableName("member")
public class Member implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("user_id")
    private Integer userId;

    @TableField("level")
    private String level;

    @TableField("level_name")
    private String levelName;

    @TableField("points")
    private Integer points;

    @TableField("growth")
    private Integer growth;

    @TableField("total_spend")
    private Double totalSpend;

    @TableField("checkin_date")
    private String checkinDate;

    @TableField("continuous_checkin")
    private Integer continuousCheckin;
}
