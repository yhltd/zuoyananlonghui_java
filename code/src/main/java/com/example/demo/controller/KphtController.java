package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.*;
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
@RequestMapping("/kpht")
public class KphtController {
    @Autowired
    private KphtService kphtService;


    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
        try {
            List<Kpht> getList = kphtService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


    /**
     * 修改
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public ResultInfo update(@RequestBody String updateJson, HttpSession session) {
        try {
            System.out.println("接收到的JSON: " + updateJson);

            // 这里应该能正确映射C、D、E、F字段
            Kpht kpht = GsonUtil.toEntity(updateJson, Kpht.class);

            System.out.println("c: " + kpht.getC());
            System.out.println("d: " + kpht.getD());
            System.out.println("e: " + kpht.getE());
            System.out.println("f: " + kpht.getF());
            System.out.println("g: " + kpht.getG());
            System.out.println("h: " + kpht.getH());
            System.out.println("i: " + kpht.getI());
            System.out.println("j: " + kpht.getJ());
            System.out.println("k: " + kpht.getK());
            System.out.println("l: " + kpht.getL());
            System.out.println("m: " + kpht.getM());
            System.out.println("n: " + kpht.getN());
            System.out.println("o: " + kpht.getO());
            System.out.println("p: " + kpht.getP());
            System.out.println("q: " + kpht.getQ());
            System.out.println("r: " + kpht.getR());
            System.out.println("s: " + kpht.getS());
            System.out.println("t: " + kpht.getT());
            System.out.println("u: " + kpht.getU());
            System.out.println("v: " + kpht.getV());
            System.out.println("w: " + kpht.getW());
            System.out.println("x: " + kpht.getX());
            System.out.println("y: " + kpht.getY());
            System.out.println("z: " + kpht.getZ());
            System.out.println("aa: " + kpht.getAa());
            System.out.println("ab: " + kpht.getAb());
            System.out.println("ac: " + kpht.getAc());
            System.out.println("ad: " + kpht.getAd());
            System.out.println("ae: " + kpht.getAe());
            System.out.println("af: " + kpht.getAf());
            System.out.println("ag: " + kpht.getAg());
            System.out.println("ah: " + kpht.getAh());
            System.out.println("ai: " + kpht.getAi());
            System.out.println("aj: " + kpht.getAj());
            System.out.println("ak: " + kpht.getAk());
            System.out.println("al: " + kpht.getAl());
            System.out.println("am: " + kpht.getAm());
            System.out.println("an: " + kpht.getAn());
            System.out.println("ao: " + kpht.getAo());
            System.out.println("ap: " + kpht.getAp());
            System.out.println("aq: " + kpht.getAq());
            System.out.println("ar: " + kpht.getAr());
            System.out.println("as: " + kpht.getAs());
            System.out.println("at: " + kpht.getAt());
            System.out.println("au: " + kpht.getAu());
            System.out.println("av: " + kpht.getAv());
            System.out.println("aw: " + kpht.getAw());
            System.out.println("ax: " + kpht.getAx());

            if (kphtService.update(kpht)) {
                return ResultInfo.success("修改成功", kpht);
            } else {
                return ResultInfo.error("修改失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("修改失败：{}", e.getMessage());
            return ResultInfo.error("修改失败: " + e.getMessage());
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
        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
        System.out.println(kpht);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
//        if(!userInfo.getPower().equals("管理员")){
//            return ResultInfo.error(401, "无权限");
//        }
        try {
            for (int i = 0; i < idList.size(); i++) {
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
        Kpht kpht = GsonUtil.toEntity(SessionUtil.getToken(session), Kpht.class);
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