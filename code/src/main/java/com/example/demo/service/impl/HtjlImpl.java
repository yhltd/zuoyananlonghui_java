package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.service.HtjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class HtjlImpl extends ServiceImpl<HtjlMapper, Htjl> implements HtjlService {
    @Autowired
    HtjlMapper htjlMapper;


//    @Override
//    public List<Htjl> getList() {  // 方法名必须一致
//        return htjlMapper.getList();
//    }
@Override
public List<Htjl> getListExcludeThjl() {
    return htjlMapper.getListExcludeThjl();
}



    @Override
    public boolean update(Htjl htjl) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return htjlMapper.update(htjl);
    }



    @Override
    public boolean add(Htjl htjl) {
        return htjlMapper.add(htjl);
    }



    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }



    @Override
    public List<Htjl> queryList(String name, String department) {
        return htjlMapper.queryList(name, department);
    }




//    退货单
    @Override
    public boolean save(Htjl htjl) {
        return htjlMapper.save(htjl);
    }
    @Override
    public String getddh() {  // 方法名必须一致
        return htjlMapper.getddh();
    }


//出库单
    @Override
    public boolean save1(Htjl htjl) {
        return htjlMapper.save1(htjl);
    }
    @Override
    public String getddh1() {  // 方法名必须一致
        return htjlMapper.getddh1();
    }







//    @Override
//    public Htjl getById(String id) {
//        return htjlMapper.getById(id);
//    }
//
//    @Override
//    public List<Htjl> getByIds(List<String> ids) {
//        if (ids == null || ids.isEmpty()) {
//            return new ArrayList<>();
//        }
//        return htjlMapper.getByIds(ids);
//    }



    @Override
    public Htjl getById(String id) {
        return htjlMapper.getById(id);
    }

    @Override
    public List<Htjl> getByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return htjlMapper.getByIds(ids);
    }



}