package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Yggs;
import com.example.demo.mapper.YggsMapper;
import com.example.demo.service.YggsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class YggsImpl extends ServiceImpl<YggsMapper, Yggs> implements YggsService {
    @Autowired
    YggsMapper yggsMapper;

    @Override
    public List<Yggs> queryList(String ksrq, String jsrq, String m) {
        // 确保参数不为null
        ksrq = ksrq != null ? ksrq : "";
        jsrq = jsrq != null ? jsrq : "";
        m = m != null ? m : "";


        return baseMapper.queryList(ksrq, jsrq, m);
    }


    @Override
    public List<Yggs> queryList1(String ksrq1, String jsrq1) {
        // 确保参数不为null
        ksrq1 = ksrq1 != null ? ksrq1 : "";
        jsrq1 = jsrq1 != null ? jsrq1 : "";

        return baseMapper.queryList1(ksrq1, jsrq1);
    }

}