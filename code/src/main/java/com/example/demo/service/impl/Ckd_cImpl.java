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

    // 在ChukuServiceImpl中实现
    @Override
    public List<Ckd_c> getByChukudanhao(String chukudanhao) {
        // 根据出库单号查询
        return ckd_cMapper.getByChukudanhao(chukudanhao);
    }

    @Override
    public boolean delete(List<Integer> idList) {
        if (idList == null || idList.isEmpty()) {
            return false;
        }
        return removeByIds(idList);
    }



    @Override
    public boolean saveReturnOrder(Map<String, Object> formData) {
        try {
            // 添加日志打印前端数据
            System.out.println("=== 接收到前端数据 ===");
            System.out.println("formData: " + formData);

            // 转换数据
            Ckd_c ckd = convertToCkd_c(formData);

            // 保存到数据库
            boolean success = this.save(ckd);
            System.out.println("保存结果: " + success);

            return success;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将前端数据转换为实体类
     */
    private Ckd_c convertToCkd_c(Map<String, Object> formData) {
        Ckd_c ckd = new Ckd_c();

        try {

            // 基础信息
            ckd.setC(getStringValue(formData, "c"));        // C: 往来单位 (前端c字段)
            ckd.setD(getStringValue(formData, "d"));        // D: 出库日期 (前端e字段)
            ckd.setE(getStringValue(formData, "e"));        // E: 出库单号 (前端f字段)

            // 产品信息 - 从前端数据获取
            ckd.setF(getStringValue(formData, "i"));        // F: 产品名称 (前端g字段)
            ckd.setG(getStringValue(formData, "j"));        // G: 图号 (前端h字段)
            ckd.setH(getStringValue(formData, "k"));        // H: 单位 (前端i字段)
            ckd.setI(getStringValue(formData, "l"));        // I: 数量 (前端l字段)

            // 价格信息
            ckd.setJ(getStringValue(formData, "m"));        // J: 单价 (前端j字段)
            ckd.setK(getStringValue(formData, "n"));        // K: 金额 (前端k字段)

            // 物料信息
            ckd.setL(getStringValue(formData, "o"));        // L: 材质 (前端m字段)
            ckd.setM(getStringValue(formData, "p"));        // M: 重量 (前端n字段)
            ckd.setN(getStringValue(formData, "q"));        // N: 备注 (前端q字段)

            // 合同信息
            ckd.setO(getStringValue(formData, "f"));        // O: 合同号 (前端o字段)
            ckd.setP(getStringValue(formData, "g"));        // P: 任务号 (前端p字段)
            ckd.setQ(getStringValue(formData, "h"));        // Q: 加工工序 (前端g字段 - 注意：这里可能不对，需要确认)

            // 人员信息
            ckd.setR(getStringValue(formData, "r"));        // R: 制单人 (前端r字段)
            ckd.setS(getStringValue(formData, "s"));        // S: 审核人 (前端s字段)
            ckd.setT(getStringValue(formData, "t"));        // T: 送货人 (前端t字段)
            ckd.setU(getStringValue(formData, "u"));        // U: 收货人 (前端u字段)

        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("转换数据时出错: " + e.getMessage());
        }

        return ckd;
    }


    /**
     * 安全获取字符串值
     */
    private String getStringValue(Map<String, Object> map, String key) {
        if (map == null || map.get(key) == null) {
            return "";
        }
        return map.get(key).toString().trim();
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



