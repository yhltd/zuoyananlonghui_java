package com.example.demo.controller;

import com.example.demo.entity.Login;
import com.example.demo.entity.UserInfo;
import com.example.demo.service.LoginService;
import com.example.demo.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserInfoController {

    @Autowired
    private LoginService loginService;

    /**
     * 查询所有
     *
     * @return ResultInfo
     */
    @RequestMapping("/getList")
    public ResultInfo getList(HttpSession session) {
//        Login login = GsonUtil.toEntity(SessionUtil.getToken(session), Login.class);
        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        try {
            List<Login> getList = loginService.getList();
            return ResultInfo.success("获取成功", getList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 根据姓名和部门查询
     *
     * @return ResultInfo
     */
    @RequestMapping("/queryList")
    public ResultInfo queryList(String name, HttpSession session) {
//        Login login = GsonUtil.toEntity(SessionUtil.getToken(session), Login.class);
        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        try {
            List<Login> list = loginService.queryList(name);
            return ResultInfo.success("获取成功", list);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }
//
//
//
    /**
     * 修改
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public ResultInfo update(@RequestBody String updateJson, HttpSession session) {

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        try {
            System.out.println("接收到的JSON: " + updateJson);

            // 这里应该能正确映射C、D、E、F字段
            Login login = GsonUtil.toEntity(updateJson, Login.class);

            System.out.println("解析后的Login对象字段:");
            System.out.println("c: " + login.getC());
            System.out.println("d: " + login.getD());
            System.out.println("e: " + login.getE());
            System.out.println("f: " + login.getF());

            if (loginService.update(login)) {
                return ResultInfo.success("修改成功", login);
            } else {
                return ResultInfo.error("修改失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("修改失败：{}", e.getMessage());
            return ResultInfo.error("修改失败: " + e.getMessage());
        }
    }


    /**
     * 添加
     */
    @RequestMapping("/add")
    public ResultInfo add(@RequestBody HashMap map, HttpSession session) {

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        try {
            // 解析前端提交的数据
            GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
            Login newUser = GsonUtil.toEntity(gsonUtil.get("addInfo"), Login.class);

            // 调试信息
            System.out.println("前端提交的addInfo: " + gsonUtil.get("addInfo"));
            System.out.println("要添加的用户数据:");
            System.out.println("姓名(c): " + newUser.getC());
            System.out.println("账号(d): " + newUser.getD());
            System.out.println("密码(e): " + newUser.getE());
            System.out.println("权限(f): " + newUser.getF());

            // 插入新用户数据
            boolean result = loginService.add(newUser);

            if (result) {
                return ResultInfo.success("添加成功", newUser);
            } else {
                return ResultInfo.error("添加失败");
            }
        } catch (Exception e) {
            e.printStackTrace();
            log.error("添加失败：{}", e.getMessage());
            log.error("参数：{}", map);
            return ResultInfo.error("添加失败: " + e.getMessage());
        }
    }

    /**
     * 删除
     *
     * @param map
     * @return ResultInfo
     */
    @RequestMapping("/delete")
    public ResultInfo delete(@RequestBody HashMap map,HttpSession session) {

        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        Login login = GsonUtil.toEntity(SessionUtil.getToken(session), Login.class);
        System.out.println(login);
        GsonUtil gsonUtil = new GsonUtil(GsonUtil.toJson(map));
        List<Integer> idList = GsonUtil.toList(gsonUtil.get("idList"), Integer.class);
        try {
            for(int i=0; i<idList.size(); i++){
                int this_id = idList.get(i);
                loginService.delete(Collections.singletonList(this_id));
            }
            return ResultInfo.success("删除成功", idList);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("删除失败：{}", e.getMessage());
            log.error("参数：{}", idList);
            return ResultInfo.error("删除失败");
        }
    }


    /**
     * 获取当前账号权限
     *
     * @return ResultInfo
     */
    @RequestMapping("/getPower")
    public ResultInfo getPower(HttpSession session) {
        // 检查管理员权限
        ResultInfo authResult = AuthUtil.checkAdminAuth(session);
        if (!authResult.isSuccess()) {
            return authResult;
        }

        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        try {
            return ResultInfo.success("获取成功", userInfo.getPower());
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

    /**
     * 获取当前账号操作权限
     *
     * @return ResultInfo
     */
    @RequestMapping("/getCaozuoquanxian")
    public ResultInfo getCaozuoquanxian(HttpSession session) {
        UserInfo userInfo = GsonUtil.toEntity(SessionUtil.getToken(session), UserInfo.class);
        try {
            return ResultInfo.success("获取成功", userInfo.getCaozuoquanxian());
        } catch (Exception e) {
            e.printStackTrace();
            log.error("获取失败：{}", e.getMessage());
            return ResultInfo.error("错误!");
        }
    }

}