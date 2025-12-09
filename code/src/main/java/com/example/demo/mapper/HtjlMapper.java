package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.*;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:32
 */
@Mapper
@Repository
public interface HtjlMapper extends BaseMapper<Htjl> {

//    @Select({
//            "<script>",
//            "WITH guicheng_stats AS (",
//            "    SELECT ",
//            "        C as left_id, ",
//            "        COUNT(CASE WHEN ISNULL(K, '') != '' THEN 1 END) as renwu_count, ",
//            "        COUNT(CASE WHEN ISNULL(M, '') != '' THEN 1 END) as renyuan_count ",
//            "    FROM gongyi_guicheng ",
//            "    WHERE C IS NOT NULL ",
//            "    GROUP BY C ",
//            "), ",
//            "filtered_hetong AS (",
//            "    SELECT * FROM hetong_jilu hj ",
//            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = '' ",
//            "      AND NOT EXISTS (",
//            "          SELECT 1 FROM tuihuo tb WITH(NOLOCK) ",
//            "          WHERE tb.v = hj.id ",
//            "      )",
//            ") ",
//            "SELECT ",
//            "    hj.id, ",
//            "    ISNULL(hj.C, '') as c, ",
//            "    ISNULL(hj.D, '') as d, ",
//            "    ISNULL(hj.E, '') as e, ",
//            "    ISNULL(CASE ",
//            "        WHEN gs.renwu_count > gs.renyuan_count THEN '未完成' ",
//            "        WHEN gs.renwu_count IS NULL THEN '未创建' ",
//            "        ELSE '已完成' ",
//            "    END, '未创建') as zhuangtai, ",
//            "    ISNULL(hj.G, '') as g, ",
//            "    ISNULL(hj.H, '') as h, ",
//            "    ISNULL(hj.I, '') as i, ",
//            "    ISNULL(hj.J, '') as j, ",
//            "    ISNULL(hj.K, '') as k, ",
//            "    ISNULL(hj.L, '') as l, ",
//            "    ISNULL(hj.AU, '') as au, ",
//            "    ISNULL(hj.AV, '') as av, ",
//            "    ISNULL(hj.AW, '') as aw, ",
//            "    ISNULL(hj.AX, '') as ax, ",
//            "    ISNULL(hj.M, '') as m, ",
//            "    ISNULL(hj.N, '') as n, ",
//            "    ISNULL(hj.O, '') as o, ",
//            "    ISNULL(hj.P, '') as p, ",
//            "    ISNULL(hj.Q, '') as q, ",
//            "    ISNULL(hj.R, '') as r, ",
//            "    ISNULL(hj.S, '') as s, ",
//            "    ISNULL(hj.T, '') as t, ",
//            "    ISNULL(hj.U, '') as u, ",
//            "    ISNULL(hj.V, '') as v, ",
//            "    ISNULL(hj.W, '') as w, ",
//            "    ISNULL(hj.X, '') as x, ",
//            "    ISNULL(hj.Y, '') as y, ",
//            "    ISNULL(hj.Z, '') as z, ",
//            "    ISNULL(hj.[AA], '') as aa, ",
//            "    ISNULL(hj.[AB], '') as ab, ",
//            "    ISNULL(hj.[AC], '') as ac, ",
//            "    ISNULL(hj.[AD], '') as ad, ",
//            "    ISNULL(hj.[AE], '') as ae, ",
//            "    ISNULL(hj.[AF], '') as af, ",
//            "    ISNULL(hj.[AG], '') as ag, ",
//            "    ISNULL(hj.[AH], '') as ah, ",
//            "    ISNULL(hj.[AI], '') as ai, ",
//            "    ISNULL(hj.[AJ], '') as aj, ",
//            "    ISNULL(hj.[AK], '') as ak, ",
//            "    ISNULL(hj.[AL], '') as al, ",
//            "    ISNULL(hj.[AM], '') as am, ",
//            "    ISNULL(hj.[AN], '') as an, ",
//            "    ISNULL(hj.[AO], '') as ao, ",
//            "    ISNULL(hj.[AP], '') as ap, ",
//            "    ISNULL(hj.[AY], '') as ay, ",
//            "    ISNULL(hj.[AQ], '') as aq, ",
//            "    ISNULL(hj.[AR], '') as ar, ",
//            "    ISNULL(hj.[AS], '') as aas, ",
//            "    ISNULL(hj.[AT], '') as at, ",
//            "    ISNULL(hj.hetong_zhuangtai, '') as hetongzhuangtai, ",
//            "    ISNULL(hj.riqi, '') as riqi ",
//            "FROM filtered_hetong hj ",
//            "LEFT JOIN guicheng_stats gs ON hj.id = gs.left_id ",
//            "OPTION (RECOMPILE)",
//            "</script>"
//    })
//    List<Htjl> getListExcludeThjl();

