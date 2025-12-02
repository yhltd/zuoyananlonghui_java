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

//            // 设置各个字段（根据你的表格字段映射）
//            ckd.setC(getStringValue(firstDetail, "contractNo"));    // 合同号
//            ckd.setD(getStringValue(firstDetail, "taskNo"));        // 任务号
//            ckd.setE(getStringValue(firstDetail, "gongxu"));        // 加工工序
//            ckd.setF(getStringValue(firstDetail, "productName"));   // 产品名称
//            ckd.setG(getStringValue(firstDetail, "drawingNo"));     // 图号
//            ckd.setH(getStringValue(firstDetail, "unit"));          // 单位
//            ckd.setI(getStringValue(firstDetail, "quantity"));      // 数量
//            ckd.setL(getStringValue(firstDetail, "material"));      // 材质
//            ckd.setM(getStringValue(firstDetail, "weight"));        // 重量
//            ckd.setN(getStringValue(firstDetail, "remark"));        // 备注
//
//            // 设置人员字段（对应r到u字段）
//            ckd.setR(getStringValue(formData, "zhidanren"));    // 制单人 (r字段)
//            ckd.setS(getStringValue(formData, "shenheren"));    // 审核人 (s字段)
//            ckd.setT(getStringValue(formData, "songhuoren"));   // 送货人 (t字段)
//            ckd.setU(getStringValue(formData, "shouhuoren"));   // 收货人 (u字段)
//            ckd.setO(getStringValue(formData, "customer")); //往来单位
//            ckd.setP(getStringValue(formData, "chukuriqi")); //出库日期
//
//            // 设置计算字段
//            ckd.setJ(getStringValue(firstDetail, "unitPrice"));     // 单价
//            ckd.setK(getStringValue(firstDetail, "amount"));        // 金额


            ckd.setC(getStringValue(formData, "customer"));        // C: 往来单位
            ckd.setD(getStringValue(formData, "chukuriqi"));       // D: 出库日期
            ckd.setE(getStringValue(formData, "chukudanhao"));     // E: 出库单号 (必须添加)

            ckd.setF(getStringValue(firstDetail, "productName"));  // F: 产品名称
            ckd.setG(getStringValue(firstDetail, "drawingNo"));    // G: 图号
            ckd.setH(getStringValue(firstDetail, "unit"));         // H: 单位
            ckd.setI(getStringValue(firstDetail, "quantity"));     // I: 数量
            ckd.setJ(getStringValue(firstDetail, "unitPrice"));    // J: 单价
            ckd.setK(getStringValue(firstDetail, "amount"));       // K: 金额

            ckd.setL(getStringValue(firstDetail, "material"));     // L: 材质
            ckd.setM(getStringValue(firstDetail, "weight"));       // M: 重量
            ckd.setN(getStringValue(firstDetail, "remark"));       // N: 备注

            ckd.setO(getStringValue(firstDetail, "contractNo"));   // O: 合同号
            ckd.setP(getStringValue(firstDetail, "taskNo"));       // P: 任务号
            ckd.setQ(getStringValue(firstDetail, "gongxu"));       // Q: 加工工序

// 设置人员字段
            ckd.setR(getStringValue(formData, "zhidanren"));       // R: 制单人
            ckd.setS(getStringValue(formData, "shenheren"));       // S: 审核人
            ckd.setT(getStringValue(formData, "songhuoren"));      // T: 送货人
            ckd.setU(getStringValue(formData, "shouhuoren"));      // U: 收货人


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






    @Override
    public boolean checkOrderExists(String chukudanhao) {
        // 调用Mapper查询
        Integer count = ckd_cMapper.countByChukudanhao(chukudanhao);
        return count != null && count > 0;
    }

    @Override
    public void deleteByOrderNo(String chukudanhao) {
        // 调用Mapper删除
        ckd_cMapper.deleteByChukudanhao(chukudanhao);
    }

    @Override
    public String getddh() {  // 方法名必须一致
        return ckd_cMapper.getddh();
    }


    @Override
    @Transactional
    public void updateContractStatus(List<String> contractIds, String chukuriqi, String chukudanhao) {
        for (String contractId : contractIds) {
            ckd_cMapper.updateHetongJiluStatus(
                    contractId,
                    "未对账",
                    chukuriqi,
                    chukudanhao
            );
        }
    }

        @Override
        @Transactional(readOnly = true)
        public List<Map<String, Object>> getContractInfoByNumbers(List<String> contractNumbers) {
            if (contractNumbers == null || contractNumbers.isEmpty()) {
                return new ArrayList<>();
            }
            return ckd_cMapper.selectContractInfoByNumbers(contractNumbers);
        }



    }

//    /**
//     * 私有方法：数据转换（属于业务逻辑）
//     */
//    private CkdEntity convertToEntity(CkdFormData formData, CkdDetail detail) {
//        CkdEntity entity = new CkdEntity();
//        entity.setC(formData.getCustomer());        // 往来单位
//        entity.setD(formData.getChukuriqi());       // 出库日期
//        entity.setE(formData.getChukudanhao());     // 出库单号
//        entity.setF(detail.getProductName());       // 产品名称
//        entity.setG(detail.getDrawingNo());         // 图号
//        entity.setH(detail.getUnit());              // 单位
//        entity.setI(detail.getQuantity());          // 数量
//        entity.setJ(detail.getUnitPrice());         // 单价
//        entity.setK(detail.getAmount());            // 金额
//        entity.setL(detail.getMaterial());          // 材质
//        entity.setM(detail.getWeight());            // 重量
//        entity.setN(detail.getRemark());            // 备注
//        entity.setO(detail.getContractNo());        // 合同号
//        entity.setP(detail.getTaskNo());            // 任务号
//        entity.setQ(detail.getGongxu());            // 加工工序
//        entity.setR(formData.getZhidanren());       // 制单人
//        entity.setS(formData.getShenheren());       // 审核人
//        entity.setT(formData.getSonghuoren());      // 送货人
//        entity.setU(formData.getShouhuoren());      // 收货人
//        return entity;
//    }



