package com.example.demo.util;

import lombok.Data;

@Data
public class YwcPageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 15;

    // 查询条件字段
    private String name;  // 业务单位（对应 C 字段）

    private String hetongzhuangtai;  // 合同状态
    private String hetongHao;  // 合同号（对应 D 字段）
    private String renwuHao;  // 任务号（对应 E 字段）
}