    @Select({
            "<script>",
            "WITH filtered_hetong AS (",
            "    SELECT * FROM hetong_jilu hj ",
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = '' ",
            "      AND NOT EXISTS (",
            "          SELECT 1 FROM tuihuo tb WITH(NOLOCK) ",
            "          WHERE tb.v = hj.id ",
            "      )",
            ") ",
            "SELECT ",
            "    hj.id, ",
            "    ISNULL(hj.C, '') as c, ",
            "    ISNULL(hj.D, '') as d, ",
            "    ISNULL(hj.E, '') as e, ",
            "    ISNULL(hj.zhuangtai, '') as zhuangtai, ",
            "    ISNULL(hj.G, '') as g, ",
            "    ISNULL(hj.H, '') as h, ",
            "    ISNULL(hj.I, '') as i, ",
            "    ISNULL(hj.J, '') as j, ",
            "    ISNULL(hj.K, '') as k, ",
            "    ISNULL(hj.L, '') as l, ",
            "    ISNULL(hj.AU, '') as au, ",
            "    ISNULL(hj.AV, '') as av, ",
            "    ISNULL(hj.AW, '') as aw, ",
            "    ISNULL(hj.AX, '') as ax, ",
            "    ISNULL(hj.M, '') as m, ",
            "    ISNULL(hj.N, '') as n, ",
            "    ISNULL(hj.O, '') as o, ",
            "    ISNULL(hj.P, '') as p, ",
            "    ISNULL(hj.Q, '') as q, ",
            "    ISNULL(hj.R, '') as r, ",
            "    ISNULL(hj.S, '') as s, ",
            "    ISNULL(hj.T, '') as t, ",
            "    ISNULL(hj.U, '') as u, ",
            "    ISNULL(hj.V, '') as v, ",
            "    ISNULL(hj.W, '') as w, ",
            "    ISNULL(hj.X, '') as x, ",
            "    ISNULL(hj.Y, '') as y, ",
            "    ISNULL(hj.Z, '') as z, ",
            "    ISNULL(hj.[AA], '') as aa, ",
            "    ISNULL(hj.[AB], '') as ab, ",
            "    ISNULL(hj.[AC], '') as ac, ",
            "    ISNULL(hj.[AD], '') as ad, ",
            "    ISNULL(hj.[AE], '') as ae, ",
            "    ISNULL(hj.[AF], '') as af, ",
            "    ISNULL(hj.[AG], '') as ag, ",
            "    ISNULL(hj.[AH], '') as ah, ",
            "    ISNULL(hj.[AI], '') as ai, ",
            "    ISNULL(hj.[AJ], '') as aj, ",
            "    ISNULL(hj.[AK], '') as ak, ",
            "    ISNULL(hj.[AL], '') as al, ",
            "    ISNULL(hj.[AM], '') as am, ",
            "    ISNULL(hj.[AN], '') as an, ",
            "    ISNULL(hj.[AO], '') as ao, ",
            "    ISNULL(hj.[AP], '') as ap, ",
            "    ISNULL(hj.[AY], '') as ay, ",
            "    ISNULL(hj.[AQ], '') as aq, ",
            "    ISNULL(hj.[AR], '') as ar, ",
            "    ISNULL(hj.[AS], '') as aas, ",
            "    ISNULL(hj.[AT], '') as at, ",
            "    ISNULL(hj.hetong_zhuangtai, '') as hetongzhuangtai, ",
            "    ISNULL(hj.riqi, '') as riqi ",
            "FROM filtered_hetong hj ",
            "OPTION (RECOMPILE)",
            "</script>"
    })
    List<Htjl> getListExcludeThjl();




