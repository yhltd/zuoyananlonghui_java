package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.*;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/ckd")
public class CkdController {
    @Autowired
    private CkdService ckdService;


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


    @RequestMapping("/gettdh")
    public ResultInfo gettdh(HttpSession session) {
        try {
            List<Ckd> getList = ckdService.gettdh();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    @RequestMapping("/searchReturnOrder")
    public ResultInfo searchReturnOrder(HttpSession session,
                                        @RequestParam("returnNo") String returnNo) {
        try {
            List<Ckd> getList = ckdService.getth(returnNo);
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }






}