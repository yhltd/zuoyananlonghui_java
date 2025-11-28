package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("userInfo")
public class Qxgl {
    /**
     * id自增列
     */
    @TableId(value = "id" , type = IdType.AUTO)
    private Integer id;
    /**
     * 名称
     */
    private String C;
    /**
     * 账号
     */
    private String D;
    /**
     * 密码
     */
    private String E;
    /**
     * 权限
     */
    private String F;

}
