package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.CkdMapper;
import com.example.demo.mapper.Ckd_cMapper;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.service.CkdService;
import com.example.demo.service.Ckd_cService;
import com.example.demo.service.HtjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class Ckd_cImpl extends ServiceImpl<Ckd_cMapper, Ckd_c> implements Ckd_cService {
    @Autowired
    Ckd_cMapper ckd_cMapper;


    @Override
    public boolean saveReturnOrder(Map<String, Object> formData) {
        try {
            // 转换数据
            Ckd_c ckd = convertToCkd_c(formData);

            // 保存到数据库
            boolean success = this.save(ckd);

            return success;

        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 将前端数据转换为实体类
     */
    private Ckd_c convertToCkd_c(Map<String, Object> formData) {
        Ckd_c ckd = new Ckd_c();

        // 设置往来单位 (c字段)
        ckd.setC(getStringValue(formData, "customer"));

        // 处理明细数据 - 取第一条数据的主要字段
        List<Map<String, Object>> details = (List<Map<String, Object>>) formData.get("details");
        if (details != null && !details.isEmpty()) {
            Map<String, Object> firstDetail = details.get(0);

            // 设置各个字段（根据你的表格字段映射）
            ckd.setC(getStringValue(firstDetail, "contractNo"));    // 合同号
            ckd.setD(getStringValue(firstDetail, "taskNo"));        // 任务号
            ckd.setE(getStringValue(firstDetail, "gongxu"));        // 加工工序
            ckd.setF(getStringValue(firstDetail, "productName"));   // 产品名称
            ckd.setG(getStringValue(firstDetail, "drawingNo"));     // 图号
            ckd.setH(getStringValue(firstDetail, "unit"));          // 单位
            ckd.setI(getStringValue(firstDetail, "quantity"));      // 数量
            ckd.setL(getStringValue(firstDetail, "material"));      // 材质
            ckd.setM(getStringValue(firstDetail, "weight"));        // 重量
            ckd.setN(getStringValue(firstDetail, "remark"));        // 备注

            // 设置计算字段
            ckd.setJ(getStringValue(firstDetail, "unitPrice"));     // 单价
            ckd.setK(getStringValue(firstDetail, "amount"));        // 金额
        }

        return ckd;
    }

    /**
     * 安全获取字符串值
     */
    private String getStringValue(Map<String, Object> map, String key) {
        if (map == null) return "";
        Object value = map.get(key);
        return value != null ? value.toString().trim() : "";
    }
}


