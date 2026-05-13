package com.example.demo.util;

import lombok.Data;

@Data
public class ThjlPageRequest {
    private Integer pageNum = 1;
    private Integer pageSize = 15;

    // 查询条件字段
    private String ksrq;  // 开始日期
    private String jsrq;  // 结束日期
    private String h;     // 合同号
    private String i;     // 任务号
    private String k;     // 图号
    private String r;     // 退货原因
}
