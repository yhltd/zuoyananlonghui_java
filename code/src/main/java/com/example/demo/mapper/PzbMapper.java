package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Htjl;
import com.example.demo.entity.Pzb;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface PzbMapper extends BaseMapper<Pzb> {

    @Select("select * from peizhi")
    List<Pzb> getList();
    // Mapper



    @Update("<script>" +
            "update peizhi set " +
            "<if test='field == \"c\"'>c = #{value}</if>" +
            "<if test='field == \"d\"'>d = #{value}</if>" +
            "<if test='field == \"e\"'>e = #{value}</if>" +
            " where id = #{id}" +
            "</script>")
    boolean update(Pzb pzb);
    @Insert("INSERT INTO peizhi (c, d, e) " +
            "VALUES (#{c}, #{d}, #{e})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    boolean add(Pzb pzb);

    @Delete("delete from pzb where id=#{id}")
    boolean delete(int id);
}