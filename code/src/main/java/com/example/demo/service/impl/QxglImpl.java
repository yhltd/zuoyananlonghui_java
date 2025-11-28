package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Qxgl;
import com.example.demo.mapper.QxglMapper;
import com.example.demo.service.QxglService;
import com.example.demo.util.GsonUtil;
import com.example.demo.util.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class QxglImpl extends ServiceImpl<QxglMapper, Qxgl> implements QxglService {

    @Override
    public Map<String, Object> login(String username, String password) {
        //条件构造器
        QueryWrapper<Qxgl> queryWrapper = new QueryWrapper<>();
        //账号
        queryWrapper.eq("D", username);
        //密码
        queryWrapper.eq("E", password);
        //获取User
        Qxgl userInfo = this.getOne(queryWrapper);
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
}
