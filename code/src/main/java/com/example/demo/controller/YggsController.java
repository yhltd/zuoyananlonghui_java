package com.example.demo.controller;

import com.example.demo.entity.Yggs;
import com.example.demo.service.YggsService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/yggs")
public class YggsController {
    @Autowired
    private YggsService yggsService;

    /**
     * 根据姓名和部门查询
     *
     * @return ResultInfo
     */
    @RequestMapping("/queryList")
    public ResultInfo queryList(String ksrq, String jsrq,  String m, HttpSession session) {
        try {
            // 日期格式转换：确保是SQL Server可以识别的格式
            if (ksrq != null && !ksrq.trim().isEmpty()) {
                ksrq = convertToSqlServerDate(ksrq);
            } else {
                ksrq = "";
            }

            if (jsrq != null && !jsrq.trim().isEmpty()) {
                jsrq = convertToSqlServerDate(jsrq);
            } else {
                jsrq = "";
            }

            // 处理其他参数
            m = (m == null) ? "" : m;


            // 调试日志
            log.info("转换后的日期参数 - ksrq: '{}', jsrq: '{}'", ksrq, jsrq);
            log.info("其他参数 - m: '{}'", m);

            List<Yggs> list = yggsService.queryList(ksrq, jsrq, m);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 转换为SQL Server兼容的日期格式
     * 将 yyyy-MM-dd 转换为 yyyy/MM/dd 格式
     */
    private String convertToSqlServerDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.trim().isEmpty()) {
                return "";
            }

            // 如果已经是 yyyy/MM/dd 格式，直接返回
            if (dateStr.contains("/")) {
                return dateStr;
            }

            // 将 yyyy-MM-dd 转换为 yyyy/MM/dd
            if (dateStr.contains("-")) {
                return dateStr.replace("-", "/");
            }

            // 其他格式直接返回
            return dateStr;
        } catch (Exception e) {
            log.warn("日期格式转换失败: {}, 使用原格式", dateStr);
            return dateStr;
        }
    }



    @RequestMapping("/queryList1")
    public ResultInfo queryList1(String ksrq1, String jsrq1, HttpSession session) {
        try {
            // 日期格式转换
            if (ksrq1 != null && !ksrq1.trim().isEmpty()) {
                ksrq1 = convertToSqlServerDate(ksrq1);
            } else {
                ksrq1 = "";
            }

            if (jsrq1 != null && !jsrq1.trim().isEmpty()) {
                jsrq1 = convertToSqlServerDate(jsrq1);
            } else {
                jsrq1 = "";
            }

            // 调试日志
            log.info("工时汇总查询参数 - ksrq1: '{}', jsrq1: '{}'", ksrq1, jsrq1);

            List<Yggs> list = yggsService.queryList1(ksrq1, jsrq1);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }





}