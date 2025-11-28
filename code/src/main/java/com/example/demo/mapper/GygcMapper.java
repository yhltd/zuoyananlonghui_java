package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Gygc;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
@Mapper
@Repository
public interface GygcMapper extends BaseMapper<Gygc> {
    @Select("select * from gongyi_guicheng where c=#{htid}")
    List<Gygc> queryList(String htid);

    /**
     * 批量更新工艺规程数据
     */
    @Update("<script>" +
            "<foreach collection='list' item='item' separator=';'>" +
            "UPDATE gongyi_guicheng SET " +
            "c = #{item.c}, d = #{item.d}, e = #{item.e}, f = #{item.f}, g = #{item.g}, " +
            "h = #{item.h}, i = #{item.i}, j = #{item.j}, k = #{item.k}, l = #{item.l}, " +
            "m = #{item.m}, n = #{item.n}, o = #{item.o}, p = #{item.p}, q = #{item.q}, " +
            "r = #{item.r}, s = #{item.s}, t = #{item.t}, u = #{item.u}, v = #{item.v} " +
            "WHERE id = #{item.id}" +
            "</foreach>" +
            "</script>")
    boolean updateBatch(@Param("list") List<Gygc> gygcList);


    @Delete("delete from gongyi_guicheng where id=#{id}")
    boolean delete(int id);


    @Select("SELECT hetong_jilu.* " +
            "FROM hetong_jilu " +
            "LEFT JOIN ( " +
            "    SELECT " +
            "        C AS left_id, " +
            "        CASE " +
            "            WHEN renwu > renyuan THEN '未完成' " +
            "            ELSE '已完成' " +
            "        END AS zhuangtai " +
            "    FROM ( " +
            "        SELECT " +
            "            C, " +
            "            SUM(CASE WHEN ISNULL(K, '') != '' THEN 1 ELSE 0 END) AS renwu, " +
            "            SUM(CASE WHEN ISNULL(M, '') != '' THEN 1 ELSE 0 END) AS renyuan " +
            "        FROM gongyi_guicheng " +
            "        GROUP BY C " +
            "    ) AS guicheng " +
            ") AS guicheng ON hetong_jilu.id = guicheng.left_id " +
            "WHERE ISNULL(zhuangtai, '未创建') != '未创建'")
    List<Gygc> getList();

}
