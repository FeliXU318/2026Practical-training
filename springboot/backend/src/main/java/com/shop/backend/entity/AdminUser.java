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
 * 后台管理员表
 * </p>
 *
 * @author MisterDong
 * @since 2026-06-30
 */
@Getter
@Setter
@TableName("admin_user")
public class AdminUser implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 管理员主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 登录账号
     */
    @TableField("username")
    private String username;

    /**
     * BCrypt加密密码哈希，不存明文
     */
    @TableField("password_hash")
    private String passwordHash;

    /**
     * 角色名称：admin/operator
     */
    @TableField("role_name")
    private String roleName;

    /**
     * 状态 0-禁用 1-正常
     */
    @TableField("status")
    private Byte status;

    /**
     * 创建时间
     */
    @TableField("created_at")
    private LocalDateTime createdAt;
}
