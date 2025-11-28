package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.*;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:32
 */
@Mapper
@Repository
public interface Ckd_cMapper extends BaseMapper<Ckd_c> {
    // 使用MyBatis Plus的默认方法，不需要额外SQL
}