    @Update("UPDATE hetong_jilu SET " +
            "c = #{c}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, " +
            "k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, " +
            "s = #{s}, t = #{t}, u = #{u}, v = #{v}, w = #{w}, x = #{x}, y = #{y}, z = #{z}, " +
            "[aa] = #{aa}, [ab] = #{ab}, [ac] = #{ac}, [ad] = #{ad}, [ae] = #{ae}, [af] = #{af}, [ag] = #{ag}, " +
            "[ah] = #{ah}, [ai] = #{ai}, [aj] = #{aj}, [ak] = #{ak}, [al] = #{al}, [am] = #{am}, [an] = #{an}, " +
            "[ao] = #{ao}, [ap] = #{ap}, [aq] = #{aq}, [ar] = #{ar}, [as] = #{as}, [at] = #{at}, [au] = #{au}, " +
            "[av] = #{av}, [aw] = #{aw}, [ax] = #{ax} " +
            "WHERE id = #{id}")
    boolean update(Htjl htjl);



    @Insert("INSERT INTO hetong_jilu (c, d, e, hetong_zhuangtai, zhuangtai, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, [aa], [ab], [ac], [ad], [ae], [af], [ag], [ah], [ai], [aj], [ak], [al], [am], [an], [ao], [ap], [aq], [ar], [as], [at], [au], [av], [aw], [ax]) " +
            "VALUES (#{c}, #{d}, #{e}, #{hetongzhuangtai}, '未创建', #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, #{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v}, #{w}, #{x}, #{y}, #{z}, #{aa}, #{ab}, #{ac}, #{ad}, #{ae}, #{af}, #{ag}, #{ah}, #{ai}, #{aj}, #{ak}, #{al}, #{am}, #{an}, #{ao}, #{ap}, #{aq}, #{ar}, #{aas}, #{at}, #{au}, #{av}, #{aw}, #{ax})")
    boolean add(Htjl htjl);

    @Delete("delete from hetong_jilu where id=#{id}")
    boolean delete(int id);


