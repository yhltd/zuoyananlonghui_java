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
public interface KphtMapper extends BaseMapper<Kpht> {

    @Select("select * from hetong_jilu where f in ('未开票', '已开票')")
    List<Kpht> getList();


    @Update("UPDATE hetong_jilu SET " +
            "c = #{c}, d = #{d}, e = #{e}, f = #{f}, g = #{g}, h = #{h}, i = #{i}, j = #{j}, " +
            "k = #{k}, l = #{l}, m = #{m}, n = #{n}, o = #{o}, p = #{p}, q = #{q}, r = #{r}, " +
            "s = #{s}, t = #{t}, u = #{u}, v = #{v}, w = #{w}, x = #{x}, y = #{y}, z = #{z}, " +
            "[aa] = #{aa}, [ab] = #{ab}, [ac] = #{ac}, [ad] = #{ad}, [ae] = #{ae}, [af] = #{af}, [ag] = #{ag}, " +
            "[ah] = #{ah}, [ai] = #{ai}, [aj] = #{aj}, [ak] = #{ak}, [al] = #{al}, [am] = #{am}, [an] = #{an}, " +
            "[ao] = #{ao}, [ap] = #{ap}, [aq] = #{aq}, [ar] = #{ar}, [as] = #{as}, [at] = #{at}, [au] = #{au}, " +
            "[av] = #{av}, [aw] = #{aw}, [ax] = #{ax} " +
            "WHERE id = #{id}")
    boolean update(Kpht kpht);


    @Delete("delete from hetong_jilu where id=#{id}")
    boolean delete(int id);


    @Select("<script>" +
            "SELECT * FROM hetong_jilu " +
            "WHERE f IN ('未开票', '已开票') " +
            "<if test='name != null and name != \"\"'>" +
            "   AND c LIKE '%' + #{name} + '%'" +
            "</if>" +
            "</script>")
    List<Kpht> queryList(String name);

}