package com.example.demo.controller;

import com.example.demo.entity.UserInfo;
import com.example.demo.service.QxglService;
import com.example.demo.util.ResultInfo;
import com.example.demo.util.SessionUtil;
import com.example.demo.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/userinfo")
public class LoginController {

    @Autowired
    private QxglService qxglService;

    @RequestMapping("/login")
    public ResultInfo login(HttpSession session, String username, String password) {
        try {
            //获取user
            Map<String, Object> map = qxglService.login(username, password);
            System.out.println("map");
            System.out.println(map);

            //为Null则查询不到
            if (StringUtils.isEmpty(map)) {
                SessionUtil.remove(session, "token");
                SessionUtil.remove(session, "power");
                SessionUtil.remove(session, "username");
                return ResultInfo.error(-1, "账号密码错误");
            } else {
                SessionUtil.setToken(session, map.get("token").toString());
                SessionUtil.setPower(session, (List<UserInfo>) map.get("power"));
                SessionUtil.setUserName(session,(List<UserInfo>) map.get("username"));
                return ResultInfo.success("登陆成功");
            }
        } catch (Exception e) {
            log.error("登陆失败：{}", e.getMessage());
            log.error("参数：{}", username);
            log.error("参数：{}", password);
            return ResultInfo.error("错误!");
        }
    }

}
