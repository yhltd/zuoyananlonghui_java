package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.mapper.KphtMapper;
import com.example.demo.mapper.YwcMapper;
import com.example.demo.service.HtjlService;
import com.example.demo.service.KphtService;
import com.example.demo.service.YwcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class KphtImpl extends ServiceImpl<KphtMapper, Kpht> implements KphtService {
    @Autowired
    KphtMapper kphtMapper;


    @Override
    public List<Kpht> getList() {  // 方法名必须一致
        return kphtMapper.getList();
    }


    @Override
    public boolean update(Kpht kpht) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return kphtMapper.update(kpht);
    }



    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }


    @Override
    public List<Kpht> queryList(String name) {
        return kphtMapper.queryList(name);
    }
}