    @Select({
            "<script>",
            "SELECT ",
            "    hj.id, ",
            "    ISNULL(hj.C, '') as c, ",
            "    ISNULL(hj.D, '') as d, ",
            "    ISNULL(hj.E, '') as e, ",
            "    ISNULL(guicheng.zhuangtai, '未创建') as zhuangtai, ",
            "    ISNULL(hj.G, '') as g, ",
            "    ISNULL(hj.H, '') as h, ",
            "    ISNULL(hj.I, '') as i, ",
            "    ISNULL(hj.J, '') as j, ",
            "    ISNULL(hj.K, '') as k, ",
            "    ISNULL(hj.L, '') as l, ",
            "    ISNULL(hj.AU, '') as au, ",
            "    ISNULL(hj.AV, '') as av, ",
            "    ISNULL(hj.AW, '') as aw, ",
            "    ISNULL(hj.AX, '') as ax, ",
            "    ISNULL(hj.M, '') as m, ",
            "    ISNULL(hj.N, '') as n, ",
            "    ISNULL(hj.O, '') as o, ",
            "    ISNULL(hj.P, '') as p, ",
            "    ISNULL(hj.Q, '') as q, ",
            "    ISNULL(hj.R, '') as r, ",
            "    ISNULL(hj.S, '') as s, ",
            "    ISNULL(hj.T, '') as t, ",
            "    ISNULL(hj.U, '') as u, ",
            "    ISNULL(hj.V, '') as v, ",
            "    ISNULL(hj.W, '') as w, ",
            "    ISNULL(hj.X, '') as x, ",
            "    ISNULL(hj.Y, '') as y, ",
            "    ISNULL(hj.Z, '') as z, ",
            "    ISNULL(hj.[AA], '') as aa, ",
            "    ISNULL(hj.[AB], '') as ab, ",
            "    ISNULL(hj.[AC], '') as ac, ",
            "    ISNULL(hj.[AD], '') as ad, ",
            "    ISNULL(hj.[AE], '') as ae, ",
            "    ISNULL(hj.[AF], '') as af, ",
            "    ISNULL(hj.[AG], '') as ag, ",
            "    ISNULL(hj.[AH], '') as ah, ",
            "    ISNULL(hj.[AI], '') as ai, ",
            "    ISNULL(hj.[AJ], '') as aj, ",
            "    ISNULL(hj.[AK], '') as ak, ",
            "    ISNULL(hj.[AL], '') as al, ",
            "    ISNULL(hj.[AM], '') as am, ",
            "    ISNULL(hj.[AN], '') as an, ",
            "    ISNULL(hj.[AO], '') as ao, ",
            "    ISNULL(hj.[AP], '') as ap, ",
            "    ISNULL(hj.[AY], '') as ay, ",
            "    ISNULL(hj.[AQ], '') as aq, ",
            "    ISNULL(hj.[AR], '') as ar, ",
            "    ISNULL(hj.[AS], '') as aas, ",
            "    ISNULL(hj.[AT], '') as at, ",
            "    ISNULL(hj.hetong_zhuangtai, '') as hetongzhuangtai, ",
            "    ISNULL(hj.riqi, '') as riqi ",
            "FROM hetong_jilu hj ",
            "LEFT JOIN (",
            "    SELECT ",
            "        C as left_id, ",
            "        CASE WHEN renwu > renyuan THEN '未完成' ELSE '已完成' END as zhuangtai ",
            "    FROM (",
            "        SELECT ",
            "            C, ",
            "            SUM(CASE WHEN ISNULL(K, '') != '' THEN 1 ELSE 0 END) as renwu, ",
            "            SUM(CASE WHEN ISNULL(M, '') != '' THEN 1 ELSE 0 END) as renyuan ",
            "        FROM gongyi_guicheng ",
            "        GROUP BY C",
            "    ) as guicheng",
            ") as guicheng ON hj.id = guicheng.left_id ",
            "WHERE ISNULL(hj.hetong_zhuangtai, '') = ''",
            "  AND NOT EXISTS (",
            "      SELECT 1 FROM tuihuo tb ",
            "      WHERE tb.v = hj.id",
            "  )",
            "<if test='name != null and name != \"\"'>",
            "   AND hj.C LIKE '%' + #{name} + '%'",
            "</if>",
            "<if test='department != null and department != \"\"'>",
            "   AND hj.hetong_zhuangtai LIKE '%' + #{department} + '%'",
            "</if>",
            "</script>"
    })
    List<Htjl> queryList(@Param("name") String name, @Param("department") String department);





//    退货单
@Insert("INSERT INTO tuihuo (C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W) " +
        "VALUES (#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, " +
        "#{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v}, #{w})")
boolean save(Htjl htjl);
    @Select("select isnull(max(F),'') from tuihuo where F like 'No:' + CONVERT(varchar(8), GETDATE(), 112) + '%'")
    String  getddh();




//    出库单
    @Insert("INSERT INTO chuku (C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U) " +
            "VALUES (#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, " +
            "#{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u})")
    boolean save1(Htjl htjl);
    @Select("select isnull(max(F),'') from chuku where F like 'No:' + CONVERT(varchar(8), GETDATE(), 112) + '%'")
    String  getddh1();



    @Select("SELECT * FROM hetong_jilu WHERE id = #{id}")
    Htjl getById(String id);



    @Select({
            "<script>",
            "SELECT * FROM hetong_jilu WHERE id IN",
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
            "#{id}",
            "</foreach>",
            "</script>"
    })
    List<Htjl> getByIds(@Param("ids") List<String> ids);

