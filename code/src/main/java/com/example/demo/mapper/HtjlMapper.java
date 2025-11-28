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
public interface HtjlMapper extends BaseMapper<Htjl> {

//    @Select("select * from hetong_jilu")
//    List<Htjl> getList();
@Select("SELECT h.* FROM hetong_jilu h " +
        "WHERE h.id NOT IN (SELECT DISTINCT t.id FROM tuihuo t WHERE t.id IS NOT NULL) " +
        "ORDER BY h.id")
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



    @Insert("INSERT INTO hetong_jilu (c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, [aa], [ab], [ac], [ad], [ae], [af], [ag], [ah], [ai], [aj], [ak], [al], [am], [an], [ao], [ap], [aq], [ar], [as], [at], [au], [av], [aw], [ax]) " +
            "VALUES (#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, #{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v}, #{w}, #{x}, #{y}, #{z}, #{aa}, #{ab}, #{ac}, #{ad}, #{ae}, #{af}, #{ag}, #{ah}, #{ai}, #{aj}, #{ak}, #{al}, #{am}, #{an}, #{ao}, #{ap}, #{aq}, #{ar}, #{as}, #{at}, #{au}, #{av}, #{aw}, #{ax})")
    boolean add(Htjl htjl);


    @Delete("delete from hetong_jilu where id=#{id}")
    boolean delete(int id);


    @Select("select c, f from hetong_jilu where c like '%'+#{name}+'%' and f like '%'+#{department}+'%'")
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





//    // 根据ID查询单条数据
//    @Select("SELECT * FROM htjl WHERE id = #{id}")
//    Htjl getById(String id);
//
//    // 根据多个ID查询数据
//    @Select({
//            "<script>",
//            "SELECT * FROM htjl WHERE id IN",
//            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
//            "#{id}",
//            "</foreach>",
//            "</script>"
//    })
//    List<Htjl> getByIds(@Param("ids") List<String> ids);





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









//    @Select({
//            "<script>",
//            "SELECT * FROM hetong_jilu WHERE id IN",
//            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
//            "#{id}",
//            "</foreach>",
//            " AND id = '1739'",  // 添加固定条件
//            "</script>"
//    })
//    List<Htjl> getByIds(@Param("ids") List<String> ids);
}