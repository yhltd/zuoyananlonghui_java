package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.YwcService;
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

@Slf4j
@RestController
@RequestMapping("/ywc")
public class YwcController {
    @Autowired
    private YwcService ywcService;


    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
        Ywc ywc = GsonUtil.toEntity(SessionUtil.getToken(session), Ywc.class);
        try {
            List<Ywc> getList = ywcService.getList();
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
            Ywc ywc = GsonUtil.toEntity(updateJson, Ywc.class);

            System.out.println("c: " + ywc.getC());
            System.out.println("d: " + ywc.getD());
            System.out.println("e: " + ywc.getE());
            System.out.println("f: " + ywc.getF());
            System.out.println("g: " + ywc.getG());
            System.out.println("h: " + ywc.getH());
            System.out.println("i: " + ywc.getI());
            System.out.println("j: " + ywc.getJ());
            System.out.println("k: " + ywc.getK());
            System.out.println("l: " + ywc.getL());
            System.out.println("m: " + ywc.getM());
            System.out.println("n: " + ywc.getN());
            System.out.println("o: " + ywc.getO());
            System.out.println("p: " + ywc.getP());
            System.out.println("q: " + ywc.getQ());
            System.out.println("r: " + ywc.getR());
            System.out.println("s: " + ywc.getS());
            System.out.println("t: " + ywc.getT());
            System.out.println("u: " + ywc.getU());
            System.out.println("v: " + ywc.getV());
            System.out.println("w: " + ywc.getW());
            System.out.println("x: " + ywc.getX());
            System.out.println("y: " + ywc.getY());
            System.out.println("z: " + ywc.getZ());
            System.out.println("aa: " + ywc.getAa());
            System.out.println("ab: " + ywc.getAb());
            System.out.println("ac: " + ywc.getAc());
            System.out.println("ad: " + ywc.getAd());
            System.out.println("ae: " + ywc.getAe());
            System.out.println("af: " + ywc.getAf());
            System.out.println("ag: " + ywc.getAg());
            System.out.println("ah: " + ywc.getAh());
            System.out.println("ai: " + ywc.getAi());
            System.out.println("aj: " + ywc.getAj());
            System.out.println("ak: " + ywc.getAk());
            System.out.println("al: " + ywc.getAl());
            System.out.println("am: " + ywc.getAm());
            System.out.println("an: " + ywc.getAn());
            System.out.println("ao: " + ywc.getAo());
            System.out.println("ap: " + ywc.getAp());
            System.out.println("aq: " + ywc.getAq());
            System.out.println("ar: " + ywc.getAr());
            System.out.println("as: " + ywc.getAs());
            System.out.println("at: " + ywc.getAt());
            System.out.println("au: " + ywc.getAu());
            System.out.println("av: " + ywc.getAv());
            System.out.println("aw: " + ywc.getAw());
            System.out.println("ax: " + ywc.getAx());

            if (ywcService.update(ywc)) {
                return ResultInfo.success("修改成功", ywc);
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
    public ResultInfo delete(@RequestBody HashMap map,HttpSession session) {
        Ywc ywc = GsonUtil.toEntity(SessionUtil.getToken(session), Ywc.class);
        System.out.println(ywc);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
//        if(!userInfo.getPower().equals("管理员")){
//            return ResultInfo.error(401, "无权限");
//        }
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                ywcService.delete(Collections.singletonList(this_id));
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
        Ywc ywc = GsonUtil.toEntity(SessionUtil.getToken(session), Ywc.class);
        try {
            List<Ywc> list = ywcService.queryList(name);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


}