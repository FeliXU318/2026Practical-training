package com.shop.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
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
@TableName("operation_log")
public class OperationLog implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 日志主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 操作管理员ID
     */
    @TableField("admin_id")
    private Long adminId;

    /**
     * 操作模块 商品/订单/用户/投诉
     */
    @TableField("module")
    private String module;

    /**
     * 操作动作 add/update/delete/audit
     */
    @TableField("action")
    private String action;

    /**
     * 操作目标资源ID/编号
     */
    @TableField("target_id")
    private String targetId;

    /**
     * 操作详情记录
     */
    @TableField("detail")
    private String detail;

    /**
     * 操作时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;
}
