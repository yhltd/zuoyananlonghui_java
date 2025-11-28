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

@Slf4j
@RestController
@RequestMapping("/ckd")
public class CkdController {
    @Autowired
    private CkdService ckdService;



//    /**
//     * 添加
//     */
//    @RequestMapping("/save1")
//    public ResultInfo save1(@RequestBody Ckd ckd, HttpSession session) {
//        try {
//            System.out.println("=== 接收退货单新增请求 ===");
//            System.out.println("出库单号: " + ckd.getF());
//            System.out.println("往来单位: " + ckd.getC());
//            System.out.println("合同号: " + ckd.getG());
//            System.out.println("产品名称: " + ckd.getI());
//            System.out.println("数量: " + ckd.getL());
//            System.out.println("单价: " + ckd.getM());
//            System.out.println("金额: " + ckd.getN());
//
//            // 直接插入数据
//            boolean result = ckdService.save1(ckd);
//            System.out.println("插入结果: " + result);
//
//            if (result) {
//                return ResultInfo.success("添加成功");
//            } else {
//                return ResultInfo.error("添加失败");
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResultInfo.error("添加失败: " + e.getMessage());
//        }
//    }
//
//
//    @RequestMapping("/getddh1")
//    public ResultInfo getddh1(HttpSession session) {
//        Ckd ckd = GsonUtil.toEntity(SessionUtil.getToken(session), Ckd.class);
//        try {
//            String getList = ckdService.getddh1();
//            return ResultInfo.success("获取成功", getList);
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error("获取失败：{}", e.getMessage());
//            return ResultInfo.error("错误!");
//        }
//    }





    @RequestMapping("/getByIds")
    public ResultInfo getByIds(@RequestParam List<String> ids, HttpSession session) {
        try {
            List<Ckd> dataList = ckdService.getByIds(ids);
            return ResultInfo.success("查询成功", dataList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("根据多个ID查询失败：{}", e.getMessage());
            return ResultInfo.error("查询失败!");
        }
    }




//    /**
//     * 保存出库单
//     */
//    @RequestMapping("/saveReturnOrder")
//    public ResultInfo saveReturnOrder(@RequestBody Map<String, Object> request, HttpSession session) {
//        try {
//            log.info("接收到保存出库单请求");
//
//            // 转换数据
//            CkdMain ckdMain = convertToCkdMain(request);
//
//            boolean success = ckdService.saveReturnOrder(ckdMain);
//
//            if (success) {
//                return ResultInfo.success("保存成功");
//            } else {
//                return ResultInfo.error("保存失败");
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error("保存出库单失败：{}", e.getMessage());
//            return ResultInfo.error("保存失败: " + e.getMessage());
//        }
//    }
//
//    // 数据转换方法 - 严格按照前端字段
//    private CkdMain convertToCkdMain(Map<String, Object> request) {
//        CkdMain ckdMain = new CkdMain();
//
//        // 设置主表信息 - 只有往来单位
//        ckdMain.setCustomer((String) request.get("customer"));  // c字段
//
//        // 处理明细数据
//        List<Map<String, Object>> details = (List<Map<String, Object>>) request.get("details");
//        if (details != null && !details.isEmpty()) {
//            List<CkdDetail> detailList = new ArrayList<>();
//            for (Map<String, Object> detailMap : details) {
//                CkdDetail detail = new CkdDetail();
//                // 严格按照表格字段设置值
//                detail.setXuhao(getStringValue(detailMap, "xuhao"));
//                detail.setContractNo(getStringValue(detailMap, "contractNo"));      // d字段
//                detail.setTaskNo(getStringValue(detailMap, "taskNo"));              // e字段
//                detail.setGongxu(getStringValue(detailMap, "gongxu"));              // g字段
//                detail.setProductName(getStringValue(detailMap, "productName"));    // h字段
//                detail.setDrawingNo(getStringValue(detailMap, "drawingNo"));        // i字段
//                detail.setUnit(getStringValue(detailMap, "unit"));                  // j字段
//                detail.setQuantity(getStringValue(detailMap, "quantity"));          // k字段
//                detail.setUnitPrice(getStringValue(detailMap, "unitPrice"));
//                detail.setAmount(getStringValue(detailMap, "amount"));
//                detail.setMaterial(getStringValue(detailMap, "material"));          // l字段
//                detail.setWeight(getStringValue(detailMap, "weight"));              // n字段
//                detail.setRemark(getStringValue(detailMap, "remark"));              // r字段
//
//                detailList.add(detail);
//            }
//            ckdMain.setDetails(detailList);
//        }
//
//        return ckdMain;
//    }
//
//    // 安全的获取字符串值
//    private String getStringValue(Map<String, Object> map, String key) {
//        Object value = map.get(key);
//        return value != null ? value.toString() : "";
//    }

}