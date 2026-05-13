package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("gongyi_guicheng")
public class Gygc {

    /**
     * id自增列
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;
    private String c;
    private String d;
    private String e;
    private String f;
    private String g;
    private String h;
    private String i;
    private String j;
    private String k;
    private String l;
    private String m;
    private String n;
    private String o;
    private String p;
    private String q;
    private String r;
    private String s;
    private String t;
    private String u;
    private String v;
    private String htid;

    private String field1;  // 对应C字段
    private String field2;  // 对应E字段
    private String field3;  // 对应I字段
}