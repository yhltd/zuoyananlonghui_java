package com.example.demo.util;

import javax.servlet.http.HttpSession;
import java.util.List;

public class SessionUtil {

    // Token 相关
    public static void setToken(HttpSession session, String token) {
        session.setAttribute("token", token);
    }

    public static String getToken(HttpSession session) {
        return (String) session.getAttribute("token");
    }

    public static boolean checkToken(HttpSession session) {
        Object token = session.getAttribute("token");
        if (token == null) {
            System.out.println("Session中token为空");
            return false;
        }
        System.out.println("Session中token存在");
        return true;
    }

    // 用户名相关
//    public static void setUserName(HttpSession session, String userName) {
//        session.setAttribute("username", userName);
//    }

    public static String getUserName(HttpSession session) {
        return (String) session.getAttribute("username");
    }

    // C字段（姓名）
    public static void setC(HttpSession session, String c) {
        session.setAttribute("C", c);
        System.out.println("Session设置C: " + c);
    }

    public static String getC(HttpSession session) {
        return (String) session.getAttribute("C");
    }

    // D字段（账号）
    public static void setD(HttpSession session, String d) {
        session.setAttribute("D", d);
        System.out.println("Session设置D: " + d);
    }

    public static String getD(HttpSession session) {
        return (String) session.getAttribute("D");
    }

    // F字段（权限）
    public static void setF(HttpSession session, String f) {
        session.setAttribute("F", f);
        System.out.println("Session设置F: " + f);
    }

    public static String getF(HttpSession session) {
        String f = (String) session.getAttribute("F");
        System.out.println("Session获取F: " + f);
        return f;
    }

    // 权限列表（List<String>）
    @SuppressWarnings("unchecked")
    public static List<String> getPower(HttpSession session) {
        return (List<String>) session.getAttribute("power");
    }

//    public static void setPower(HttpSession session, List<String> powerList) {
//        session.setAttribute("power", powerList);
//        System.out.println("Session设置权限列表: " + powerList);
//    }

    // 移除所有session属性
    public static void removeAll(HttpSession session) {
        session.removeAttribute("token");
        session.removeAttribute("username");
        session.removeAttribute("C");
        session.removeAttribute("D");
        session.removeAttribute("F");
        session.removeAttribute("power");
    }

    // 移除指定属性
    public static void remove(HttpSession session, String key) {
        session.removeAttribute(key);
    }
}