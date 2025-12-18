package com.example.demo.controller;

import com.example.demo.entity.Power;
import com.example.demo.entity.UserInfo;
import com.example.demo.service.PowerService;
import com.example.demo.service.QxglService;
import com.example.demo.util.ResultInfo;
import com.example.demo.util.SessionUtil;
import com.example.demo.util.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/userinfo")
public class LoginController {

    @Autowired
    private QxglService qxglService;

    @Autowired
    private PowerService powerService;

    @RequestMapping("/login")
    public ResultInfo login(HttpSession session, String username, String password) {
        try {


            String endtime = "";
            String mark1 = "";
            String mark2 = "";
            String mark3 = "";
            String mark4 = "";
            //获取user
            SessionUtil.remove(session, "token");
            List<Power> softTime = powerService.getList();
            System.out.println("softTime: " + softTime);

            if (softTime.size() == 0) {
                return ResultInfo.error(-1, "友情提示：感谢您的使用，系統已到期，请及时联系续费以免影响使用，官方微信号：1623005800");
            }else{
                if(softTime.get(0).getEndtime() != null){
                    endtime = softTime.get(0).getEndtime().trim();
                }
                if(softTime.get(0).getMark1() != null){
                    mark1 = softTime.get(0).getMark1().trim();
                }
                if(softTime.get(0).getMark2() != null){
                    mark2 = softTime.get(0).getMark2().trim();
                }
                if(softTime.get(0).getMark3() != null){
                    mark3 = softTime.get(0).getMark3().trim();
                    if(mark3 != ""){
                        mark3 = mark3.split(":")[1];
                        mark3 = mark3.replace("(","");
                        mark3 = mark3.replace(")","");
                    }
                }
                if(softTime.get(0).getMark4() != null){
                    mark4 = softTime.get(0).getMark4().trim();
                }
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
                if(!mark1.equals("a8xd2s")){
                    if(endtime == ""){
                        return ResultInfo.error(-1, "友情提示：感谢您的使用，系統已到期，请及时联系续费以免影响使用，官方微信号：1623005800");
                    }
                    if(mark2 == ""){
                        return ResultInfo.error(-1, "友情提示：感谢您的使用，您租用的服务已到期，请及时联系续费以免影响使用，官方微信号：1623005800");
                    }
                    Date enddate = sdf.parse(endtime);
                    Date fuwudate = sdf.parse(mark2);
                    Date now = new Date();
                    String this_time = sdf.format(now);
                    now = sdf.parse(this_time);
                    if(now.getTime() > enddate.getTime()){
                        return ResultInfo.error(-1, "友情提示：感谢您的使用，系統已到期，请及时联系续费以免影响使用，官方微信号：1623005800");
                    }
                    if(now.getTime() > fuwudate.getTime()){
                        return ResultInfo.error(-1, "友情提示：感谢您的使用，您租用的服务已到期，请及时联系续费以免影响使用，官方微信号：1623005800");
                    }
                }
//
            }


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
//                SessionUtil.setPower(session, (List<UserInfo>) map.get("power"));
//                SessionUtil.setUserName(session,(List<UserInfo>) map.get("username"));


                // 获取 token 字符串
                String tokenJson = map.get("token").toString();
                System.out.println("Token JSON: " + tokenJson);

                // 解析 JSON
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Object> tokenData = objectMapper.readValue(tokenJson, Map.class);

                System.out.println("解析后的Token数据: " + tokenData);

                // 设置 Session（只设置一次！）
                SessionUtil.setToken(session, tokenJson);  // 存储完整的 token JSON
                System.out.println("设置的Token: " + tokenJson);

                // 从解析的数据中获取 F 字段（权限）
                String fValue = (String) tokenData.get("F");

                // 存储 F 字段到 Session 的正确属性中（不是 token！）
                SessionUtil.setF(session, fValue);  // 注意：这里是 setF，不是 setToken！

                System.out.println("已存储F到Session: " + fValue);

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
