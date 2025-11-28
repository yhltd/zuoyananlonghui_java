package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface Ckd_cService extends IService<Ckd_c> {


    /**
     * 保存出库单数据
     */
    boolean saveReturnOrder(Map<String, Object> formData);

}