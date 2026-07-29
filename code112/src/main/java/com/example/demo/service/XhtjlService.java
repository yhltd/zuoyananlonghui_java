package com.example.demo.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Htjl;
import com.example.demo.entity.Xhtjl;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface XhtjlService extends IService<Xhtjl> {


    /**
     * 查询所有（排除退货记录中已存在的数据）
     */
    List<Xhtjl> getListExcludeThjl();

    /**
     * 修改
     */
    boolean update(Xhtjl htjl);

    /**
     * 添加
     * @return
     */
    boolean add(Xhtjl htjl);

    /**
     * 删除
     *
     * @param idList 根据id集合删除
     * @return 是否删除成功
     */
    boolean delete(List<Integer> idList);


    /**
     * 根据姓名和部门查询c列和f列
     */
    List<Xhtjl> queryList(String name, String department);



    //    退货单
    boolean save(Xhtjl htjl);
    String getddh();

    Page<Map<String, Object>> selectDistinctByDdhPage(Page<Map<String, Object>> page, @Param(Constants.WRAPPER) Wrapper<Map<String, Object>> queryWrapper);



//出库单

    boolean save1(Xhtjl htjl);
    String getddh1();

    /**
     * 根据ID查询合同记录
     */
    Xhtjl getById(String id);


    /**
     * 根据多个ID查询合同记录
     */
    List<Xhtjl> getByIds(List<String> ids);

    boolean updateField(Integer id, Map<String, Object> updateFields);

    Map<String, Object> importExcelData(List<Map<String, Object>> records);

    List<Xhtjl> getCustomerList();

}