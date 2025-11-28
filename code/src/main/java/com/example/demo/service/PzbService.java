package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Pzb;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PzbService extends IService<Pzb> {

    /**
     * 查询所有
     */
    List<Pzb> getList();

    boolean update(Pzb pzb);
    boolean add(Pzb pzb);

    boolean delete(List<Integer> idList);
}