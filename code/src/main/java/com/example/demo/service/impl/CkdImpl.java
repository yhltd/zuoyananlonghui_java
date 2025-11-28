package com.example.demo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.entity.*;
import com.example.demo.mapper.CkdMapper;
import com.example.demo.mapper.HtjlMapper;

import com.example.demo.service.CkdService;
import com.example.demo.service.HtjlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:34
 */
@Service
public class CkdImpl extends ServiceImpl<CkdMapper, Ckd> implements CkdService {
    @Autowired
    CkdMapper ckdMapper;


//    //出库单
//    @Override
//    public boolean save1(Ckd ckd) {
//        return ckdMapper.save1(ckd);
//    }
//
//    @Override
//    public String getddh1() {  // 方法名必须一致
//        return ckdMapper.getddh1();
//    }





    @Override
    public List<Ckd> getByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return ckdMapper.getByIds(ids);
    }




//    @Override
//    @Transactional
//    public boolean saveReturnOrder(Ckd ckd) {
//        try {
//            // 只设置创建时间，其他字段从前端获取
//            ckd.setCreateTime(LocalDateTime.now());
//
//            // 处理明细关系
//            if (ckd.getDetails() != null) {
//                for (CkdDetail detail : ckd.getDetails()) {
//                    detail.setCkd(ckd);
//                }
//            }
//
//            ckdMainRepository.save(ckdMain);
//            log.info("出库单保存成功，包含 {} 条明细", ckdMain.getDetails().size());
//            return true;
//        } catch (Exception e) {
//            log.error("保存出库单失败：{}", e.getMessage());
//            throw new RuntimeException("保存出库单失败");
//        }
//    }
}
