package com.example.demo.controller;

import com.example.demo.dto.HetongVO;
import com.example.demo.entity.Lcd;
import com.example.demo.entity.UserInfo;
import com.example.demo.service.LcdService;
import com.example.demo.util.GsonUtil;
import com.example.demo.util.ResultInfo;
import com.example.demo.util.SessionUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
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
        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
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
        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
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
}