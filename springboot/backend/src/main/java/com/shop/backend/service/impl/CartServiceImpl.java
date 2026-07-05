package com.shop.backend.service.impl;

import com.shop.backend.entity.Cart;
import com.shop.backend.mapper.CartMapper;
import com.shop.backend.service.CartService;
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
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements CartService {

}
