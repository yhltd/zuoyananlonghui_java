package com.example.demo.controller;

import com.example.demo.entity.Login;
import com.example.demo.entity.Thjl;
import com.example.demo.service.ThjlService;
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
@RequestMapping("/thjl")
public class ThjlController {
    @Autowired
    private ThjlService thjlService;


    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
        Thjl thjl = GsonUtil.toEntity(SessionUtil.getToken(session), Thjl.class);
        try {
            List<Thjl> getList = thjlService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }



    /**
     * 根据姓名和部门查询
     *
     * @return ResultInfo
     */
    @RequestMapping("/queryList")
    public ResultInfo queryList(String ksrq, String jsrq, String h, String i, String k, String r, HttpSession session) {
        try {
            // 日期格式转换：确保是SQL Server可以识别的格式
            if (ksrq != null && !ksrq.trim().isEmpty()) {
                ksrq = convertToSqlServerDate(ksrq);
            } else {
                ksrq = "";
            }

            if (jsrq != null && !jsrq.trim().isEmpty()) {
                jsrq = convertToSqlServerDate(jsrq);
            } else {
                jsrq = "";
            }

            // 处理其他参数
            h = (h == null) ? "" : h;
            i = (i == null) ? "" : i;
            k = (k == null) ? "" : k;
            r = (r == null) ? "" : r;

            // 调试日志
            log.info("转换后的日期参数 - ksrq: '{}', jsrq: '{}'", ksrq, jsrq);
            log.info("其他参数 - h: '{}', i: '{}', k: '{}', r: '{}'", h, i, k, r);

            List<Thjl> list = thjlService.queryList(ksrq, jsrq, h, i, k, r);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 转换为SQL Server兼容的日期格式
     * 将 yyyy-MM-dd 转换为 yyyy/MM/dd 格式
     */
    private String convertToSqlServerDate(String dateStr) {
        try {
            if (dateStr == null || dateStr.trim().isEmpty()) {
                return "";
            }

            // 如果已经是 yyyy/MM/dd 格式，直接返回
            if (dateStr.contains("/")) {
                return dateStr;
            }

            // 将 yyyy-MM-dd 转换为 yyyy/MM/dd
            if (dateStr.contains("-")) {
                return dateStr.replace("-", "/");
            }

            // 其他格式直接返回
            return dateStr;
        } catch (Exception e) {
            log.warn("日期格式转换失败: {}, 使用原格式", dateStr);
            return dateStr;
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
                Thjl thjl = GsonUtil.toEntity(updateJson, Thjl.class);

                System.out.println("解析后的Login对象字段:");
                System.out.println("c: " + thjl.getC());
                System.out.println("d: " + thjl.getD());
                System.out.println("e: " + thjl.getE());
                System.out.println("f: " + thjl.getF());
                System.out.println("g: " + thjl.getC());
                System.out.println("h: " + thjl.getD());
                System.out.println("i: " + thjl.getE());
                System.out.println("j: " + thjl.getF());
                System.out.println("k: " + thjl.getC());
                System.out.println("l: " + thjl.getD());
                System.out.println("m: " + thjl.getE());
                System.out.println("n: " + thjl.getF());
                System.out.println("o: " + thjl.getC());
                System.out.println("p: " + thjl.getD());
                System.out.println("q: " + thjl.getE());
                System.out.println("r: " + thjl.getF());
                System.out.println("s: " + thjl.getC());
                System.out.println("t: " + thjl.getD());
                System.out.println("u: " + thjl.getE());
                System.out.println("v: " + thjl.getF());

                if (thjlService.update(thjl)) {
                    return ResultInfo.success("修改成功", thjl);
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
     * 添加
     */
    @RequestMapping("/add")
    public ResultInfo add(@RequestBody Thjl thjl, HttpSession session) {
        try {
            // 直接接收Thjl对象，不需要手动解析
            System.out.println("=== 接收新增请求 ===");
            System.out.println("直接接收的Thjl对象:");
            System.out.println("退货客户(c): " + thjl.getC());
            System.out.println("退货电话(d): " + thjl.getD());
            System.out.println("退货日期(e): " + thjl.getE());
            System.out.println("回厂日期(f): " + thjl.getF());
            System.out.println("退货单号(g): " + thjl.getG());
            System.out.println("合同号(h): " + thjl.getH());
            System.out.println("任务号(i): " + thjl.getI());
            System.out.println("产品名称(j): " + thjl.getJ());
            System.out.println("图号(k): " + thjl.getK());
            System.out.println("单位(l): " + thjl.getL());
            System.out.println("数量(m): " + thjl.getM());
            System.out.println("单价(n): " + thjl.getN());
            System.out.println("金额(o): " + thjl.getO());
            System.out.println("材质(p): " + thjl.getP());
            System.out.println("重量(q): " + thjl.getQ());
            System.out.println("退货原因(r): " + thjl.getR());
            System.out.println("备注(s): " + thjl.getS());
            System.out.println("地址(t): " + thjl.getT());
            System.out.println("客户签字(u): " + thjl.getU());
            System.out.println("电话(v): " + thjl.getV());

            // 插入新用户数据
            boolean result = thjlService.add(thjl);
            System.out.println("插入结果: " + result);

            if (result) {
                return ResultInfo.success("添加成功", thjl);
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
        Thjl thjl = GsonUtil.toEntity(SessionUtil.getToken(session), Thjl.class);
        System.out.println(thjl);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
//        if(!userInfo.getPower().equals("管理员")){
//            return ResultInfo.error(401, "无权限");
//        }
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                thjlService.delete(Collections.singletonList(this_id));
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






