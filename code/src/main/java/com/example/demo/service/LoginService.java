package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Login;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
@Service
public interface LoginService extends IService<Login> {

    Map<String, Object> Login(String username, String password);


    /**
     * 查询所有
     */
    List<Login> getList();

    /**
     * 根据姓名和部门查询
     */
    List<Login> queryList(String name);


    /**
     * 修改
     */
    boolean update(Login login);


    /**
     * 添加
     * @return
     */
    boolean add(Login login);

    /**
     * 删除
     *
     * @param idList 根据id集合删除
     * @return 是否删除成功
     */
    boolean delete(List<Integer> idList);

}
