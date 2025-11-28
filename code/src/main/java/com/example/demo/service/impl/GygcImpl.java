package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Gygc;

import com.example.demo.mapper.GygcMapper;
import com.example.demo.service.GygcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GygcImpl extends ServiceImpl<GygcMapper, Gygc> implements GygcService {
    @Autowired
    GygcMapper gygcMapper;


    @Override
    public List<Gygc> queryList(String htid) {
        return gygcMapper.queryList(htid);
    }

    @Override
    public boolean update(Gygc gygc) { return updateById(gygc); }


    @Override
    public boolean addBatch(List<Gygc> gygcList) {
        try {
            for (Gygc gygc : gygcList) {
                baseMapper.insert(gygc);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean updateBatch(List<Gygc> gygcList) {
        if (gygcList == null || gygcList.isEmpty()) {
            return false;
        }
        try {
            // 方法1: 使用MyBatis-Plus的批量更新
            return this.updateBatchById(gygcList);

            // 方法2: 使用自定义的Mapper批量更新（性能更好）
            // return baseMapper.updateBatch(gygcList);
        } catch (Exception e) {
            log.error("批量更新工艺规程失败: {}", e);
            return false;
        }
    }

    @Override
    public boolean saveOrUpdateBatch(List<Gygc> gygcList) {
        if (gygcList == null || gygcList.isEmpty()) {
            return false;
        }
        try {
            // 分离新增和修改的数据
            List<Gygc> toInsert = new ArrayList<>();
            List<Gygc> toUpdate = new ArrayList<>();

            for (Gygc item : gygcList) {
                if (item.getId() == null) {
                    toInsert.add(item);
                } else {
                    toUpdate.add(item);
                }
            }

            boolean insertSuccess = true;
            boolean updateSuccess = true;

            // 批量新增
            if (!toInsert.isEmpty()) {
                insertSuccess = this.addBatch(toInsert);
            }

            // 批量修改
            if (!toUpdate.isEmpty()) {
                updateSuccess = this.updateBatch(toUpdate);
            }

            return insertSuccess && updateSuccess;
        } catch (Exception e) {
            log.error("批量保存工艺规程失败: {}", e);
            return false;
        }
    }

    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }

    @Override
    public List<Gygc> getList() {  // 方法名必须一致
        return gygcMapper.getList();
    }

}
