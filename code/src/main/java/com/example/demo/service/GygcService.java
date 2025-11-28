package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Gygc;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface GygcService extends IService<Gygc> {

    /**
     * 查询所有
     */
    List<Gygc> queryList(String htid);

    /**
     * 修改
     */
    boolean update(Gygc gygc);


    /**
     * 添加
     */
    boolean addBatch(List<Gygc> gygcList);

    /**
     * 批量修改工艺规程
     */
    boolean updateBatch(List<Gygc> gygcList);

    /**
     * 批量新增或修改工艺规程（智能判断）
     */
    boolean saveOrUpdateBatch(List<Gygc> gygcList);

    boolean delete(List<Integer> idList);

    List<Gygc> getList();
}
