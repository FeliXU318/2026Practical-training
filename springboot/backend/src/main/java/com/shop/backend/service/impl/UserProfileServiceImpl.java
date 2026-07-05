package com.shop.backend.service.impl;

import com.shop.backend.entity.UserProfile;
import com.shop.backend.mapper.UserProfileMapper;
import com.shop.backend.service.UserProfileService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author MisterDong
 * @since 2026-07-04
 */
@Service
public class UserProfileServiceImpl extends ServiceImpl<UserProfileMapper, UserProfile> implements UserProfileService {

}
