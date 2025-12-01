package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.mapper.YwcMapper;
import com.example.demo.service.HtjlService;
import com.example.demo.service.YwcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class YwcImpl extends ServiceImpl<YwcMapper, Ywc> implements YwcService {
    @Autowired
    YwcMapper ywcMapper;


    @Override
    public List<Ywc> getList() {  // 方法名必须一致
        return ywcMapper.getList();
    }


    @Override
    public boolean update(Ywc ywc) {
        // 使用MyBatis-Plus的updateById方法
        // ✅ 正确：应该调用自定义的update方法
        return ywcMapper.update(ywc);
    }



    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }


    @Override
    public List<Ywc> queryList(String name) {
        return ywcMapper.queryList(name);
    }

    public boolean updateField(Integer id, Map<String, Object> updateFields) {
    try {
        if (updateFields.isEmpty()) {
            return false;
        }

        System.out.println("开始更新字段，ID: " + id + ", 更新字段: " + updateFields);

        // 获取当前记录的完整数据
        Ywc currentRecord = getById(id);
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
        boolean result = ywcMapper.updateByMap(id, processedFields);
        System.out.println("更新结果: " + result);
        return result;

    } catch (Exception e) {
        e.printStackTrace();
        System.out.println("更新过程中发生异常: " + e.getMessage());
        return false;
    }
}

    /**
     * 计算汇总字段：m、n、aq、ar
     */
    private void calculateSummaryFields(Ywc currentRecord, Map<String, Object> processedFields, Map<String, Object> updateFields) {
        try {
            // 获取当前值或更新后的值
            double p = getNumericValue(processedFields.get("p"), currentRecord.getP());
            double r = getNumericValue(processedFields.get("r"), currentRecord.getR());
            double t = getNumericValue(processedFields.get("t"), currentRecord.getT());
            double v = getNumericValue(processedFields.get("v"), currentRecord.getV());
            double x = getNumericValue(processedFields.get("x"), currentRecord.getX());
            double z = getNumericValue(processedFields.get("z"), currentRecord.getZ());
            double ab = getNumericValue(processedFields.get("ab"), currentRecord.getAb());
            double ad = getNumericValue(processedFields.get("ad"), currentRecord.getAd());
            double af = getNumericValue(processedFields.get("af"), currentRecord.getAf());
            double ah = getNumericValue(processedFields.get("ah"), currentRecord.getAh());
            double aj = getNumericValue(processedFields.get("aj"), currentRecord.getAj());
            double al = getNumericValue(processedFields.get("al"), currentRecord.getAl());

            double k = getNumericValue(processedFields.get("k"), currentRecord.getK());
            double o = getNumericValue(processedFields.get("o"), currentRecord.getO());
            double q_val = getNumericValue(processedFields.get("q"), currentRecord.getQ());

            // 计算 m 字段：所有单价之和
            double m = p + r + t + v + x + z + ab + ad + af + ah + aj + al;
            processedFields.put("m", String.valueOf(m));
            System.out.println("计算 m 字段: " + p + " + " + r + " + " + t + " + " + v + " + " + x + " + " + z +
                    " + " + ab + " + " + ad + " + " + af + " + " + ah + " + " + aj + " + " + al + " = " + m);

            // 计算 n 字段：k * m
            double n = k * m;
            processedFields.put("n", String.valueOf(n));
            System.out.println("计算 n 字段: " + k + " * " + m + " = " + n);

            // 计算 aq 字段：o * k
            double aq = o * k;
            processedFields.put("aq", String.valueOf(aq));
            System.out.println("计算 aq 字段: " + o + " * " + k + " = " + aq);

            // 计算 ar 字段：q * k
            double ar = q_val * k;
            processedFields.put("ar", String.valueOf(ar));
            System.out.println("计算 ar 字段: " + q_val + " * " + k + " = " + ar);

        } catch (Exception e) {
            System.out.println("计算汇总字段时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 获取数值，优先使用更新后的值，如果没有则使用当前记录的值
     */
    private double getNumericValue(Object newValue, String currentValue) {
        try {
            // 优先使用更新后的值
            if (newValue != null && !newValue.toString().trim().isEmpty()) {
                return Double.parseDouble(newValue.toString());
            }
            // 如果没有更新值，使用当前记录的值
            if (currentValue != null && !currentValue.trim().isEmpty()) {
                return Double.parseDouble(currentValue);
            }
            return 0.0;
        } catch (NumberFormatException e) {
            System.out.println("数值转换错误: newValue=" + newValue + ", currentValue=" + currentValue);
            return 0.0;
        }
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

                double hours = Double.parseDouble(value.toString());

                // 查询工序单价
                String priceStr = ywcMapper.getGongxuNumByName(gongxuName);
                if (priceStr != null && !priceStr.trim().isEmpty()) {
                    double price = Double.parseDouble(priceStr);
                    double result = hours * price;

                    processedFields.put(targetField, String.valueOf(result));
                    System.out.println("自动计算: " + field + "(" + hours + ") * " + gongxuName + "(" + price + ") = " + targetField + "(" + result + ")");
                }
            } catch (NumberFormatException e) {
                System.out.println("字段 " + field + " 的值不是有效数字: " + value);
            } catch (Exception e) {
                System.out.println("计算 " + field + " 相关字段时出错: " + e.getMessage());
            }
        }
    }

}