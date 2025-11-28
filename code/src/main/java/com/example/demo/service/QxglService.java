package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Qxgl;

import java.util.Map;

public interface QxglService extends IService<Qxgl> {

    Map<String, Object> login(String username, String password);
}
