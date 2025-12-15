package com.example.demo.controller;

import com.example.demo.entity.Gygc;
import com.example.demo.entity.UserInfo;
import com.example.demo.mapper.HtjlMapper;
import com.example.demo.service.GygcService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/gygc")
public class GygcController {
    @Autowired
    private GygcService gygcService;

    @Autowired
    private HtjlMapper htjlMapper;

    @RequestMapping("/queryList")
    public ResultInfo queryList(String htid, HttpSession session) {

        try {
            List<Gygc> list = gygcService.queryList(htid);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


    /**
     * 修改
     */
    @RequestMapping(value = "/updateBatch", method = RequestMethod.POST)
    public ResultInfo updateBatch(@RequestBody List<Gygc> gygcList, HttpSession session) {
        try {
            if (gygcList == null || gygcList.isEmpty()) {
                return ResultInfo.error("数据不能为空");
            }

            System.out.println("接收到的数据条数: " + gygcList.size());

            // 调用批量修改服务
            boolean success = gygcService.updateBatch(gygcList);
            if (success) {
                updateHetongZhuangtaiBasedOnGongyiGuicheng();
                return ResultInfo.success("批量修改成功，共修改 " + gygcList.size() + " 条记录", gygcList);
            } else {
                return ResultInfo.error("批量修改失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("批量修改失败", e);
            return ResultInfo.error("批量修改失败：" + e.getMessage());
        }
    }

    /**
     * 根据gongyi_guicheng表数据更新hetong_jilu表的zhuangtai字段
     */
    private void updateHetongZhuangtaiBasedOnGongyiGuicheng() {


        updateZhuangtaiBySQL();

    }

    /**
     * 使用SQL直接更新hetong_jilu表的zhuangtai字段
     */
    private void updateZhuangtaiBySQL() {
        // 执行SQL更新
        try {
            System.out.println("开始更新hetong_jilu表的zhuangtai字段...");

            // 使用MyBatis Mapper执行更新
            int unfinishedRows = htjlMapper.updateZhuangtaiForUnfinished();
            int completedRows = htjlMapper.updateZhuangtaiForCompleted();

            System.out.println("更新完成：未完成=" + unfinishedRows + "条，已完成=" + completedRows + "条");
            System.out.println("hetong_jilu表的zhuangtai字段更新完成");
        } catch (Exception e) {
            log.error("更新hetong_jilu表zhuangtai字段失败", e);
        }
    }



    @RequestMapping(value = "/addBatch", method = RequestMethod.POST)
    public ResultInfo addBatch(@RequestBody List<Gygc> gygcList, HttpSession session) {
        try {
            if (gygcList == null || gygcList.isEmpty()) {
                return ResultInfo.error("数据不能为空");
            }

            System.out.println("接收到的数据条数: " + gygcList.size());

            // 调用批量新增服务
            boolean success = gygcService.addBatch(gygcList);
            if (success) {
                updateHetongZhuangtaiBasedOnGongyiGuicheng();
                return ResultInfo.success("批量添加成功，共添加 " + gygcList.size() + " 条记录", gygcList);
            } else {
                return ResultInfo.error("批量添加失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("批量添加失败", e);
            return ResultInfo.error("批量添加失败：" + e.getMessage());
        }
    }


    /**
     * 智能批量保存工艺规程（自动判断新增或修改）
     */
    @PostMapping("/saveBatch")
    public ResultInfo saveBatch(@RequestBody HashMap map, HttpSession session) {
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        try {
            List<Gygc> gygcList = GsonUtil.toList(gsonUtil.get("saveBatchInfo"), Gygc.class);

            if (gygcList == null || gygcList.isEmpty()) {
                return ResultInfo.error("数据不能为空");
            }

            // 统计新增和修改的数量
            long insertCount = gygcList.stream().filter(item -> item.getId() == null).count();
            long updateCount = gygcList.stream().filter(item -> item.getId() != null).count();

            boolean success = gygcService.saveOrUpdateBatch(gygcList);
            if (success) {
                String message = "保存成功";
                if (insertCount > 0) {
                    message += "，新增 " + insertCount + " 条";
                }
                if (updateCount > 0) {
                    message += "，修改 " + updateCount + " 条";
                }
                return ResultInfo.success(message);
            } else {
                return ResultInfo.error("保存失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("批量保存失败：{}", e.getMessage());
            return ResultInfo.error("批量保存失败：" + e.getMessage());
        }
    }

    @RequestMapping("/delete")
    public ResultInfo delete(@RequestBody HashMap map,HttpSession session) {

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

//        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);

        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                gygcService.delete(Collections.singletonList(this_id));
            }
            return ResultInfo.success("删除成功", idList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("删除失败：{}", e.getMessage());
            log.error("参数：{}", idList);
            return ResultInfo.error("删除失败");
        }
    }



    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
//        Gygc gygc = GsonUtil.toEntity(SessionUtil.getToken(session), Gygc.class);
        try {
            List<Gygc> getList = gygcService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }
}
