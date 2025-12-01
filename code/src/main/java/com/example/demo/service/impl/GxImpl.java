package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Gx;
import com.example.demo.mapper.GxMapper;
import com.example.demo.service.GxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class GxImpl extends ServiceImpl<GxMapper, Gx> implements GxService {

    @Autowired
    private GxMapper gxMapper;

    @Override
    public List<Gx> getAllGongxu() {
        return gxMapper.getAllGongxu();
    }

    @Override
    public boolean updateGongxu(Gx gx) {
        return gxMapper.updateGongxu(gx);
    }
}
