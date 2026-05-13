package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.CkdMapper;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.service.CkdService;
import com.example.demo.service.HtjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class CkdImpl extends ServiceImpl<CkdMapper, Ckd> implements CkdService {
    @Autowired
    CkdMapper ckdMapper;


    @Override
    public List<Ckd> gettdh() {  // 方法名必须一致
        return baseMapper.gettdh();
    }

    @Override
    public List<Ckd> getth(String returnNo ){
        return baseMapper.getth(returnNo);
    }





    @Override
    public List<Ckd> getByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return ckdMapper.getByIds(ids);
    }





}
