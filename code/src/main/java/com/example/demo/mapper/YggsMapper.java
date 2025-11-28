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
public interface YggsMapper extends BaseMapper<Yggs> {
    /**
//     * 按员工分组统计工时
//     * @return 员工工时统计列表
//     */
//    @Select("<script>" +
//            "SELECT * FROM gongyi_guicheng WHERE 1=1 " +
//            "<if test=\"ksrq != null and ksrq != ''\">" +
//            "  <if test=\"jsrq != null and jsrq != ''\">" +
//            "    AND (" +
//            "      CASE " +
//            "        WHEN ISDATE(n) = 1 AND ISDATE(#{ksrq}) = 1 AND ISDATE(#{jsrq}) = 1 " +
//            "        THEN " +
//            "          CASE WHEN CONVERT(DATETIME, n) BETWEEN CONVERT(DATETIME, #{ksrq}, 111) AND CONVERT(DATETIME, #{jsrq}, 111) " +
//            "          THEN 1 ELSE 0 END " +
//            "        ELSE 0 " +
//            "      END = 1" +
//            "    ) " +
//            "  </if>" +
//            "</if>" +
//            "AND CONVERT(NVARCHAR(MAX), m) LIKE '%' + #{m} + '%' " +
//
//            "</script>")
//    List<Yggs> queryList(String ksrq, String jsrq, String m);
//
//
//
//
//
//
//    /**
//     * 按员工分组统计工时汇总
//     */
//    @Select("<script>" +
//            "SELECT " +
//            "    M as m, " +
//            "    SUM(CONVERT(FLOAT, ISNULL(L, 0))) as l " +
//            "FROM gongyi_guicheng " +
//            "WHERE 1=1 " +
//            "<if test=\"ksrq1 != null and ksrq1 != ''\">" +
//            "  AND CONVERT(DATE, ISNULL(N, '')) &gt;= CONVERT(DATE, #{ksrq1}) " +
//            "</if>" +
//            "<if test=\"jsrq1 != null and jsrq1 != ''\">" +
//            "  AND CONVERT(DATE, ISNULL(N, '')) &lt;= CONVERT(DATE, #{jsrq1}) " +
//            "</if>" +
//            "AND ISNULL(M, '') != '' " +
//            "AND ISNULL(N, '') != '' " +
//            "GROUP BY M " +
//            "ORDER BY SUM(CONVERT(FLOAT, ISNULL(L, 0))) DESC" +
//            "</script>")
//    List<Yggs> queryList1(String ksrq1, String jsrq1);
//
//

    /**
     * 按员工分组统计工时
     * @return 员工工时统计列表
     */
    @Select("<script>" +
            "SELECT id, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V " +
            "FROM gongyi_guicheng " +
            "WHERE 1=1 " +
            "<if test=\"ksrq != null and ksrq != ''\">" +
            "  <if test=\"jsrq != null and jsrq != ''\">" +
            "    AND n BETWEEN #{ksrq} AND DATEADD(DAY, 1, #{jsrq}) " +
            "  </if>" +
            "</if>" +
            "<if test=\"m != null and m != ''\">" +
            "  AND m LIKE CONCAT('%', #{m}, '%') " +
            "</if>" +
            "</script>")
    List<Yggs> queryList(String ksrq, String jsrq, String m);

    /**
     * 按员工分组统计工时汇总 - 优化版
     */
    @Select("<script>" +
            "SELECT " +
            "    M as m, " +
            "    SUM(CAST(ISNULL(L, '0') AS FLOAT)) as l " +
            "FROM gongyi_guicheng " +
            "WHERE 1=1 " +
            "AND M IS NOT NULL AND M != '' " +
            "AND N IS NOT NULL AND N != '' " +
            "<if test=\"ksrq1 != null and ksrq1 != ''\">" +
            "  AND N &gt;= #{ksrq1} " +
            "</if>" +
            "<if test=\"jsrq1 != null and jsrq1 != ''\">" +
            "  AND N &lt; DATEADD(DAY, 1, #{jsrq1}) " +
            "</if>" +
            "GROUP BY M " +
            "ORDER BY l DESC" +
            "</script>")
    List<Yggs> queryList1(String ksrq1, String jsrq1);


}








