package com.example.demo.controller;

import com.example.demo.entity.Gx;
import com.example.demo.service.GxService;
import com.example.demo.util.ResultInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/gx")
public class GxController {

    @Autowired
    private GxService gxService;

    /**
     * 查询所有工序配置
     */
    @GetMapping("/getAll")
    public ResultInfo getAllGongxu() {
        try {
            List<Gx> list = gxService.getAllGongxu();
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取工序配置失败：{}", e.getMessage());
            return ResultInfo.error("获取失败!");
        }
    }

    /**
     * 更新工序配置
     */
    @PostMapping("/update")
    public ResultInfo updateGongxu(@RequestBody Gx gx) {
        try {
            System.out.println("更新工序配置: " + gx);
            boolean success = gxService.updateGongxu(gx);
            if (success) {
                return ResultInfo.success("更新成功", gx);
            } else {
                return ResultInfo.error("更新失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("更新工序配置失败：{}", e.getMessage());
            return ResultInfo.error("更新失败: " + e.getMessage());
        }
    }
}