package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.*;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface KphtService extends IService<Kpht> {

    /**
     * 查询所有
     */
    List<Kpht> getList();


    Page<Map<String, Object>> selectDistinctByDdhPage(Page<Map<String, Object>> page,@Param(Constants.WRAPPER) Wrapper<Map<String, Object>> queryWrapper);

    /**
     * 修改
     */
    boolean update(Kpht kpht);

    /**
     * 删除
     *
     * @param idList 根据id集合删除
     * @return 是否删除成功
     */
    boolean delete(List<Integer> idList);


    /**
     * 根据姓名和部门查询
     */
    List<Kpht> queryList(String name);

    boolean updateField(Integer id, Map<String, Object> updateFields);


}