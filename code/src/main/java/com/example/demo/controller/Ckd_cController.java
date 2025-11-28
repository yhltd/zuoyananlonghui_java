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
}

///**
// * 统一返回结果类
// */
//class ResultInfo {
//    private int code;
//    private String msg;
//    private Object data;
//
//    public static ResultInfo success(String msg) {
//        return success(msg, null);
//    }
//
//    public static ResultInfo success(String msg, Object data) {
//        ResultInfo result = new ResultInfo();
//        result.setCode(200);
//        result.setMsg(msg);
//        result.setData(data);
//        return result;
//    }
//
//    public static ResultInfo error(String msg) {
//        ResultInfo result = new ResultInfo();
//        result.setCode(500);
//        result.setMsg(msg);
//        return result;
//    }
//
//    // getter setter
//    public int getCode() { return code; }
//    public void setCode(int code) { this.code = code; }
//    public String getMsg() { return msg; }
//    public void setMsg(String msg) { this.msg = msg; }
//    public Object getData() { return data; }
//    public void setData(Object data) { this.data = data; }






