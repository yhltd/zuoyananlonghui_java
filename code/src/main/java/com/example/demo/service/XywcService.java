package com.example.demo.service;

import com.example.demo.entity.Ywc;
import com.example.demo.util.PageResult;
import com.example.demo.util.YwcPageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public interface XywcService {
    /**
     * 查询所有
     */
//    List<Ywc> getList();
    PageResult<Ywc> getYwcPage(YwcPageRequest request);



    /**
     * 修改
     */
    boolean update(Ywc ywc);

    /**
     * 删除
     *
     * @param idList 根据id集合删除
     * @return 是否删除成功
     */
    boolean delete(List<Integer> idList);


    /**
     * 根据姓名和部门查询
     */
    List<Ywc> queryList(String name);

    boolean updateField(Integer id, Map<String, Object> updateFields);


}
