package com.example.demo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.entity.Thjl;
import com.example.demo.util.PageResult;
import com.example.demo.util.ThjlPageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hui
 * @date 2025/11/25 9:38
 */
@Service
public interface ThjlService extends IService<Thjl> {

    /**
     * 查询所有
     */
//    List<Thjl> getList();
    PageResult<Thjl> getThjlPage(ThjlPageRequest request);



    /**
     * 根据姓名和部门查询
     */
    List<Thjl> queryList(String ksrq, String jsrq, String h, String i, String k, String r);


    /**
     * 修改
     */
    boolean update(Thjl thjl);

    /**
     * 添加
     * @return
     */
    boolean add(Thjl thjl);

    /**
     * 删除
     *
     * @param idList 根据id集合删除
     * @return 是否删除成功
     */
    boolean delete(List<Integer> idList);


    List<Thjl> gettdh();

    List<Thjl> getth(String returnNo );



}
