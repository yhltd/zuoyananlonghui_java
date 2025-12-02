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
}