package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
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

//    @Select("select * from tuihuo")
//    List<Thjl> getList();


    @Select("<script>" +
            "SELECT * FROM (" +
            "   SELECT ROW_NUMBER() OVER (ORDER BY id DESC) as row_num, " +
            "          t.* " +
            "   FROM tuihuo t " +
            "   <where>" +
            "     1=1 " +
            "     <if test='ew != null and ew.sqlSegment != null and ew.sqlSegment != \"\"'>" +
            "       <choose>" +
            "         <when test='ew.sqlSegment.contains(\"WHERE\")'>" +
            "           AND ${ew.sqlSegment.replace(\"WHERE\", \"\").trim()}" +
            "         </when>" +
            "         <otherwise>" +
            "           AND ${ew.sqlSegment}" +
            "         </otherwise>" +
            "       </choose>" +
            "     </if>" +
            "   </where>" +
            ") as temp " +
            "WHERE row_num BETWEEN #{start} AND #{end}" +
            "</script>")
    List<Thjl> selectForPage(@Param("start") long start,
                             @Param("end") long end,
                             @Param("ew") Wrapper<Thjl> wrapper);

    @Select("<script>" +
            "SELECT COUNT(*) " +
            "FROM tuihuo " +
            "<where>" +
            "  1=1 " +
            "  <if test='ew != null and ew.sqlSegment != null and ew.sqlSegment != \"\"'>" +
            "    <choose>" +
            "      <when test='ew.sqlSegment.contains(\"WHERE\")'>" +
            "        AND ${ew.sqlSegment.replace(\"WHERE\", \"\").trim()}" +
            "      </when>" +
            "      <otherwise>" +
            "        AND ${ew.sqlSegment}" +
            "      </otherwise>" +
            "    </choose>" +
            "  </if>" +
            "</where>" +
            "</script>")
    Long selectCountForPage(@Param("ew") Wrapper<Thjl> wrapper);





    @Select("<script>" +
            "SELECT * FROM tuihuo WHERE 1=1 " +
            "<if test=\"ksrq != null and ksrq != ''\">" +
            "  <if test=\"jsrq != null and jsrq != ''\">" +
            "    AND (" +
            "      CASE " +
            "        WHEN ISDATE(w) = 1 AND ISDATE(#{ksrq}) = 1 AND ISDATE(#{jsrq}) = 1 " +  // 修正：e改为w，查询回厂日期
            "        THEN " +
            "          CASE WHEN CONVERT(DATETIME, w) BETWEEN CONVERT(DATETIME, #{ksrq}, 111) AND CONVERT(DATETIME, #{jsrq}, 111) " +
            "          THEN 1 ELSE 0 END " +
            "        ELSE 0 " +
            "      END = 1" +
            "    ) " +
            "  </if>" +
            "</if>" +
            "<if test=\"h != null and h != ''\">" +
            "  AND CONVERT(NVARCHAR(MAX), g) LIKE '%' + #{h} + '%' " +  // h参数对应数据库g字段（合同号）
            "</if>" +
            "<if test=\"i != null and i != ''\">" +
            "  AND CONVERT(NVARCHAR(MAX), h) LIKE '%' + #{i} + '%' " +  // i参数对应数据库h字段（任务号）
            "</if>" +
            "<if test=\"k != null and k != ''\">" +
            "  AND CONVERT(NVARCHAR(MAX), j) LIKE '%' + #{k} + '%' " +  // k参数对应数据库j字段（图号）
            "</if>" +
            "<if test=\"r != null and r != ''\">" +
            "  AND CONVERT(NVARCHAR(MAX), q) LIKE '%' + #{r} + '%'" +   // r参数对应数据库q字段（退货原因）
            "</if>" +
            "</script>")
    List<Thjl> queryList(String ksrq, String jsrq, String h, String i, String k, String r);


    @Update("UPDATE tuihuo SET c = #{c},w = #{w}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, s = #{s}, t = #{t}, u = #{u}, v = #{v} WHERE id = #{id}")
    boolean update(Thjl thjl);

    @Insert("INSERT INTO tuihuo (w,c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v) " +
            "VALUES (#{w},#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, #{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v})")
    boolean add(Thjl thjl);


    @Delete("delete from tuihuo where id=#{id}")
    boolean delete(int id);


    @Select("SELECT F FROM tuihuo GROUP BY F")
    List<Thjl> gettdh();

    // Mapper接口
    @Select("SELECT * FROM tuihuo WHERE F = #{returnNo}")
    List<Thjl> getth(@Param("returnNo") String returnNo);

}
