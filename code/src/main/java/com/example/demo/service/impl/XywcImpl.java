package com.example.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.Ywc;
import com.example.demo.mapper.XywcMapper;
import com.example.demo.service.XywcService;
import com.example.demo.util.PageResult;
import com.example.demo.util.StringUtils;
import com.example.demo.util.YwcPageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class XywcImpl extends ServiceImpl<XywcMapper, Ywc> implements XywcService {
    @Autowired
    XywcMapper ywcMapper;

    @Override
    public PageResult<Ywc> getYwcPage(YwcPageRequest request) {
        try {
            // 计算分页范围（SQL Server ROW_NUMBER 从1开始）
            long start = (long) (request.getPageNum() - 1) * request.getPageSize() + 1;
            long end = (long) request.getPageNum() * request.getPageSize();
            int pageSize = request.getPageSize();

            // 构建查询条件
            LambdaQueryWrapper<Ywc> wrapper = new LambdaQueryWrapper<>();

            // 添加查询条件
            if (StringUtils.isNotBlank(request.getName())) {
                wrapper.like(Ywc::getC, request.getName());  // 业务单位
            }
            if (StringUtils.isNotBlank(request.getHetongzhuangtai())) {
                wrapper.like(Ywc::getHetongzhuangtai, request.getHetongzhuangtai());  // 合同状态
            }
            if (StringUtils.isNotBlank(request.getHetongHao())) {
                wrapper.like(Ywc::getD, request.getHetongHao());  // 合同状态
            }

            // 注意：不在wrapper中添加排序，使用SQL中的ROW_NUMBER排序

            // 使用分页查询数据
            List<Ywc> records = ywcMapper.selectForPage(start, end, wrapper);

            // 查询总记录数
            Long totalCount = ywcMapper.selectCountForPage(wrapper);

            // 计算总页数
            Long totalPages = (totalCount + pageSize - 1) / pageSize;

            return new PageResult<>(records, totalCount, totalPages);
        } catch (Exception e) {
            log.error("已完成合同分页查询失败", e);
            throw new RuntimeException("查询失败: " + e.getMessage());
        }
    }

    @Override
    public boolean update(Ywc ywc) {
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
            boolean result = ywcMapper.updateByMap(id, processedFields);
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
    private void calculateNField(Ywc currentRecord, Map<String, Object> processedFields, Map<String, Object> updateFields) {
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
}