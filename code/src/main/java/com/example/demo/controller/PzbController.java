package com.example.demo.controller;


import com.example.demo.entity.Pzb;

import com.example.demo.service.PzbService;
import com.example.demo.util.GsonUtil;
import com.example.demo.util.ResultInfo;
import com.example.demo.util.SessionUtil;
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

@Slf4j
@RestController
@RequestMapping("/pzb")
public class PzbController {
    @Autowired
    private PzbService pzbService;



    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
        Pzb pzb = GsonUtil.toEntity(SessionUtil.getToken(session), Pzb.class);
        try {
            List<Pzb> getList = pzbService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public ResultInfo update(@RequestBody String updateJson, HttpSession session) {
        try {
            Pzb pzb = GsonUtil.toEntity(updateJson, Pzb.class);

            if (pzbService.update(pzb)) {
                return ResultInfo.success("修改成功", pzb);
            } else {
                return ResultInfo.success("修改失败", pzb);
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("修改失败：{}", e.getMessage());
//            log.error("参数：{}", userInfo);
            return ResultInfo.error("修改失败");
        }
    }


    @RequestMapping("/add")
    public ResultInfo add(@RequestBody Pzb pzb, HttpSession session) {
        try {


            // 插入新用户数据
            boolean result = pzbService.add(pzb);
            System.out.println("插入结果: " + result);

            if (result) {
                return ResultInfo.success("添加成功", pzb);
            } else {
                return ResultInfo.error("添加失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("添加失败：{}", e.getMessage());
            return ResultInfo.error("添加失败: " + e.getMessage());
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
        Pzb pzb = GsonUtil.toEntity(SessionUtil.getToken(session), Pzb.class);
        System.out.println(pzb);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
//        if(!userInfo.getPower().equals("管理员")){
//            return ResultInfo.error(401, "无权限");
//        }
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                pzbService.delete(Collections.singletonList(this_id));
            }
            return ResultInfo.success("删除成功", idList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("删除失败：{}", e.getMessage());
            log.error("参数：{}", idList);
            return ResultInfo.error("删除失败");
        }
    }

}