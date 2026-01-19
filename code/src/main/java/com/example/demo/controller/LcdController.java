package com.example.demo.controller;

import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Lcd;
import com.example.demo.entity.UserInfo;
import com.example.demo.service.LcdService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
@Slf4j
@RestController
@RequestMapping("/lcd")
public class LcdController {

    @Autowired
    private LcdService lcdService;

    /**
     * 查询工艺规程数据 - 根据未完成合同动态查询
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {


//        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        try {
            List<Lcd> getList = lcdService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 根据条件查询工艺规程数据
     */
    @PostMapping("/getListByCondition")
    public ResultInfo getListByCondition(@RequestParam(required = false) String where, HttpSession session) {
//        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        try {
            List<Lcd> getList = lcdService.getListByUncompletedContracts(where);
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 获取未完成合同数据
     */
    @PostMapping("/uncompleted")
    public List<HetongVO> getUncompletedHetong(@RequestParam(required = false) String where) {
        return lcdService.refreshUncompletedHetong(where);
    }

    /**
     * 获取未完成合同的ID列表
     */
    @PostMapping("/uncompleted-ids")
    public List<Integer> getUncompletedHetongIds(@RequestParam(required = false) String where) {
        return lcdService.getUncompletedHetongIds(where);
    }

    @PostMapping("/getDetail")
    public ResultInfo getDetail(@RequestParam("contractId") String contractId) {
        try {
            if (contractId == null || contractId.trim().isEmpty()) {
                return ResultInfo.error(400, "合同ID不能为空");
            }

            List<Lcd> detail = lcdService.getDetailByContractId(contractId);
            if (detail != null && !detail.isEmpty()) {
                return ResultInfo.success("获取工艺规程详情成功", detail);
            } else {
                return ResultInfo.error(404, "未找到合同ID为 " + contractId + " 的工艺规程数据");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error(500, "系统错误，获取工艺规程详情失败");
        }
    }
    @PostMapping("/getAllProcessesForSummary")
    public ResultInfo getAllProcessesForSummary(HttpSession session) {
        try {
            log.info("开始获取所有工序数据用于工时汇总统计...");

            List<Lcd> allProcesses = lcdService.getAllProcessesForSummary();

            log.info("成功获取 {} 条工序数据", allProcesses.size());

            if (allProcesses != null && !allProcesses.isEmpty()) {
                // 调试信息：打印前几条数据
                for (int i = 0; i < Math.min(5, allProcesses.size()); i++) {
                    Lcd process = allProcesses.get(i);
                    log.debug("工序数据 {}: C={}, J={}, L={}, M={}",
                            i+1, process.getC(), process.getJ(), process.getL(), process.getM());
                }

                return ResultInfo.success("获取所有工序数据成功", allProcesses);
            } else {
                log.warn("没有获取到工序数据");
                return ResultInfo.success("没有工序数据", Collections.emptyList());
            }
        } catch (Exception e) {
            log.error("获取所有工序数据失败: {}", e.getMessage(), e);
            return ResultInfo.error("获取工序数据失败: " + e.getMessage());
        }
    }

    /**
     * 批量获取多个合同的工序数据
     */
    @PostMapping("/getProcessesByContractIds")
    public ResultInfo getProcessesByContractIds(@RequestParam("contractIds") List<String> contractIds) {
        try {
            if (contractIds == null || contractIds.isEmpty()) {
                return ResultInfo.error("合同ID列表不能为空");
            }

            log.info("批量获取 {} 个合同的工序数据", contractIds.size());

            List<Lcd> allProcesses = new ArrayList<>();

            for (String contractId : contractIds) {
                try {
                    List<Lcd> processes = lcdService.getDetailByContractId(contractId);
                    if (processes != null && !processes.isEmpty()) {
                        allProcesses.addAll(processes);
                    }
                } catch (Exception e) {
                    log.warn("获取合同 {} 的工序失败: {}", contractId, e.getMessage());
                    // 继续处理其他合同
                }
            }

            log.info("总共获取到 {} 条工序数据", allProcesses.size());
            return ResultInfo.success("获取工序数据成功", allProcesses);
        } catch (Exception e) {
            log.error("批量获取工序数据失败: {}", e.getMessage(), e);
            return ResultInfo.error("获取工序数据失败: " + e.getMessage());
        }
    }
}