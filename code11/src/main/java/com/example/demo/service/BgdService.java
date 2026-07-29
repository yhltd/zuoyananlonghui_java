package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Bgd;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface BgdService extends IService<Bgd> {


    /**
     * 查询所有 - 根据未完成合同动态查询
     */
    List<Map<String, Object>> getList();


    /**
     * 查询合同数据 - 返回待完成和已完成的合同（排除退货合同）
     */
    List<Map<String, Object>> getContractList();


    List<Map<String, Object>> getContractDetails(String contractId);

    boolean updateProcessSign(String contractId, String processName, String employeeSign, String completionTime, Integer id);

    boolean deductWorkHours(Integer id, Double newHours, Double deductHours, String deductReason);

    boolean resetProcess(Integer id, String resetReason);



}
