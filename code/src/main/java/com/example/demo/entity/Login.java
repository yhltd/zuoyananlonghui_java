package com.example.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * @author hui
 * @date 2025/11/24 14:07
 */
@Data
@TableName("userInfo")
public class Login {
    /**
     * id自增列
     */
    @TableId(value = "id" , type = IdType.AUTO)
    private Integer id;


    private String c;
    private String d;
    /**
     * 密码
     */
    private String e;
    /**
     * 权限
     */
    private String f;

}
