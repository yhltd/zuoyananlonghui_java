package com.example.demo.controller;

import com.example.demo.entity.Ywc;
import com.example.demo.service.XywcService;
import com.example.demo.service.YwcService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/xywc")
public class XywcController {
    @Autowired
    private XywcService xywcService;


    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @PostMapping("/getList")
    public ResultInfo getYwcPage(@RequestBody Map<String, Object> params, HttpSession session) {
        try {
            log.info("收到分页查询请求，参数：{}", params);

            // 提取分页参数
            Integer pageNum = (Integer) params.get("pageNum");
            Integer pageSize = (Integer) params.get("pageSize");

            // 提取查询条件
            String name = (String) params.get("name");
            String hetongZhuangtai = (String) params.get("hetongZhuangtai");
            String hetongHao = (String) params.get("hetongHao");
            String renwuHao = (String) params.get("renwuHao");

            // 创建分页请求对象
            YwcPageRequest request = new YwcPageRequest();
            request.setPageNum(pageNum != null ? pageNum : 1);
            request.setPageSize(pageSize != null ? pageSize : 15);

            // 设置查询条件
            if (name != null && !name.trim().isEmpty()) {
                request.setName(name.trim());
            }
            if (hetongZhuangtai != null && !hetongZhuangtai.trim().isEmpty()) {
                request.setHetongzhuangtai(hetongZhuangtai.trim());
            }
            if (hetongHao != null && !hetongHao.trim().isEmpty()) {
                request.setHetongHao(hetongHao.trim());
            }
            if (renwuHao != null && !renwuHao.trim().isEmpty()) {
                request.setRenwuHao(renwuHao.trim());
            }

            // 调用服务层方法
            PageResult<Ywc> pageResult = xywcService.getYwcPage(request);

            return ResultInfo.success("获取成功", pageResult);
        } catch (Exception e) {
            log.error("获取已完成合同分页失败：{}", e.getMessage(), e);
            return ResultInfo.error("查询失败: " + e.getMessage());
        }
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

            boolean success = xywcService.updateField(id, params);

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
    public ResultInfo delete(@RequestBody HashMap map, HttpSession session) {
        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

//        Ywc ywc = GsonUtil.toEntity(SessionUtil.getToken(session), Ywc.class);
//        System.out.println(ywc);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                xywcService.delete(Collections.singletonList(this_id));
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
//        Ywc ywc = GsonUtil.toEntity(SessionUtil.getToken(session), Ywc.class);
        try {
            List<Ywc> list = xywcService.queryList(name);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


}
