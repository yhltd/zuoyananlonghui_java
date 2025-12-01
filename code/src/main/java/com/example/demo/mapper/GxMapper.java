package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Gx;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface GxMapper extends BaseMapper<Gx> {

    @Select("SELECT * FROM gongxu ORDER BY id")
    List<Gx> getAllGongxu();

    @Update("UPDATE gongxu SET name = #{name}, num = #{num} WHERE id = #{id}")
    boolean updateGongxu(Gx gx);
}
