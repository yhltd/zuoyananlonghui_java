package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.*;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/ckd_c")
public class Ckd_cController {
    @Autowired
    private Ckd_cService ckd_cService;

    /**
     * 保存出库单
     */
    @PostMapping("/saveReturnOrder")
    public ResultInfo saveReturnOrder(@RequestBody Map<String, Object> request, HttpSession session) {
        try {
            log.info("接收到保存出库单请求");
            log.info("请求数据详情 - 往来单位: {}, 明细条数: {}",
                    request.get("customer"),
                    request.get("details") != null ? ((java.util.List) request.get("details")).size() : 0);

            // 调用保存服务
            boolean success = ckd_cService.saveReturnOrder(request);

            if (success) {
                log.info("出库单保存成功");
                return ResultInfo.success("保存成功");
            } else {
                log.error("出库单保存失败");
                return ResultInfo.error("保存失败");
            }

        } catch (Exception e) {
            log.error("保存出库单异常：{}", e.getMessage(), e);
            return ResultInfo.error("保存失败: " + e.getMessage());
        }
    }


    /**
     * 检查单号是否重复
     */
    @GetMapping("/checkDuplicateOrder")
    public ResultInfo checkDuplicateOrder(@RequestParam String chukudanhao) {
        try {
            boolean exists = ckd_cService.checkOrderExists(chukudanhao);

            // 创建包含检查结果的Map
            Map<String, Object> data = new HashMap<>();
            data.put("exists", exists);
            data.put("chukudanhao", chukudanhao);

            return ResultInfo.success("检查成功", data); // ✅ 返回包含exists的数据
        } catch (Exception e) {
            return ResultInfo.error("检查失败: " + e.getMessage());
        }
    }

    /**
     * 删除重复单号数据
     */
    @PostMapping("/deleteDuplicateOrder")
    public ResultInfo deleteDuplicateOrder(HttpSession session,@RequestBody Map<String, String> params) {
        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        try {
            String chukudanhao = params.get("chukudanhao");
            ckd_cService.deleteByOrderNo(chukudanhao);
            return ResultInfo.success("删除重复数据成功");
        } catch (Exception e) {
            return ResultInfo.error("删除失败: " + e.getMessage());
        }
    }


    @PostMapping("/updateContractStatus")
    public ResultInfo updateContractStatus(@RequestBody Map<String, Object> params) {
        try {
            @SuppressWarnings("unchecked")
            List<String> contractIds = (List<String>) params.get("contractIds");
            String chukuriqi = (String) params.get("chukuriqi");
            String chukudanhao = (String) params.get("chukudanhao");

            ckd_cService.updateContractStatus(contractIds, chukuriqi, chukudanhao);
            return ResultInfo.success("合同状态更新成功");
        } catch (Exception e) {
            return ResultInfo.error("合同状态更新失败: " + e.getMessage());
        }
    }




    /**
     * 根据合同号查询合同ID
     */
    @PostMapping("/getContractIdsByNumbers")
    public ResultInfo getContractIdsByNumbers(@RequestBody Map<String, Object> params) {
        try {
            @SuppressWarnings("unchecked")
            List<String> contractNumbers = (List<String>) params.get("contractNumbers");

            List<Map<String, Object>> contractInfo = ckd_cService.getContractInfoByNumbers(contractNumbers);

            // 提取合同ID列表
            List<String> contractIds = contractInfo.stream()
                    .map(info -> info.get("id").toString())
                    .collect(Collectors.toList());

            Map<String, Object> data = new HashMap<>();
            data.put("contractIds", contractIds);
            data.put("contractInfo", contractInfo);

            return ResultInfo.success("查询成功", data);
        } catch (Exception e) {
            return ResultInfo.error("查询失败: " + e.getMessage());
        }
    }


}


