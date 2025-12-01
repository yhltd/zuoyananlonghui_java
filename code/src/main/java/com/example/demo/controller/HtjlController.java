package com.example.demo.controller;

import com.example.demo.entity.*;
import com.example.demo.service.HtjlService;
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
@RequestMapping("/htjl")
public class HtjlController {
    @Autowired
    private HtjlService htjlService;


//    /**
//     * 查询所有
//     *
//     * @return ResultInfo
//     */
//    @RequestMapping("/getList")
//    public ResultInfo getList(HttpSession session) {
//        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
//        try {
//            List<Htjl> getList = htjlService.getList();
//            return ResultInfo.success("获取成功", getList);
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error("获取失败：{}", e.getMessage());
//            return ResultInfo.error("错误!");
//        }
//    }


    /**
     * 查询所有（排除退货记录中已存在的数据）
     *
     * @return ResultInfo
     */
    @RequestMapping("/getListExcludeThjl")
    public ResultInfo getListExcludeThjl(HttpSession session) {
        try {
            List<Htjl> getList = htjlService.getListExcludeThjl();
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
//    @RequestMapping(value = "/update", method = RequestMethod.POST)
//    public ResultInfo update(@RequestBody String updateJson, HttpSession session) {
//        try {
//            System.out.println("接收到的JSON: " + updateJson);
//
//            // 这里应该能正确映射C、D、E、F字段
//            Htjl htjl = GsonUtil.toEntity(updateJson, Htjl.class);
//
//            if (htjlService.update(htjl)) {
//                return ResultInfo.success("修改成功", htjl);
//            } else {
//                return ResultInfo.error("修改失败");
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            log.error("修改失败：{}", e.getMessage());
//            return ResultInfo.error("修改失败: " + e.getMessage());
//        }
//    }

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

            boolean success = htjlService.updateField(id, params);

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
     * 添加
     */
    @RequestMapping("/add")
    public ResultInfo add(@RequestBody Htjl htjl, HttpSession session) {
        try {

            // 插入新用户数据
            boolean result = htjlService.add(htjl);
            System.out.println("插入结果: " + result);

            if (result) {
                return ResultInfo.success("添加成功", htjl);
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
    public ResultInfo delete(@RequestBody HashMap map, HttpSession session) {
        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
        System.out.println(htjl);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
//        if(!userInfo.getPower().equals("管理员")){
//            return ResultInfo.error(401, "无权限");
//        }
        try {
            for (int i = 0; i < idList.size(); i++) {
                int this_id = idList.get(i);
                htjlService.delete(Collections.singletonList(this_id));
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
    public ResultInfo queryList(String name, String department, HttpSession session) {
        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
        try {
            List<Htjl> list = htjlService.queryList(name, department);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


//退货单

    /**
     * 添加
     */
    @RequestMapping("/save")
    public ResultInfo save(@RequestBody Htjl htjl, HttpSession session) {
        try {
            System.out.println("=== 接收退货单新增请求 ===");
            System.out.println("退货单号: " + htjl.getF());
            System.out.println("退货客户: " + htjl.getC());
            System.out.println("合同号: " + htjl.getG());
            System.out.println("产品名称: " + htjl.getI());
            System.out.println("数量: " + htjl.getL());
            System.out.println("单价: " + htjl.getM());
            System.out.println("金额: " + htjl.getN());

            // 直接插入数据
            boolean result = htjlService.save(htjl);
            System.out.println("插入结果: " + result);

            if (result) {
                return ResultInfo.success("添加成功");
            } else {
                return ResultInfo.error("添加失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("添加失败: " + e.getMessage());
        }
    }


    @RequestMapping("/getddh")
    public ResultInfo getddh(HttpSession session) {
        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
        try {
            String getList = htjlService.getddh();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }


//出库单

    /**
     * 添加
     */
    @RequestMapping("/save1")
    public ResultInfo save1(@RequestBody Htjl htjl, HttpSession session) {
        try {
            System.out.println("=== 接收出库单新增请求 ===");
            System.out.println("出库单号: " + htjl.getF());
            System.out.println("往来单位: " + htjl.getC());
            System.out.println("出库日期: " + htjl.getE());
            System.out.println("合同号: " + htjl.getD());
            System.out.println("任务号: " + htjl.getG());
            System.out.println("加工工序: " + htjl.getH());
            System.out.println("产品名称: " + htjl.getI());
            System.out.println("图号: " + htjl.getJ());
            System.out.println("单位: " + htjl.getK());
            System.out.println("数量: " + htjl.getL());
            System.out.println("单价: " + htjl.getM());
            System.out.println("金额: " + htjl.getN());
            System.out.println("材质: " + htjl.getO());
            System.out.println("重量: " + htjl.getP());
            System.out.println("备注: " + htjl.getAx());

            // 直接插入数据
            boolean result = htjlService.save1(htjl);
            System.out.println("插入结果: " + result);

            if (result) {
                return ResultInfo.success("添加成功");
            } else {
                return ResultInfo.error("添加失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResultInfo.error("添加失败: " + e.getMessage());
        }
    }


    @RequestMapping("/getddh1")
    public ResultInfo getddh1(HttpSession session) {
        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
        try {
            String getList = htjlService.getddh1();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }









    /**
     * 根据ID查询单条合同记录
     */
    @RequestMapping("/getById")
    public ResultInfo getById(String id, HttpSession session) {
        try {
            Htjl data = htjlService.getById(id);
            if (data != null) {
                return ResultInfo.success("查询成功", data);
            } else {
                return ResultInfo.error("未找到对应数据");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("根据ID查询失败：{}", e.getMessage());
            return ResultInfo.error("查询失败!");
        }
    }

    /**
     * 根据多个ID查询合同记录
     */
    @RequestMapping("/getByIds")
    public ResultInfo getByIds(@RequestParam List<String> ids, HttpSession session) {
        try {
            List<Htjl> dataList = htjlService.getByIds(ids);
            return ResultInfo.success("查询成功", dataList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("根据多个ID查询失败：{}", e.getMessage());
            return ResultInfo.error("查询失败!");
        }
    }

}