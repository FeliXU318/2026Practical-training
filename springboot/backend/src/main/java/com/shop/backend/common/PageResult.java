package com.shop.backend.common;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PageResult<T> {

    private List<T> list;
    private long total;
}
