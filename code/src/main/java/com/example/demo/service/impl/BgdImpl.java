package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Bgd;
import com.example.demo.mapper.BgdMapper;
import com.example.demo.service.BgdService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class BgdImpl extends ServiceImpl<BgdMapper, Bgd> implements BgdService {


    @Override
    public List<Map<String, Object>> getList() {
        return baseMapper.getOptimizedProcessData();
    }


    @Override
    public List<Map<String, Object>> getContractList() {
        return baseMapper.getContractList();
    }


    public List<HetongVO> refreshUncompletedHetong(String additionalWhere) {
        List<Integer> tuihuoIds = baseMapper.selectAllTuihuoIds();
        return Collections.emptyList();
    }

    public List<Integer> getUncompletedHetongIds(String additionalWhere) {
        return Collections.emptyList();
    }

    public List<Map<String, Object>> getContractDetails(String contractId){

        return baseMapper.getContractDetails(contractId);

    }

    @Override
    public boolean updateProcessSign(String contractId, String processName, String employeeSign, String completionTime, Integer id) {
        try {
            return baseMapper.updateProcessSign(contractId, processName, employeeSign, completionTime, id) > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean deductWorkHours(Integer id, Double newHours, Double deductHours, String deductReason) {
        try {
            int affectedRows = baseMapper.updateWorkHours(id, newHours);
            // 这里可以添加扣款记录到日志表（可选）
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean resetProcess(Integer id, String resetReason) {
        try {
            int affectedRows = baseMapper.resetProcessSign(id);
            // 这里可以添加工序复工记录到日志表（可选）
            return affectedRows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
