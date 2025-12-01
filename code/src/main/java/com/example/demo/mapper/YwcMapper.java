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
public interface YwcMapper extends BaseMapper<Ywc> {

    @Select("SELECT " +
            "id, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, " +
            "AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN, AO, AP, AQ, AR, " +
            "[AS] as aas, AT, " +  // 关键：使用 [AS] 转义
            "hetong_zhuangtai, AU, AV, AW, AX, AY, riqi " +
            "FROM hetong_jilu WHERE hetong_zhuangtai IN ('未对账', '已对账')")
    List<Ywc> getList();


    @Update("UPDATE hetong_jilu SET " +
            "c = #{c}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, " +
            "k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, " +
            "s = #{s}, t = #{t}, u = #{u}, v = #{v}, w = #{w}, x = #{x}, y = #{y}, z = #{z}, " +
            "[aa] = #{aa}, [ab] = #{ab}, [ac] = #{ac}, [ad] = #{ad}, [ae] = #{ae}, [af] = #{af}, [ag] = #{ag}, " +
            "[ah] = #{ah}, [ai] = #{ai}, [aj] = #{aj}, [ak] = #{ak}, [al] = #{al}, [am] = #{am}, [an] = #{an}, " +
            "[ao] = #{ao}, [ap] = #{ap}, [aq] = #{aq}, [ar] = #{ar}, [as] = #{as}, [at] = #{at}, [au] = #{au}, " +
            "[av] = #{av}, [aw] = #{aw}, [ax] = #{ax} " +
            "WHERE id = #{id}")
    boolean update(Ywc ywc);

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


    @Delete("delete from hetong_jilu where id=#{id}")
    boolean delete(int id);



    @Select("<script>" +
            "SELECT " +
            "id, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, " +
            "AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN, AO, AP, AQ, AR, " +
            "[AS] as aas, AT, " +  // 关键：使用 AS as aas 明确映射
            "hetong_zhuangtai, AU, AV, AW, AX, AY, riqi " +
            "FROM hetong_jilu " +
            "WHERE hetong_zhuangtai IN ('已对账', '未对账') " +
            "<if test='name != null and name != \"\"'>" +
            "   AND C LIKE '%' + #{name} + '%'" +
            "</if>" +
            "</script>")
    List<Ywc> queryList(String name);

    @Select("SELECT num FROM gongxu WHERE name = #{name}")
    String getGongxuNumByName(String name);

}