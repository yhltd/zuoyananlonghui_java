package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Lcd;

import java.util.List;

public interface LcdService extends IService<Lcd>{

    /**
     * 查询所有 - 根据未完成合同动态查询
     */
    List<Lcd> getList();

    /**
     * 根据未完成合同ID查询工艺规程数据
     */
    List<Lcd> getListByUncompletedContracts(String additionalWhere);

    List<HetongVO> refreshUncompletedHetong(String additionalWhere);

    List<Integer> getUncompletedHetongIds(String additionalWhere);

    List<Lcd> getDetailByContractId(String contractId);
}