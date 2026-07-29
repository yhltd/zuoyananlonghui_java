package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Gx;

import java.util.List;

public interface GxService extends IService<Gx> {

    List<Gx> getAllGongxu();
    boolean updateGongxu(Gx gx);
}
