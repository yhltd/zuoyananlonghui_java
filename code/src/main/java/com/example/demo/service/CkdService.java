package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface CkdService extends IService<Ckd> {


//    //出库单
//
//    boolean save1(Ckd ckd);
//    String getddh1();




    /**
     * 根据多个ID查询合同记录
     */
    List<Ckd> getByIds(List<String> ids);



//
//    /**
//     * 保存出库单
//     */
//    boolean saveReturnOrder(Ckd ckd);
}