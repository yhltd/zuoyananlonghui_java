package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Htjl;
import com.example.demo.entity.Yggs;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface YggsService extends IService<Yggs> {


    /**
     * 根据姓名和部门查询
     */
    List<Yggs> queryList(String ksrq, String jsrq, String m);


    /**
     * 查询员工工时汇总
     */
    List<Yggs> queryList1(String ksrq1, String jsrq1);

    List<Yggs> getygname();
}