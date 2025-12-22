package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Kpht;
import com.example.demo.mapper.KphtMapper;
import com.example.demo.mapper.XkphtMapper;
import com.example.demo.service.KphtService;
import com.example.demo.service.XkphtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class XkphtImpl extends ServiceImpl<XkphtMapper, Kpht> implements XkphtService {
    @Autowired
    XkphtMapper kphtMapper;

    @Override
    public List<Kpht> getList() {  // 方法名必须一致
        return kphtMapper.getList();
    }

    @Override
    public boolean update(Kpht kpht) {
        return kphtMapper.update(kpht);
    }

    @Override
    public boolean delete(List<Integer> idList) {
        return removeByIds(idList);
    }

    @Override
    public List<Kpht> queryList(String name) {
        return kphtMapper.queryList(name);
    }

    public boolean updateField(Integer id, Map<String, Object> updateFields) {
        try {
            if (updateFields.isEmpty()) {
                return false;
            }

            System.out.println("开始更新字段，ID: " + id + ", 更新字段: " + updateFields);

            // 获取当前记录的完整数据
            Kpht currentRecord = getById(id);
            if (currentRecord == null) {
                System.out.println("未找到ID为 " + id + " 的记录");
                return false;
            }

            // 处理字段名映射
            Map<String, Object> processedFields = new HashMap<>();

            for (Map.Entry<String, Object> entry : updateFields.entrySet()) {
                String field = entry.getKey();
                Object value = entry.getValue();

                // 如果传入了 n 字段，直接忽略
                if ("n".equals(field)) {
                    System.out.println("忽略传入的 n 字段");
                    continue;
                }

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
            }

            // 计算 n 字段（总是计算）
            calculateNField(currentRecord, processedFields, updateFields);

            // 如果没有要更新的字段，返回false
            if (processedFields.isEmpty()) {
                System.out.println("没有要更新的字段");
                return false;
            }

            // 使用自定义的Mapper方法
            boolean result = kphtMapper.updateByMap(id, processedFields);
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
     * 计算 n 字段：n = k * m
     * 每次都重新计算 n 字段
     */
    private void calculateNField(Kpht currentRecord, Map<String, Object> processedFields, Map<String, Object> updateFields) {
        try {
            // 获取 k 字段值（优先使用更新后的值，否则使用当前记录的值）
            BigDecimal k = getBigDecimalValue(processedFields.get("k"), currentRecord.getK());

            // 获取 m 字段值（优先使用更新后的值，否则使用当前记录的值）
            BigDecimal m;
            if (processedFields.containsKey("m")) {
                // 如果有传入的 m 字段，使用传入的值
                m = getBigDecimalValue(processedFields.get("m"), null);
            } else if (updateFields.containsKey("m")) {
                // 如果传入的是 m 字段但被其他逻辑处理了，从 updateFields 中获取
                m = getBigDecimalValue(updateFields.get("m"), currentRecord.getM());
            } else {
                // 否则使用当前记录的 m 值
                m = getBigDecimalValue(null, currentRecord.getM());
            }

            // 计算 n 字段：k * m
            BigDecimal n = k.multiply(m);
            processedFields.put("n", formatDecimal(n));
            System.out.println("计算 n 字段: " + formatDecimal(k) + " * " + formatDecimal(m) + " = " + formatDecimal(n));

        } catch (Exception e) {
            System.out.println("计算 n 字段时出错: " + e.getMessage());
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

    @Override
    public Page<Map<String, Object>> selectDistinctByDdhPage(Page<Map<String, Object>> page,
                                                             Wrapper<Map<String, Object>> queryWrapper) {

        // 计算分页参数
        long start = (page.getCurrent() - 1) * page.getSize();
        long end = page.getSize();

        // 查询数据
        List<Map<String, Object>> records = kphtMapper.selectDistinctByDdhForPage(start, end, queryWrapper);

        // 查询总数
        Long total = kphtMapper.selectDistinctCount(queryWrapper);

        // 设置分页结果
        page.setRecords(records);
        page.setTotal(total);

        return page;
    }
}