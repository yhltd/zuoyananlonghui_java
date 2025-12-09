package com.example.demo.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
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
@RequestMapping("/kpht")
public class KphtController {
    @Autowired
    private KphtService kphtService;


    /**
     * 查询所有
     *
     * @return ResultInfo
     */
//    @RequestMapping("/getList")
//    public ResultInfo getList(HttpSession session) {
////        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
//        try {
//            // 执行查询
//            PageResult<Xdmx> result = xdmxService.getScgdPage(request);
//            return Result.success(result);
//            List<Kpht> getList = kphtService.getList();
//            return ResultInfo.success("获取成功", getList);
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error("获取失败：{}", e.getMessage());
//            return ResultInfo.error("错误!");
//        }
//    }
    @RequestMapping("/getList")
    public Result<Page<Map<String, Object>>> distinctPage(HttpSession session, @RequestBody PageRequest pageRequest) {
        // 创建分页对象
        Page<Map<String, Object>> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());

        // 构建查询条件
        QueryWrapper<Map<String, Object>> queryWrapper = new QueryWrapper<>();
        System.out.println("=== 接收到的参数 ===");
        System.out.println("pageNum: " + pageRequest.getPageNum());
        System.out.println("pageSize: " + pageRequest.getPageSize());
        System.out.println("C字段值: " + pageRequest.getC());
        System.out.println("C是否为空: " + (pageRequest.getC() == null));
        System.out.println("C是否空白: " + StringUtils.isBlank(pageRequest.getC()));

        // 添加查询条件
        if (StringUtils.isNotBlank(pageRequest.getC())) {
            queryWrapper.like("c", pageRequest.getC());
        }

        // 执行查询 - 通过Service调用
        Page<Map<String, Object>> result = kphtService.selectDistinctByDdhPage(page,queryWrapper);

        return Result.success(result);
    }

    @PostMapping("/updateField")
    public Result<?> updateField(@RequestBody Map<String, Object> params) {
        try {
            System.out.println("更新字段请求:" + params);

            Integer id = (Integer) params.get("id");
            if (id == null) {
                return Result.error("ID不能为空");
            }

            // 移除id，剩下的就是需要更新的字段
            params.remove("id");

            if (params.isEmpty()) {
                return Result.error("没有要更新的字段");
            }

            boolean success = kphtService.updateField(id, params);

            if (success) {
                return Result.success("更新成功");
            } else {
                return Result.error("更新失败");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("系统错误: " + e.getMessage());
        }
    }



    /**
     * 删除
     *
     * @param map
     * @return ResultInfo
     */
    @RequestMapping("/delete")
    public ResultInfo delete(@RequestBody HashMap map,HttpSession session) {

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

//        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
//        System.out.println(kpht);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                kphtService.delete(Collections.singletonList(this_id));
            }
            return ResultInfo.success("删除成功", idList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("删除失败：{}", e.getMessage());
            log.error("参数：{}", idList);
            return ResultInfo.error("删除失败");
        }
    }



    /**
     * 根据姓名和部门查询
     *
     * @return ResultInfo
     */
    @RequestMapping("/queryList")
    public ResultInfo queryList(String name, HttpSession session) {
//        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
        try {
            List<Kpht> list = kphtService.queryList(name);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }
}