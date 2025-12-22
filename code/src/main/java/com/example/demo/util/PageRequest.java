package com.example.demo.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PageRequest {
    private Integer pageNum = 1;     // 当前页码，默认第1页
    private Integer pageSize = 10;   // 每页条数，默认10条
    @JsonProperty("C")
    private String C;
    @JsonProperty("D")
    private String D;
    @JsonProperty("E")
    private String E;
    @JsonProperty("I")
    private String I;
    private String zhuangtai;
    private String hetongzhuangtai;
    @JsonProperty("AS")
    private String AS;
}
