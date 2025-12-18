package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("hetong_jilu")
public class Xhtjl {

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
    private String w;
    private String x;
    private String y;
    private String z;

    // 为所有双字母字段添加明确的映射，使用方括号
    @TableField("[aa]")
    private String aa;

    @TableField("[ab]")
    private String ab;

    @TableField("[ac]")
    private String ac;

    @TableField("[ad]")
    private String ad;

    @TableField("[ae]")
    private String ae;

    @TableField("[af]")
    private String af;

    @TableField("[ag]")
    private String ag;

    @TableField("[ah]")
    private String ah;

    @TableField("[ai]")
    private String ai;

    @TableField("[aj]")
    private String aj;

    @TableField("[ak]")
    private String ak;

    @TableField("[al]")
    private String al;

    @TableField("[am]")
    private String am;

    @TableField("[an]")
    private String an;

    @TableField("[ao]")
    private String ao;

    @TableField("[ap]")
    private String ap;

    @TableField("[aq]")
    private String aq;

    @TableField("[ar]")
    private String ar;

    // 特别处理 SQL 关键字 'as'
    @TableField("[as]")
    private String aas;

    @TableField("[at]")
    private String at;

    @TableField("hetong_zhuangtai")
    private String hetongzhuangtai;

    @TableField("[au]")
    private String au;

    @TableField("[av]")
    private String av;

    @TableField("[aw]")
    private String aw;

    @TableField("[ax]")
    private String ax;

    @TableField("[ay]")
    private String ay;

    private String riqi;

    // 添加状态字段
    @TableField(exist = false)
    private String zhuangtai;


    private String lingjianhao;
    private String qianshiji;
    private String tangshiji;
    private String geshiji;
    private String moshiji;
    private String licheshiji;
    private String dianhuohuashiji;
    private String zhongzuosishiji;
    private String jingmixianqiege;
    private String hanjiegongshi;
    private String dengjiriqi;
    private String shijijiaohuoriqi;
    private String muban;



}
