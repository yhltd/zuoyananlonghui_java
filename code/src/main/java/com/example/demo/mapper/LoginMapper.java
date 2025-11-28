package com.example.demo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.entity.Login;
import org.apache.ibatis.annotations.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface LoginMapper extends BaseMapper<Login> {

    @Select("select * from userinfo")
    List<Login> getList();



    @Select("SELECT * FROM userinfo WHERE c LIKE '%' + #{name} + '%'")
    List<Login> queryList(String name);

    // 或者方式二：使用注解，但参数要与实体类字段一致
    @Update("UPDATE userInfo SET c = #{c}, d = #{d}, e = #{e}, f = #{f} WHERE id = #{id}")
    boolean update(Login login);

    @Insert("INSERT INTO userInfo (c, d, e, f) VALUES (#{c}, #{d}, #{e}, #{f})")
    boolean add(Login login);


    @Delete("delete from userinfo where id=#{id}")
    boolean delete(int id);


//
//    @Delete("delete from userinfo where id=#{id}")
//    boolean delete(int id);
//
//    @Insert("insert into userinfo(C,D,E,F,caozuoquanxian) values(#{name},#{D},#{E},#{power},#{caozuoquanxian})")
//    boolean add(String name,String username,String password,String power,String caozuoquanxian);



}
