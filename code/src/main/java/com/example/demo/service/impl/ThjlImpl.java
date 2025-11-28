package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Thjl;
import com.example.demo.mapper.ThjlMapper;
import com.example.demo.service.ThjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class ThjlImpl extends ServiceImpl<ThjlMapper, Thjl> implements ThjlService {
    @Autowired
    ThjlMapper thjlMapper;


    @Override
    public List<Thjl> getList() {  // 方法名必须一致
        return thjlMapper.getList();
    }


    @Override
    public List<Thjl> queryList(String ksrq, String jsrq, String h, String i, String k, String r) {
        // 确保参数不为null
        ksrq = ksrq != null ? ksrq : "";
        jsrq = jsrq != null ? jsrq : "";
        h = h != null ? h : "";
        i = i != null ? i : "";
        k = k != null ? k : "";
        r = r != null ? r : "";

        return baseMapper.queryList(ksrq, jsrq, h, i, k, r);
    }


    @Override
    public boolean update(Thjl thjl) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return thjlMapper.update(thjl);
    }


    @Override
    public boolean add(Thjl thjl) {
        return thjlMapper.add(thjl);
    }

    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }

    }






