package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Thjl;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:32
 */
@Mapper
@Repository
public interface ThjlMapper extends BaseMapper<Thjl> {

    @Select("select * from tuihuo")
    List<Thjl> getList();


    @Select("<script>" +
            "SELECT * FROM tuihuo WHERE 1=1 " +
            "<if test=\"ksrq != null and ksrq != ''\">" +
            "  <if test=\"jsrq != null and jsrq != ''\">" +
            "    AND (" +
            "      CASE " +
            "        WHEN ISDATE(e) = 1 AND ISDATE(#{ksrq}) = 1 AND ISDATE(#{jsrq}) = 1 " +
            "        THEN " +
            "          CASE WHEN CONVERT(DATETIME, e) BETWEEN CONVERT(DATETIME, #{ksrq}, 111) AND CONVERT(DATETIME, #{jsrq}, 111) " +
            "          THEN 1 ELSE 0 END " +
            "        ELSE 0 " +
            "      END = 1" +
            "    ) " +
            "  </if>" +
            "</if>" +
            "AND CONVERT(NVARCHAR(MAX), h) LIKE '%' + #{h} + '%' " +
            "AND CONVERT(NVARCHAR(MAX), i) LIKE '%' + #{i} + '%' " +
            "AND CONVERT(NVARCHAR(MAX), k) LIKE '%' + #{k} + '%' " +
            "AND CONVERT(NVARCHAR(MAX), r) LIKE '%' + #{r} + '%'" +
            "</script>")
    List<Thjl> queryList(String ksrq, String jsrq, String h, String i, String k, String r);


    @Update("UPDATE tuihuo SET c = #{c}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, s = #{s}, t = #{t}, u = #{u}, v = #{v} WHERE id = #{id}")
    boolean update(Thjl thjl);

    @Insert("INSERT INTO tuihuo (c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v) " +
            "VALUES (#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, #{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v})")
    boolean add(Thjl thjl);


    @Delete("delete from tuihuo where id=#{id}")
    boolean delete(int id);


}
