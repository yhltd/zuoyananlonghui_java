package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Login;
import com.example.demo.mapper.LoginMapper;
import com.example.demo.service.LoginService;
import com.example.demo.util.GsonUtil;
import com.example.demo.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@Service
public class LoginImpl extends ServiceImpl<LoginMapper, Login> implements LoginService {
    @Autowired
    LoginMapper loginMapper;

    @Override
    public Map<String, Object> Login(String username, String password) {
        //条件构造器
        QueryWrapper<Login> queryWrapper = new QueryWrapper<>();
        //账号
        queryWrapper.eq("D", username);
        //密码
        queryWrapper.eq("E", password);
        //获取User
        Login userInfo = this.getOne(queryWrapper);
        //如果不为空
        String data = StringUtils.EMPTY;
        if (StringUtils.isNotNull(userInfo)) {
            //转JSON
            data = GsonUtil.toJson(userInfo);

            Map<String, Object> map = new HashMap<>();
            map.put("token", data);
            String this_power = "";
            return map;
        }
        return null;
    }

    @Override
    public List<Login> getList() {  // 方法名必须一致
        return loginMapper.getList();
    }

    @Override
    public List<Login> queryList(String name) {
        return loginMapper.queryList(name);
    }

    @Override
    public boolean update(Login login) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
         return loginMapper.update(login);
    }


    @Override
    public boolean add(Login login) {
        return loginMapper.add(login);
    }



    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }



}








