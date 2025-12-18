package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
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

    @Select({
            "<script>",
            "WITH filtered_hetong AS (",
            "    SELECT * FROM hetong_jilu hj ",
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = '' ",
            "    AND ISNULL(hj.muban, '') != '新' ",
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
            "    ISNULL(hj.lingjianhao, '') as lingjianhao, ",
            "    ISNULL(hj.qianshiji, '') as qianshiji, ",
            "    ISNULL(hj.tangshiji, '') as tangshiji, ",
            "    ISNULL(hj.geshiji, '') as geshiji, ",
            "    ISNULL(hj.moshiji, '') as moshiji, ",
            "    ISNULL(hj.licheshiji, '') as licheshiji, ",
            "    ISNULL(hj.dianhuohuashiji, '') as dianhuohuashiji, ",
            "    ISNULL(hj.zhongzuosishiji, '') as zhongzuosishiji, ",
            "    ISNULL(hj.jingmixianqiege, '') as jingmixianqiege, ",
            "    ISNULL(hj.hanjiegongshi, '') as hanjiegongshi, ",
            "    ISNULL(hj.dengjiriqi, '') as dengjiriqi, ",
            "    ISNULL(hj.shijijiaohuoriqi, '') as shijijiaohuoriqi, ",
            "    ISNULL(hj.xianshiji, '') as xianshiji, ",  // 新增
            "    ISNULL(hj.cheshiji, '') as cheshiji, ",    // 新增
            "    ISNULL(hj.skxshiji, '') as skxshiji, ",    // 新增
            "    ISNULL(hj.riqi, '') as riqi, ",            // 注意：这里有个问题，缺了逗号
            "    ISNULL(hj.muban, '') as muban " +          // 新增muban字段
                    "FROM filtered_hetong hj ",
            "OPTION (RECOMPILE)",
            "</script>"
    })
    List<Htjl> getListExcludeThjl();



    @Select("<script>" +
            "WITH filtered_hetong AS (" +
            "    SELECT * FROM hetong_jilu hj " +
            "    WHERE ISNULL(hj.hetong_zhuangtai, '') = '' " +
            "    AND ISNULL(hj.muban, '') != '新' " +
            "      AND NOT EXISTS (" +
            "          SELECT 1 FROM tuihuo tb WITH(NOLOCK) " +
            "          WHERE tb.v = hj.id " +
            "      )" +
            "    <if test='ew != null'>" +
            "        <trim prefix=' AND ' prefixOverrides='AND |OR '>" +
            "            ${ew.sqlSegment}" +
            "        </trim>" +
            "    </if>" +
            ") " +
            "SELECT * FROM (" +
            "    SELECT ROW_NUMBER() OVER (ORDER BY id ASC) as rn, " +
            "           hj.id, " +
            "           ISNULL(hj.C, '') as c, " +
            "           ISNULL(hj.D, '') as d, " +
            "           ISNULL(hj.E, '') as e, " +
            "           ISNULL(hj.zhuangtai, '') as zhuangtai, " +
            "           ISNULL(hj.G, '') as g, " +
            "           ISNULL(hj.H, '') as h, " +
            "           ISNULL(hj.I, '') as i, " +
            "           ISNULL(hj.J, '') as j, " +
            "           ISNULL(hj.K, '') as k, " +
            "           ISNULL(hj.L, '') as l, " +
            "           ISNULL(hj.AU, '') as au, " +
            "           ISNULL(hj.AV, '') as av, " +
            "           ISNULL(hj.AW, '') as aw, " +
            "           ISNULL(hj.AX, '') as ax, " +
            "           ISNULL(hj.M, '') as m, " +
            "           ISNULL(hj.N, '') as n, " +
            "           ISNULL(hj.O, '') as o, " +
            "           ISNULL(hj.P, '') as p, " +
            "           ISNULL(hj.Q, '') as q, " +
            "           ISNULL(hj.R, '') as r, " +
            "           ISNULL(hj.S, '') as s, " +
            "           ISNULL(hj.T, '') as t, " +
            "           ISNULL(hj.U, '') as u, " +
            "           ISNULL(hj.V, '') as v, " +
            "           ISNULL(hj.W, '') as w, " +
            "           ISNULL(hj.X, '') as x, " +
            "           ISNULL(hj.Y, '') as y, " +
            "           ISNULL(hj.Z, '') as z, " +
            "           ISNULL(hj.[AA], '') as aa, " +
            "           ISNULL(hj.[AB], '') as ab, " +
            "           ISNULL(hj.[AC], '') as ac, " +
            "           ISNULL(hj.[AD], '') as ad, " +
            "           ISNULL(hj.[AE], '') as ae, " +
            "           ISNULL(hj.[AF], '') as af, " +
            "           ISNULL(hj.[AG], '') as ag, " +
            "           ISNULL(hj.[AH], '') as ah, " +
            "           ISNULL(hj.[AI], '') as ai, " +
            "           ISNULL(hj.[AJ], '') as aj, " +
            "           ISNULL(hj.[AK], '') as ak, " +
            "           ISNULL(hj.[AL], '') as al, " +
            "           ISNULL(hj.[AM], '') as am, " +
            "           ISNULL(hj.[AN], '') as an, " +
            "           ISNULL(hj.[AO], '') as ao, " +
            "           ISNULL(hj.[AP], '') as ap, " +
            "           ISNULL(hj.[AY], '') as ay, " +
            "           ISNULL(hj.[AQ], '') as aq, " +
            "           ISNULL(hj.[AR], '') as ar, " +
            "           ISNULL(hj.[AS], '') as aas, " +
            "           ISNULL(hj.[AT], '') as at, " +
            "           ISNULL(hj.hetong_zhuangtai, '') as hetongzhuangtai, " +
            "           ISNULL(hj.lingjianhao, '') as lingjianhao, " +
            "           ISNULL(hj.qianshiji, '') as qianshiji, " +
            "           ISNULL(hj.tangshiji, '') as tangshiji, " +
            "           ISNULL(hj.geshiji, '') as geshiji, " +
            "           ISNULL(hj.moshiji, '') as moshiji, " +
            "           ISNULL(hj.licheshiji, '') as licheshiji, " +
            "           ISNULL(hj.dianhuohuashiji, '') as dianhuohuashiji, " +
            "           ISNULL(hj.zhongzuosishiji, '') as zhongzuosishiji, " +
            "           ISNULL(hj.jingmixianqiege, '') as jingmixianqiege, " +
            "           ISNULL(hj.hanjiegongshi, '') as hanjiegongshi, " +
            "           ISNULL(hj.dengjiriqi, '') as dengjiriqi, " +
            "           ISNULL(hj.shijijiaohuoriqi, '') as shijijiaohuoriqi, " +
            "           ISNULL(hj.xianshiji, '') as xianshiji, " +        // 新增
            "           ISNULL(hj.cheshiji, '') as cheshiji, " +          // 新增
            "           ISNULL(hj.skxshiji, '') as skxshiji, " +          // 新增
            "           ISNULL(hj.riqi, '') as riqi, " +                  // 修正：添加逗号
            "           ISNULL(hj.muban, '') as muban " +                 // 新增muban字段
            "    FROM filtered_hetong hj " +
            ") temp " +
            "WHERE temp.rn BETWEEN #{start} + 1 AND #{start} + #{end} " +
            "OPTION (RECOMPILE)" +
            "</script>")
    List<Map<String, Object>> selectDistinctByDdhForPage(@Param("start") long start,
                                                         @Param("end") long end,
                                                         @Param("ew") Wrapper<Map<String, Object>> wrapper);

    @Select("<script>" +
            "SELECT COUNT(*) FROM hetong_jilu hj " +
            "WHERE ISNULL(hj.hetong_zhuangtai, '') = '' " +
            "  AND NOT EXISTS (" +
            "      SELECT 1 FROM tuihuo tb WITH(NOLOCK) " +
            "      WHERE tb.v = hj.id " +
            "  )" +
            "  <if test='ew != null'>" +
            "      <trim prefix=' AND ' prefixOverrides='AND |OR '>" +
            "          ${ew.sqlSegment}" +
            "      </trim>" +
            "  </if>" +
            "</script>")
    Long selectDistinctCount(@Param("ew") Wrapper<Map<String, Object>> wrapper);




    @Update("UPDATE hetong_jilu SET " +
            "c = #{c}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, " +
            "k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, " +
            "s = #{s}, t = #{t}, u = #{u}, v = #{v}, w = #{w}, x = #{x}, y = #{y}, z = #{z}, " +
            "[aa] = #{aa}, [ab] = #{ab}, [ac] = #{ac}, [ad] = #{ad}, [ae] = #{ae}, [af] = #{af}, [ag] = #{ag}, " +
            "[ah] = #{ah}, [ai] = #{ai}, [aj] = #{aj}, [ak] = #{ak}, [al] = #{al}, [am] = #{am}, [an] = #{an}, " +
            "[ao] = #{ao}, [ap] = #{ap}, [aq] = #{aq}, [ar] = #{ar}, [as] = #{aas}, [at] = #{at}, [au] = #{au}, " +
            "[av] = #{av}, [aw] = #{aw}, [ax] = #{ax}, [ay] = #{ay}, " +
            "hetong_zhuangtai = #{hetongzhuangtai}, " +
            "lingjianhao = #{lingjianhao}, qianshiji = #{qianshiji}, tangshiji = #{tangshiji}, " +
            "geshiji = #{geshiji}, moshiji = #{moshiji}, licheshiji = #{licheshiji}, " +
            "dianhuohuashiji = #{dianhuohuashiji}, zhongzuosishiji = #{zhongzuosishiji}, " +
            "jingmixianqiege = #{jingmixianqiege}, hanjiegongshi = #{hanjiegongshi}, " +
            "dengjiriqi = #{dengjiriqi}, shijijiaohuoriqi = #{shijijiaohuoriqi}, " +
            "xianshiji = #{xianshiji}, cheshiji = #{cheshiji}, skxshiji = #{skxshiji}, " +  // 新增三个字段
            "riqi = #{riqi}, muban = #{muban} " +  // 新增muban字段
            "WHERE id = #{id}")
    boolean update(Htjl htjl);



    @Insert("INSERT INTO hetong_jilu (c, d, e, hetong_zhuangtai, zhuangtai, muban, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, [aa], [ab], [ac], [ad], [ae], [af], [ag], [ah], [ai], [aj], [ak], [al], [am], [an], [ao], [ap], [aq], [ar], [as], [at], [au], [av], [aw], [ax], [ay], " +
            "lingjianhao, qianshiji, tangshiji, geshiji, moshiji, licheshiji, dianhuohuashiji, zhongzuosishiji, jingmixianqiege, hanjiegongshi, dengjiriqi, shijijiaohuoriqi, xianshiji, cheshiji, skxshiji, riqi) " +  // 新增三个字段
            "VALUES (#{c}, #{d}, #{e}, #{hetongzhuangtai}, '未创建', '', #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, #{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v}, #{w}, #{x}, #{y}, #{z}, #{aa}, #{ab}, #{ac}, #{ad}, #{ae}, #{af}, #{ag}, #{ah}, #{ai}, #{aj}, #{ak}, #{al}, #{am}, #{an}, #{ao}, #{ap}, #{aq}, #{ar}, #{aas}, #{at}, #{au}, #{av}, #{aw}, #{ax}, #{ay}, " +
            "#{lingjianhao}, #{qianshiji}, #{tangshiji}, #{geshiji}, #{moshiji}, #{licheshiji}, #{dianhuohuashiji}, #{zhongzuosishiji}, #{jingmixianqiege}, #{hanjiegongshi}, #{dengjiriqi}, #{shijijiaohuoriqi}, #{xianshiji}, #{cheshiji}, #{skxshiji}, #{riqi})")  // 新增三个字段
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
            "    ISNULL(hj.lingjianhao, '') as lingjianhao, ",
            "    ISNULL(hj.qianshiji, '') as qianshiji, ",
            "    ISNULL(hj.tangshiji, '') as tangshiji, ",
            "    ISNULL(hj.geshiji, '') as geshiji, ",
            "    ISNULL(hj.moshiji, '') as moshiji, ",
            "    ISNULL(hj.licheshiji, '') as licheshiji, ",
            "    ISNULL(hj.dianhuohuashiji, '') as dianhuohuashiji, ",
            "    ISNULL(hj.zhongzuosishiji, '') as zhongzuosishiji, ",
            "    ISNULL(hj.jingmixianqiege, '') as jingmixianqiege, ",
            "    ISNULL(hj.hanjiegongshi, '') as hanjiegongshi, ",
            "    ISNULL(hj.dengjiriqi, '') as dengjiriqi, ",
            "    ISNULL(hj.shijijiaohuoriqi, '') as shijijiaohuoriqi, ",
            "    ISNULL(hj.xianshiji, '') as xianshiji, ",  // 新增
            "    ISNULL(hj.cheshiji, '') as cheshiji, ",    // 新增
            "    ISNULL(hj.skxshiji, '') as skxshiji, ",    // 新增
            "    ISNULL(hj.riqi, '') as riqi, ",            // 修正：添加逗号
            "    ISNULL(hj.muban, '') as muban " +          // 新增muban字段
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



    @Select("SELECT " +
            "    id, c, d, e, zhuangtai, g, h, i, j, k, l, au, av, aw, ax, m, n, o, p, q, r, " +
            "    s, t, u, v, w, x, y, z, [aa], [ab], [ac], [ad], [ae], [af], [ag], [ah], [ai], " +
            "    [aj], [ak], [al], [am], [an], [ao], [ap], [ay], [aq], [ar], [as], [at], " +
            "    hetong_zhuangtai, lingjianhao, qianshiji, tangshiji, geshiji, moshiji, " +
            "    licheshiji, dianhuohuashiji, zhongzuosishiji, jingmixianqiege, hanjiegongshi, " +
            "    dengjiriqi, shijijiaohuoriqi, xianshiji, cheshiji, skxshiji, riqi, muban " +  // 新增三个字段和muban
            "FROM hetong_jilu WHERE id = #{id}")
    Htjl getById(String id);



    @Select({
            "<script>",
            "SELECT ",
            "    id, c, d, e, zhuangtai, g, h, i, j, k, l, au, av, aw, ax, m, n, o, p, q, r, ",
            "    s, t, u, v, w, x, y, z, [aa], [ab], [ac], [ad], [ae], [af], [ag], [ah], [ai], ",
            "    [aj], [ak], [al], [am], [an], [ao], [ap], [ay], [aq], [ar], [as], [at], ",
            "    hetong_zhuangtai, lingjianhao, qianshiji, tangshiji, geshiji, moshiji, ",
            "    licheshiji, dianhuohuashiji, zhongzuosishiji, jingmixianqiege, hanjiegongshi, ",
            "    dengjiriqi, shijijiaohuoriqi, xianshiji, cheshiji, skxshiji, riqi, muban ",  // 新增三个字段和muban
            "FROM hetong_jilu WHERE id IN",
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
            "<if test='params.lingjianhao != null'>lingjianhao = #{params.lingjianhao},</if>" +
            "<if test='params.qianshiji != null'>qianshiji = #{params.qianshiji},</if>" +
            "<if test='params.tangshiji != null'>tangshiji = #{params.tangshiji},</if>" +
            "<if test='params.geshiji != null'>geshiji = #{params.geshiji},</if>" +
            "<if test='params.moshiji != null'>moshiji = #{params.moshiji},</if>" +
            "<if test='params.licheshiji != null'>licheshiji = #{params.licheshiji},</if>" +
            "<if test='params.dianhuohuashiji != null'>dianhuohuashiji = #{params.dianhuohuashiji},</if>" +
            "<if test='params.zhongzuosishiji != null'>zhongzuosishiji = #{params.zhongzuosishiji},</if>" +
            "<if test='params.jingmixianqiege != null'>jingmixianqiege = #{params.jingmixianqiege},</if>" +
            "<if test='params.hanjiegongshi != null'>hanjiegongshi = #{params.hanjiegongshi},</if>" +
            "<if test='params.dengjiriqi != null'>dengjiriqi = #{params.dengjiriqi},</if>" +
            "<if test='params.shijijiaohuoriqi != null'>shijijiaohuoriqi = #{params.shijijiaohuoriqi},</if>" +
            "<if test='params.xianshiji != null'>xianshiji = #{params.xianshiji},</if>" +        // 新增
            "<if test='params.cheshiji != null'>cheshiji = #{params.cheshiji},</if>" +          // 新增
            "<if test='params.skxshiji != null'>skxshiji = #{params.skxshiji},</if>" +          // 新增
            "<if test='params.muban != null'>muban = #{params.muban},</if>" +                   // 新增
            "<if test='params.riqi != null'>riqi = #{params.riqi},</if>" +
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


    @Select("<script>" +
            "SELECT DISTINCT " +
            "    ISNULL(c, '') as c " +
            "FROM hetong_jilu hj " +
            "WHERE ISNULL(hj.hetong_zhuangtai, '') = '' " +
            "  AND ISNULL(hj.muban, '') != '新' " +
            "  AND ISNULL(c, '') != '' " +
            "ORDER BY c " +
            "</script>")
    List<Htjl> getCustomerList();
}