package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("chuku")
public class Ckd_c {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @TableField("C")
    private String c;

    @TableField("D")
    private String d;

    @TableField("E")
    private String e;

    @TableField("F")
    private String f;

    @TableField("G")
    private String g;

    @TableField("H")
    private String h;

    @TableField("I")
    private String i;

    @TableField("J")
    private String j;

    @TableField("K")
    private String k;

    @TableField("L")
    private String l;

    @TableField("M")
    private String m;

    @TableField("N")
    private String n;

    @TableField("O")
    private String o;

    @TableField("P")
    private String p;

    @TableField("Q")
    private String q;

    @TableField("R")
    private String r;

    @TableField("S")
    private String s;

    @TableField("T")
    private String t;

    @TableField("U")
    private String u;
}

