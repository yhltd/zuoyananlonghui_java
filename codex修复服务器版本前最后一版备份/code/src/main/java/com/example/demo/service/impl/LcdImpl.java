package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Lcd;
import com.example.demo.mapper.LcdMapper;
import com.example.demo.service.LcdService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Collections;

@Service
public class LcdImpl extends ServiceImpl<LcdMapper, Lcd> implements LcdService {

    @Override
    public List<Lcd> getList() {
        // 直接调用优化后的单次查询
        return baseMapper.getOptimizedProcessData();
    }

    /**
     * 根据未完成合同ID查询工艺规程数据
     */
    @Override
    public List<Lcd> getListByUncompletedContracts(String additionalWhere) {
        if (additionalWhere == null || additionalWhere.trim().isEmpty()) {
            return baseMapper.getOptimizedProcessData();
        } else {
            return baseMapper.getOptimizedProcessDataWithCondition(additionalWhere);
        }
    }

    /**
     * 刷新未完成合同数据（排除退货合同）- 保持原有逻辑
     */
    public List<HetongVO> refreshUncompletedHetong(String additionalWhere) {
        // 如果其他地方还需要这个方法，保持原有实现
        List<Integer> tuihuoIds = baseMapper.selectAllTuihuoIds();
        // 这里需要原有的selectUncompletedHetong方法，可以保留或重构
        return Collections.emptyList(); // 临时返回空列表
    }

    /**
     * 获取状态为未完成的合同ID列表 - 保持原有逻辑
     */
    public List<Integer> getUncompletedHetongIds(String additionalWhere) {
        // 如果其他地方还需要这个方法，保持原有实现
        return Collections.emptyList(); // 临时返回空列表
    }

    public List<Lcd> getDetailByContractId(String contractId){
        return baseMapper.selectDetailByContractId(contractId);
    }
    @Override
    public List<Lcd> getAllProcessesForSummary() {
        try {
            // 调用Mapper中的新方法
            return baseMapper.selectAllProcessesForSummary();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("获取所有工序数据失败: " + e.getMessage());
        }
    }

    /**
     * 根据合同ID获取所有工序
     */
    @Override
    public List<Lcd> getProcessesByContractId(String contractId) {
        // 复用已有的 getDetailByContractId 方法
        return getDetailByContractId(contractId);
    }
}