package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Pzb;
import com.example.demo.mapper.PzbMapper;
import com.example.demo.service.PzbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PzbImpl extends ServiceImpl<PzbMapper, Pzb> implements PzbService {
    @Autowired
    PzbMapper pzbMapper;


    @Override
    public List<Pzb> getList() {  // 方法名必须一致
        return pzbMapper.getList();
    }


    @Override
    public boolean update(Pzb pzb) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return pzbMapper.update(pzb);
    }
    @Override
    public boolean add(Pzb pzb) {
        boolean result = pzbMapper.add(pzb);
        System.out.println("插入结果: " + result);
        System.out.println("插入后的ID: " + pzb.getId());  // 检查ID是否设置
        return result;
    }

    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }
}