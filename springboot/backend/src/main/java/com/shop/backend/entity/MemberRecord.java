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
@TableName("member_record")
public class MemberRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("record_id")
    private String recordId;

    @TableField("user_id")
    private String userId;

    @TableField("type")
    private String type;

    @TableField("change")
    private Integer change;

    @TableField("balance")
    private Integer balance;

    @TableField("reason")
    private String reason;

    @TableField("order_id")
    private Integer orderId;

    @TableField("time")
    private String time;
}
