package com.example.demo.util;

import javax.servlet.http.HttpSession;
import java.util.List;

public class AuthUtil {

    /**
     * 检查用户是否登录且有管理员权限
     */
    public static ResultInfo checkAdminAuth(HttpSession session) {
        // 1. 检查 token
        if (!SessionUtil.checkToken(session)) {
            return ResultInfo.error(401, "请重新登录");
        }

        // 2. 获取权限信息 - 应该是 F 字段的值，不是权限列表
        String fValue = SessionUtil.getF(session);
        System.out.println("AuthUtil检查：用户权限F值为：" + fValue);

        // 3. 检查是否是管理员（包含"管理员"或"超级管理员"都算管理员）
        if (fValue == null || (!fValue.contains("管理员") && !"超级管理员".equals(fValue))) {
            System.out.println("权限不足：F值=" + fValue + "，需要管理员权限");
            return ResultInfo.error(403, "权限不足，需要管理员权限");
        }

        System.out.println("权限验证通过：F值=" + fValue);
        return ResultInfo.success("权限验证通过");
    }

    /**
     * 检查用户是否登录且有超级管理员权限
     */
    public static ResultInfo checkSuperAdminAuth(HttpSession session) {
        // 1. 检查 token
        if (!SessionUtil.checkToken(session)) {
            return ResultInfo.error(401, "请重新登录");
        }

        // 2. 获取权限信息
        String fValue = SessionUtil.getF(session);
        System.out.println("AuthUtil检查：用户权限F值为：" + fValue);

        // 3. 只有超级管理员有权限
        if (!"超级管理员".equals(fValue)) {
            System.out.println("权限不足：F值=" + fValue + "，需要超级管理员权限");
            return ResultInfo.error(403, "权限不足，需要超级管理员权限");
        }

        System.out.println("超级管理员权限验证通过");
        return ResultInfo.success("权限验证通过");
    }

    /**
     * 检查用户是否登录（不检查具体权限）
     */
    public static ResultInfo checkLogin(HttpSession session) {
        if (!SessionUtil.checkToken(session)) {
            return ResultInfo.error(401, "请重新登录");
        }
        return ResultInfo.success("已登录");
    }

    /**
     * 检查用户是否有特定权限（从权限列表中检查）
     */
    public static ResultInfo checkPermission(HttpSession session, String permission) {
        // 1. 检查是否登录
        ResultInfo loginCheck = checkLogin(session);
        if (!isSuccess(loginCheck)) {
            return loginCheck;
        }

        // 2. 获取权限列表（注意：这里是 List<String>，不是 List<UserInfo>）
        List<String> powerList = SessionUtil.getPower(session);

        // 3. 检查是否有特定权限
        if (powerList == null || !powerList.contains(permission)) {
            return ResultInfo.error(403, "权限不足，需要 [" + permission + "] 权限");
        }

        return ResultInfo.success("权限验证通过");
    }

    /**
     * 检查 ResultInfo 是否成功
     */
    public static boolean isSuccess(ResultInfo result) {
        Integer code = (Integer) result.get(ResultInfo.CODE_TAG);
        return code != null && code == HttpStatus.SUCCESS;
    }

    /**
     * 获取 ResultInfo 的状态码
     */
    public static int getCode(ResultInfo result) {
        Integer code = (Integer) result.get(ResultInfo.CODE_TAG);
        return code != null ? code : HttpStatus.ERROR;
    }

    /**
     * 获取 ResultInfo 的消息
     */
    public static String getMsg(ResultInfo result) {
        return (String) result.get(ResultInfo.MSG_TAG);
    }
}