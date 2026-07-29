package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.service.HtjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class HtjlImpl extends ServiceImpl<HtjlMapper, Htjl> implements HtjlService {
    @Autowired
    HtjlMapper htjlMapper;


    @Override
    public List<Htjl> getListExcludeThjl() {
        return htjlMapper.getListExcludeThjl();
    }



    @Override
    public boolean update(Htjl htjl) {
        return htjlMapper.update(htjl);
    }



    @Override
    public boolean add(Htjl htjl) {
        return htjlMapper.add(htjl);
    }



    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }



    @Override
    public List<Htjl> queryList(String name, String department) {
        return htjlMapper.queryList(name, department);
    }




//    退货单
    @Override
    public boolean save(Htjl htjl) {
        return htjlMapper.save(htjl);
    }
    @Override
    public String getddh() {  // 方法名必须一致
        return htjlMapper.getddh();
    }


//出库单
    @Override
    public boolean save1(Htjl htjl) {
        return htjlMapper.save1(htjl);
    }
    @Override
    public String getddh1() {  // 方法名必须一致
        return htjlMapper.getddh1();
    }


    @Override
    public Htjl getById(String id) {
        return htjlMapper.getById(id);
    }

    @Override
    public List<Htjl> getByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return htjlMapper.getByIds(ids);
    }

    public boolean updateField(Integer id, Map<String, Object> updateFields) {
        try {
            if (updateFields.isEmpty()) {
                return false;
            }

            System.out.println("开始更新字段，ID: " + id + ", 更新字段: " + updateFields);

            // 获取当前记录的完整数据
            Htjl currentRecord = getById(id);
            if (currentRecord == null) {
                System.out.println("未找到ID为 " + id + " 的记录");
                return false;
            }

            // 处理字段名映射和业务计算
            Map<String, Object> processedFields = new HashMap<>();

            for (Map.Entry<String, Object> entry : updateFields.entrySet()) {
                String field = entry.getKey();
                Object value = entry.getValue();

                // 处理特殊的字段名映射
                switch (field) {
                    case "aas":
                        processedFields.put("aas", value);
                        break;
                    case "hetongzhuangtai":
                        // 前端发送的是 hetongzhuangtai，数据库字段是 hetong_zhuangtai
                        processedFields.put("hetong_zhuangtai", value);
                        break;
                    default:
                        processedFields.put(field, value);
                }

                // 如果是工时字段，自动计算单价
                calculatePriceIfNeeded(field, value, processedFields);
            }

            // 自动计算汇总字段
            calculateSummaryFields(currentRecord, processedFields, updateFields);

            // 使用自定义的Mapper方法
            boolean result = htjlMapper.updateByMap(id, processedFields);
            System.out.println("更新结果: " + result);
            return result;

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("更新过程中发生异常: " + e.getMessage());
            return false;
        }
    }


    // 定义小数格式化器
    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("#.##"); // 保留两位小数
    /**
     * 计算汇总字段：m、n、aq、ar
     */
    private void calculateSummaryFields(Htjl currentRecord, Map<String, Object> processedFields, Map<String, Object> updateFields) {
        try {
            // 获取当前值或更新后的值（使用BigDecimal避免精度问题）
            BigDecimal p = getBigDecimalValue(processedFields.get("p"), currentRecord.getP());
            BigDecimal r = getBigDecimalValue(processedFields.get("r"), currentRecord.getR());
            BigDecimal t = getBigDecimalValue(processedFields.get("t"), currentRecord.getT());
            BigDecimal v = getBigDecimalValue(processedFields.get("v"), currentRecord.getV());
            BigDecimal x = getBigDecimalValue(processedFields.get("x"), currentRecord.getX());
            BigDecimal z = getBigDecimalValue(processedFields.get("z"), currentRecord.getZ());
            BigDecimal ab = getBigDecimalValue(processedFields.get("ab"), currentRecord.getAb());
            BigDecimal ad = getBigDecimalValue(processedFields.get("ad"), currentRecord.getAd());
            BigDecimal af = getBigDecimalValue(processedFields.get("af"), currentRecord.getAf());
            BigDecimal ah = getBigDecimalValue(processedFields.get("ah"), currentRecord.getAh());
            BigDecimal aj = getBigDecimalValue(processedFields.get("aj"), currentRecord.getAj());
            BigDecimal al = getBigDecimalValue(processedFields.get("al"), currentRecord.getAl());

            BigDecimal k = getBigDecimalValue(processedFields.get("k"), currentRecord.getK());
            BigDecimal o = getBigDecimalValue(processedFields.get("o"), currentRecord.getO());
            BigDecimal q_val = getBigDecimalValue(processedFields.get("q"), currentRecord.getQ());

            // 计算 m 字段：所有单价之和
            BigDecimal m = p.add(r).add(t).add(v).add(x).add(z)
                    .add(ab).add(ad).add(af).add(ah).add(aj).add(al);
            processedFields.put("m", formatDecimal(m));
            System.out.println("计算 m 字段 = " + formatDecimal(m));

            // 计算 n 字段：k * m
            BigDecimal n = k.multiply(m);
            processedFields.put("n", formatDecimal(n));
            System.out.println("计算 n 字段: " + formatDecimal(k) + " * " + formatDecimal(m) + " = " + formatDecimal(n));

            // 计算 aq 字段：o * k
            BigDecimal aq = o.multiply(k);
            processedFields.put("aq", formatDecimal(aq));
            System.out.println("计算 aq 字段: " + formatDecimal(o) + " * " + formatDecimal(k) + " = " + formatDecimal(aq));

            // 计算 ar 字段：q * k
            BigDecimal ar = q_val.multiply(k);
            processedFields.put("ar", formatDecimal(ar));
            System.out.println("计算 ar 字段: " + formatDecimal(q_val) + " * " + formatDecimal(k) + " = " + formatDecimal(ar));

        } catch (Exception e) {
            System.out.println("计算汇总字段时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 获取数值，优先使用更新后的值，如果没有则使用当前记录的值
     */
    private BigDecimal getBigDecimalValue(Object newValue, String currentValue) {
        try {
            String valueStr = null;

            // 优先使用更新后的值
            if (newValue != null && !newValue.toString().trim().isEmpty()) {
                valueStr = newValue.toString().trim();
            }
            // 如果没有更新值，使用当前记录的值
            else if (currentValue != null && !currentValue.trim().isEmpty()) {
                valueStr = currentValue.trim();
            }

            if (valueStr != null) {
                return new BigDecimal(valueStr).setScale(4, BigDecimal.ROUND_HALF_UP);
            }
            return BigDecimal.ZERO;
        } catch (NumberFormatException e) {
            System.out.println("数值转换错误: newValue=" + newValue + ", currentValue=" + currentValue);
            return BigDecimal.ZERO;
        }
    }

    /**
     * 格式化小数，保留两位小数
     */
    private String formatDecimal(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        // 保留两位小数，四舍五入
        return value.setScale(2, BigDecimal.ROUND_HALF_UP).toString();
    }


    /**
     * 如果是工时字段，自动计算对应的单价
     */
    private void calculatePriceIfNeeded(String field, Object value, Map<String, Object> processedFields) {
        // 定义工时字段和对应的工序名称、目标字段的映射
        Map<String, String[]> fieldMapping = new HashMap<>();
        fieldMapping.put("o", new String[]{"铣工时", "p"});
        fieldMapping.put("q", new String[]{"车工时", "r"});
        fieldMapping.put("s", new String[]{"钳工时", "t"});
        fieldMapping.put("u", new String[]{"整件外委工时", "v"});
        fieldMapping.put("w", new String[]{"外委工时", "x"});
        fieldMapping.put("y", new String[]{"镗工时", "z"});
        fieldMapping.put("aa", new String[]{"割工时", "ab"});
        fieldMapping.put("ac", new String[]{"磨工时", "ad"});
        fieldMapping.put("ae", new String[]{"数控铣工时", "af"});
        fieldMapping.put("ag", new String[]{"立车", "ah"});
        fieldMapping.put("ai", new String[]{"电火花", "aj"});
        fieldMapping.put("ak", new String[]{"中走丝", "al"});

        if (fieldMapping.containsKey(field) && value != null && !value.toString().trim().isEmpty()) {
            try {
                String[] mapping = fieldMapping.get(field);
                String gongxuName = mapping[0];
                String targetField = mapping[1];

                // 使用BigDecimal计算，避免精度问题
                BigDecimal hours = new BigDecimal(value.toString().trim());

                // 查询工序单价
                String priceStr = htjlMapper.getGongxuNumByName(gongxuName);
                if (priceStr != null && !priceStr.trim().isEmpty()) {
                    BigDecimal price = new BigDecimal(priceStr.trim());
                    BigDecimal result = hours.multiply(price);

                    // 保留两位小数
                    String formattedResult = result.setScale(2, BigDecimal.ROUND_HALF_UP).toString();

                    processedFields.put(targetField, formattedResult);
                    System.out.println("自动计算: " + field + "(" + formatDecimal(hours) + ") * " +
                            gongxuName + "(" + formatDecimal(price) + ") = " +
                            targetField + "(" + formattedResult + ")");
                }
            } catch (NumberFormatException e) {
                System.out.println("字段 " + field + " 的值不是有效数字: " + value);
            } catch (Exception e) {
                System.out.println("计算 " + field + " 相关字段时出错: " + e.getMessage());
            }
        }
    }

    /**
     * 辅助方法：格式化BigDecimal为字符串（如果需要）
     */
    private String formatDecimalForDisplay(BigDecimal value) {
        if (value == null) {
            return "0.00";
        }
        return value.setScale(2, BigDecimal.ROUND_HALF_UP).toString();
    }


    @Override
    public Page<Map<String, Object>> selectDistinctByDdhPage(Page<Map<String, Object>> page,
                                                             Wrapper<Map<String, Object>> queryWrapper) {

        // 计算分页参数
        long start = (page.getCurrent() - 1) * page.getSize();
        long end = page.getSize();

        // 查询数据
        List<Map<String, Object>> records = htjlMapper.selectDistinctByDdhForPage(start, end, queryWrapper);

        // 查询总数
        Long total = htjlMapper.selectDistinctCount(queryWrapper);

        // 设置分页结果
        page.setRecords(records);
        page.setTotal(total);

        return page;
    }


    @Override
    public Map<String, Object> importExcelData(List<Map<String, Object>> records) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;

        System.out.println("开始批量导入Excel数据，共 " + records.size() + " 条记录");

        for (int i = 0; i < records.size(); i++) {
            try {
                Map<String, Object> record = records.get(i);
                int recordNum = i + 1;

                // 转换数据为Htjl实体
                Htjl htjl = convertMapToHtjl(record);

                if (htjl == null) {
                    String errorMsg = "第" + recordNum + "行: 数据转换失败";
                    errors.add(errorMsg);
                    errorCount++;
                    System.err.println(errorMsg);
                    continue;
                }

                // 使用现有的add方法保存数据
                boolean saveResult = this.add(htjl);

                if (saveResult) {
                    successCount++;
                    System.out.println("第 " + recordNum + " 条记录导入成功");
                } else {
                    String errorMsg = "第" + recordNum + "行: 保存到数据库失败";
                    errors.add(errorMsg);
                    errorCount++;
                    System.err.println(errorMsg);
                }

            } catch (Exception e) {
                String errorMsg = "第" + (i+1) + "行: " + e.getMessage();
                errors.add(errorMsg);
                errorCount++;
                System.err.println("导入第" + (i+1) + "条记录时出错: " + e.getMessage());
                e.printStackTrace();
            }
        }

        // 构建返回结果
        result.put("successCount", successCount);
        result.put("errorCount", errorCount);
        result.put("totalCount", records.size());

        if (errorCount > 0 && !errors.isEmpty()) {
            // 只返回前10个错误，避免响应过大
            result.put("errors", errors.subList(0, Math.min(10, errors.size())));
        }

        System.out.println("导入完成: 成功 " + successCount + " 条，失败 " + errorCount + " 条");
        return result;
    }

    /**
     * 将Map转换为Htjl实体（也可以在Controller中使用）
     */
    private Htjl convertMapToHtjl(Map<String, Object> record) {
        try {
            if (record == null || record.isEmpty()) {
                return null;
            }

            Htjl htjl = new Htjl();

            // 设置字段值 - 使用反射简化
            Class<?> clazz = Htjl.class;

            for (Map.Entry<String, Object> entry : record.entrySet()) {
                String fieldName = entry.getKey();
                Object value = entry.getValue();

                if (value == null) {
                    continue;
                }

                try {
                    // 获取字段对象
                    java.lang.reflect.Field field = null;
                    try {
                        field = clazz.getDeclaredField(fieldName);
                    } catch (NoSuchFieldException e) {
                        // 尝试处理特殊字段名
                        if (fieldName.equals("aas")) {
                            field = clazz.getDeclaredField("aas");
                        } else {
                            continue;
                        }
                    }

                    if (field != null) {
                        field.setAccessible(true);
                        field.set(htjl, value.toString());
                    }

                } catch (Exception e) {
                    System.err.println("设置字段 " + fieldName + " 失败: " + e.getMessage());
                }
            }

            // 设置默认值
            if (htjl.getZhuangtai() == null) {
                htjl.setZhuangtai("未创建");
            }

            return htjl;

        } catch (Exception e) {
            System.err.println("转换Htjl实体失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public List<Htjl> getCustomerList() {  // 方法名必须一致
        return baseMapper.getCustomerList();
    }
    @Override
    public List<Htjl> getxCustomerList() {  // 方法名必须一致
        return baseMapper.getxCustomerList();
    }
    @Override
    public List<Htjl> getdjy() {  // 方法名必须一致
        return baseMapper.getdjy();
    }
    @Override
    public List<Htjl> getrwh() {  // 方法名必须一致
        return baseMapper.getrwh();
    }
    @Override
    public List<Htjl> getth() {  // 方法名必须一致
        return baseMapper.getth();
    }
    @Override
    public List<Htjl> getywdw() {  // 方法名必须一致
        return baseMapper.getywdw();
    }
    @Override
    public List<Htjl> gethth() {  // 方法名必须一致
        return baseMapper.gethth();
    }
    @Override
    public List<Htjl> getxhth() {  // 方法名必须一致
        return baseMapper.getxhth();
    }

}