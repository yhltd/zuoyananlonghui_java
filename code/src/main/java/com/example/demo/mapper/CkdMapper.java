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
public interface CkdMapper extends BaseMapper<Ckd> {

    //    出库单
    @Insert("INSERT INTO chuku (C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W) " +
            "VALUES (#{c}, #{d}, #{e}, #{f}, #{g}, #{h}, #{i}, #{j}, #{k}, #{l}, #{m}, #{n}, " +
            "#{o}, #{p}, #{q}, #{r}, #{s}, #{t}, #{u}, #{v}, #{w})")
    boolean save1(Ckd ckd);
    @Select("select isnull(max(F),'') from chuku where F like 'No:' + CONVERT(varchar(8), GETDATE(), 112) + '%'")
    String  getddh1();












//    @Select({
//            "<script>",
//            "SELECT * FROM hetong_jilu WHERE id IN",
//            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
//            "#{id}",
//            "</foreach>",
//            " AND id = '1739'",  // 添加固定条件
//            "</script>"
//    })
//    List<Ckd> getByIds(@Param("ids") List<String> ids);

    @Select({
            "<script>",
            "SELECT * FROM hetong_jilu WHERE id IN",
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
            "#{id}",
            "</foreach>",
            "</script>"
    })
    List<Ckd> getByIds(@Param("ids") List<String> ids);


}