    @Update("<script>" +
            "UPDATE hetong_jilu " +
            "<set>" +
            "<if test='params.c != null'>c = #{params.c},</if>" +
            "<if test='params.d != null'>d = #{params.d},</if>" +
            "<if test='params.e != null'>e = #{params.e},</if>" +
            "<if test='params.f != null'>f = #{params.f},</if>" +
            "<if test='params.g != null'>g = #{params.g},</if>" +
            "<if test='params.h != null'>h = #{params.h},</if>" +
            "<if test='params.i != null'>i = #{params.i},</if>" +
            "<if test='params.j != null'>j = #{params.j},</if>" +
            "<if test='params.k != null'>k = #{params.k},</if>" +
            "<if test='params.l != null'>l = #{params.l},</if>" +
            "<if test='params.m != null'>m = #{params.m},</if>" +
            "<if test='params.n != null'>n = #{params.n},</if>" +
            "<if test='params.o != null'>o = #{params.o},</if>" +
            "<if test='params.p != null'>p = #{params.p},</if>" +
            "<if test='params.q != null'>q = #{params.q},</if>" +
            "<if test='params.r != null'>r = #{params.r},</if>" +
            "<if test='params.s != null'>s = #{params.s},</if>" +
            "<if test='params.t != null'>t = #{params.t},</if>" +
            "<if test='params.u != null'>u = #{params.u},</if>" +
            "<if test='params.v != null'>v = #{params.v},</if>" +
            "<if test='params.w != null'>w = #{params.w},</if>" +
            "<if test='params.x != null'>x = #{params.x},</if>" +
            "<if test='params.y != null'>y = #{params.y},</if>" +
            "<if test='params.z != null'>z = #{params.z},</if>" +
            "<if test='params.aa != null'>[aa] = #{params.aa},</if>" +
            "<if test='params.ab != null'>[ab] = #{params.ab},</if>" +
            "<if test='params.ac != null'>[ac] = #{params.ac},</if>" +
            "<if test='params.ad != null'>[ad] = #{params.ad},</if>" +
            "<if test='params.ae != null'>[ae] = #{params.ae},</if>" +
            "<if test='params.af != null'>[af] = #{params.af},</if>" +
            "<if test='params.ag != null'>[ag] = #{params.ag},</if>" +
            "<if test='params.ah != null'>[ah] = #{params.ah},</if>" +
            "<if test='params.ai != null'>[ai] = #{params.ai},</if>" +
            "<if test='params.aj != null'>[aj] = #{params.aj},</if>" +
            "<if test='params.ak != null'>[ak] = #{params.ak},</if>" +
            "<if test='params.al != null'>[al] = #{params.al},</if>" +
            "<if test='params.am != null'>[am] = #{params.am},</if>" +
            "<if test='params.an != null'>[an] = #{params.an},</if>" +
            "<if test='params.ao != null'>[ao] = #{params.ao},</if>" +
            "<if test='params.ap != null'>[ap] = #{params.ap},</if>" +
            "<if test='params.aq != null'>[aq] = #{params.aq},</if>" +
            "<if test='params.ar != null'>[ar] = #{params.ar},</if>" +
            "<if test='params.aas != null'>[as] = #{params.aas},</if>" +
            "<if test='params.at != null'>[at] = #{params.at},</if>" +
            "<if test='params.au != null'>[au] = #{params.au},</if>" +
            "<if test='params.av != null'>[av] = #{params.av},</if>" +
            "<if test='params.aw != null'>[aw] = #{params.aw},</if>" +
            "<if test='params.ax != null'>[ax] = #{params.ax},</if>" +
            "<if test='params.ay != null'>[ay] = #{params.ay},</if>" +
            "<if test='params.hetong_zhuangtai != null'>hetong_zhuangtai = #{params.hetong_zhuangtai},</if>" +
            "</set>" +
            "WHERE id = #{id}" +
            "</script>")
    boolean updateByMap(@Param("id") Integer id, @Param("params") Map<String, Object> params);

    @Select("SELECT num FROM gongxu WHERE name = #{name}")
    String getGongxuNumByName(String name);






    @Update("UPDATE ht SET ht.zhuangtai = '未完成' " +
            "FROM hetong_jilu ht " +
            "INNER JOIN ( " +
            "    SELECT C, COUNT(*) as total_count, " +
            "           COUNT(CASE WHEN ISNULL(M, '') != '' THEN 1 END) as m_count " +
            "    FROM gongyi_guicheng " +
            "    WHERE C IS NOT NULL " +
            "    GROUP BY C " +
            "    HAVING COUNT(*) > COUNT(CASE WHEN ISNULL(M, '') != '' THEN 1 END) " +
            ") gg ON ht.id = gg.C " +
            "WHERE ISNULL(ht.hetong_zhuangtai, '') = ''")
    int updateZhuangtaiForUnfinished();

    @Update("UPDATE ht SET ht.zhuangtai = '已完成' " +
            "FROM hetong_jilu ht " +
            "INNER JOIN ( " +
            "    SELECT C, COUNT(*) as total_count, " +
            "           COUNT(CASE WHEN ISNULL(M, '') != '' THEN 1 END) as m_count " +
            "    FROM gongyi_guicheng " +
            "    WHERE C IS NOT NULL " +
            "    GROUP BY C " +
            "    HAVING COUNT(*) <= COUNT(CASE WHEN ISNULL(M, '') != '' THEN 1 END) " +
            ") gg ON ht.id = gg.C " +
            "WHERE ISNULL(ht.hetong_zhuangtai, '') = ''")
    int updateZhuangtaiForCompleted();
}