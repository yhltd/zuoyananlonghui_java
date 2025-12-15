package com.example.demo.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.entity.*;
import com.example.demo.service.HtjlService;
import com.example.demo.service.ThjlService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/htjl")
public class HtjlController {
    @Autowired
    private HtjlService htjlService;

    @Autowired
    private ThjlService thjlService;


    @RequestMapping("/getListExcludeThjl")
    public Result<Page<Map<String, Object>>> distinctPage(HttpSession session, @RequestBody PageRequest pageRequest) {
        // 创建分页对象
        Page<Map<String, Object>> page = new Page<>(pageRequest.getPageNum(), pageRequest.getPageSize());

        // 构建查询条件
        QueryWrapper<Map<String, Object>> queryWrapper = new QueryWrapper<>();

        // 添加查询条件
        if (StringUtils.isNotBlank(pageRequest.getC())) {
            queryWrapper.like("c", pageRequest.getC());
        }
        if (StringUtils.isNotBlank(pageRequest.getZhuangtai())) {
            queryWrapper.like("zhuangtai", pageRequest.getZhuangtai());
        }

        // 执行查询 - 通过Service调用
        Page<Map<String, Object>> result = htjlService.selectDistinctByDdhPage(page,queryWrapper);

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

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

//        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
//        System.out.println(htjl);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
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
//        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
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
//        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
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
//        Htjl htjl = GsonUtil.toEntity(SessionUtil.getToken(session), Htjl.class);
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



    @RequestMapping("/gettdh")
    public ResultInfo gettdh(HttpSession session) {
        try {
            List<Thjl> getList = thjlService.gettdh();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    @RequestMapping("/searchReturnOrder")
    public ResultInfo searchReturnOrder(HttpSession session,
                                        @RequestParam("returnNo") String returnNo) {
        try {
            List<Thjl> getList = thjlService.getth(returnNo);
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }




    @RequestMapping("/deleteReturnOrderByNo")
    public ResultInfo deleteReturnOrderByNo(@RequestParam("returnNo") String returnNo, HttpSession session) {
        try {
            // 先查询该退货单的所有记录
            List<Thjl> thjlList = thjlService.getth(returnNo);

            if (thjlList == null || thjlList.isEmpty()) {
                return ResultInfo.success("未找到相关数据");
            }

            // 提取ID列表（根据实际数据结构调整）
            List<Integer> idList = new ArrayList<>();
            for (Thjl thjl : thjlList) {
                // 根据实际ID字段调整，这里假设ID在某个字段中
                // 如果Thjl有getId()方法，使用它
                if (thjl.getId() != null) {
                    idList.add(thjl.getId());
                }
            }

            // 调用删除服务
            boolean result = thjlService.delete(idList);

            if (result) {
                return ResultInfo.success("删除成功，共删除 " + idList.size() + " 条记录");
            } else {
                return ResultInfo.error("删除失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("删除退货单失败：{}", e.getMessage());
            return ResultInfo.error("删除失败!");
        }
    }


    /**
     * Excel批量导入接口 - 简单版本
     * 支持前端直接上传数据列表
     */
    @PostMapping("/importExcel")
    public Result importExcel(@RequestBody Map<String, Object> request, HttpSession session) {
        try {
            System.out.println("=== 接收Excel批量导入请求 ===");

            // 从请求中提取数据
            Object recordsObj = request.get("records");

            if (recordsObj == null) {
                return Result.error("没有接收到数据");
            }

            List<Map<String, Object>> records;

            if (recordsObj instanceof List) {
                records = (List<Map<String, Object>>) recordsObj;
            } else {
                return Result.error("数据格式不正确，应为数组格式");
            }

            if (records.isEmpty()) {
                return Result.error("数据列表为空");
            }

            System.out.println("待导入记录数: " + records.size());
            System.out.println("第一条数据样例: " + (records.size() > 0 ? records.get(0) : "无数据"));

            // 调用Service进行数据导入
            Map<String, Object> importResult = htjlService.importExcelData(records);

            int successCount = (int) importResult.getOrDefault("successCount", 0);
            int errorCount = (int) importResult.getOrDefault("errorCount", 0);

            Map<String, Object> result = new HashMap<>();
            result.put("successCount", successCount);
            result.put("errorCount", errorCount);
            result.put("totalCount", records.size());

            if (errorCount == 0) {
                return Result.success("导入成功");
            } else {
                return Result.success("部分数据导入成功");
            }

        } catch (Exception e) {
            e.printStackTrace();
            log.error("Excel导入失败：{}", e.getMessage());
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    @RequestMapping("/getCustomerList")
    public ResultInfo getCustomerList(HttpSession session) {
        try {
            List<Htjl> getList = htjlService.getCustomerList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }



}