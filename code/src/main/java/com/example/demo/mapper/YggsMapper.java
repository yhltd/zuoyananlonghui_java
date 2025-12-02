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
     * 按员工分组统计工时
     * @return 员工工时统计列表
     */
//    @Select("<script>" +
//            "SELECT id, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V " +
//            "FROM gongyi_guicheng " +
//            "WHERE 1=1 " +
//            "<if test=\"ksrq != null and ksrq != ''\">" +
//            "  <if test=\"jsrq != null and jsrq != ''\">" +
//            "    AND n BETWEEN #{ksrq} AND DATEADD(DAY, 1, #{jsrq}) " +
//            "  </if>" +
//            "</if>" +
//            "<if test=\"m != null and m != ''\">" +
//            "  AND m LIKE CONCAT('%', #{m}, '%') " +
//            "</if>" +
//            "</script>")
//    List<Yggs> queryList(String ksrq, String jsrq, String m);
    @Select("<script>" +
            "SELECT id, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V " +
            "FROM gongyi_guicheng WITH(NOLOCK) " +
            "WHERE 1=1 " +
            "<if test=\"ksrq != null and ksrq != ''\">" +
            "  <if test=\"jsrq != null and jsrq != ''\">" +
            "    AND CONVERT(DATE, N) BETWEEN #{ksrq} AND #{jsrq} " +
            "  </if>" +
                    "  <if test=\"jsrq == null or jsrq == ''\">" +
                    "    AND CONVERT(DATE, N) >= #{ksrq} " +
                    "  </if>" +
                    "</if>" +
                    "<if test=\"jsrq != null and jsrq != ''\">" +
                    "  <if test=\"ksrq == null or ksrq == ''\">" +
                    "    AND CONVERT(DATE, N) &lt;= #{jsrq} " +
                    "  </if>" +
                    "</if>" +
                    "<if test=\"m != null and m != ''\">" +
                    "  AND (M LIKE #{m} + '%' OR M = #{m}) " +
            "</if>" +
                    "ORDER BY N DESC " +
            "OPTION(RECOMPILE) " +
            "</script>")
    List<Yggs> queryList(String ksrq, String jsrq, String m);

    /**
     * 按员工分组统计工时汇总 - 优化版
     */
//    @Select("<script>" +
//            "SELECT " +
//            "    M as m, " +
//            "    SUM(CAST(ISNULL(L, '0') AS FLOAT)) as l " +
//            "FROM gongyi_guicheng " +
//            "WHERE 1=1 " +
//            "AND M IS NOT NULL AND M != '' " +
//            "AND N IS NOT NULL AND N != '' " +
//            "<if test=\"ksrq1 != null and ksrq1 != ''\">" +
//            "  AND N &gt;= #{ksrq1} " +
//            "</if>" +
//            "<if test=\"jsrq1 != null and jsrq1 != ''\">" +
//            "  AND N &lt; DATEADD(DAY, 1, #{jsrq1}) " +
//            "</if>" +
//            "GROUP BY M " +
//            "ORDER BY l DESC" +
//            "</script>")
//    List<Yggs> queryList1(String ksrq1, String jsrq1);
    @Select("<script>" +
            "WITH ValidData AS (" +
            "    SELECT M, L, N " +
            "    FROM gongyi_guicheng WITH(NOLOCK) " +
            "    WHERE M IS NOT NULL AND M != '' " +
            "      AND L IS NOT NULL AND L != '' " +
            "      AND ISNUMERIC(L) = 1 " +
            "      <if test=\"ksrq1 != null and ksrq1 != ''\">" +
                    "        AND CONVERT(DATE, N) >= #{ksrq1} " +
            "      </if>" +
                    "      <if test=\"jsrq1 != null and jsrq1 != ''\">" +
                    "        AND CONVERT(DATE, N) &lt;= #{jsrq1} " +
                    "      </if>" +
                    ") " +
                    "SELECT " +
                    "    M as m, " +
                    "    SUM(CAST(L AS DECIMAL(18,2))) as l " +
            "FROM ValidData " +
                    "GROUP BY M " +
                    "HAVING SUM(CAST(L AS DECIMAL(18,2))) > 0 " +
            "ORDER BY l DESC " +
                    "OPTION(RECOMPILE, MAXDOP 1) " +
            "</script>")
    List<Yggs> queryList1(String ksrq1, String jsrq1);


}








